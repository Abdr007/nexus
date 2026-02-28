import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// This endpoint is called by Vercel Cron or an external cron service every 5 minutes
// Authorization via CRON_SECRET to prevent unauthorized access

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return Response.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Get all active alerts
  const { data: alerts, error } = await supabase
    .from('price_alerts')
    .select('*')
    .eq('active', true);

  if (error || !alerts?.length) {
    return Response.json({ checked: 0, triggered: 0 });
  }

  // Get unique token IDs
  const tokenIds = [...new Set(alerts.map(a => a.coingecko_id))];

  // Fetch current prices
  const priceRes = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${tokenIds.join(',')}&vs_currencies=usd`
  );
  const prices = await priceRes.json();

  // Check each alert
  const triggered: string[] = [];

  for (const alert of alerts) {
    const currentPrice = prices[alert.coingecko_id]?.usd;
    if (!currentPrice) continue;

    const isTriggered =
      (alert.direction === 'above' && currentPrice >= alert.target_price) ||
      (alert.direction === 'below' && currentPrice <= alert.target_price);

    if (isTriggered) {
      triggered.push(alert.id);

      // Mark as triggered (deactivate)
      await supabase
        .from('price_alerts')
        .update({
          active: false,
          triggered_at: new Date().toISOString(),
          triggered_price: currentPrice,
        })
        .eq('id', alert.id);

      // Store notification for in-app display
      await supabase
        .from('notifications')
        .insert({
          user_id: alert.user_id,
          type: 'price_alert',
          title: `${alert.symbol.toUpperCase()} hit $${currentPrice.toLocaleString()}`,
          body: `Your ${alert.direction} alert for ${alert.symbol.toUpperCase()} at $${alert.target_price.toLocaleString()} was triggered. Current price: $${currentPrice.toLocaleString()}`,
          data: { alert_id: alert.id, price: currentPrice },
        });
    }
  }

  return Response.json({
    checked: alerts.length,
    triggered: triggered.length,
    triggered_ids: triggered,
  });
}

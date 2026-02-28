import { createClient } from '@/lib/supabase/server';
import { getStripe, PLANS } from '@/lib/stripe';
import { NextRequest } from 'next/server';

export async function GET() {
  return Response.json({ plans: PLANS });
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return Response.json({ error: 'Billing not configured' }, { status: 503 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return Response.json({ error: 'Auth required for billing' }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { action } = await req.json();

  if (action === 'checkout') {
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [{ price: PLANS.pro.priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/?upgraded=true`,
      cancel_url: `${req.headers.get('origin')}/?cancelled=true`,
      metadata: { userId: user.id },
    });

    return Response.json({ url: session.url });
  }

  if (action === 'portal') {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return Response.json({ error: 'No active subscription' }, { status: 400 });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${req.headers.get('origin')}/`,
    });

    return Response.json({ url: portal.url });
  }

  return Response.json({ error: 'Invalid action' }, { status: 400 });
}

import { NextRequest } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) return Response.json({ error: 'Stripe not configured' }, { status: 503 });

  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Use service role for webhook processing
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any;
      const userId = session.metadata?.userId;
      const customerId = session.customer;

      if (userId) {
        // Update user tier
        await supabase.auth.admin.updateUserById(userId, {
          user_metadata: { tier: 'pro', stripe_customer_id: customerId },
        });

        // Store in profiles
        await supabase.from('user_profiles').upsert({
          user_id: userId,
          tier: 'pro',
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString(),
        });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as any;
      const customerId = subscription.customer;

      // Find user by customer ID and downgrade
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (profile) {
        await supabase.auth.admin.updateUserById(profile.user_id, {
          user_metadata: { tier: 'free' },
        });
        await supabase.from('user_profiles').update({
          tier: 'free',
          updated_at: new Date().toISOString(),
        }).eq('user_id', profile.user_id);
      }
      break;
    }
  }

  return Response.json({ received: true });
}

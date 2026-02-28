import Stripe from 'stripe';

let stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (stripe) return stripe;
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-01-27.acacia' as any });
  return stripe;
}

export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      '20 messages/hour',
      '3 tools (price, news, sentiment)',
      'Groq Llama 3.3 70B',
      'Short-term memory',
    ],
  },
  pro: {
    name: 'Pro',
    price: 9,
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    features: [
      '200 messages/hour',
      'All tools (DeFi, on-chain, whale alerts)',
      'Claude Sonnet for deeper analysis',
      'Long-term memory',
      'Portfolio tracking',
      'Conversation history',
      'Priority support',
    ],
  },
};

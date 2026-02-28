export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.2.0',
    phase: 'Phase 2+3',
    services: {
      groq: !!process.env.GROQ_API_KEY,
      claude: !!process.env.ANTHROPIC_API_KEY,
      supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      redis: !!process.env.UPSTASH_REDIS_REST_URL,
      tavily: !!process.env.TAVILY_API_KEY,
      stripe: !!process.env.STRIPE_SECRET_KEY,
    },
    tools: ['market_price', 'fear_greed', 'crypto_news', 'live_search', 'defi_tvl', 'gas_tracker'],
    modes: ['analyst', 'trader', 'defi', 'risk'],
  });
}

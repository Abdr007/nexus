export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    phase: 'Phase 4 Complete',
    services: {
      groq: !!process.env.GROQ_API_KEY,
      claude: !!process.env.ANTHROPIC_API_KEY,
      supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      redis: !!process.env.UPSTASH_REDIS_REST_URL,
      tavily: !!process.env.TAVILY_API_KEY,
      stripe: !!process.env.STRIPE_SECRET_KEY,
      telegram: !!process.env.TELEGRAM_BOT_TOKEN,
      discord: !!process.env.DISCORD_BOT_TOKEN,
    },
    tools: [
      'market_price', 'fear_greed', 'crypto_news', 'live_search',
      'defi_tvl', 'gas_tracker', 'whale_tracker', 'onchain_data',
    ],
    modes: ['analyst', 'trader', 'defi', 'risk'],
    features: [
      'streaming_chat', 'multi_llm_routing', 'short_term_memory',
      'long_term_memory', 'rate_limiting', 'auth', 'billing',
      'portfolio_watchlist', 'price_alerts', 'conversation_history',
      'admin_dashboard', 'telegram_bot', 'discord_bot', 'pwa', 'plugins',
    ],
  });
}

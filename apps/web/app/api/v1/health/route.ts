export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    services: {
      groq: !!process.env.GROQ_API_KEY,
      redis: !!process.env.UPSTASH_REDIS_REST_URL,
      tavily: !!process.env.TAVILY_API_KEY,
    },
  });
}

import type { ToolConfig, ToolParams, ToolResult } from '@nexus/shared';
import { CACHE_TTL, TOOL_TIMEOUTS } from '@nexus/shared';

async function execute(params: ToolParams): Promise<ToolResult> {
  const start = Date.now();

  const url = 'https://min-api.cryptocompare.com/data/v2/news/?lang=EN&sortOrder=popular';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CryptoCompare News API error: ${res.status}`);
  const json = await res.json();

  const articles = (json.Data || []).slice(0, 5).map((article: Record<string, unknown>) => ({
    title: article.title,
    source: article.source,
    url: article.url,
    body: typeof article.body === 'string' ? article.body.slice(0, 200) + '...' : '',
    publishedAt: article.published_on,
    categories: article.categories,
  }));

  // Filter by relevance if query has specific tokens
  const query = params.query.toLowerCase();
  const relevant = articles.filter((a: { title: string; body: string; categories: string }) => {
    const text = `${a.title} ${a.body} ${a.categories}`.toLowerCase();
    return query.split(' ').some((word: string) => word.length > 3 && text.includes(word));
  });

  return {
    data: { articles: relevant.length > 0 ? relevant : articles },
    source: 'CryptoCompare',
    timestamp: Date.now(),
    latency_ms: Date.now() - start,
    cached: false,
  };
}

export const cryptoNewsTool: ToolConfig = {
  id: 'crypto_news',
  name: 'Crypto News',
  description: 'Get the latest crypto news headlines',
  timeout: TOOL_TIMEOUTS.default,
  cacheTTL: CACHE_TTL.news,
  execute,
};

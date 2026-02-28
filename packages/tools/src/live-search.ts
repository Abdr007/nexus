import type { ToolConfig, ToolParams, ToolResult } from '@nexus/shared';
import { TOOL_TIMEOUTS, CACHE_TTL } from '@nexus/shared';

async function execute(params: ToolParams): Promise<ToolResult> {
  const start = Date.now();
  const apiKey = process.env.TAVILY_API_KEY;

  if (!apiKey) {
    return {
      data: { error: 'Tavily API key not configured' },
      source: 'Tavily',
      timestamp: Date.now(),
      latency_ms: Date.now() - start,
      cached: false,
    };
  }

  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: apiKey,
      query: params.query,
      search_depth: 'basic',
      include_answer: true,
      max_results: 5,
    }),
  });

  if (!res.ok) throw new Error(`Tavily API error: ${res.status}`);
  const json = await res.json();

  const data = {
    answer: json.answer,
    results: (json.results || []).slice(0, 5).map((r: Record<string, unknown>) => ({
      title: r.title,
      url: r.url,
      snippet: r.content,
    })),
  };

  return {
    data,
    source: 'Tavily Search',
    timestamp: Date.now(),
    latency_ms: Date.now() - start,
    cached: false,
  };
}

export const liveSearchTool: ToolConfig = {
  id: 'live_search',
  name: 'Live Search',
  description: 'Search the web for real-time information',
  timeout: TOOL_TIMEOUTS.search,
  cacheTTL: CACHE_TTL.search,
  execute,
};

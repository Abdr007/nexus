import type { ToolConfig, ToolParams, ToolResult } from '@nexus/shared';
import { CACHE_TTL, TOOL_TIMEOUTS } from '@nexus/shared';

async function execute(_params: ToolParams): Promise<ToolResult> {
  const start = Date.now();

  const res = await fetch('https://api.alternative.me/fng/?limit=1&format=json');
  if (!res.ok) throw new Error(`Fear & Greed API error: ${res.status}`);
  const json = await res.json();

  const entry = json.data?.[0];
  const data = {
    value: Number(entry?.value),
    label: entry?.value_classification,
    timestamp: entry?.timestamp,
    description: getDescription(Number(entry?.value)),
  };

  return {
    data,
    source: 'Alternative.me Fear & Greed Index',
    timestamp: Date.now(),
    latency_ms: Date.now() - start,
    cached: false,
  };
}

function getDescription(value: number): string {
  if (value <= 25) return 'Extreme Fear — investors are very worried, potential buying opportunity';
  if (value <= 45) return 'Fear — market sentiment is negative';
  if (value <= 55) return 'Neutral — market sentiment is balanced';
  if (value <= 75) return 'Greed — investors are getting greedy, caution advised';
  return 'Extreme Greed — market may be overheated, high risk of correction';
}

export const fearGreedTool: ToolConfig = {
  id: 'fear_greed',
  name: 'Fear & Greed Index',
  description: 'Get the current crypto Fear & Greed Index score and sentiment',
  timeout: TOOL_TIMEOUTS.default,
  cacheTTL: CACHE_TTL.fearGreed,
  execute,
};

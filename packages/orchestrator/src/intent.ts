import type { Intent, ToolHint } from '@nexus/shared';

const TOOL_PATTERNS: Record<ToolHint, RegExp> = {
  price: /\b(price|worth|cost|value|how much)\b.*\b(btc|eth|sol|bitcoin|ethereum|solana|bnb|xrp|ada|doge|avax|dot|matic|link|uni|atom|arb|op|\$[a-z]{2,})\b|\b(btc|eth|sol|bitcoin|ethereum|solana|bnb|xrp|ada|doge|avax|dot|matic|link|uni|atom|arb|op)\b.*\b(price|worth|cost|trading|at)\b/i,
  market: /\b(market|cap|volume|dominance|trend|overview|total)\b/i,
  news: /\b(news|latest|headline|update|announcement|hack|exploit|breaking)\b/i,
  defi: /\b(tvl|yield|apy|apr|farm|stake|liquidity|pool|swap|defi|protocol)\b/i,
  analysis: /\b(analy[sz]|predict|forecast|outlook|bull|bear|support|resistance|technical|ta)\b/i,
  fear: /\b(fear|greed|sentiment|index|mood)\b/i,
  portfolio: /\b(portfolio|holding|bag|position|pnl|profit|loss)\b/i,
  search: /\b(search|find|look up|google|what is|who is|explain)\b/i,
};

const REALTIME_PATTERN = /\b(now|today|current|live|latest|right now|at the moment|currently|this week)\b/i;

export function classifyIntent(message: string): Intent {
  const toolHints: ToolHint[] = [];

  for (const [hint, pattern] of Object.entries(TOOL_PATTERNS)) {
    if (pattern.test(message)) {
      toolHints.push(hint as ToolHint);
    }
  }

  // Deduplicate: if price + market both matched, keep both (they resolve to same tool anyway)
  // If search matched alongside more specific tools, drop search
  const filtered = toolHints.length > 1
    ? toolHints.filter(h => h !== 'search')
    : toolHints;

  const needsRealtime = REALTIME_PATTERN.test(message) || filtered.length > 0;

  return {
    needsRealtime,
    needsTools: filtered.length > 0,
    toolHints: filtered,
    complexity: filtered.length > 2 ? 'high' : filtered.length > 0 ? 'medium' : 'low',
  };
}

import type { ToolConfig, ToolParams, ToolResult } from '@nexus/shared';
import { CACHE_TTL, TOOL_TIMEOUTS } from '@nexus/shared';

const SYMBOL_MAP: Record<string, string> = {
  btc: 'bitcoin', bitcoin: 'bitcoin',
  eth: 'ethereum', ethereum: 'ethereum',
  sol: 'solana', solana: 'solana',
  bnb: 'binancecoin',
  xrp: 'ripple',
  ada: 'cardano',
  doge: 'dogecoin',
  avax: 'avalanche-2',
  dot: 'polkadot',
  matic: 'matic-network', polygon: 'matic-network',
  link: 'chainlink',
  uni: 'uniswap',
  atom: 'cosmos',
  arb: 'arbitrum',
  op: 'optimism',
};

function extractSymbols(query: string): string[] {
  const lower = query.toLowerCase();
  const found: string[] = [];

  // Match $TOKEN pattern
  const dollarMatches = lower.match(/\$([a-z]+)/g);
  if (dollarMatches) {
    dollarMatches.forEach(m => {
      const sym = m.slice(1);
      if (SYMBOL_MAP[sym]) found.push(SYMBOL_MAP[sym]);
    });
  }

  // Match known symbols/names
  for (const [key, id] of Object.entries(SYMBOL_MAP)) {
    if (lower.includes(key) && !found.includes(id)) {
      found.push(id);
    }
  }

  return found.length > 0 ? found : ['bitcoin'];
}

async function execute(params: ToolParams): Promise<ToolResult> {
  const start = Date.now();
  const ids = params.symbol
    ? [SYMBOL_MAP[params.symbol.toLowerCase()] || params.symbol]
    : extractSymbols(params.query);

  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko API error: ${res.status}`);
  const data = await res.json();

  return {
    data,
    source: 'CoinGecko',
    timestamp: Date.now(),
    latency_ms: Date.now() - start,
    cached: false,
  };
}

export const marketPriceTool: ToolConfig = {
  id: 'market_price',
  name: 'Market Price',
  description: 'Get real-time crypto prices, 24h change, market cap, and volume',
  timeout: TOOL_TIMEOUTS.default,
  cacheTTL: CACHE_TTL.price,
  execute,
};

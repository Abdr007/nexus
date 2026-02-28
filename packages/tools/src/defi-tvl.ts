import type { ToolConfig, ToolParams, ToolResult } from '@nexus/shared';
import { TOOL_TIMEOUTS } from '@nexus/shared';

async function execute(params: ToolParams): Promise<ToolResult> {
  const start = Date.now();
  const query = params.query.toLowerCase();

  // Check if asking about a specific protocol
  const protocolMatch = query.match(/\b(aave|uniswap|lido|makerdao|compound|curve|convex|eigenlayer|pendle|morpho|gmx|hyperliquid)\b/i);

  let data: unknown;

  if (protocolMatch) {
    const protocol = protocolMatch[1].toLowerCase();
    const res = await fetch(`https://api.llama.fi/protocol/${protocol}`);
    if (!res.ok) throw new Error(`DeFi Llama API error: ${res.status}`);
    const json = await res.json();

    data = {
      name: json.name,
      symbol: json.symbol,
      tvl: json.tvl,
      chain: json.chain,
      category: json.category,
      chains: json.chains?.slice(0, 5),
      change_1d: json.change_1d,
      change_7d: json.change_7d,
      mcap: json.mcap,
    };
  } else {
    // Get top protocols by TVL
    const res = await fetch('https://api.llama.fi/protocols');
    if (!res.ok) throw new Error(`DeFi Llama API error: ${res.status}`);
    const protocols = await res.json();

    data = {
      top_protocols: protocols.slice(0, 10).map((p: any) => ({
        name: p.name,
        symbol: p.symbol,
        tvl: p.tvl,
        category: p.category,
        change_1d: p.change_1d,
        chain: p.chain,
      })),
      total_tvl: protocols.reduce((sum: number, p: any) => sum + (p.tvl || 0), 0),
    };
  }

  return {
    data,
    source: 'DeFi Llama',
    timestamp: Date.now(),
    latency_ms: Date.now() - start,
    cached: false,
  };
}

export const defiTvlTool: ToolConfig = {
  id: 'defi_tvl',
  name: 'DeFi TVL',
  description: 'Get DeFi protocol TVL data, rankings, and trends',
  timeout: TOOL_TIMEOUTS.default,
  cacheTTL: 60,
  execute,
};

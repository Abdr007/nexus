import type { ToolConfig, ToolHint, ToolResult } from '@nexus/shared';
import { log } from '@nexus/shared';
import { marketPriceTool } from './market-price';
import { fearGreedTool } from './fear-greed';
import { cryptoNewsTool } from './crypto-news';
import { liveSearchTool } from './live-search';
import { defiTvlTool } from './defi-tvl';
import { gasTrackerTool } from './gas-tracker';
import { whaleTrackerTool } from './whale-tracker';
import { onchainDataTool } from './onchain-data';

const tools: Map<string, ToolConfig> = new Map();

// Phase 1 tools
tools.set('market_price', marketPriceTool);
tools.set('fear_greed', fearGreedTool);
tools.set('crypto_news', cryptoNewsTool);
tools.set('live_search', liveSearchTool);

// Phase 3 tools
tools.set('defi_tvl', defiTvlTool);
tools.set('gas_tracker', gasTrackerTool);

// Phase 4 tools
tools.set('whale_tracker', whaleTrackerTool);
tools.set('onchain_data', onchainDataTool);

const HINT_TO_TOOL: Record<ToolHint, string[]> = {
  price: ['market_price'],
  market: ['market_price'],
  news: ['crypto_news'],
  fear: ['fear_greed'],
  analysis: ['market_price', 'fear_greed'],
  defi: ['defi_tvl'],
  portfolio: ['market_price'],
  search: ['live_search'],
};

export function resolveTools(hints: ToolHint[]): ToolConfig[] {
  const resolved = new Set<string>();
  for (const hint of hints) {
    const toolIds = HINT_TO_TOOL[hint] || [];
    toolIds.forEach(id => resolved.add(id));
  }
  return Array.from(resolved)
    .map(id => tools.get(id))
    .filter((t): t is ToolConfig => t !== undefined);
}

export async function dispatchTools(hints: ToolHint[], query: string): Promise<ToolResult[]> {
  const toolConfigs = resolveTools(hints);
  if (toolConfigs.length === 0) return [];

  // Dynamic tool matching beyond hint system
  const lower = query.toLowerCase();
  if (/\b(gas|gwei|fee|transaction cost)\b/.test(lower) && !toolConfigs.find(t => t.id === 'gas_tracker')) {
    const gasTool = tools.get('gas_tracker');
    if (gasTool) toolConfigs.push(gasTool);
  }
  if (/\b(whale|large transaction|big transfer)\b/.test(lower) && !toolConfigs.find(t => t.id === 'whale_tracker')) {
    const whaleTool = tools.get('whale_tracker');
    if (whaleTool) toolConfigs.push(whaleTool);
  }
  if (/\b(on.?chain|hashrate|difficulty|block height|supply)\b/.test(lower) && !toolConfigs.find(t => t.id === 'onchain_data')) {
    const onchainTool = tools.get('onchain_data');
    if (onchainTool) toolConfigs.push(onchainTool);
  }

  const start = Date.now();

  const results = await Promise.allSettled(
    toolConfigs.map(tool =>
      Promise.race([
        tool.execute({ query }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`${tool.id} timed out`)), tool.timeout)
        ),
      ])
    )
  );

  const successful: ToolResult[] = [];
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      successful.push(result.value);
    } else {
      log('warn', `Tool ${toolConfigs[i].id} failed`, { error: result.reason?.message });
    }
  });

  log('info', 'Tools dispatched', {
    requested: toolConfigs.map(t => t.id),
    succeeded: successful.map(r => r.source),
    totalLatencyMs: Date.now() - start,
  });

  return successful;
}

export function getAvailableTools(): { id: string; name: string; description: string }[] {
  return Array.from(tools.values()).map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
  }));
}

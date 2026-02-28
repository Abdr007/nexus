import type { ToolConfig, ToolParams, ToolResult } from '@nexus/shared';
import { TOOL_TIMEOUTS } from '@nexus/shared';

async function execute(params: ToolParams): Promise<ToolResult> {
  const start = Date.now();
  const query = params.query.toLowerCase();

  // Use free public blockchain APIs for on-chain data
  const data: Record<string, unknown> = {};

  // ETH supply and stats from Etherscan (free, no key needed for basic)
  if (query.includes('eth') || query.includes('ethereum') || query.includes('chain')) {
    try {
      const supplyRes = await fetch('https://api.etherscan.io/api?module=stats&action=ethsupply');
      const supplyJson = await supplyRes.json();

      const priceRes = await fetch('https://api.etherscan.io/api?module=stats&action=ethprice');
      const priceJson = await priceRes.json();

      data.ethereum = {
        total_supply_eth: Number(supplyJson.result) / 1e18,
        price_usd: Number(priceJson.result?.ethusd),
        price_btc: Number(priceJson.result?.ethbtc),
        last_updated: priceJson.result?.ethusd_timestamp
          ? new Date(Number(priceJson.result.ethusd_timestamp) * 1000).toISOString()
          : undefined,
      };
    } catch {
      data.ethereum = { error: 'Failed to fetch Ethereum on-chain data' };
    }
  }

  // Bitcoin stats from Blockchain.com (free, no key needed)
  if (query.includes('btc') || query.includes('bitcoin') || query.includes('chain')) {
    try {
      const [diffRes, hashRes, blocksRes] = await Promise.all([
        fetch('https://blockchain.info/q/getdifficulty'),
        fetch('https://blockchain.info/q/hashrate'),
        fetch('https://blockchain.info/q/getblockcount'),
      ]);

      data.bitcoin = {
        difficulty: Number(await diffRes.text()),
        hashrate_ghs: Number(await hashRes.text()),
        block_height: Number(await blocksRes.text()),
      };
    } catch {
      data.bitcoin = { error: 'Failed to fetch Bitcoin on-chain data' };
    }
  }

  if (Object.keys(data).length === 0) {
    // Default: return some general blockchain stats
    try {
      const btcBlocks = await fetch('https://blockchain.info/q/getblockcount');
      data.general = {
        btc_block_height: Number(await btcBlocks.text()),
        note: 'Specify "ethereum" or "bitcoin" for detailed on-chain data',
      };
    } catch {
      data.general = { note: 'On-chain data temporarily unavailable' };
    }
  }

  return {
    data,
    source: 'On-Chain Analytics',
    timestamp: Date.now(),
    latency_ms: Date.now() - start,
    cached: false,
  };
}

export const onchainDataTool: ToolConfig = {
  id: 'onchain_data',
  name: 'On-Chain Data',
  description: 'Get on-chain blockchain data: supply, hashrate, difficulty, block height',
  timeout: TOOL_TIMEOUTS.default,
  cacheTTL: 120,
  execute,
};

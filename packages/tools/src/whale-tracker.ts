import type { ToolConfig, ToolParams, ToolResult } from '@nexus/shared';
import { TOOL_TIMEOUTS } from '@nexus/shared';

async function execute(params: ToolParams): Promise<ToolResult> {
  const start = Date.now();
  const apiKey = process.env.WHALE_ALERT_API_KEY;

  if (!apiKey) {
    // Fallback: use Blockchain.com's public API for large BTC transactions
    const res = await fetch('https://blockchain.info/unconfirmed-transactions?format=json');
    if (!res.ok) throw new Error(`Blockchain API error: ${res.status}`);
    const json = await res.json();

    // Filter for large transactions (>10 BTC)
    const largeTxs = (json.txs || [])
      .filter((tx: any) => {
        const totalOut = tx.out?.reduce((sum: number, o: any) => sum + (o.value || 0), 0) || 0;
        return totalOut > 10 * 1e8; // >10 BTC in satoshis
      })
      .slice(0, 5)
      .map((tx: any) => {
        const totalBTC = tx.out.reduce((sum: number, o: any) => sum + (o.value || 0), 0) / 1e8;
        return {
          hash: tx.hash?.slice(0, 16) + '...',
          amount_btc: totalBTC.toFixed(4),
          inputs: tx.inputs?.length || 0,
          outputs: tx.out?.length || 0,
          time: new Date(tx.time * 1000).toISOString(),
        };
      });

    return {
      data: {
        network: 'Bitcoin',
        large_transactions: largeTxs,
        note: 'Showing unconfirmed transactions >10 BTC',
      },
      source: 'Blockchain.com Whale Tracker',
      timestamp: Date.now(),
      latency_ms: Date.now() - start,
      cached: false,
    };
  }

  // With Whale Alert API key
  const since = Math.floor(Date.now() / 1000) - 3600; // Last hour
  const res = await fetch(
    `https://api.whale-alert.io/v1/transactions?api_key=${apiKey}&min_value=500000&start=${since}`
  );

  if (!res.ok) throw new Error(`Whale Alert API error: ${res.status}`);
  const json = await res.json();

  const transactions = (json.transactions || []).slice(0, 10).map((tx: any) => ({
    blockchain: tx.blockchain,
    symbol: tx.symbol,
    amount: tx.amount,
    amount_usd: tx.amount_usd,
    from: tx.from?.owner_type || 'unknown',
    to: tx.to?.owner_type || 'unknown',
    hash: tx.hash?.slice(0, 16) + '...',
    timestamp: new Date(tx.timestamp * 1000).toISOString(),
  }));

  return {
    data: { transactions, count: json.count },
    source: 'Whale Alert',
    timestamp: Date.now(),
    latency_ms: Date.now() - start,
    cached: false,
  };
}

export const whaleTrackerTool: ToolConfig = {
  id: 'whale_tracker',
  name: 'Whale Tracker',
  description: 'Track large crypto transactions and whale movements',
  timeout: TOOL_TIMEOUTS.default,
  cacheTTL: 60,
  execute,
};

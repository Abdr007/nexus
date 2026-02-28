import type { ToolConfig, ToolParams, ToolResult } from '@nexus/shared';
import { TOOL_TIMEOUTS } from '@nexus/shared';

async function execute(_params: ToolParams): Promise<ToolResult> {
  const start = Date.now();

  // Use Etherscan free API (no key needed for gas oracle)
  const res = await fetch('https://api.etherscan.io/api?module=gastracker&action=gasoracle');
  if (!res.ok) throw new Error(`Etherscan API error: ${res.status}`);
  const json = await res.json();

  const result = json.result;

  const data = {
    low: Number(result.SafeGasPrice),
    average: Number(result.ProposeGasPrice),
    high: Number(result.FastGasPrice),
    base_fee: Number(result.suggestBaseFee),
    unit: 'Gwei',
    recommendation: getRecommendation(Number(result.ProposeGasPrice)),
  };

  return {
    data,
    source: 'Etherscan Gas Tracker',
    timestamp: Date.now(),
    latency_ms: Date.now() - start,
    cached: false,
  };
}

function getRecommendation(avgGas: number): string {
  if (avgGas < 10) return 'Very low gas — excellent time for transactions';
  if (avgGas < 25) return 'Low gas — good time for most transactions';
  if (avgGas < 50) return 'Moderate gas — normal network activity';
  if (avgGas < 100) return 'High gas — consider waiting for lower fees';
  return 'Very high gas — network congestion, delay non-urgent transactions';
}

export const gasTrackerTool: ToolConfig = {
  id: 'gas_tracker',
  name: 'ETH Gas Tracker',
  description: 'Get current Ethereum gas prices and fee recommendations',
  timeout: TOOL_TIMEOUTS.default,
  cacheTTL: 15,
  execute,
};

import type { ToolResult, Mode, MemoryContext } from '@nexus/shared';
import { MODE_PROMPTS, DEFAULT_MODE, TOKEN_LIMITS } from '@nexus/shared';

interface BuildPromptInput {
  userMessage: string;
  mode: Mode;
  memoryContext: MemoryContext;
  toolResults: ToolResult[] | null;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function formatToolResults(results: ToolResult[]): string {
  return results.map(r => {
    const data = typeof r.data === 'string' ? r.data : JSON.stringify(r.data, null, 2);
    return `[Source: ${r.source} | Fetched: ${new Date(r.timestamp).toISOString()} | Latency: ${r.latency_ms}ms]\n${data}`;
  }).join('\n\n');
}

export function buildPrompt(input: BuildPromptInput): { system: string; user: string } {
  const { userMessage, mode, memoryContext, toolResults } = input;
  const systemPrompt = MODE_PROMPTS[mode] || MODE_PROMPTS[DEFAULT_MODE];

  let contextBlock = '';
  let remaining = TOKEN_LIMITS.maxInputTokens - estimateTokens(systemPrompt) - estimateTokens(userMessage);

  // Priority 1: Tool data (most time-sensitive)
  if (toolResults && toolResults.length > 0) {
    const toolBlock = `\n\n---\n## Live Data (Retrieved Just Now)\n${formatToolResults(toolResults)}`;
    const toolTokens = estimateTokens(toolBlock);
    if (toolTokens < remaining) {
      contextBlock += toolBlock;
      remaining -= toolTokens;
    }
  }

  // Priority 2: Short-term memory
  if (memoryContext.shortTerm) {
    const stmBlock = `\n\n---\n## Recent Conversation\n${memoryContext.shortTerm}`;
    const stmTokens = estimateTokens(stmBlock);
    if (stmTokens < remaining) {
      contextBlock += stmBlock;
      remaining -= stmTokens;
    }
  }

  // Priority 3: Long-term memory (Phase 2)
  if (memoryContext.longTerm) {
    const ltmBlock = `\n\n---\n## User Context\n${memoryContext.longTerm}`;
    const ltmTokens = estimateTokens(ltmBlock);
    if (ltmTokens < remaining * 0.5) {
      contextBlock += ltmBlock;
    }
  }

  return {
    system: systemPrompt + contextBlock,
    user: userMessage,
  };
}

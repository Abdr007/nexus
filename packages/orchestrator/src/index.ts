import { classifyIntent } from './intent';
import { buildPrompt } from './prompt-builder';
import { generateFallbackResponse } from './fallback';
import { streamLLM, getAvailableModels, type Tier } from './llm-router';
import { dispatchTools } from '@nexus/tools';
import {
  getShortTermMemory, saveToShortTermMemory,
  getLongTermMemory, saveToLongTermMemory, shouldPersist,
} from '@nexus/memory';
import type { Mode, ChatEvent, ToolResult } from '@nexus/shared';
import { DEFAULT_MODE, log } from '@nexus/shared';

export interface OrchestrateOptions {
  message: string;
  userId: string;
  mode?: Mode;
  tier?: Tier;
}

async function fetchTools(needsTools: boolean, hints: string[], query: string): Promise<ToolResult[] | null> {
  if (!needsTools) return null;
  try {
    return await dispatchTools(hints as any, query);
  } catch (err) {
    log('error', 'Tool dispatch failed', { error: (err as Error).message });
    return null;
  }
}

export async function* orchestrate(options: OrchestrateOptions): AsyncGenerator<ChatEvent> {
  const { message, userId, mode = DEFAULT_MODE, tier = 'free' } = options;
  const startTime = Date.now();

  // Step 1: Classify intent (< 1ms, no network)
  const intent = classifyIntent(message);
  log('info', 'Intent classified', { intent, userId });

  // Step 2: Parallel fetch — tools + short-term memory + long-term memory
  const [toolResults, shortTermMemory, longTermMemory] = await Promise.all([
    fetchTools(intent.needsTools, intent.toolHints, message),
    getShortTermMemory(userId),
    getLongTermMemory(userId, message),
  ]);

  // Emit tool events
  if (toolResults && toolResults.length > 0) {
    for (const result of toolResults) {
      yield { type: 'tool_result', tool: result.source, data: result.data };
    }
  }

  // Check if any LLM is available
  const models = getAvailableModels();
  if (models.length === 0) {
    log('warn', 'No LLM configured — running in demo mode');
    const fallback = generateFallbackResponse(message, toolResults, mode);
    const words = fallback.split(' ');
    for (let i = 0; i < words.length; i++) {
      const token = (i === 0 ? '' : ' ') + words[i];
      yield { type: 'token', content: token };
      await new Promise(r => setTimeout(r, 8));
    }
    yield { type: 'done' };
    return;
  }

  // Step 3: Build prompt with both memory layers
  const { system, user } = buildPrompt({
    userMessage: message,
    mode,
    memoryContext: { shortTerm: shortTermMemory, longTerm: longTermMemory },
    toolResults,
  });

  // Step 4: Stream LLM response via router
  let fullResponse = '';
  let modelUsed = '';

  try {
    const maxTokens = tier === 'pro' ? 3000 : 1500;
    for await (const { token, model } of streamLLM({ system, user, maxTokens, temperature: 0.7 }, tier)) {
      fullResponse += token;
      modelUsed = model;
      yield { type: 'token', content: token };
    }
  } catch (err) {
    log('error', 'LLM streaming failed', { error: (err as Error).message });
    yield { type: 'error', content: 'Failed to generate response. Please try again.' };
    return;
  }

  // Step 5: Post-processing (non-blocking)
  const totalLatencyMs = Date.now() - startTime;
  log('info', 'Request completed', { userId, totalLatencyMs, modelUsed, toolsUsed: intent.toolHints });

  // Save to short-term memory
  const stmPromise = Promise.all([
    saveToShortTermMemory(userId, 'user', message),
    saveToShortTermMemory(userId, 'assistant', fullResponse),
  ]);

  // Check if user message should be persisted to long-term memory
  const persistence = shouldPersist(message);
  const ltmPromise = persistence.should
    ? saveToLongTermMemory(userId, message, persistence.type, persistence.importance)
    : Promise.resolve();

  Promise.all([stmPromise, ltmPromise])
    .catch(err => log('error', 'Memory save failed', { error: (err as Error).message }));

  yield { type: 'done' };
}

export { classifyIntent } from './intent';
export { buildPrompt } from './prompt-builder';
export { streamLLM, getAvailableModels } from './llm-router';

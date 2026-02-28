import Groq from 'groq-sdk';
import { classifyIntent } from './intent';
import { buildPrompt } from './prompt-builder';
import { dispatchTools } from '@nexus/tools';
import { getShortTermMemory, saveToShortTermMemory } from '@nexus/memory';
import type { Mode, ChatEvent, ToolResult } from '@nexus/shared';
import { GROQ_MODEL, DEFAULT_MODE, log } from '@nexus/shared';

let groq: Groq | null = null;

function getGroq(): Groq {
  if (groq) return groq;
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groq;
}

export interface OrchestrateOptions {
  message: string;
  userId: string;
  mode?: Mode;
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
  const { message, userId, mode = DEFAULT_MODE } = options;
  const startTime = Date.now();

  // Step 1: Classify intent (< 1ms, no network)
  const intent = classifyIntent(message);
  log('info', 'Intent classified', { intent, userId });

  // Step 2: Parallel fetch — tools + memory
  const [toolResults, shortTermMemory] = await Promise.all([
    fetchTools(intent.needsTools, intent.toolHints, message),
    getShortTermMemory(userId),
  ]);

  // Emit tool events
  if (toolResults && toolResults.length > 0) {
    for (const result of toolResults) {
      yield { type: 'tool_result', tool: result.source, data: result.data };
    }
  }

  // Step 3: Build prompt
  const { system, user } = buildPrompt({
    userMessage: message,
    mode,
    memoryContext: { shortTerm: shortTermMemory, longTerm: '' },
    toolResults,
  });

  // Step 4: Stream LLM response
  const client = getGroq();
  let fullResponse = '';

  try {
    const stream = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: 1500,
      temperature: 0.7,
      stream: true,
    });

    for await (const chunk of stream) {
      const token = chunk.choices[0]?.delta?.content;
      if (token) {
        fullResponse += token;
        yield { type: 'token', content: token };
      }
    }
  } catch (err) {
    log('error', 'LLM streaming failed', { error: (err as Error).message });
    yield { type: 'error', content: 'Failed to generate response. Please try again.' };
    return;
  }

  // Step 5: Post-processing (non-blocking)
  const totalLatencyMs = Date.now() - startTime;
  log('info', 'Request completed', { userId, totalLatencyMs, toolsUsed: intent.toolHints });

  // Save to memory (fire and forget)
  Promise.all([
    saveToShortTermMemory(userId, 'user', message),
    saveToShortTermMemory(userId, 'assistant', fullResponse),
  ]).catch(err => log('error', 'Memory save failed', { error: (err as Error).message }));

  yield { type: 'done' };
}

export { classifyIntent } from './intent';
export { buildPrompt } from './prompt-builder';

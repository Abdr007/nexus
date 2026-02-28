import { log } from '@nexus/shared';

export interface LLMStreamOptions {
  system: string;
  user: string;
  maxTokens: number;
  temperature: number;
}

export type Tier = 'free' | 'pro';

/**
 * Stream from Anthropic API using native fetch.
 */
async function* streamClaude(
  system: string,
  user: string,
  maxTokens: number,
  temperature: number,
  model: string,
): AsyncGenerator<{ token: string; model: string }> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      system,
      messages: [{ role: 'user', content: user }],
      stream: true,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Claude API ${res.status}: ${errText}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body from Claude');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;
      const data = trimmed.slice(6);

      try {
        const parsed = JSON.parse(data);
        if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
          yield { token: parsed.delta.text, model };
        }
      } catch {
        // skip
      }
    }
  }
}

/**
 * Routes to the best Claude model based on tier:
 * - Pro tier  → Claude Sonnet 4.6 (deeper analysis)
 * - Free tier → Claude Haiku 4.5 (fast, capable)
 */
export async function* streamLLM(
  options: LLMStreamOptions,
  tier: Tier = 'free'
): AsyncGenerator<{ token: string; model: string }> {
  const { system, user, maxTokens, temperature } = options;

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('No LLM provider available — set ANTHROPIC_API_KEY');
  }

  const model = tier === 'pro' ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001';
  log('info', `Using ${model} for ${tier} tier`);
  yield* streamClaude(system, user, maxTokens, temperature, model);
}

export function getAvailableModels(): string[] {
  const models: string[] = [];
  if (process.env.ANTHROPIC_API_KEY) {
    models.push('claude-haiku-4-5 (Free)');
    models.push('claude-sonnet-4-6 (Pro)');
  }
  return models;
}

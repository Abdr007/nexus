import { log } from '@nexus/shared';

export interface LLMStreamOptions {
  system: string;
  user: string;
  maxTokens: number;
  temperature: number;
}

export type Tier = 'free' | 'pro';

/**
 * Stream from Groq API using native fetch (works reliably on Vercel serverless).
 */
async function* streamGroq(
  system: string,
  user: string,
  maxTokens: number,
  temperature: number,
): AsyncGenerator<{ token: string; model: string }> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: maxTokens,
      temperature,
      stream: true,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API ${res.status}: ${errText}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body from Groq');

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
      if (data === '[DONE]') return;

      try {
        const parsed = JSON.parse(data);
        const token = parsed.choices?.[0]?.delta?.content;
        if (token) {
          yield { token, model: 'llama-3.3-70b' };
        }
      } catch {
        // skip malformed chunks
      }
    }
  }
}

/**
 * Stream from Anthropic API using native fetch.
 */
async function* streamClaude(
  system: string,
  user: string,
  maxTokens: number,
  temperature: number,
): AsyncGenerator<{ token: string; model: string }> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
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
          yield { token: parsed.delta.text, model: 'claude-sonnet-4-6' };
        }
      } catch {
        // skip
      }
    }
  }
}

/**
 * Routes to the best available LLM based on tier:
 * - Pro tier → Claude Sonnet (if available) → Groq fallback
 * - Free tier → Groq Llama 3.3 70B
 */
export async function* streamLLM(
  options: LLMStreamOptions,
  tier: Tier = 'free'
): AsyncGenerator<{ token: string; model: string }> {
  const { system, user, maxTokens, temperature } = options;

  // Pro tier: try Claude first
  if (tier === 'pro' && process.env.ANTHROPIC_API_KEY) {
    try {
      log('info', 'Using Claude Sonnet for pro tier');
      yield* streamClaude(system, user, maxTokens, temperature);
      return;
    } catch (err) {
      log('warn', 'Claude failed, falling back to Groq', { error: (err as Error).message });
    }
  }

  // Free tier or Claude fallback: use Groq
  if (!process.env.GROQ_API_KEY) {
    throw new Error('No LLM provider available');
  }

  log('info', 'Using Groq Llama 3.3 70B');
  yield* streamGroq(system, user, maxTokens, temperature);
}

export function getAvailableModels(): string[] {
  const models: string[] = [];
  if (process.env.GROQ_API_KEY) models.push('llama-3.3-70b (Groq)');
  if (process.env.ANTHROPIC_API_KEY) models.push('claude-sonnet-4-6 (Anthropic)');
  return models;
}

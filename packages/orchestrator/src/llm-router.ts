import Groq from 'groq-sdk';
import Anthropic from '@anthropic-ai/sdk';
import { log } from '@nexus/shared';

export interface LLMStreamOptions {
  system: string;
  user: string;
  maxTokens: number;
  temperature: number;
}

export type Tier = 'free' | 'pro';

let groq: Groq | null = null;
let anthropic: Anthropic | null = null;

function getGroq(): Groq | null {
  if (!process.env.GROQ_API_KEY) return null;
  if (groq) return groq;
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groq;
}

function getAnthropic(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (anthropic) return anthropic;
  anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return anthropic;
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
  if (tier === 'pro') {
    const claude = getAnthropic();
    if (claude) {
      try {
        log('info', 'Using Claude Sonnet for pro tier');
        const stream = claude.messages.stream({
          model: 'claude-sonnet-4-6',
          max_tokens: maxTokens,
          temperature,
          system,
          messages: [{ role: 'user', content: user }],
        });

        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            yield { token: event.delta.text, model: 'claude-sonnet-4-6' };
          }
        }
        return;
      } catch (err) {
        log('warn', 'Claude failed, falling back to Groq', { error: (err as Error).message });
      }
    }
  }

  // Free tier or Claude fallback: use Groq
  const groqClient = getGroq();
  if (!groqClient) {
    throw new Error('No LLM provider available');
  }

  const stream = await groqClient.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    max_tokens: maxTokens,
    temperature,
    stream: true,
  });

  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content;
    if (token) {
      yield { token, model: 'llama-3.3-70b' };
    }
  }
}

export function getAvailableModels(): string[] {
  const models: string[] = [];
  if (process.env.GROQ_API_KEY) models.push('llama-3.3-70b (Groq)');
  if (process.env.ANTHROPIC_API_KEY) models.push('claude-sonnet-4-6 (Anthropic)');
  return models;
}

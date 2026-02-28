import { Redis } from '@upstash/redis';
import type { MemoryEntry } from '@nexus/shared';
import { log } from '@nexus/shared';

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    log('warn', 'Upstash Redis not configured, short-term memory disabled');
    return null;
  }
  redis = new Redis({ url, token });
  return redis;
}

const MAX_ENTRIES = 20;
const TTL_SECONDS = 86400; // 24 hours

function key(userId: string): string {
  return `stm:${userId}`;
}

export async function getShortTermMemory(userId: string): Promise<string> {
  const r = getRedis();
  if (!r) return '';

  try {
    const start = Date.now();
    const raw = await r.lrange<string>(key(userId), 0, MAX_ENTRIES - 1);
    log('info', 'Short-term memory retrieved', { userId, entries: raw.length, latencyMs: Date.now() - start });

    if (!raw || raw.length === 0) return '';

    const entries: MemoryEntry[] = raw.map(item =>
      typeof item === 'string' ? JSON.parse(item) : item
    );

    return entries
      .map(e => `[${e.role}]: ${e.summary || e.content}`)
      .join('\n');
  } catch (err) {
    log('error', 'Failed to retrieve short-term memory', { error: (err as Error).message });
    return '';
  }
}

export async function saveToShortTermMemory(
  userId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<void> {
  const r = getRedis();
  if (!r) return;

  try {
    const entry: MemoryEntry = {
      role,
      content: content.slice(0, 500), // Cap stored content
      timestamp: Date.now(),
    };

    const k = key(userId);
    await r.lpush(k, JSON.stringify(entry));
    await r.ltrim(k, 0, MAX_ENTRIES - 1);
    await r.expire(k, TTL_SECONDS);
  } catch (err) {
    log('error', 'Failed to save short-term memory', { error: (err as Error).message });
  }
}

export async function clearShortTermMemory(userId: string): Promise<void> {
  const r = getRedis();
  if (!r) return;
  await r.del(key(userId));
}

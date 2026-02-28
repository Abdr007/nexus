import { log } from '@nexus/shared';

interface LongTermMemory {
  id: string;
  content: string;
  memory_type: string;
  importance: number;
  similarity: number;
}

interface SupabaseConfig {
  url: string;
  serviceKey: string;
}

function getConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return { url, serviceKey };
}

/**
 * Generate a simple embedding using a hash-based approach.
 * For production, replace with a real embedding model (e.g., Supabase edge function + all-MiniLM-L6-v2).
 * This is a 384-dim pseudo-embedding that enables basic similarity search.
 */
function generateSimpleEmbedding(text: string): number[] {
  const dim = 384;
  const embedding = new Array(dim).fill(0);
  const lower = text.toLowerCase();

  for (let i = 0; i < lower.length; i++) {
    const charCode = lower.charCodeAt(i);
    const idx = (charCode * (i + 1)) % dim;
    embedding[idx] += 1;
  }

  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum: number, v: number) => sum + v * v, 0));
  if (magnitude > 0) {
    for (let i = 0; i < dim; i++) {
      embedding[i] = embedding[i] / magnitude;
    }
  }

  return embedding;
}

export async function getLongTermMemory(userId: string, query: string): Promise<string> {
  const config = getConfig();
  if (!config) return '';

  try {
    const start = Date.now();
    const embedding = generateSimpleEmbedding(query);

    const res = await fetch(`${config.url}/rest/v1/rpc/match_memories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.serviceKey,
        'Authorization': `Bearer ${config.serviceKey}`,
      },
      body: JSON.stringify({
        query_embedding: embedding,
        match_user_id: userId,
        match_threshold: 0.5,
        match_count: 5,
      }),
    });

    if (!res.ok) {
      log('warn', 'Long-term memory query failed', { status: res.status });
      return '';
    }

    const memories: LongTermMemory[] = await res.json();
    log('info', 'Long-term memory retrieved', { userId, count: memories.length, latencyMs: Date.now() - start });

    if (!memories.length) return '';

    return memories
      .map(m => `- [${m.memory_type}] ${m.content}`)
      .join('\n');
  } catch (err) {
    log('error', 'Long-term memory error', { error: (err as Error).message });
    return '';
  }
}

export async function saveToLongTermMemory(
  userId: string,
  content: string,
  memoryType: 'preference' | 'fact' | 'portfolio' | 'interaction',
  importance: number = 0.5
): Promise<void> {
  const config = getConfig();
  if (!config) return;

  try {
    const embedding = generateSimpleEmbedding(content);

    const res = await fetch(`${config.url}/rest/v1/memories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.serviceKey,
        'Authorization': `Bearer ${config.serviceKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        user_id: userId,
        content,
        embedding,
        memory_type: memoryType,
        importance,
      }),
    });

    if (!res.ok) {
      log('warn', 'Failed to save long-term memory', { status: res.status });
    }
  } catch (err) {
    log('error', 'Long-term memory save error', { error: (err as Error).message });
  }
}

/**
 * Detects if a message contains information worth persisting.
 */
export function shouldPersist(message: string): { should: boolean; type: 'preference' | 'fact' | 'portfolio' | 'interaction'; importance: number } {
  const lower = message.toLowerCase();

  // Portfolio mentions
  if (/\b(i (hold|have|own|bought)|my (portfolio|bag|position|holdings?))\b/i.test(lower)) {
    return { should: true, type: 'portfolio', importance: 0.8 };
  }

  // Explicit preferences
  if (/\b(i (prefer|like|want|always|usually|mostly)|remember that|my favorite)\b/i.test(lower)) {
    return { should: true, type: 'preference', importance: 0.7 };
  }

  // Explicit save requests
  if (/\b(remember|save|note|keep in mind)\b/i.test(lower)) {
    return { should: true, type: 'preference', importance: 0.9 };
  }

  return { should: false, type: 'interaction', importance: 0.3 };
}

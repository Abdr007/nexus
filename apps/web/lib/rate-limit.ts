import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let rateLimiters: { free: Ratelimit; pro: Ratelimit } | null = null;

export function getRateLimiters() {
  if (rateLimiters) return rateLimiters;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const redis = new Redis({ url, token });

  rateLimiters = {
    free: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, '1 h'),
      prefix: 'rl:free',
    }),
    pro: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(200, '1 h'),
      prefix: 'rl:pro',
    }),
  };

  return rateLimiters;
}

export async function checkRateLimit(
  userId: string,
  tier: 'free' | 'pro' = 'free'
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const limiters = getRateLimiters();
  if (!limiters) return { allowed: true, remaining: 999, reset: 0 };

  const limiter = tier === 'pro' ? limiters.pro : limiters.free;
  const result = await limiter.limit(userId);

  return {
    allowed: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}

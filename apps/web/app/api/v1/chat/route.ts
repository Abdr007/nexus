import { NextRequest } from 'next/server';
import { orchestrate } from '@nexus/orchestrator';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import type { Mode } from '@nexus/shared';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, mode = 'analyst' } = body as { message: string; mode?: Mode };

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    if (message.length > 2000) {
      return Response.json({ error: 'Message too long (max 2000 chars)' }, { status: 400 });
    }

    // Get authenticated user or fall back to session header
    let userId = req.headers.get('x-session-id') || 'anonymous';
    let tier: 'free' | 'pro' = 'free';

    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          userId = user.id;
          // Check pro tier from user metadata
          tier = user.user_metadata?.tier === 'pro' ? 'pro' : 'free';
        }
      } catch {
        // Auth not configured — use fallback
      }
    }

    // Rate limiting
    const rateCheck = await checkRateLimit(userId, tier);
    if (!rateCheck.allowed) {
      return Response.json(
        { error: 'Rate limit exceeded. Upgrade to Pro for higher limits.', reset: rateCheck.reset },
        { status: 429, headers: { 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': String(rateCheck.reset) } }
      );
    }

    const stream = orchestrate({ message: message.trim(), userId, mode, tier });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            const data = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
        } catch {
          const errorEvent = `data: ${JSON.stringify({ type: 'error', content: 'Stream interrupted' })}\n\n`;
          controller.enqueue(encoder.encode(errorEvent));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-RateLimit-Remaining': String(rateCheck.remaining),
      },
    });
  } catch (err) {
    console.error('Chat API error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

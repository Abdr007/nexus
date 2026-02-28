import { NextRequest } from 'next/server';
import { orchestrate } from '@nexus/orchestrator';
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

    // For MVP, use a session-based user ID (no auth yet)
    const userId = req.headers.get('x-session-id') || 'anonymous';

    const stream = orchestrate({ message: message.trim(), userId, mode });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            const data = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
        } catch (err) {
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
      },
    });
  } catch (err) {
    console.error('Chat API error:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

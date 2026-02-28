import { NextRequest } from 'next/server';
import { getRegisteredPlugins, registerPlugin, unregisterPlugin } from '@nexus/tools/src/plugin-loader';

export async function GET() {
  const plugins = getRegisteredPlugins();
  return Response.json({ plugins });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const manifest = await req.json();

  if (!manifest.id || !manifest.name || !manifest.endpoint) {
    return Response.json({ error: 'Plugin must have id, name, and endpoint' }, { status: 400 });
  }

  const tool = registerPlugin(manifest);
  return Response.json({ registered: true, tool_id: tool.id });
}

export async function DELETE(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await req.json();
  const removed = unregisterPlugin(id);
  return Response.json({ removed });
}

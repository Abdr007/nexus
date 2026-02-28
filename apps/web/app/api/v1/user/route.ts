import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return Response.json({ user: null });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ user: null });

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return Response.json({
    user: {
      id: user.id,
      email: user.email,
      tier: profile?.tier || user.user_metadata?.tier || 'free',
      preferences: profile?.preferences || {},
      created_at: user.created_at,
    },
  });
}

export async function PATCH(req: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return Response.json({ error: 'Auth required' }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { preferences } = await req.json();

  const { error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: user.id,
      preferences,
      updated_at: new Date().toISOString(),
    });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

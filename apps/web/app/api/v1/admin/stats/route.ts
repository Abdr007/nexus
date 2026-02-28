import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  // Admin auth: check for admin secret
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // Return mock stats if no Supabase
    return Response.json({
      users: { total: 0, pro: 0, active_24h: 0 },
      requests: { total: 0, today: 0, avg_latency_ms: 0 },
      tools: { most_used: [], cache_hit_rate: 0 },
      revenue: { mrr: 0, total: 0 },
    });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const yesterday = new Date(now.getTime() - 86400000).toISOString();

  // Parallel queries
  const [usersRes, proUsersRes, totalReqRes, todayReqRes, avgLatencyRes] = await Promise.all([
    supabase.from('user_profiles').select('user_id', { count: 'exact', head: true }),
    supabase.from('user_profiles').select('user_id', { count: 'exact', head: true }).eq('tier', 'pro'),
    supabase.from('request_logs').select('id', { count: 'exact', head: true }),
    supabase.from('request_logs').select('id', { count: 'exact', head: true }).gte('created_at', today),
    supabase.from('request_logs').select('total_latency_ms').gte('created_at', yesterday).limit(100),
  ]);

  const avgLatency = avgLatencyRes.data?.length
    ? Math.round(avgLatencyRes.data.reduce((sum: number, r: any) => sum + (r.total_latency_ms || 0), 0) / avgLatencyRes.data.length)
    : 0;

  // Tool usage stats
  const { data: recentLogs } = await supabase
    .from('request_logs')
    .select('tools_used')
    .gte('created_at', yesterday)
    .limit(500);

  const toolCounts: Record<string, number> = {};
  recentLogs?.forEach((log: any) => {
    (log.tools_used || []).forEach((tool: string) => {
      toolCounts[tool] = (toolCounts[tool] || 0) + 1;
    });
  });

  const mostUsed = Object.entries(toolCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([tool, count]) => ({ tool, count }));

  return Response.json({
    users: {
      total: usersRes.count || 0,
      pro: proUsersRes.count || 0,
      active_24h: new Set(recentLogs?.map((l: any) => l.user_id)).size,
    },
    requests: {
      total: totalReqRes.count || 0,
      today: todayReqRes.count || 0,
      avg_latency_ms: avgLatency,
    },
    tools: {
      most_used: mostUsed,
    },
    revenue: {
      mrr: (proUsersRes.count || 0) * 9,
      pro_users: proUsersRes.count || 0,
    },
  });
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stats {
  users: { total: number; pro: number; active_24h: number };
  requests: { total: number; today: number; avg_latency_ms: number };
  tools: { most_used: { tool: string; count: number }[] };
  revenue: { mrr: number; pro_users: number };
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [secret, setSecret] = useState('');
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState('');

  const fetchStats = async (key: string) => {
    const res = await fetch('/api/v1/admin/stats', {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      setError('Invalid admin key');
      return;
    }
    setStats(await res.json());
    setAuthed(true);
    setError('');
  };

  useEffect(() => {
    if (authed) {
      const interval = setInterval(() => fetchStats(secret), 30000);
      return () => clearInterval(interval);
    }
  }, [authed, secret]);

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-nexus-bg px-4">
        <div className="w-full max-w-sm">
          <h1 className="mb-6 text-center text-xl font-bold text-nexus-text">Admin Dashboard</h1>
          <form
            onSubmit={e => { e.preventDefault(); fetchStats(secret); }}
            className="space-y-3"
          >
            <input
              type="password"
              placeholder="Admin secret"
              value={secret}
              onChange={e => setSecret(e.target.value)}
              className="w-full rounded-xl border border-nexus-border bg-nexus-surface px-4 py-3 text-sm text-nexus-text placeholder:text-nexus-muted focus:border-nexus-accent focus:outline-none"
            />
            {error && <p className="text-xs text-nexus-red">{error}</p>}
            <button type="submit" className="w-full rounded-xl bg-nexus-accent px-4 py-3 text-sm font-medium text-white">
              Access Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nexus-bg">
      <header className="flex items-center justify-between border-b border-nexus-border px-6 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-nexus-accent">N</span>exus
          </Link>
          <span className="text-xs text-nexus-red border border-nexus-red/30 px-2 py-0.5 rounded">Admin</span>
        </div>
        <Link href="/" className="text-xs text-nexus-muted hover:text-nexus-text">Back to App</Link>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Users" value={stats?.users.total || 0} />
          <StatCard label="Pro Users" value={stats?.users.pro || 0} accent />
          <StatCard label="Requests Today" value={stats?.requests.today || 0} />
          <StatCard label="Avg Latency" value={`${stats?.requests.avg_latency_ms || 0}ms`} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Revenue */}
          <div className="rounded-xl border border-nexus-border bg-nexus-surface p-4">
            <h3 className="mb-3 text-sm font-semibold">Revenue</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-nexus-muted">MRR</span>
                <span className="text-sm font-bold text-nexus-green">${stats?.revenue.mrr || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-nexus-muted">Pro subscribers</span>
                <span className="text-sm font-medium">{stats?.revenue.pro_users || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-nexus-muted">Total requests</span>
                <span className="text-sm font-medium">{stats?.requests.total?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>

          {/* Tool Usage */}
          <div className="rounded-xl border border-nexus-border bg-nexus-surface p-4">
            <h3 className="mb-3 text-sm font-semibold">Tool Usage (24h)</h3>
            {stats?.tools.most_used && stats.tools.most_used.length > 0 ? (
              <div className="space-y-2">
                {stats.tools.most_used.map(t => (
                  <div key={t.tool} className="flex items-center justify-between">
                    <span className="text-sm text-nexus-muted">{t.tool}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 rounded-full bg-nexus-accent" style={{ width: `${Math.min(t.count * 2, 120)}px` }} />
                      <span className="text-xs text-nexus-muted w-8 text-right">{t.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-nexus-muted">No tool usage data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-nexus-border bg-nexus-surface p-4">
      <p className="text-xs text-nexus-muted mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent ? 'text-nexus-accent' : ''}`}>{value}</p>
    </div>
  );
}

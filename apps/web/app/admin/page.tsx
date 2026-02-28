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
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm animate-scale-in">
          <div className="mb-8 flex flex-col items-center">
            <div className="relative mb-4">
              <div className="absolute inset-0 rounded-full bg-nexus-red/20 blur-2xl" />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-nexus-red/20 border border-nexus-red/30">
                <svg className="h-6 w-6 text-nexus-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
            </div>
            <h1 className="text-xl font-bold text-nexus-text">Admin Dashboard</h1>
          </div>

          <div className="glass-card p-6">
            <form
              onSubmit={e => { e.preventDefault(); fetchStats(secret); }}
              className="space-y-3"
            >
              <input
                type="password"
                placeholder="Admin secret"
                value={secret}
                onChange={e => setSecret(e.target.value)}
                className="input-field"
              />
              {error && <p className="text-xs text-nexus-red">{error}</p>}
              <button type="submit" className="btn-accent w-full">
                Access Dashboard
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="glass-surface flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-gradient">N</span>exus
          </Link>
          <span className="badge-red">Admin</span>
        </div>
        <Link href="/" className="btn-ghost text-xs">Back to App</Link>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Users"
            value={stats?.users.total || 0}
            icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>}
          />
          <StatCard
            label="Pro Users"
            value={stats?.users.pro || 0}
            accent
            icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>}
          />
          <StatCard
            label="Requests Today"
            value={stats?.requests.today || 0}
            icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>}
          />
          <StatCard
            label="Avg Latency"
            value={`${stats?.requests.avg_latency_ms || 0}ms`}
            icon={<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Revenue */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <svg className="h-4 w-4 text-nexus-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-sm font-semibold">Revenue</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-nexus-muted">MRR</span>
                <span className="text-sm font-bold text-nexus-green">${stats?.revenue.mrr || 0}</span>
              </div>
              <div className="divider" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-nexus-muted">Pro subscribers</span>
                <span className="text-sm font-medium">{stats?.revenue.pro_users || 0}</span>
              </div>
              <div className="divider" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-nexus-muted">Total requests</span>
                <span className="text-sm font-medium">{stats?.requests.total?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>

          {/* Tool Usage */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <svg className="h-4 w-4 text-nexus-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.42 15.17l-5.384 3.08A1 1 0 014.5 17.33V6.67a1 1 0 011.536-.92l5.384 3.08a1 1 0 010 1.74zM15.75 9.75h4.5m-4.5 4.5h4.5" />
              </svg>
              <h3 className="text-sm font-semibold">Tool Usage (24h)</h3>
            </div>
            {stats?.tools.most_used && stats.tools.most_used.length > 0 ? (
              <div className="space-y-3">
                {stats.tools.most_used.map(t => {
                  const maxCount = Math.max(...stats.tools.most_used.map(x => x.count));
                  const pct = maxCount > 0 ? (t.count / maxCount) * 100 : 0;
                  return (
                    <div key={t.tool}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-nexus-muted">{t.tool}</span>
                        <span className="text-xs font-medium text-nexus-text">{t.count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-accent transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
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

function StatCard({ label, value, accent, icon }: { label: string; value: string | number; accent?: boolean; icon: React.ReactNode }) {
  return (
    <div className={`glass-card group p-4 transition-all duration-300 hover:shadow-glow-sm ${accent ? 'hover:border-nexus-accent/20' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-nexus-muted">{label}</p>
        <span className={`${accent ? 'text-nexus-accent' : 'text-nexus-muted'}`}>{icon}</span>
      </div>
      <p className={`text-2xl font-bold ${accent ? 'text-gradient' : 'text-nexus-text-bright'}`}>{value}</p>
    </div>
  );
}

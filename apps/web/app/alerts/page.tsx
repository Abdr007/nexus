'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserMenu } from '@/components/auth/user-menu';

interface Alert {
  id: string;
  coin_id: string;
  symbol?: string;
  target_price: number;
  direction: 'above' | 'below';
  active: boolean;
  triggered?: boolean;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [coinId, setCoinId] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [direction, setDirection] = useState<'above' | 'below'>('above');
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  async function fetchAlerts() {
    try {
      const res = await fetch('/api/v1/alerts');
      if (!res.ok) throw new Error('Unauthorized');
      const data = await res.json();
      setAlerts(data.alerts || data);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAlerts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!coinId.trim() || !targetPrice) return;
    setCreating(true);
    try {
      await fetch('/api/v1/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coin_id: coinId.trim().toLowerCase(),
          target_price: parseFloat(targetPrice),
          direction,
        }),
      });
      setCoinId('');
      setTargetPrice('');
      setDirection('above');
      await fetchAlerts();
    } catch {
      // silently fail
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch('/api/v1/alerts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch {
      // silently fail
    }
  }

  return (
    <div className="min-h-screen">
      <header className="glass-surface sticky top-0 z-30 flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-gradient">N</span>exus
          </Link>
          <span className="badge-accent hidden sm:inline-flex">Alerts</span>
        </div>
        <UserMenu />
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-2xl font-bold text-nexus-text-bright mb-6 animate-fade-in">Price Alerts</h1>

        {/* Create Form */}
        <form onSubmit={handleCreate} className="glass-card p-4 mb-8 animate-slide-up" style={{ animationFillMode: 'forwards' }}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="block text-xs text-nexus-muted mb-1">Coin ID</label>
              <input
                type="text"
                placeholder="e.g. bitcoin, ethereum"
                value={coinId}
                onChange={(e) => setCoinId(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="w-full sm:w-36">
              <label className="block text-xs text-nexus-muted mb-1">Target Price</label>
              <input
                type="number"
                step="any"
                placeholder="$0.00"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                className="input-field"
              />
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setDirection('above')}
                className={`rounded-lg px-3 py-3 text-xs font-medium transition-all duration-200 ${
                  direction === 'above'
                    ? 'bg-nexus-green/20 text-nexus-green border border-nexus-green/30'
                    : 'bg-white/[0.04] text-nexus-muted hover:bg-white/[0.08]'
                }`}
              >
                Above
              </button>
              <button
                type="button"
                onClick={() => setDirection('below')}
                className={`rounded-lg px-3 py-3 text-xs font-medium transition-all duration-200 ${
                  direction === 'below'
                    ? 'bg-nexus-red/20 text-nexus-red border border-nexus-red/30'
                    : 'bg-white/[0.04] text-nexus-muted hover:bg-white/[0.08]'
                }`}
              >
                Below
              </button>
            </div>
            <button type="submit" disabled={creating || !coinId.trim() || !targetPrice} className="btn-accent whitespace-nowrap">
              {creating ? 'Creating...' : 'Create Alert'}
            </button>
          </div>
        </form>

        {/* Loading */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20 rounded-2xl" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center py-20 animate-fade-in">
            <svg className="h-16 w-16 text-nexus-muted/40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <p className="text-nexus-muted text-sm">No alerts set</p>
            <p className="text-nexus-muted/60 text-xs mt-1">Create an alert above to get notified on price changes</p>
          </div>
        ) : (
          /* Alert List */
          <div className="space-y-3">
            {alerts.map((alert, i) => (
              <div
                key={alert.id}
                className={`glass-card flex items-center justify-between p-4 animate-slide-up stagger-${Math.min(i + 1, 6)}`}
                style={{ animationFillMode: 'forwards' }}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-sm font-semibold text-nexus-text-bright uppercase">
                      {alert.symbol || alert.coin_id}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-nexus-muted">
                        {alert.direction === 'above' ? 'Above' : 'Below'} ${alert.target_price.toLocaleString()}
                      </span>
                      <svg
                        className={`h-3 w-3 ${alert.direction === 'above' ? 'text-nexus-green' : 'text-nexus-red rotate-180'}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {alert.active && !alert.triggered ? (
                    <span className="badge-green">Active</span>
                  ) : (
                    <span className="badge-yellow">{alert.triggered ? 'Triggered' : 'Inactive'}</span>
                  )}
                  <button
                    onClick={() => handleDelete(alert.id)}
                    className="rounded-lg p-1.5 text-nexus-muted transition-colors hover:bg-nexus-red/10 hover:text-nexus-red"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

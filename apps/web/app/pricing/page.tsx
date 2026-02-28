'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserMenu } from '@/components/auth/user-menu';

const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      '20 messages/hour',
      '3 tools (price, news, sentiment)',
      'Claude Haiku 4.5',
      'Short-term memory',
    ],
  },
  pro: {
    name: 'Pro',
    price: 9,
    features: [
      '200 messages/hour',
      'All tools (DeFi, on-chain, whale alerts)',
      'Claude Sonnet 4.6 for deeper analysis',
      'Long-term memory',
      'Portfolio tracking',
      'Conversation history',
      'Priority support',
    ],
  },
};

export default function PricingPage() {
  const [tier, setTier] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetch('/api/v1/user')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setTier(data?.tier ?? null))
      .catch(() => setTier(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleCheckout() {
    setActionLoading(true);
    try {
      const res = await fetch('/api/v1/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'checkout' }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      // silently fail
    } finally {
      setActionLoading(false);
    }
  }

  async function handlePortal() {
    setActionLoading(true);
    try {
      const res = await fetch('/api/v1/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'portal' }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      // silently fail
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-surface sticky top-0 z-30 flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-gradient">N</span>exus
          </Link>
          <span className="badge-accent hidden sm:inline-flex">Pricing</span>
        </div>
        <UserMenu />
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-12 text-center animate-fade-in">
          <h1 className="text-3xl font-bold text-nexus-text-bright mb-2">
            Simple, transparent pricing
          </h1>
          <p className="text-nexus-muted">
            Start free, upgrade when you need more power.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Free Plan */}
          <div className="glass-card p-8 animate-slide-up stagger-1" style={{ animationFillMode: 'forwards' }}>
            <h2 className="text-lg font-semibold text-nexus-text-bright">{PLANS.free.name}</h2>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-nexus-text-bright">$0</span>
              <span className="text-nexus-muted text-sm">/month</span>
            </div>
            <div className="divider my-6" />
            <ul className="space-y-3">
              {PLANS.free.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-nexus-muted">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-nexus-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            {!loading && tier === 'free' && (
              <div className="mt-8">
                <span className="badge-green">Current plan</span>
              </div>
            )}
          </div>

          {/* Pro Plan */}
          <div
            className="glass-card relative p-8 animate-slide-up stagger-2 border-nexus-accent/30 shadow-glow"
            style={{ animationFillMode: 'forwards' }}
          >
            <div className="absolute -top-3 right-6">
              <span className="badge-accent">Popular</span>
            </div>
            <h2 className="text-lg font-semibold text-nexus-text-bright">{PLANS.pro.name}</h2>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-gradient">$9</span>
              <span className="text-nexus-muted text-sm">/month</span>
            </div>
            <div className="divider my-6" />
            <ul className="space-y-3">
              {PLANS.pro.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-nexus-muted">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-nexus-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              {loading ? (
                <div className="skeleton h-12 w-full rounded-xl" />
              ) : tier === 'pro' ? (
                <button onClick={handlePortal} disabled={actionLoading} className="btn-ghost w-full border border-nexus-accent/20 py-3">
                  {actionLoading ? 'Loading...' : 'Manage Subscription'}
                </button>
              ) : (
                <button onClick={handleCheckout} disabled={actionLoading} className="btn-accent w-full">
                  {actionLoading ? 'Loading...' : 'Upgrade to Pro'}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

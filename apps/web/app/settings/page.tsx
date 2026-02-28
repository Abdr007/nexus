'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { UserMenu } from '@/components/auth/user-menu';

const MODES = ['analyst', 'trader', 'defi', 'risk'] as const;

interface UserData {
  email: string;
  tier: string;
  created_at: string;
  preferences?: { defaultMode?: string };
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [defaultMode, setDefaultMode] = useState('analyst');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetch('/api/v1/user')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => {
        setUser(data);
        if (data.preferences?.defaultMode) {
          setDefaultMode(data.preferences.defaultMode);
        }
      })
      .catch(() => router.push('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch('/api/v1/user', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: { defaultMode } }),
      });
    } catch {
      // silently fail
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push('/login');
    router.refresh();
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <header className="glass-surface sticky top-0 z-30 flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold tracking-tight">
              <span className="text-gradient">N</span>exus
            </Link>
            <span className="badge-accent hidden sm:inline-flex">Settings</span>
          </div>
          <UserMenu />
        </header>
        <main className="mx-auto max-w-2xl px-6 py-16 space-y-6">
          <div className="skeleton h-48 w-full rounded-2xl" />
          <div className="skeleton h-36 w-full rounded-2xl" />
          <div className="skeleton h-36 w-full rounded-2xl" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="glass-surface sticky top-0 z-30 flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-gradient">N</span>exus
          </Link>
          <span className="badge-accent hidden sm:inline-flex">Settings</span>
        </div>
        <UserMenu />
      </header>

      <main className="mx-auto max-w-2xl px-6 py-16 space-y-6">
        <h1 className="text-2xl font-bold text-nexus-text-bright animate-fade-in">Settings</h1>

        {/* Profile */}
        <section className="glass-card p-6 animate-slide-up stagger-1" style={{ animationFillMode: 'forwards' }}>
          <h2 className="text-sm font-semibold text-nexus-text-bright mb-4">Profile</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-nexus-muted">Email</span>
              <span className="text-nexus-text">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-nexus-muted">Tier</span>
              <span className={user?.tier === 'pro' ? 'badge-accent' : 'badge-green'}>{user?.tier || 'free'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-nexus-muted">Joined</span>
              <span className="text-nexus-text">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
              </span>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="glass-card p-6 animate-slide-up stagger-2" style={{ animationFillMode: 'forwards' }}>
          <h2 className="text-sm font-semibold text-nexus-text-bright mb-4">Preferences</h2>
          <label className="block text-sm text-nexus-muted mb-2">Default analysis mode</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {MODES.map((m) => (
              <button
                key={m}
                onClick={() => setDefaultMode(m)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all duration-200 ${
                  defaultMode === m
                    ? 'bg-nexus-accent text-white'
                    : 'bg-white/[0.04] text-nexus-muted hover:bg-white/[0.08] hover:text-nexus-text'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-accent text-sm">
            {saving ? 'Saving...' : 'Save preferences'}
          </button>
        </section>

        {/* Billing */}
        <section className="glass-card p-6 animate-slide-up stagger-3" style={{ animationFillMode: 'forwards' }}>
          <h2 className="text-sm font-semibold text-nexus-text-bright mb-4">Billing</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-nexus-muted">Current plan:</span>
              <span className={user?.tier === 'pro' ? 'badge-accent' : 'badge-green'}>{user?.tier || 'free'}</span>
            </div>
            <Link href="/pricing" className="btn-ghost text-xs">
              {user?.tier === 'pro' ? 'Manage plan' : 'View plans'}
            </Link>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="glass-card border-nexus-red/20 p-6 animate-slide-up stagger-4" style={{ animationFillMode: 'forwards' }}>
          <h2 className="text-sm font-semibold text-nexus-red mb-4">Danger Zone</h2>
          <button
            onClick={handleSignOut}
            className="rounded-xl border border-nexus-red/20 bg-nexus-red/10 px-4 py-2.5 text-sm text-nexus-red transition-all duration-200 hover:bg-nexus-red/20"
          >
            Sign out
          </button>
        </section>
      </main>
    </div>
  );
}

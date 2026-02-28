'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  // No Supabase configured — show sign in links anyway
  if (!supabase) {
    return (
      <span className="text-xs text-nexus-muted">v0.2.0</span>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className="rounded-lg px-3 py-1.5 text-xs font-medium text-nexus-muted transition-colors hover:text-nexus-text">
          Sign in
        </Link>
        <Link href="/signup" className="rounded-lg bg-nexus-accent px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-nexus-accent-hover">
          Sign up
        </Link>
      </div>
    );
  }

  const initial = (user.email?.[0] || 'U').toUpperCase();
  const tier = user.user_metadata?.tier || 'free';

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex h-8 w-8 items-center justify-center rounded-full bg-nexus-accent text-xs font-bold text-white">
        {initial}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-20 w-56 rounded-xl border border-nexus-border bg-nexus-surface p-2 shadow-xl">
            <div className="border-b border-nexus-border px-3 py-2">
              <p className="text-xs text-nexus-muted truncate">{user.email}</p>
              <p className="text-xs text-nexus-accent capitalize">{tier} tier</p>
            </div>
            {tier === 'free' && (
              <button
                onClick={async () => {
                  const res = await fetch('/api/v1/billing', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'checkout' }),
                  });
                  const { url } = await res.json();
                  if (url) window.location.href = url;
                }}
                className="mt-1 w-full rounded-lg bg-nexus-accent/10 px-3 py-2 text-left text-xs text-nexus-accent transition-colors hover:bg-nexus-accent/20"
              >
                Upgrade to Pro
              </button>
            )}
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                setOpen(false);
                router.push('/login');
                router.refresh();
              }}
              className="mt-1 w-full rounded-lg px-3 py-2 text-left text-xs text-nexus-muted transition-colors hover:bg-nexus-bg hover:text-nexus-text"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

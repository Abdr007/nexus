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
            <nav className="mt-1 space-y-0.5">
              <Link href="/settings" onClick={() => setOpen(false)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-nexus-muted transition-colors hover:bg-nexus-bg hover:text-nexus-text">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Settings
              </Link>
              <Link href="/watchlist" onClick={() => setOpen(false)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-nexus-muted transition-colors hover:bg-nexus-bg hover:text-nexus-text">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                Watchlist
              </Link>
              <Link href="/alerts" onClick={() => setOpen(false)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-nexus-muted transition-colors hover:bg-nexus-bg hover:text-nexus-text">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
                Alerts
              </Link>
              <Link href="/pricing" onClick={() => setOpen(false)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-nexus-muted transition-colors hover:bg-nexus-bg hover:text-nexus-text">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Pricing
              </Link>
            </nav>
            <div className="divider my-1" />
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

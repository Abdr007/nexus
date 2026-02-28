'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  if (!supabase) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-nexus-bg px-4">
        <div className="text-center">
          <h1 className="mb-2 text-xl font-bold text-nexus-text">Auth Not Configured</h1>
          <p className="text-sm text-nexus-muted">Add Supabase credentials to .env.local to enable authentication.</p>
          <Link href="/" className="mt-4 inline-block text-nexus-accent hover:underline">Back to chat</Link>
        </div>
      </div>
    );
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/callback` },
    });

    if (error) setError(error.message);
    else setSuccess(true);
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/callback` },
    });
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-nexus-bg px-4">
        <div className="w-full max-w-sm text-center">
          <h1 className="mb-2 text-2xl font-bold text-nexus-accent">Check your email</h1>
          <p className="text-sm text-nexus-muted">We sent a confirmation link to <strong className="text-nexus-text">{email}</strong>.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-nexus-bg px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-2xl font-bold">
          <span className="text-nexus-accent">N</span>exus
        </h1>
        <p className="mb-8 text-center text-sm text-nexus-muted">Create your account</p>

        <button onClick={handleGoogleSignup} className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-nexus-border bg-nexus-surface px-4 py-3 text-sm font-medium text-nexus-text transition-colors hover:border-nexus-accent">
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-nexus-border" />
          <span className="text-xs text-nexus-muted">or</span>
          <div className="h-px flex-1 bg-nexus-border" />
        </div>

        <form onSubmit={handleSignup} className="space-y-3">
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full rounded-xl border border-nexus-border bg-nexus-surface px-4 py-3 text-sm text-nexus-text placeholder:text-nexus-muted focus:border-nexus-accent focus:outline-none" />
          <input type="password" placeholder="Password (min 6 characters)" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full rounded-xl border border-nexus-border bg-nexus-surface px-4 py-3 text-sm text-nexus-text placeholder:text-nexus-muted focus:border-nexus-accent focus:outline-none" />
          {error && <p className="text-xs text-nexus-red">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-nexus-accent px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-nexus-accent-hover disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-nexus-muted">
          Already have an account?{' '}
          <Link href="/login" className="text-nexus-accent hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

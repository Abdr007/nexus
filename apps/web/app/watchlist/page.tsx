'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserMenu } from '@/components/auth/user-menu';

interface WatchlistItem {
  id: string;
  coin_name: string;
  symbol: string;
  coingecko_id: string;
  current_price?: number;
  price_change_24h?: number;
}

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [coinName, setCoinName] = useState('');
  const [coinSymbol, setCoinSymbol] = useState('');
  const [coingeckoId, setCoingeckoId] = useState('');
  const [adding, setAdding] = useState(false);
  const router = useRouter();

  async function fetchWatchlist() {
    try {
      const res = await fetch('/api/v1/watchlist');
      if (!res.ok) throw new Error('Unauthorized');
      const data = await res.json();
      setItems(data.items || data);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWatchlist();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!coinName.trim() || !coingeckoId.trim()) return;
    setAdding(true);
    try {
      await fetch('/api/v1/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coin_name: coinName.trim(),
          symbol: coinSymbol.trim().toUpperCase(),
          coingecko_id: coingeckoId.trim().toLowerCase(),
        }),
      });
      setCoinName('');
      setCoinSymbol('');
      setCoingeckoId('');
      await fetchWatchlist();
    } catch {
      // silently fail
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(id: string) {
    try {
      await fetch('/api/v1/watchlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setItems((prev) => prev.filter((item) => item.id !== id));
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
          <span className="badge-accent hidden sm:inline-flex">Watchlist</span>
        </div>
        <UserMenu />
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-2xl font-bold text-nexus-text-bright mb-6 animate-fade-in">Watchlist</h1>

        {/* Add Form */}
        <form onSubmit={handleAdd} className="glass-card p-4 mb-8 animate-slide-up" style={{ animationFillMode: 'forwards' }}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="Coin name (e.g. Bitcoin)"
              value={coinName}
              onChange={(e) => setCoinName(e.target.value)}
              className="input-field flex-1"
            />
            <input
              type="text"
              placeholder="Symbol (e.g. BTC)"
              value={coinSymbol}
              onChange={(e) => setCoinSymbol(e.target.value)}
              className="input-field w-full sm:w-28"
            />
            <input
              type="text"
              placeholder="CoinGecko ID (e.g. bitcoin)"
              value={coingeckoId}
              onChange={(e) => setCoingeckoId(e.target.value)}
              className="input-field flex-1"
            />
            <button type="submit" disabled={adding || !coinName.trim() || !coingeckoId.trim()} className="btn-accent whitespace-nowrap">
              {adding ? 'Adding...' : 'Add Coin'}
            </button>
          </div>
        </form>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-36 rounded-2xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center py-20 animate-fade-in">
            <svg className="h-16 w-16 text-nexus-muted/40 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <p className="text-nexus-muted text-sm">Your watchlist is empty</p>
            <p className="text-nexus-muted/60 text-xs mt-1">Add coins above to track their prices</p>
          </div>
        ) : (
          /* Card Grid */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <div
                key={item.id}
                className={`glass-card p-5 animate-slide-up stagger-${Math.min(i + 1, 6)}`}
                style={{ animationFillMode: 'forwards' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-nexus-text-bright">{item.coin_name}</h3>
                    <span className="text-xs text-nexus-muted uppercase">{item.symbol}</span>
                  </div>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="rounded-lg p-1 text-nexus-muted transition-colors hover:bg-nexus-red/10 hover:text-nexus-red"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {item.current_price != null && (
                  <div>
                    <p className="text-lg font-bold text-nexus-text-bright">
                      ${item.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                    </p>
                    {item.price_change_24h != null && (
                      <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${item.price_change_24h >= 0 ? 'text-nexus-green' : 'text-nexus-red'}`}>
                        <svg className={`h-3 w-3 ${item.price_change_24h < 0 ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                        {Math.abs(item.price_change_24h).toFixed(2)}%
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

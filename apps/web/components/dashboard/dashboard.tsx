'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserMenu } from '@/components/auth/user-menu';

interface MarketData {
  bitcoin: { usd: number; usd_24h_change: number; usd_market_cap: number };
  ethereum: { usd: number; usd_24h_change: number; usd_market_cap: number };
  solana: { usd: number; usd_24h_change: number; usd_market_cap: number };
}

interface FearGreed {
  value: number;
  label: string;
}

interface TopMover {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  image: string;
}

export function Dashboard() {
  const [market, setMarket] = useState<MarketData | null>(null);
  const [fearGreed, setFearGreed] = useState<FearGreed | null>(null);
  const [topGainers, setTopGainers] = useState<TopMover[]>([]);
  const [topLosers, setTopLosers] = useState<TopMover[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [priceRes, fgRes, moversRes] = await Promise.all([
          fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true&include_market_cap=true'),
          fetch('https://api.alternative.me/fng/?limit=1&format=json'),
          fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h'),
        ]);

        const priceData = await priceRes.json();
        setMarket(priceData);

        const fgData = await fgRes.json();
        setFearGreed({ value: Number(fgData.data[0].value), label: fgData.data[0].value_classification });

        const moversData: TopMover[] = await moversRes.json();
        const sorted = [...moversData].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
        setTopGainers(sorted.slice(0, 5));
        setTopLosers(sorted.slice(-5).reverse());
      } catch (err) {
        console.error('Dashboard data fetch failed:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-surface flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-gradient">N</span>exus
          </Link>
          <span className="badge-accent">Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="btn-ghost text-xs">
            <span className="flex items-center gap-1.5">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
              Chat
            </span>
          </Link>
          <UserMenu />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-6">
        {loading ? (
          <div className="space-y-6 animate-fade-in">
            {/* Skeleton cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass-card p-4 space-y-3">
                  <div className="skeleton h-3 w-16" />
                  <div className="skeleton h-7 w-28" />
                  <div className="skeleton h-3 w-20" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="glass-card p-4 space-y-3">
                  <div className="skeleton h-4 w-32" />
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="flex items-center justify-between">
                      <div className="skeleton h-3 w-24" />
                      <div className="skeleton h-3 w-16" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top cards row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {market && (
                <>
                  <PriceCard name="Bitcoin" symbol="BTC" price={market.bitcoin.usd} change={market.bitcoin.usd_24h_change} mcap={market.bitcoin.usd_market_cap} delay={0} />
                  <PriceCard name="Ethereum" symbol="ETH" price={market.ethereum.usd} change={market.ethereum.usd_24h_change} mcap={market.ethereum.usd_market_cap} delay={1} />
                  <PriceCard name="Solana" symbol="SOL" price={market.solana.usd} change={market.solana.usd_24h_change} mcap={market.solana.usd_market_cap} delay={2} />
                </>
              )}
              {fearGreed && <FearGreedCard value={fearGreed.value} label={fearGreed.label} />}
            </div>

            {/* Movers */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <MoversTable title="Top Gainers (24h)" movers={topGainers} isGainer />
              <MoversTable title="Top Losers (24h)" movers={topLosers} isGainer={false} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PriceCard({ name, symbol, price, change, mcap, delay }: { name: string; symbol: string; price: number; change: number; mcap: number; delay: number }) {
  const isPositive = change >= 0;
  return (
    <div className="glass-card group p-4 transition-all duration-300 hover:shadow-glow-sm hover:border-nexus-accent/20 animate-slide-up"
      style={{ animationDelay: `${delay * 0.08}s`, animationFillMode: 'backwards' }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-nexus-muted">{name}</p>
        <span className="badge-accent text-[10px]">{symbol}</span>
      </div>
      <p className="text-2xl font-bold text-nexus-text-bright">${price.toLocaleString()}</p>
      <div className="flex items-center justify-between mt-2">
        <span className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-nexus-green' : 'text-nexus-red'}`}>
          <svg className={`h-3.5 w-3.5 ${isPositive ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          {isPositive ? '+' : ''}{change.toFixed(2)}%
        </span>
        <span className="text-xs text-nexus-muted">MCap: ${(mcap / 1e9).toFixed(1)}B</span>
      </div>
    </div>
  );
}

function FearGreedCard({ value, label }: { value: number; label: string }) {
  const color = value <= 25 ? '#ef4444' : value <= 45 ? '#f97316' : value <= 55 ? '#eab308' : value <= 75 ? '#22c55e' : '#10b981';
  const angle = -90 + (value / 100) * 180;

  return (
    <div className="glass-card p-4 animate-slide-up" style={{ animationDelay: '0.24s', animationFillMode: 'backwards' }}>
      <p className="text-xs text-nexus-muted mb-3">Fear & Greed Index</p>
      <div className="flex items-center gap-4">
        <svg width="90" height="55" viewBox="0 0 90 55" className="shrink-0">
          {/* Background arc */}
          <path d="M 8 50 A 36 36 0 0 1 82 50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" strokeLinecap="round" />
          {/* Colored arc */}
          <path d="M 8 50 A 36 36 0 0 1 82 50" fill="none" stroke="url(#dashGrad)" strokeWidth="7" strokeLinecap="round"
            strokeDasharray={`${(value / 100) * 113} 113`} />
          {/* Needle */}
          <line x1="45" y1="50" x2={45 + 28 * Math.cos((angle * Math.PI) / 180)} y2={50 + 28 * Math.sin((angle * Math.PI) / 180)}
            stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="45" cy="50" r="3.5" fill={color} />
          <defs>
            <linearGradient id="dashGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
        </svg>
        <div>
          <p className="text-2xl font-bold" style={{ color }}>{value}</p>
          <p className="text-sm font-medium" style={{ color }}>{label}</p>
        </div>
      </div>
    </div>
  );
}

function MoversTable({ title, movers, isGainer }: { title: string; movers: TopMover[]; isGainer: boolean }) {
  return (
    <div className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'backwards' }}>
      <div className="border-b border-white/[0.06] px-4 py-3 flex items-center gap-2">
        <span className={`flex h-5 w-5 items-center justify-center rounded-md text-xs ${isGainer ? 'bg-nexus-green-muted text-nexus-green' : 'bg-nexus-red-muted text-nexus-red'}`}>
          <svg className={`h-3 w-3 ${isGainer ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </span>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {movers.map(coin => (
          <div key={coin.id} className="flex items-center justify-between px-4 py-3 transition-colors duration-200 hover:bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <img src={coin.image} alt={coin.name} className="h-7 w-7 rounded-full ring-1 ring-white/10" />
              <div>
                <p className="text-sm font-medium text-nexus-text">{coin.name}</p>
                <p className="text-xs text-nexus-muted uppercase">{coin.symbol}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-nexus-text">${coin.current_price.toLocaleString()}</p>
              <p className={`text-xs font-medium ${isGainer ? 'text-nexus-green' : 'text-nexus-red'}`}>
                {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

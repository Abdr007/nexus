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
    <div className="min-h-screen bg-nexus-bg">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-nexus-border px-6 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-nexus-accent">N</span>exus
          </Link>
          <span className="text-xs text-nexus-muted border border-nexus-border px-2 py-0.5 rounded">Dashboard</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xs text-nexus-muted hover:text-nexus-text transition-colors">Chat</Link>
          <UserMenu />
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-nexus-accent border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top cards row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {market && (
                <>
                  <PriceCard name="Bitcoin" symbol="BTC" price={market.bitcoin.usd} change={market.bitcoin.usd_24h_change} mcap={market.bitcoin.usd_market_cap} />
                  <PriceCard name="Ethereum" symbol="ETH" price={market.ethereum.usd} change={market.ethereum.usd_24h_change} mcap={market.ethereum.usd_market_cap} />
                  <PriceCard name="Solana" symbol="SOL" price={market.solana.usd} change={market.solana.usd_24h_change} mcap={market.solana.usd_market_cap} />
                </>
              )}
              {fearGreed && (
                <div className="rounded-xl border border-nexus-border bg-nexus-surface p-4">
                  <p className="text-xs text-nexus-muted mb-1">Fear & Greed Index</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">{fearGreed.value}</span>
                    <span className={`text-sm font-medium ${fearGreed.value <= 25 ? 'text-nexus-red' : fearGreed.value >= 75 ? 'text-nexus-green' : 'text-yellow-500'}`}>
                      {fearGreed.label}
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-nexus-bg overflow-hidden">
                    <div
                      className={`h-full rounded-full ${fearGreed.value <= 25 ? 'bg-nexus-red' : fearGreed.value <= 50 ? 'bg-yellow-500' : fearGreed.value <= 75 ? 'bg-nexus-green' : 'bg-emerald-400'}`}
                      style={{ width: `${fearGreed.value}%` }}
                    />
                  </div>
                </div>
              )}
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

function PriceCard({ name, symbol, price, change, mcap }: { name: string; symbol: string; price: number; change: number; mcap: number }) {
  const isPositive = change >= 0;
  return (
    <div className="rounded-xl border border-nexus-border bg-nexus-surface p-4">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-nexus-muted">{name}</p>
        <span className="text-xs text-nexus-muted">{symbol}</span>
      </div>
      <p className="text-2xl font-bold">${price.toLocaleString()}</p>
      <div className="flex items-center justify-between mt-1">
        <span className={`text-sm font-medium ${isPositive ? 'text-nexus-green' : 'text-nexus-red'}`}>
          {isPositive ? '+' : ''}{change.toFixed(2)}%
        </span>
        <span className="text-xs text-nexus-muted">MCap: ${(mcap / 1e9).toFixed(1)}B</span>
      </div>
    </div>
  );
}

function MoversTable({ title, movers, isGainer }: { title: string; movers: TopMover[]; isGainer: boolean }) {
  return (
    <div className="rounded-xl border border-nexus-border bg-nexus-surface">
      <div className="border-b border-nexus-border px-4 py-3">
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="divide-y divide-nexus-border">
        {movers.map(coin => (
          <div key={coin.id} className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <img src={coin.image} alt={coin.name} className="h-6 w-6 rounded-full" />
              <div>
                <p className="text-sm font-medium">{coin.name}</p>
                <p className="text-xs text-nexus-muted uppercase">{coin.symbol}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">${coin.current_price.toLocaleString()}</p>
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

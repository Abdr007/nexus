'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { UserMenu } from '@/components/auth/user-menu';

/* ─── Scroll-reveal hook ─── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, visible };
}

function RevealSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── Data ─── */
const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
];

const FEATURES = [
  {
    title: 'AI Chat',
    description: 'Ask anything about crypto markets and get instant, intelligent answers powered by advanced LLMs.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
  },
  {
    title: 'Market Dashboard',
    description: 'Real-time prices, Fear & Greed Index, top gainers and losers — all in one glance.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-1.5 3 3 3-1.5 3 4.5" />
      </svg>
    ),
  },
  {
    title: 'Watchlist',
    description: 'Track your favorite coins with a personalized watchlist that updates in real time.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    title: 'Price Alerts',
    description: 'Set custom price alerts and get notified the moment your targets are hit.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
  },
  {
    title: 'Multi-Mode Analysis',
    description: 'Switch between Analyst, Trader, DeFi, and Risk modes for tailored insights.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-1.579 4.737a2.25 2.25 0 01-2.135 1.513H8.714a2.25 2.25 0 01-2.135-1.513L5 14.5m14 0H5" />
      </svg>
    ),
  },
  {
    title: 'Pro Tier',
    description: 'Unlock Claude-powered deep analysis, all tools, portfolio tracking, and priority support.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
  },
];

const STEPS = [
  { num: '01', title: 'Ask', description: 'Type any crypto question — prices, sentiment, DeFi yields, risk analysis, or market news.' },
  { num: '02', title: 'Analyze', description: 'Nexus fetches real-time data, runs multi-source analysis, and synthesizes insights in seconds.' },
  { num: '03', title: 'Act', description: 'Get actionable intelligence to inform your trades, manage risk, and stay ahead of the market.' },
];

const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    features: [
      '20 messages/hour',
      '3 tools (price, news, sentiment)',
      'Groq Llama 3.3 70B',
      'Short-term memory',
    ],
  },
  pro: {
    name: 'Pro',
    price: 9,
    features: [
      '200 messages/hour',
      'All tools (DeFi, on-chain, whale alerts)',
      'Claude Sonnet for deeper analysis',
      'Long-term memory',
      'Portfolio tracking',
      'Conversation history',
      'Priority support',
    ],
  },
};

const STATS = [
  { value: '50+', label: 'Data Sources' },
  { value: '24/7', label: 'Real-Time' },
  { value: '<2s', label: 'Response Time' },
];

/* ─── Page ─── */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function smoothScroll(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen">
      {/* ─── Sticky Nav ─── */}
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? 'glass-surface border-b border-white/[0.06] shadow-glass-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-8">
            <span className="text-xl font-bold tracking-tight">
              <span className="text-gradient">N</span>exus
            </span>
            <nav className="hidden items-center gap-6 md:flex">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => smoothScroll(e, link.href)}
                  className="text-sm text-nexus-muted transition-colors hover:text-nexus-text"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/chat"
              className="btn-accent hidden px-4 py-2 text-xs sm:inline-flex"
            >
              Launch App
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-20 text-center">
        {/* Animated glow orb */}
        <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="h-[420px] w-[420px] rounded-full bg-nexus-accent/[0.12] blur-[140px] animate-pulse-glow" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl animate-fade-in">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 text-xs text-nexus-muted backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-nexus-green animate-pulse-fast" />
            AI-Powered Crypto Intelligence
          </div>

          <h1 className="mb-4 text-5xl font-bold tracking-tight text-nexus-text-bright sm:text-6xl lg:text-7xl">
            <span className="text-gradient">Nexus</span>
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-lg text-nexus-muted sm:text-xl">
            Your AI copilot for crypto markets. Real-time data, multi-source analysis, and actionable intelligence — all through a single conversation.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/chat" className="btn-accent px-6 py-3 text-sm">
              Launch App
            </Link>
            <a
              href="#pricing"
              onClick={(e) => smoothScroll(e, '#pricing')}
              className="btn-ghost border border-white/[0.08] px-6 py-3 text-sm"
            >
              View Pricing
            </a>
          </div>

          {/* Floating stats */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-4">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className={`glass-card-sm flex items-center gap-3 px-5 py-3 animate-slide-up opacity-0 stagger-${i + 1}`}
                style={{ animationFillMode: 'forwards' }}
              >
                <span className="text-lg font-bold text-gradient">{stat.value}</span>
                <span className="text-xs text-nexus-muted">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-nexus-muted/40">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-24">
        <RevealSection>
          <div className="mb-14 text-center">
            <span className="badge-accent mb-4 inline-flex">Features</span>
            <h2 className="text-3xl font-bold text-nexus-text-bright sm:text-4xl">
              Everything you need to navigate crypto
            </h2>
            <p className="mt-3 text-nexus-muted">
              Powerful tools, real-time data, and AI analysis in one platform.
            </p>
          </div>
        </RevealSection>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <RevealSection key={f.title}>
              <div
                className={`glass-card group relative overflow-hidden p-6 transition-all duration-300 hover:border-nexus-accent/30 hover:shadow-glow-sm animate-slide-up opacity-0 stagger-${i + 1}`}
                style={{ animationFillMode: 'forwards' }}
              >
                {/* Hover glow */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-nexus-accent/[0.06] opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative z-10">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-nexus-accent/10 text-nexus-accent transition-colors duration-300 group-hover:bg-nexus-accent/20">
                    {f.icon}
                  </div>
                  <h3 className="mb-2 text-base font-semibold text-nexus-text-bright">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-nexus-muted">{f.description}</p>
                </div>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="mx-auto max-w-5xl px-6 py-24">
        <RevealSection>
          <div className="mb-14 text-center">
            <span className="badge-accent mb-4 inline-flex">How It Works</span>
            <h2 className="text-3xl font-bold text-nexus-text-bright sm:text-4xl">
              Three steps to smarter crypto decisions
            </h2>
          </div>
        </RevealSection>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <RevealSection key={step.num}>
              <div
                className={`glass-card relative p-8 text-center animate-slide-up opacity-0 stagger-${i + 1}`}
                style={{ animationFillMode: 'forwards' }}
              >
                <span className="mb-4 inline-block text-3xl font-bold text-gradient">{step.num}</span>
                <h3 className="mb-2 text-lg font-semibold text-nexus-text-bright">{step.title}</h3>
                <p className="text-sm leading-relaxed text-nexus-muted">{step.description}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="mx-auto max-w-4xl px-6 py-24">
        <RevealSection>
          <div className="mb-14 text-center">
            <span className="badge-accent mb-4 inline-flex">Pricing</span>
            <h2 className="text-3xl font-bold text-nexus-text-bright sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-3 text-nexus-muted">
              Start free, upgrade when you need more power.
            </p>
          </div>
        </RevealSection>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Free */}
          <RevealSection>
            <div className="glass-card p-8">
              <h3 className="text-lg font-semibold text-nexus-text-bright">{PLANS.free.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-nexus-text-bright">$0</span>
                <span className="text-sm text-nexus-muted">/month</span>
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
              <div className="mt-8">
                <Link href="/chat" className="btn-ghost block w-full border border-white/[0.08] py-3 text-center">
                  Get Started
                </Link>
              </div>
            </div>
          </RevealSection>

          {/* Pro */}
          <RevealSection>
            <div className="glass-card relative border-nexus-accent/30 p-8 shadow-glow">
              <div className="absolute -top-3 right-6">
                <span className="badge-accent">Popular</span>
              </div>
              <h3 className="text-lg font-semibold text-nexus-text-bright">{PLANS.pro.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gradient">$9</span>
                <span className="text-sm text-nexus-muted">/month</span>
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
                <Link href="/pricing" className="btn-accent block w-full text-center">
                  Upgrade to Pro
                </Link>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="glass-surface mt-12 border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <span className="text-sm font-bold tracking-tight">
            <span className="text-gradient">N</span>exus
          </span>
          <nav className="flex items-center gap-6">
            <Link href="/chat" className="text-xs text-nexus-muted transition-colors hover:text-nexus-text">Chat</Link>
            <Link href="/dashboard" className="text-xs text-nexus-muted transition-colors hover:text-nexus-text">Dashboard</Link>
            <Link href="/pricing" className="text-xs text-nexus-muted transition-colors hover:text-nexus-text">Pricing</Link>
          </nav>
          <p className="text-xs text-nexus-muted/60">&copy; {new Date().getFullYear()} Nexus. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

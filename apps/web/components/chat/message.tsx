'use client';

import ReactMarkdown from 'react-markdown';
import type { Message } from '@/lib/use-chat';

/* ───── Tool data formatters ───── */

function formatPrice(val: number) {
  if (val >= 1) return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${val.toPrecision(4)}`;
}

function PriceWidget({ data }: { data: Record<string, { usd?: number; usd_24h_change?: number; usd_market_cap?: number }> }) {
  return (
    <div className="my-2 grid gap-2 sm:grid-cols-2">
      {Object.entries(data).map(([coin, info]) => {
        const change = info.usd_24h_change ?? 0;
        const isUp = change >= 0;
        return (
          <div key={coin} className="glass-card-sm flex items-center justify-between p-3">
            <div>
              <p className="text-xs text-nexus-muted capitalize">{coin}</p>
              <p className="text-lg font-bold text-nexus-text-bright">{info.usd != null ? formatPrice(info.usd) : 'N/A'}</p>
            </div>
            <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              isUp ? 'bg-nexus-green-muted text-nexus-green' : 'bg-nexus-red-muted text-nexus-red'
            }`}>
              <svg className={`h-3 w-3 ${isUp ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              {Math.abs(change).toFixed(2)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FearGreedWidget({ data }: { data: { value?: number; value_classification?: string } }) {
  const val = Number(data.value ?? 50);
  const label = data.value_classification ?? '';
  const color = val <= 25 ? '#ef4444' : val <= 45 ? '#f97316' : val <= 55 ? '#eab308' : val <= 75 ? '#22c55e' : '#10b981';
  const angle = -90 + (val / 100) * 180;

  return (
    <div className="my-2 glass-card-sm flex items-center gap-4 p-4">
      <svg width="80" height="50" viewBox="0 0 80 50">
        {/* Background arc */}
        <path d="M 8 45 A 32 32 0 0 1 72 45" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" strokeLinecap="round" />
        {/* Colored arc */}
        <path d="M 8 45 A 32 32 0 0 1 72 45" fill="none" stroke="url(#fgGradient)" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${(val / 100) * 100.5} 100.5`} />
        {/* Needle */}
        <line x1="40" y1="45" x2={40 + 24 * Math.cos((angle * Math.PI) / 180)} y2={45 + 24 * Math.sin((angle * Math.PI) / 180)}
          stroke={color} strokeWidth="2" strokeLinecap="round" />
        <circle cx="40" cy="45" r="3" fill={color} />
        <defs>
          <linearGradient id="fgGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
      </svg>
      <div>
        <p className="text-xs text-nexus-muted">Fear & Greed Index</p>
        <p className="text-2xl font-bold" style={{ color }}>{val}</p>
        <p className="text-xs font-medium" style={{ color }}>{label}</p>
      </div>
    </div>
  );
}

function NewsWidget({ data }: { data: { title?: string; url?: string; source?: string; published_at?: string }[] }) {
  return (
    <div className="my-2 space-y-1.5">
      {data.slice(0, 5).map((item, i) => (
        <div key={i} className="glass-card-sm flex items-start gap-3 p-3">
          <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-nexus-accent/10 text-nexus-accent">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            {item.url ? (
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-nexus-text hover:text-nexus-accent-hover transition-colors line-clamp-2">{item.title}</a>
            ) : (
              <p className="text-sm font-medium text-nexus-text line-clamp-2">{item.title}</p>
            )}
            {(item.source || item.published_at) && (
              <p className="mt-0.5 text-xs text-nexus-muted">
                {item.source}{item.source && item.published_at ? ' · ' : ''}{item.published_at}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function KeyValueWidget({ tool, data }: { tool: string; data: Record<string, unknown> }) {
  return (
    <div className="my-2 glass-card-sm overflow-hidden">
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2">
        <svg className="h-3.5 w-3.5 text-nexus-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.42 15.17l-5.384 3.08A1 1 0 014.5 17.33V6.67a1 1 0 011.536-.92l5.384 3.08a1 1 0 010 1.74zM15.75 9.75h4.5m-4.5 4.5h4.5" />
        </svg>
        <span className="text-xs font-semibold text-nexus-accent">{tool}</span>
      </div>
      <div className="divide-y divide-white/[0.04] px-3">
        {Object.entries(data).map(([key, val]) => (
          <div key={key} className="flex items-center justify-between py-2">
            <span className="text-xs text-nexus-muted">{key.replace(/_/g, ' ')}</span>
            <span className="text-xs font-medium text-nexus-text ml-4 text-right">
              {typeof val === 'object' ? JSON.stringify(val) : String(val)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ToolDataCard({ tool, data }: { tool: string; data: unknown }) {
  // Try to render specialized widgets based on tool name or data shape
  const toolLower = tool.toLowerCase();

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>;

    // Price data: has coin keys with usd sub-objects
    if (toolLower.includes('price') || Object.values(obj).some(v => typeof v === 'object' && v !== null && 'usd' in (v as Record<string, unknown>))) {
      return <PriceWidget data={obj as Record<string, { usd?: number; usd_24h_change?: number; usd_market_cap?: number }>} />;
    }

    // Fear & Greed
    if (toolLower.includes('fear') || toolLower.includes('greed') || ('value' in obj && 'value_classification' in obj)) {
      return <FearGreedWidget data={obj as { value?: number; value_classification?: string }} />;
    }

    // Flat key-value object
    const values = Object.values(obj);
    if (values.length > 0 && values.length <= 12 && values.every(v => typeof v !== 'object' || v === null)) {
      return <KeyValueWidget tool={tool} data={obj} />;
    }
  }

  // News: array of items with title
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && data[0] !== null && 'title' in data[0]) {
    return <NewsWidget data={data as { title?: string; url?: string; source?: string; published_at?: string }[]} />;
  }

  // Fallback: formatted JSON
  return (
    <div className="my-2 glass-card-sm overflow-hidden">
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2">
        <svg className="h-3.5 w-3.5 text-nexus-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
        <span className="text-xs font-semibold text-nexus-accent">{tool}</span>
      </div>
      <pre className="overflow-x-auto p-3 text-xs leading-relaxed text-nexus-muted">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

/* ───── Main message component ───── */

export function ChatMessage({ message, isStreaming }: { message: Message; isStreaming?: boolean }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full animate-slide-up ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 transition-all duration-200 ${
          isUser
            ? 'bg-gradient-accent text-white shadow-glow-sm'
            : 'glass-card-sm'
        }`}
      >
        {/* Tool data cards */}
        {!isUser && message.toolData && message.toolData.length > 0 && (
          <div className="mb-2">
            {message.toolData.map((td, i) => (
              <ToolDataCard key={i} tool={td.tool} data={td.data} />
            ))}
          </div>
        )}

        {/* Message content */}
        {isUser ? (
          <p className="text-sm leading-relaxed">{message.content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0">
            {message.content ? (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            ) : isStreaming ? (
              <div className="flex items-center gap-1.5 py-1">
                <div className="h-2 w-2 rounded-full bg-nexus-accent animate-bounce-dot" />
                <div className="h-2 w-2 rounded-full bg-nexus-accent animate-bounce-dot [animation-delay:0.16s]" />
                <div className="h-2 w-2 rounded-full bg-nexus-accent animate-bounce-dot [animation-delay:0.32s]" />
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

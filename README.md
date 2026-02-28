<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-Auth_&_DB-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Stripe-Billing-635BFF?style=for-the-badge&logo=stripe&logoColor=white" alt="Stripe" />
</p>

<h1 align="center">Nexus — Crypto Intelligence Platform</h1>

<p align="center">
  <strong>AI-powered crypto & finance intelligence engine with real-time market data, multi-LLM routing, and a premium glassmorphic interface.</strong>
</p>

<p align="center">
  <a href="https://nexus-pi-one.vercel.app">Live Demo</a> &nbsp;·&nbsp;
  <a href="#getting-started">Getting Started</a> &nbsp;·&nbsp;
  <a href="#architecture">Architecture</a> &nbsp;·&nbsp;
  <a href="#api-reference">API Reference</a>
</p>

---

## Overview

Nexus is a full-stack AI platform that combines real-time crypto market intelligence with conversational AI. Users can query live prices, analyze market sentiment, track DeFi protocols, monitor whale transactions, and receive AI-driven risk assessments — all through a streaming chat interface or via Discord/Telegram bots.

### Key Capabilities

- **Claude-Powered** — Claude Haiku 4.5 (free tier) + Claude Sonnet 4.6 (pro tier)
- **8 Real-Time Tools** — Prices, Fear & Greed, news, web search, DeFi TVL, gas tracker, whale monitoring, on-chain data
- **4 Analysis Modes** — Analyst, Trader, DeFi, Risk — each with specialized system prompts
- **Dual-Layer Memory** — Redis short-term (24h) + Supabase pgvector long-term embeddings
- **Streaming Chat** — Server-Sent Events with formatted data widgets (not raw JSON)
- **Pro Billing** — Stripe integration with free/pro tier gating
- **Bot Integrations** — Discord (slash commands) + Telegram bots
- **Plugin System** — Dynamic tool registration at runtime via admin API
- **Glassmorphic UI** — Premium fintech design with glass surfaces, gradient accents, glow effects, and micro-interactions

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Clients                              │
│   Web App (Next.js 15)  ·  Discord Bot  ·  Telegram Bot    │
└────────────────────────────┬────────────────────────────────┘
                             │ SSE / REST
┌────────────────────────────▼────────────────────────────────┐
│                    API Layer (Next.js Routes)                │
│  /api/v1/chat  ·  /api/v1/user  ·  /api/v1/conversations   │
│  /api/v1/alerts  ·  /api/v1/billing  ·  /api/v1/plugins    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Orchestrator Engine                     │    │
│  │                                                     │    │
│  │  1. Intent Classification (regex-based)             │    │
│  │  2. Parallel: Tool Dispatch + Memory Retrieval      │    │
│  │  3. Prompt Assembly (system + tools + memory)       │    │
│  │  4. LLM Streaming (Claude)                          │    │
│  │  5. Post-process: Memory Persistence                │    │
│  └──────┬──────────────┬──────────────┬────────────────┘    │
│         │              │              │                      │
│  ┌──────▼──────┐ ┌─────▼─────┐ ┌─────▼──────┐              │
│  │   Tools     │ │  Memory   │ │ LLM Router │              │
│  │  Registry   │ │  Layer    │ │            │              │
│  │             │ │           │ │ Haiku(free)│              │
│  │ 8 tools +   │ │ Redis ST  │ │Sonnet(pro) │              │
│  │ plugins     │ │ pgvector  │ │            │              │
│  └─────────────┘ └───────────┘ └────────────┘              │
└─────────────────────────────────────────────────────────────┘
                             │
        ┌────────────────────┼─────────────────────┐
        │                    │                     │
  ┌─────▼──────┐    ┌───────▼───────┐    ┌───────▼───────┐
  │  Supabase  │    │ Upstash Redis │    │  External APIs│
  │  Auth + DB │    │  Memory +     │    │  CoinGecko    │
  │  pgvector  │    │  Rate Limit   │    │  DeFi Llama   │
  │  RLS       │    │               │    │  Etherscan    │
  └────────────┘    └───────────────┘    │  Tavily       │
                                         │  Alternative  │
                                         └───────────────┘
```

### Monorepo Structure

```
nexus/
├── apps/
│   └── web/                    # Next.js 15 — UI + API routes
│       ├── app/                # App Router (pages, API, auth)
│       ├── components/         # React components (chat, dashboard, auth)
│       ├── lib/                # Hooks, Supabase clients, Stripe, rate-limit
│       └── middleware.ts       # Auth session management
│
├── packages/
│   ├── shared/                 # Types, constants, mode prompts, logger
│   ├── orchestrator/           # Core engine: intent → tools → LLM → stream
│   ├── tools/                  # 8 tool implementations + plugin loader
│   └── memory/                 # Dual-layer: Redis short-term + pgvector long-term
│
├── bots/
│   ├── discord/                # discord.js — slash commands + mentions
│   └── telegram/               # grammy — commands + message handler
│
├── supabase/
│   └── migrations/             # PostgreSQL schema + pgvector + RLS
│
├── turbo.json                  # Turborepo build orchestration
├── vercel.json                 # Deployment config
└── .env.example                # All environment variables documented
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router, React 19) |
| **Language** | TypeScript 5.7 |
| **Styling** | Tailwind CSS (glassmorphism, custom design system) |
| **Auth** | Supabase Auth (email + Google OAuth) |
| **Database** | Supabase PostgreSQL + pgvector |
| **Cache/Memory** | Upstash Redis |
| **LLM (Free)** | Anthropic — Claude Haiku 4.5 |
| **LLM (Pro)** | Anthropic — Claude Sonnet 4.6 |
| **Billing** | Stripe (subscriptions + webhooks) |
| **Monorepo** | Turborepo + npm workspaces |
| **Deployment** | Vercel (Edge + Serverless) |
| **Bots** | discord.js + grammy |

---

## Tools

| Tool | Source | Data |
|------|--------|------|
| `market_price` | CoinGecko | Real-time prices, 24h change, market cap, volume |
| `fear_greed` | Alternative.me | Fear & Greed Index with classification |
| `crypto_news` | News API | Aggregated crypto news headlines |
| `live_search` | Tavily | Web search for real-time information |
| `defi_tvl` | DeFi Llama | Protocol TVL rankings and trends |
| `gas_tracker` | Etherscan | Ethereum gas fees (safe, standard, fast) |
| `whale_tracker` | Whale Alert | Large transaction monitoring |
| `onchain_data` | Blockchain APIs | Hashrate, block height, supply metrics |

Tools execute in parallel with 5-second timeouts and `Promise.allSettled` for graceful failure handling. Results are cached at tool-specific TTLs (30s for prices, 300s for sentiment, 120s for news).

---

## Analysis Modes

| Mode | Focus | System Prompt |
|------|-------|---------------|
| **Analyst** | Data-driven market analysis | Focuses on metrics, comparisons, and factual reporting |
| **Trader** | Technical & trading signals | Emphasizes technicals, entries/exits, risk-reward |
| **DeFi** | Protocol & yield analysis | Specializes in TVL, yields, protocol risks, smart contracts |
| **Risk** | Risk assessment & management | Evaluates volatility, correlation, exposure, and hedging |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 10+
- An [Anthropic API key](https://console.anthropic.com)

### Installation

```bash
git clone https://github.com/abdr007/nexus.git
cd nexus
npm install
```

### Environment Setup

```bash
cp .env.example .env.local
```

**Minimum required** (chat works with just this):
```env
ANTHROPIC_API_KEY=sk-ant-...
```

**Full setup** (all features):
```env
# LLM Provider
ANTHROPIC_API_KEY=sk-ant-...                   # Required — powers all tiers

# Supabase (auth, database, memory)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Upstash Redis (memory + rate limiting)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXxx...

# Stripe (Pro billing)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...

# Tools
TAVILY_API_KEY=tvly-...                        # Web search
ETHERSCAN_API_KEY=...                          # Gas tracker
WHALE_ALERT_API_KEY=...                        # Whale monitoring

# Bots
DISCORD_BOT_TOKEN=...
DISCORD_CLIENT_ID=...
TELEGRAM_BOT_TOKEN=...

# Admin
ADMIN_SECRET=...                               # Plugin management & admin dashboard
CRON_SECRET=...                                # Price alert cron job
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
```

---

## API Reference

All endpoints are under `/api/v1/`. The chat endpoint uses Server-Sent Events for streaming.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/v1/chat` | Optional | Streaming chat (SSE) — accepts `message`, `mode`, `conversationId` |
| `GET` | `/api/v1/health` | No | Service status + feature availability |
| `GET` | `/api/v1/user` | Yes | User profile + tier + preferences |
| `PATCH` | `/api/v1/user` | Yes | Update user preferences |
| `GET` | `/api/v1/conversations` | Yes | List conversations |
| `POST` | `/api/v1/conversations` | Yes | Create/update conversation |
| `GET` | `/api/v1/alerts` | Yes | List price alerts |
| `POST` | `/api/v1/alerts` | Yes | Create price alert |
| `GET` | `/api/v1/watchlist` | Yes | Get watchlist |
| `POST` | `/api/v1/watchlist` | Yes | Add to watchlist |
| `GET` | `/api/v1/billing` | Yes | Billing status |
| `POST` | `/api/v1/billing` | Yes | Create Stripe checkout session |
| `POST` | `/api/v1/webhooks/stripe` | Stripe | Webhook handler |
| `GET/POST/DELETE` | `/api/v1/plugins` | Admin | Plugin management |
| `GET` | `/api/v1/admin/stats` | Admin | Platform analytics |
| `GET` | `/api/cron/check-alerts` | Cron | Scheduled alert checker |

### Chat Streaming Example

```bash
curl -X POST http://localhost:3000/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the price of Bitcoin?", "mode": "analyst"}'
```

Response (SSE stream):
```
data: {"type":"tool_result","tool":"market_price","data":{...}}
data: {"type":"token","content":"Bitcoin"}
data: {"type":"token","content":" is currently"}
data: {"type":"done"}
```

---

## Billing Tiers

| Feature | Free | Pro ($9/mo) |
|---------|------|-------------|
| Messages | 20/hour | 200/hour |
| LLM | Claude Haiku 4.5 | Claude Sonnet 4.6 |
| Tools | Price, News, Sentiment | All 8 tools |
| Memory | Short-term (24h) | Long-term (pgvector) |
| Features | Basic chat | Watchlist, alerts, conversation history |

---

## Database Schema

The Supabase migration (`supabase/migrations/001_initial.sql`) creates:

| Table | Purpose | RLS |
|-------|---------|-----|
| `user_profiles` | Tier, Stripe ID, preferences | Yes |
| `conversations` | Chat history with messages array | Yes |
| `watchlist` | Tracked crypto symbols | Yes |
| `memories` | pgvector embeddings for long-term memory | Yes |
| `price_alerts` | Target price, direction, trigger state | Yes |
| `notifications` | User alert notifications | Yes |
| `request_logs` | Observability — latency, tokens, errors | No |

---

## Deployment

### Vercel (Recommended)

```bash
vercel --prod
```

The project includes `vercel.json` preconfigured for the Next.js monorepo:
- **Build**: `cd apps/web && npm run build`
- **Output**: `apps/web/.next`
- **Region**: `iad1` (US East)

### Discord Bot

```bash
cd bots/discord && npx tsx src/index.ts
```

Slash commands: `/ask`, `/price`, `/sentiment`, `/news`, `/gas`, `/defi`

### Telegram Bot

```bash
cd bots/telegram && npx tsx src/index.ts
```

Commands: `/start`, `/price`, `/news`, `/sentiment`, `/gas`, `/defi`, `/mode`

---

## Design System

The UI follows a premium fintech design language:

- **Glassmorphism** — Semi-transparent surfaces with `backdrop-blur-xl` and `bg-white/[0.03]`
- **Gradient Accents** — `linear-gradient(135deg, #6366f1, #8b5cf6)` on buttons, badges, active states
- **Glow Effects** — Accent-colored box-shadows on hover and active elements
- **Micro-Interactions** — Scale transforms, slide-in animations, staggered reveals
- **Skeleton Loading** — Shimmer placeholders with gradient animation
- **Smart Data Widgets** — Tool results render as price cards, SVG gauges, news cards (not raw JSON)

Component classes defined in `globals.css`:

```
glass-card      — Primary surface (rounded-2xl, border, blur, shadow)
glass-card-sm   — Smaller variant
btn-accent      — Gradient button with glow hover
input-field     — Glass input with focus glow
badge-*         — Accent/green/red/yellow pill badges
skeleton        — Shimmer loading placeholder
text-gradient   — Gradient text effect
divider         — Subtle gradient horizontal rule
```

---

## License

MIT

---

<p align="center">
  Built with <a href="https://nextjs.org">Next.js</a>, <a href="https://supabase.com">Supabase</a>, and <a href="https://anthropic.com">Claude</a>
</p>

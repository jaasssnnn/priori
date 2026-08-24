# Priori

**B2B complaint intelligence for product-ops teams.**

Priori pulls public user reviews from the App Store, Play Store, Reddit, Twitter/X, YouTube, Instagram, and Facebook — then uses AI to categorise complaints into scored priority buckets so your team can triage faster.

---

## Features

- **Multi-source scraping** — Google Play Store, Apple App Store, Reddit, Twitter/X, YouTube, Instagram, Facebook
- **AI complaint classification** — powered by Google Gemini; groups feedback into 4-7 actionable categories with severity scores
- **Priority scoring** — `frequency × 0.40 + severity × 0.35 + risk_relevance × 0.25`
- **Health score** — single 0–100 signal per company (`100 − mean(category scores)`)
- **Workflow tracker** — assign action items with owner, deadline, and Slack notification
- **Audit trail** — log triage decisions (act on it / deprioritize / defer)
- **Watchlist & alerts** — weekly spike detection and new-trend alerts across monitored companies
- **Competitive compare** — side-by-side benchmarking with AI insight
- **Industry-aware** — fintech, food delivery, quick commerce, SaaS, travel, healthcare, and more

---

## Data sources — cloud vs local

| Source | Vercel (cloud) | Local (with OpenCLI) |
|--------|:--------------:|:--------------------:|
| Google Play Store | ✅ | ✅ |
| Apple App Store | ✅ | ✅ |
| Twitter / X | ✅ (needs `TWITTER_BEARER_TOKEN`) | ✅ |
| Reddit | — | ✅ |
| Instagram | — | ✅ |
| YouTube | — | ✅ |
| Facebook | — | ✅ |

Social scraping (Reddit, Instagram, YouTube, Facebook) runs through **OpenCLI** — a Chrome extension that bridges CLI commands to your logged-in browser sessions. It only works when running the app locally. See [Local setup with OpenCLI](#local-setup-with-opencli) below.

---

## Quick start — Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/jaasssnnn/Priori)

After deploying, set the following environment variables in your Vercel project dashboard:

```
GEMINI_API_KEY=                  # Google AI Studio — required for AI analysis
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=       # Supabase service role key (for cron)
NEXT_PUBLIC_BASE_URL=            # https://your-domain.vercel.app
NEXT_PUBLIC_DEMO_MODE=false      # Set true only for demos — bypasses auth
SLACK_CLIENT_ID=                 # Slack app OAuth (optional)
SLACK_CLIENT_SECRET=             # Slack app OAuth (optional)
SLACK_REDIRECT_URI=              # https://your-domain.vercel.app/api/slack/callback
RESEND_API_KEY=                  # Resend email (optional)
CRON_SECRET=                     # Random string — protects the cron endpoint
TWITTER_BEARER_TOKEN=            # Twitter/X API v2 bearer token (optional)
```

> **Tip:** `GEMINI_API_KEY` and the three Supabase keys are the only ones required for the app to work. Everything else enables optional integrations.

---

## Local setup

```bash
git clone https://github.com/jaasssnnn/Priori.git
cd Priori
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Local setup with OpenCLI

To enable Reddit, Instagram, YouTube, and Facebook scraping:

1. **Install OpenCLI** from [opencli.dev](https://opencli.dev) — follow the browser extension setup
2. **Log in** to Reddit, Instagram, YouTube, and Facebook in Chrome
3. **Verify** the connection:
   ```bash
   opencli doctor
   ```
4. Run `npm run dev` — social scraping activates automatically when OpenCLI is connected

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Auth + DB | Supabase (PostgreSQL + Row Level Security) |
| AI | Google Gemini `gemini-3.6-flash` |
| Styling | TailwindCSS v4 |
| Charts | Recharts |
| Email | Resend |
| Notifications | Slack Web API |
| Cron | Vercel Cron (weekly watchlist refresh) |
| Social scraping | OpenCLI (browser-session CLI) + Exa (semantic web search via mcporter) |

---

## Environment variables reference

| Variable | Required | Purpose |
|----------|----------|---------|
| `GEMINI_API_KEY` | ✅ | AI complaint classification and summaries |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase client auth |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Server-side DB writes (cron) |
| `NEXT_PUBLIC_BASE_URL` | ✅ | Full URL of your deployment |
| `NEXT_PUBLIC_DEMO_MODE` | — | `true` bypasses auth — for live demos only, never in production |
| `TWITTER_BEARER_TOKEN` | — | Twitter/X API v2 recent search |
| `SLACK_CLIENT_ID` | — | Slack OAuth integration |
| `SLACK_CLIENT_SECRET` | — | Slack OAuth integration |
| `SLACK_REDIRECT_URI` | — | Slack OAuth callback URL |
| `RESEND_API_KEY` | — | Email alert delivery |
| `CRON_SECRET` | — | Protects `/api/cron/refresh-watchlist` from unauthorized calls |

---

## Scoring formula

**Priority score** (per complaint category):
```
score = 100 × (frequency × 0.40 + severity × 0.35 + risk_relevance × 0.25)
```

**Health score** (per company):
```
health = 100 − mean(priority_score across all categories)
```

Bands: **Critical** ≥ 70 · **High** ≥ 40 · **Medium** ≥ 20 · **Low** < 20

---

## License

MIT

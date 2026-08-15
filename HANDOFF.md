# Priori — Session Handoff Document

> **For Claude:** Read this first at the start of every new session. Update before ending each session.

---

## Product

**Priori** — B2B product intelligence and ops platform. Search any company → pulls reviews from
Play Store, App Store, Reddit, Twitter/X → AI categorises complaints into scored buckets →
teams create action items, assign owners, push to Slack, log decisions in audit trail.

Full spec: `documentation` (project root)  
Build plan: `/Users/jasonabhishek/.claude/plans/breezy-napping-reef.md`

---

## How to Run

```bash
npm install        # first time only
npm run dev        # http://localhost:3000
```

**No API keys required.** All 9 pages fully functional on mock data. Visit any route:

| Route | What you see |
|-------|-------------|
| `/` | Landing page |
| `/login` | Auth page (stub OAuth) |
| `/search?q=CRED` | Company search results |
| `/dashboard/cred` | Full complaint dashboard (also `/phonepe`, `/paytm`) |
| `/workflows` | Action item tracker, expandable rows, Slack preview, status updates |
| `/audit` | Decision feed, filters, CSV export |
| `/watchlist` | 3 demo companies with health scores and trend badges |
| `/alerts` | 5 demo alerts (spike + new trend), mark read / dismiss |
| `/compare` | Side-by-side benchmarking, AI competitive insight |
| `/settings` | Slack connection (mock), email prefs, watchlist management, Block Kit preview |

---

## Phase Status

| Phase | Name                              | Status      | Completed  |
|-------|-----------------------------------|-------------|------------|
| 0     | Scaffold & Foundations            | ✅ Done     | 2026-08-14 |
| 1     | Mock Data Layer & Types           | ✅ Done     | 2026-08-14 |
| 2     | Landing, Search & Dashboard       | ✅ Done     | 2026-08-14 |
| 3     | Workflow Tracker & Audit Trail    | ✅ Done     | 2026-08-14 |
| 4     | Watchlist, Alerts & Compare       | ✅ Done     | 2026-08-14 |
| 5     | Settings & Slack UI               | ✅ Done     | 2026-08-14 |
| 6     | Wire Real Integrations            | ⬜ Not started | Needs API keys |

---

## What's Built (complete feature list)

### Foundation
- Next.js 16 + React 19 + TypeScript + TailwindCSS v4, `npm run build` passes, 12 routes
- `types/index.ts` — all DB-mirroring interfaces
- `lib/config.ts` — USE_MOCK_* flags (all true; flip per service in Phase 6)
- `lib/scoring.ts` — exact spec formula: `(Freq×0.4) + (Sentiment×0.3) + (Regulatory×0.3)`
- `lib/utils.ts` — cn(), formatDate(), timeAgo(), priorityBadgeClass()
- `providers/AppProvider.tsx` — React Context: watchlist, action items, audit, alerts, all mutations

### Mock Data
- `lib/mock/companies.ts` — CRED, PhonePe, Paytm with real app IDs + icons
- `lib/mock/snapshots.ts` — 8 complaint categories per company, 12-week trend, AI summary
- `lib/mock/workflows.ts` — 7 action items across companies
- `lib/mock/audit.ts` — 8 audit entries (acted_on / deprioritized / deferred)
- `lib/mock/alerts.ts` — 5 alerts (spike + new_trend)
- `lib/mock/slack.ts` — mock SlackConnection with 7 channels

### Service Layer (mock paths; real stubs for Phase 6)
- `lib/services/companies.ts` — searchCompanies, getCompany
- `lib/services/analysis.ts` — getSnapshot, getPreviousSnapshot
- `lib/services/workflows.ts` — getActionItems, createActionItem, updateActionItemStatus
- `lib/services/audit.ts` — getAuditEntries, logDecision
- `lib/services/watchlist.ts` — getWatchlist, addToWatchlist, removeFromWatchlist, detectSpike
- `lib/services/alerts.ts` — getAlerts, markAlertRead, dismissAlert, markAllRead
- `lib/services/slack.ts` — buildAssignmentMessage, buildOverdueMessage, buildSpikeMessage, sendSlackMessage

### Pages & Components
- `/` — hero, search bar (GET /search?q=), 3 value cards
- `/login` — stub Google OAuth + demo link
- `/search` — SearchClient: live search, loading skeletons, company cards
- `/dashboard/[companyId]` — DashboardClient + 6 sub-components:
  - HealthScoreCard (SVG ring, trend delta)
  - SourceBreakdownChart (Recharts donut)
  - RatingDistributionChart (Recharts horizontal bars)
  - SentimentTrendChart (Recharts line, reference lines at 40%/60%)
  - ComplaintCategoryCard (expandable, Create Action Item + Log Decision)
  - AISummaryPanel
  - CreateActionItemModal (pre-filled from dashboard OR manual entry from workflows)
  - LogDecisionModal
- `/workflows` — WorkflowsClient: table with status chips, overdue badges, filters, expanded
  Slack preview, inline status change dropdown
- `/audit` — AuditClient: stats bar, decision feed cards, company/decision/date filters, CSV export
- `/watchlist` — WatchlistClient: grid of company cards, health badge, trend icon, top complaint
- `/alerts` — AlertsClient: tab filters, spike/trend cards, mark read / dismiss
- `/compare` — CompareClient: company picker (up to 3), health columns, AI insight, shared
  category rows side-by-side
- `/settings` — SettingsClient: Slack (connected status, channel picker, Block Kit preview),
  email prefs, notification toggles, watchlist management, save button

---

## Next Up — Phase 6 (Wire Real Integrations)

All services have real-path stubs ready. Flip `USE_MOCK_*` flags in `lib/config.ts` as each
key arrives. Order recommended:

### 6-a: Supabase (first — unlocks auth + persistence)
1. `npm install @supabase/ssr @supabase/supabase-js`
2. Set `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
3. Create tables in Supabase Dashboard matching `documentation` schema
4. Enable Row Level Security on all tables
5. Replace mock reads/writes in `lib/services/` with Supabase client calls
6. Add `middleware.ts` for session checking (redirect to `/login` if no session)
7. Wire `app/login/GoogleButton.tsx` to `supabase.auth.signInWithOAuth({ provider: 'google' })`
8. Set `USE_MOCK_AUTH: false, USE_MOCK_DB: false`

### 6-b: Groq AI
1. `npm install groq-sdk`
2. Set `NEXT_PUBLIC_GROQ_API_KEY` in `.env.local`
3. Create `app/api/analyze/route.ts` implementing classify + prioritize + summarize
4. Set `USE_MOCK_AI: false`

### 6-c: Scrapers + Twitter
1. `npm install google-play-scraper app-store-scraper`
2. Set `TWITTER_BEARER_TOKEN` in `.env.local`
3. Create `app/api/reviews/[source]/route.ts` for each source
4. Create `app/api/search/company/route.ts`
5. Set `USE_MOCK_SCRAPERS: false`

### 6-d: Slack
1. Create Slack app at api.slack.com/apps with scopes: chat:write, channels:read, users:read
2. Set `SLACK_CLIENT_ID` + `SLACK_CLIENT_SECRET`
3. Create `app/api/slack/auth/route.ts` + `app/api/slack/callback/route.ts`
4. Set `USE_MOCK_SLACK: false`

### 6-e: Email (Resend)
1. `npm install resend`
2. Set `RESEND_API_KEY`
3. Create `app/api/email/route.ts`
4. Set `USE_MOCK_EMAIL: false`

### 6-f: Vercel Cron
1. Create `app/api/cron/refresh-watchlist/route.ts`
2. Add to `vercel.json`: `{ "crons": [{ "path": "/api/cron/refresh-watchlist", "schedule": "0 0 * * 0" }] }`
3. Reuse `detectSpike` + `detectNewTrend` from `lib/services/watchlist.ts`

---

## Keys Still Needed

| Service    | Where to get                           | What unlocks |
|------------|----------------------------------------|--------------|
| Supabase   | supabase.com → new project             | Auth + DB    |
| Groq       | console.groq.com (free)               | Real AI      |
| Twitter/X  | developer.twitter.com (free tier)     | Twitter data |
| Slack      | api.slack.com/apps                    | Real Slack   |
| Resend     | resend.com (free, 100/day)            | Email alerts |

---

## Architecture Decisions

| Date       | Decision |
|------------|----------|
| 2026-08-14 | Mock-first — zero keys needed until Phase 6 |
| 2026-08-14 | TailwindCSS v4 — CSS-based theme, no tailwind.config.ts |
| 2026-08-14 | Route groups: `(app)/` has sidebar; `/` and `/login` are public |
| 2026-08-14 | Service modules use in-memory mutable `let _mock*` for mutations |
| 2026-08-14 | Dashboard: async server component fetches → DashboardClient "use client" |
| 2026-08-14 | CreateActionItemModal: optional category/company props handle both pre-fill and manual |

## Known Gotchas

- `lucide-react` v1.31 doesn't export `Slack` icon → use `MessageSquare` instead
- Recharts v3 Tooltip `formatter` receives `ValueType | undefined` → always `Number(v ?? 0)`
- Server components cannot have `onClick` → extract to `"use client"` child component
- Mock service mutations reset on server restart (fine for demo; Supabase fixes in Phase 6)

---

*Last updated: 2026-08-14 — Phases 0–5 complete. Full app running on mock data. Phase 6 ready to start when API keys arrive.*

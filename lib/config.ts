/**
 * Central feature flags — auto-configured from env vars.
 * Falls back to mock mode for any service whose key is not yet set.
 */

const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
const hasGroq     = Boolean(process.env.NEXT_PUBLIC_GROQ_API_KEY);
const hasSlack    = Boolean(process.env.SLACK_CLIENT_ID);
const hasResend   = Boolean(process.env.RESEND_API_KEY);

export const config = {
  /** Supabase auth + DB (Phase 6-a) */
  USE_MOCK_AUTH: !hasSupabase,
  USE_MOCK_DB:   !hasSupabase,

  /** Groq AI classification (Phase 6-b) */
  USE_MOCK_AI:
    !hasGroq || process.env.NEXT_PUBLIC_USE_MOCK_AI === "true",

  /** App store scrapers + Twitter (Phase 6-c) — packages installed, always real */
  USE_MOCK_SCRAPERS: false,

  /** Slack integration (Phase 6-d) */
  USE_MOCK_SLACK: !hasSlack,

  /** Email via Resend (Phase 6-e) */
  USE_MOCK_EMAIL: !hasResend,

  /** Skip auth and load mock data — for quick demos */
  DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE === "true",
} as const;

export type Config = typeof config;

/** Public GitHub repo — update this when the repo is created */
export const GITHUB_REPO_URL = "https://github.com/jaasssnnn/Priori";

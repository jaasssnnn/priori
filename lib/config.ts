/**
 * Central mock/real toggle flags.
 *
 * All flags default to TRUE (mock mode) — the app runs with zero API keys.
 * As you obtain each key/account, set the corresponding flag to false here
 * (or drive it from an env var) to switch that service to real data.
 */

export const config = {
  /** Phase 6-a: Supabase auth + DB */
  USE_MOCK_AUTH: true,
  USE_MOCK_DB:   true,

  /** Phase 6-b: Groq AI classification */
  USE_MOCK_AI: process.env.NEXT_PUBLIC_USE_MOCK_AI !== "false",

  /** Phase 6-c: App store scrapers + Twitter */
  USE_MOCK_SCRAPERS: true,

  /** Phase 6-d: Slack integration */
  USE_MOCK_SLACK: true,

  /** Phase 6-e: Email via Resend / Nodemailer */
  USE_MOCK_EMAIL: true,

  /** Demo mode: pre-loads mock data (CRED / PhonePe / Paytm) without auth */
  DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE === "true",
} as const;

export type Config = typeof config;

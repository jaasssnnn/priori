import { MOCK_COMPANIES } from "@/lib/mock/companies";
import { MOCK_SNAPSHOTS, MOCK_PREVIOUS_SNAPSHOTS } from "@/lib/mock/snapshots";
import type { Company, Snapshot, WatchlistEntry } from "@/types";

// ─── localStorage-backed watchlist ──────────────────────────────────────────
// Works without a Supabase login (demo mode) and persists across refreshes.
// Server DB writes are still fired best-effort so a logged-in user's data and
// the cron job stay in sync.

const LS_KEY = "priori_watchlist";
const DEFAULT_IDS = ["cred", "phonepe", "paytm"];

function readLS(): WatchlistEntry[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as WatchlistEntry[]) : null;
  } catch {
    return null;
  }
}

function writeLS(entries: WatchlistEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(entries));
  } catch {
    /* ignore quota errors */
  }
}

function emptySnapshot(companyId: string): Snapshot {
  return {
    id: `snap-${companyId}-placeholder`,
    company_id: companyId,
    health_score: 75,
    categories: [],
    review_count: 0,
    avg_rating: 0,
    source_breakdown: { play_store: 0, app_store: 0, reddit: 0, twitter: 0, instagram: 0, youtube: 0, facebook: 0 },
    rating_distribution: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
    sentiment_trend: [],
    ai_summary: { health_assessment: "", urgent_problem: "", improving: "" },
    created_at: new Date().toISOString(),
  };
}

function buildEntry(company: Company, snapshot?: Snapshot): WatchlistEntry {
  const latest = snapshot ?? MOCK_SNAPSHOTS[company.id] ?? emptySnapshot(company.id);
  const previous = MOCK_PREVIOUS_SNAPSHOTS[company.id];
  return {
    company,
    latest_snapshot: latest,
    previous_snapshot: previous,
    trend: deriveTrend(latest.health_score, previous?.health_score),
    unread_alerts: 0,
  };
}

function seedDefault(): WatchlistEntry[] {
  const entries = DEFAULT_IDS
    .map((id) => {
      const company = MOCK_COMPANIES.find((c) => c.id === id);
      const latest = MOCK_SNAPSHOTS[id];
      if (!company || !latest) return null;
      return buildEntry(company, latest);
    })
    .filter((e): e is WatchlistEntry => e !== null);
  writeLS(entries);
  return entries;
}

export async function getWatchlist(): Promise<WatchlistEntry[]> {
  const stored = readLS();
  if (stored) return stored;
  return seedDefault();
}

export async function addToWatchlist(company: Company, snapshot?: Snapshot): Promise<void> {
  const entries = readLS() ?? seedDefault();
  if (!entries.some((e) => e.company.id === company.id)) {
    writeLS([buildEntry(company, snapshot), ...entries]);
  }
  // Best-effort server sync (no-op / 401 in demo mode)
  try {
    await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company_id:   company.id,
        company_name: company.name,
        company_icon: company.icon_url,
        app_id:       company.app_id,
        app_store_id: company.app_store_id,
      }),
    });
  } catch {
    /* ignore */
  }
}

export async function removeFromWatchlist(companyId: string): Promise<void> {
  const entries = readLS() ?? seedDefault();
  writeLS(entries.filter((e) => e.company.id !== companyId));
  try {
    await fetch(`/api/watchlist/${companyId}`, { method: "DELETE" });
  } catch {
    /* ignore */
  }
}

export function isOnWatchlist(companyId: string): boolean {
  return (readLS() ?? []).some((e) => e.company.id === companyId);
}

/**
 * Spike detection — guards against division by zero and suppresses noise from
 * tiny counts (e.g. 1 → 2 is not a spike worth alerting on).
 *
 * Rules:
 *   1. At least 10 complaints in the current snapshot (minimum signal threshold)
 *   2. Smoothed growth rate > 30%  (α=5 prevents zero-division and 1→2 false positives)
 *   3. Rate delta ≥ 5 percentage points per 100 reviews  (raw-count comparisons
 *      are misleading when snapshot sizes differ)
 */
export function detectSpike(
  currentCount:  number,
  previousCount: number,
  currentTotal:  number = 100,
  previousTotal: number = 100,
): boolean {
  if (currentCount < 10) return false;

  const α      = 5;
  const growth = (currentCount + α) / (previousCount + α) - 1;
  if (growth <= 0.3) return false;

  const currentRate  = currentCount  / Math.max(currentTotal,  1);
  const previousRate = previousCount / Math.max(previousTotal, 1);

  return (currentRate - previousRate) >= 0.05;
}

/** New trend: category absent from previous snapshot with ≥10 complaints */
export function detectNewTrend(
  categoryName:          string,
  currentCount:          number,
  previousCategoryNames: string[],
): boolean {
  return !previousCategoryNames.includes(categoryName) && currentCount >= 10;
}

function deriveTrend(
  current: number,
  previous?: number
): WatchlistEntry["trend"] {
  if (previous === undefined) return "stable";
  const delta = current - previous;
  if (delta > 3) return "improving";
  if (delta < -3) return "worsening";
  return "stable";
}

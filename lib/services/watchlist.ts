import { config } from "@/lib/config";
import { MOCK_COMPANIES } from "@/lib/mock/companies";
import { MOCK_SNAPSHOTS, MOCK_PREVIOUS_SNAPSHOTS } from "@/lib/mock/snapshots";
import type { Company, WatchlistEntry } from "@/types";

// Default watchlist contains all three demo companies
let _mockWatchlist: string[] = ["cred", "phonepe", "paytm"];

export async function getWatchlist(): Promise<WatchlistEntry[]> {
  if (config.USE_MOCK_DB) {
    await delay(300);
    return _mockWatchlist
      .map((id): WatchlistEntry | null => {
        const company = MOCK_COMPANIES.find((c) => c.id === id);
        const latest = MOCK_SNAPSHOTS[id];
        const previous = MOCK_PREVIOUS_SNAPSHOTS[id];
        if (!company || !latest) return null;

        const trend = deriveTrend(latest.health_score, previous?.health_score);
        const unread_alerts = id === "cred" ? 1 : id === "phonepe" ? 1 : id === "paytm" ? 1 : 0;

        return { company, latest_snapshot: latest, previous_snapshot: previous, trend, unread_alerts };
      })
      .filter((e): e is WatchlistEntry => e !== null);
  }
  const res = await fetch("/api/watchlist");
  if (!res.ok) throw new Error("Failed to fetch watchlist");
  return res.json();
}

export async function addToWatchlist(company: Company): Promise<void> {
  if (config.USE_MOCK_DB) {
    await delay(200);
    if (!_mockWatchlist.includes(company.id)) {
      _mockWatchlist = [company.id, ..._mockWatchlist];
    }
    return;
  }
  await fetch("/api/watchlist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      company_id:    company.id,
      company_name:  company.name,
      company_icon:  company.icon_url,
      app_id:        company.app_id,
      app_store_id:  company.app_store_id,
    }),
  });
}

export async function removeFromWatchlist(companyId: string): Promise<void> {
  if (config.USE_MOCK_DB) {
    await delay(200);
    _mockWatchlist = _mockWatchlist.filter((id) => id !== companyId);
    return;
  }
  await fetch(`/api/watchlist/${companyId}`, { method: "DELETE" });
}

export function isOnWatchlist(companyId: string): boolean {
  return _mockWatchlist.includes(companyId);
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

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

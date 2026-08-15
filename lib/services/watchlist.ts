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
    body: JSON.stringify({ company_id: company.id }),
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

/** Spike detection logic (reused by real cron in Phase 6) */
export function detectSpike(currentCount: number, previousCount: number): boolean {
  if (previousCount === 0) return false;
  return (currentCount - previousCount) / previousCount > 0.3;
}

/** New trend: category not in previous snapshot with ≥5 complaints */
export function detectNewTrend(categoryName: string, currentCount: number, previousCategoryNames: string[]): boolean {
  return !previousCategoryNames.includes(categoryName) && currentCount >= 5;
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

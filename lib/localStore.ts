/**
 * Client-side persistence for the demo experience.
 *
 * The app is usable in DEMO_MODE without a Supabase login, but the server-side
 * watchlist and snapshot cache both require an authenticated user. To make the
 * demo behave (analysis survives a refresh, watchlist actually sticks), we mirror
 * that state into localStorage. All helpers are SSR-safe (no-op on the server).
 */

import type { Snapshot } from "@/types";

const SNAP_PREFIX = "priori_snapshot_";

/** Cached analysis snapshot for a company, or null. */
export function getCachedSnapshot(companyId: string): Snapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SNAP_PREFIX + companyId);
    return raw ? (JSON.parse(raw) as Snapshot) : null;
  } catch {
    return null;
  }
}

export function setCachedSnapshot(companyId: string, snapshot: Snapshot): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SNAP_PREFIX + companyId, JSON.stringify(snapshot));
  } catch {
    /* quota or serialization failure — ignore, analysis just won't persist */
  }
}

export function clearCachedSnapshot(companyId: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SNAP_PREFIX + companyId);
  } catch {
    /* ignore */
  }
}

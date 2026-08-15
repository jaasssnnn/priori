import { config } from "@/lib/config";
import { getMockSnapshot, getMockPreviousSnapshot } from "@/lib/mock/snapshots";
import type { Snapshot } from "@/types";

export async function getSnapshot(companyId: string): Promise<Snapshot | null> {
  if (config.USE_MOCK_AI && config.USE_MOCK_SCRAPERS) {
    await delay(600); // simulate AI processing time
    return getMockSnapshot(companyId) ?? null;
  }
  // Phase 6: trigger real scrape + AI analysis pipeline
  const res = await fetch(`/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ companyId }),
  });
  if (!res.ok) throw new Error("Analysis failed");
  return res.json();
}

export async function getPreviousSnapshot(companyId: string): Promise<Snapshot | null> {
  if (config.USE_MOCK_DB) {
    await delay(100);
    return getMockPreviousSnapshot(companyId) ?? null;
  }
  const res = await fetch(`/api/snapshots/${companyId}/previous`);
  if (!res.ok) return null;
  return res.json();
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

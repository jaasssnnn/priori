import { config } from "@/lib/config";
import { getMockSnapshot, getMockPreviousSnapshot } from "@/lib/mock/snapshots";
import type { Snapshot } from "@/types";

// Full URL required when called from server components
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export async function getSnapshot(
  companyId: string,
  companyName?: string
): Promise<Snapshot | null> {
  if (config.USE_MOCK_AI && config.USE_MOCK_SCRAPERS) {
    await delay(600);
    return getMockSnapshot(companyId) ?? null;
  }
  try {
    const res = await fetch(`${BASE}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, companyName }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Analyze ${res.status}`);
    return res.json();
  } catch (err) {
    console.error("[analysis] getSnapshot failed, falling back to mock:", err);
    return getMockSnapshot(companyId) ?? null;
  }
}

export async function getPreviousSnapshot(companyId: string): Promise<Snapshot | null> {
  if (config.USE_MOCK_DB) {
    await delay(100);
    return getMockPreviousSnapshot(companyId) ?? null;
  }
  try {
    const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return getMockPreviousSnapshot(companyId) ?? null;

    // Second-most-recent snapshot for this company
    const { data } = await supabase
      .from("snapshots")
      .select("*")
      .eq("user_id", user.id)
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .range(1, 1)
      .single();

    return (data as Snapshot) ?? getMockPreviousSnapshot(companyId) ?? null;
  } catch {
    return getMockPreviousSnapshot(companyId) ?? null;
  }
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

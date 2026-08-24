import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { MOCK_SNAPSHOTS, MOCK_PREVIOUS_SNAPSHOTS } from "@/lib/mock/snapshots";
import { MOCK_COMPANIES } from "@/lib/mock/companies";
import type { WatchlistEntry } from "@/types";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("watchlist")
    .select("*")
    .eq("user_id", user.id)
    .order("added_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Attach snapshots (mock until Phase 6-c wires real scrapers)
  const entries: WatchlistEntry[] = (data ?? [])
    .map((row) => {
      const latest   = MOCK_SNAPSHOTS[row.company_id];
      const previous = MOCK_PREVIOUS_SNAPSHOTS[row.company_id];
      if (!latest) return null;

      const delta = previous ? latest.health_score - previous.health_score : 0;
      const trend =
        delta > 3 ? "improving" : delta < -3 ? "worsening" : "stable";

      return {
        company: {
          id:           row.company_id,
          user_id:      user.id,
          app_id:       row.app_id ?? "",
          app_store_id: row.app_store_id ?? "",
          name:         row.company_name,
          icon_url:     MOCK_COMPANIES.find((m) => m.id === row.company_id)?.icon_url ?? row.company_icon ?? "",
          added_at:     row.added_at,
        },
        latest_snapshot:   latest,
        previous_snapshot: previous,
        trend,
        unread_alerts: 0,
      } satisfies WatchlistEntry;
    })
    .filter(Boolean) as WatchlistEntry[];

  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { company_id, company_name, company_icon, app_id, app_store_id } =
    await request.json();

  const { error } = await supabase.from("watchlist").upsert(
    { user_id: user.id, company_id, company_name, company_icon, app_id, app_store_id },
    { onConflict: "user_id,company_id" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

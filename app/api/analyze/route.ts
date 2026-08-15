import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { classifyComplaints, generateHealthSummary } from "@/lib/ai/groq";
import { getMockSnapshot } from "@/lib/mock/snapshots";
import { getMockCompany } from "@/lib/mock/companies";
import type { RawReview } from "@/lib/ai/groq";
import type { Snapshot } from "@/types";

const CACHE_TTL_DAYS = 7;

export async function POST(request: Request) {
  const { companyId } = await request.json();
  if (!companyId) {
    return NextResponse.json({ error: "companyId required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // ── 1. Check Supabase cache ────────────────────────────────────────────────

  if (user) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - CACHE_TTL_DAYS);

    const { data: cached } = await supabase
      .from("snapshots")
      .select("*")
      .eq("user_id", user.id)
      .eq("company_id", companyId)
      .gte("created_at", cutoff.toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (cached) {
      return NextResponse.json(cached as Snapshot);
    }
  }

  // ── 2. Get mock company + reviews as AI input ──────────────────────────────
  // Phase 6-c: replace mock reviews with real scraper output

  const company      = getMockCompany(companyId);
  const mockSnapshot = getMockSnapshot(companyId);

  if (!company || !mockSnapshot) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  // Extract quotes from mock snapshot as review input for Groq
  const reviews: RawReview[] = mockSnapshot.categories.flatMap((cat) =>
    cat.quotes.map((q) => ({
      text:   q.text,
      source: q.source,
      rating: q.rating ?? null,
      date:   q.date,
    }))
  );

  // ── 3. Run AI classification + summary ────────────────────────────────────

  let categories   = mockSnapshot.categories;
  let ai_summary   = mockSnapshot.ai_summary;

  try {
    categories = await classifyComplaints(
      reviews,
      company.name,
      mockSnapshot.review_count
    );
    categories.sort((a, b) => b.score - a.score);

    ai_summary = await generateHealthSummary(
      company.name,
      mockSnapshot.health_score,
      categories,
      mockSnapshot.avg_rating,
      mockSnapshot.review_count
    );
  } catch (err) {
    console.error("[Groq] Analysis failed, using mock fallback:", err);
    // Already set to mock above — graceful fallback
  }

  // ── 4. Build snapshot ─────────────────────────────────────────────────────

  const snapshot: Snapshot = {
    ...mockSnapshot,
    id:         `snap-${companyId}-${Date.now()}`,
    categories,
    ai_summary,
    created_at: new Date().toISOString(),
  };

  // ── 5. Persist to Supabase ────────────────────────────────────────────────

  if (user) {
    await supabase.from("snapshots").insert({
      ...snapshot,
      user_id: user.id,
    });
  }

  return NextResponse.json(snapshot);
}

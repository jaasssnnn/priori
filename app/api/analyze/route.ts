import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { classifyComplaints, generateHealthSummary } from "@/lib/ai/groq";
import { getMockSnapshot } from "@/lib/mock/snapshots";
import { getMockCompany } from "@/lib/mock/companies";
import { computePriorityScore } from "@/lib/scoring";
import { config } from "@/lib/config";
import type { RawReview } from "@/lib/ai/groq";
import type { Snapshot, DataSource } from "@/types";

const CACHE_TTL_DAYS = 7;
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchSource(url: string): Promise<RawReview[]> {
  try {
    const res = await fetch(`${BASE}${url}`, { cache: "no-store" });
    if (!res.ok) return [];
    const { reviews } = await res.json() as { reviews: RawReview[] };
    return reviews ?? [];
  } catch {
    return [];
  }
}

function computeHealthScore(categories: Snapshot["categories"]): number {
  if (categories.length === 0) return 75;
  const avg = categories.reduce((s, c) => s + c.score, 0) / categories.length;
  return Math.round(Math.max(0, Math.min(100, 100 - avg)));
}

function buildSourceBreakdown(reviews: RawReview[]): Record<DataSource, number> {
  const counts: Record<DataSource, number> = {
    play_store: 0, app_store: 0, reddit: 0, twitter: 0,
  };
  reviews.forEach((r) => {
    const src = r.source as DataSource;
    if (src in counts) counts[src]++;
  });
  return counts;
}

function buildRatingDist(reviews: RawReview[]): Record<"1"|"2"|"3"|"4"|"5", number> {
  const dist: Record<"1"|"2"|"3"|"4"|"5", number> = { "1":0,"2":0,"3":0,"4":0,"5":0 };
  reviews.forEach((r) => {
    if (r.rating != null) {
      const key = String(Math.round(r.rating)) as "1"|"2"|"3"|"4"|"5";
      if (key in dist) dist[key]++;
    }
  });
  return dist;
}

function computeAvgRating(reviews: RawReview[]): number {
  const rated = reviews.filter((r) => r.rating != null);
  if (rated.length === 0) return 0;
  return Math.round((rated.reduce((s, r) => s + r.rating!, 0) / rated.length) * 10) / 10;
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const { companyId, companyName } = await request.json() as {
    companyId: string;
    companyName?: string;
  };

  if (!companyId) {
    return NextResponse.json({ error: "companyId required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // ── 1. Check Supabase cache ────────────────────────────────────────────────

  if (user && !config.USE_MOCK_DB) {
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

    if (cached) return NextResponse.json(cached as Snapshot);
  }

  // ── 2. Gather reviews ─────────────────────────────────────────────────────

  let allReviews: RawReview[] = [];
  const mockSnapshot = getMockSnapshot(companyId);
  const mockCompany  = getMockCompany(companyId);
  const displayName  = companyName ?? mockCompany?.name ?? companyId;

  if (config.USE_MOCK_SCRAPERS) {
    // Use mock quotes as review input
    if (mockSnapshot) {
      allReviews = mockSnapshot.categories.flatMap((cat) =>
        cat.quotes.map((q) => ({
          text:   q.text,
          source: q.source,
          rating: q.rating ?? null,
          date:   q.date,
        }))
      );
    }
  } else {
    // Fetch all 4 sources in parallel
    const [gpReviews, asReviews, rdReviews, twReviews] = await Promise.all([
      fetchSource(`/api/reviews/google-play?appId=${encodeURIComponent(companyId)}`),
      fetchSource(`/api/reviews/app-store?appName=${encodeURIComponent(displayName)}`),
      fetchSource(`/api/reviews/reddit?companyName=${encodeURIComponent(displayName)}`),
      fetchSource(`/api/reviews/twitter?companyName=${encodeURIComponent(displayName)}`),
    ]);
    allReviews = [...gpReviews, ...asReviews, ...rdReviews, ...twReviews];
  }

  // Filter to negative/complaint reviews for AI classification
  const negativeReviews = allReviews.filter((r) => {
    if (r.rating != null) return r.rating <= 3;
    return true; // Reddit + Twitter have no rating — include all
  });

  const reviewsForAI = negativeReviews.length > 0 ? negativeReviews : allReviews;

  if (reviewsForAI.length === 0 && !mockSnapshot) {
    return NextResponse.json({ error: "No reviews found" }, { status: 404 });
  }

  // ── 3. AI classification + summary ────────────────────────────────────────

  const totalReviews   = allReviews.length || mockSnapshot?.review_count || 100;
  let categories       = mockSnapshot?.categories ?? [];
  let ai_summary       = mockSnapshot?.ai_summary ?? { health_assessment: "", urgent_problem: "", improving: "" };

  if (!config.USE_MOCK_AI && reviewsForAI.length > 0) {
    try {
      categories = await classifyComplaints(reviewsForAI, displayName, totalReviews);
      categories.sort((a, b) => b.score - a.score);

      const healthScore = computeHealthScore(categories);
      const avgRating   = computeAvgRating(allReviews) || mockSnapshot?.avg_rating || 0;

      ai_summary = await generateHealthSummary(
        displayName,
        healthScore,
        categories,
        avgRating,
        totalReviews
      );
    } catch (err) {
      console.error("[analyze] Groq failed, using mock categories:", err);
      categories = mockSnapshot?.categories ?? categories;
      ai_summary = mockSnapshot?.ai_summary ?? ai_summary;
    }
  }

  // ── 4. Build snapshot ─────────────────────────────────────────────────────

  const health_score      = computeHealthScore(categories);
  const avg_rating        = computeAvgRating(allReviews) || mockSnapshot?.avg_rating || 0;
  const source_breakdown  = allReviews.length > 0
    ? buildSourceBreakdown(allReviews)
    : (mockSnapshot?.source_breakdown ?? { play_store: 0, app_store: 0, reddit: 0, twitter: 0 });
  const rating_distribution = allReviews.length > 0
    ? buildRatingDist(allReviews)
    : (mockSnapshot?.rating_distribution ?? { "1":0,"2":0,"3":0,"4":0,"5":0 });

  const snapshot: Snapshot = {
    id:                  `snap-${companyId}-${Date.now()}`,
    company_id:          companyId,
    health_score,
    categories,
    review_count:        totalReviews,
    avg_rating,
    source_breakdown,
    rating_distribution,
    sentiment_trend:     mockSnapshot?.sentiment_trend ?? [],
    ai_summary,
    created_at:          new Date().toISOString(),
  };

  // ── 5. Persist to Supabase ────────────────────────────────────────────────

  if (user && !config.USE_MOCK_DB) {
    await supabase.from("snapshots").insert({
      ...snapshot,
      user_id: user.id,
    });
  }

  return NextResponse.json(snapshot);
}

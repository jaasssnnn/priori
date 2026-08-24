import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeReviews } from "@/lib/ai/groq";
import { getMockCompany } from "@/lib/mock/companies";
import { scrapePlayStore, scrapeAppStore, scrapeReddit, scrapeTwitter, scrapeWebMentions, scrapeYouTube, scrapeInstagram, scrapeFacebook } from "@/lib/scrapers";
import { config } from "@/lib/config";
import type { RawReview } from "@/lib/ai/groq";
import type { Snapshot, DataSource } from "@/types";

export const maxDuration = 60;

const CACHE_TTL_DAYS = 7;

function computeHealthScore(categories: Snapshot["categories"]): number {
  if (categories.length === 0) return 75;
  const avg = categories.reduce((s, c) => s + c.score, 0) / categories.length;
  return Math.round(Math.max(0, Math.min(100, 100 - avg)));
}

function buildSourceBreakdown(reviews: RawReview[]): Record<DataSource, number> {
  const counts: Record<DataSource, number> = { play_store: 0, app_store: 0, reddit: 0, twitter: 0, instagram: 0, youtube: 0, facebook: 0 };
  reviews.forEach((r) => { const src = r.source as DataSource; if (src in counts) counts[src]++; });
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
  if (!rated.length) return 0;
  return Math.round((rated.reduce((s, r) => s + r.rating!, 0) / rated.length) * 10) / 10;
}

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

  // ── 1. Check Supabase cache ───────────────────────────────────────────────

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

  // ── 2. Resolve real app IDs ───────────────────────────────────────────────
  // companyId may be a short slug ("cred") — resolve real package IDs from mock map

  const mockCompany    = getMockCompany(companyId);
  const realAppId      = mockCompany?.app_id      ?? companyId;
  const realAppStoreId = mockCompany?.app_store_id ?? undefined;
  const displayName    = companyName ?? mockCompany?.name ?? companyId;

  // ── 3. Scrape all sources directly (no internal HTTP) ────────────────────

  const [gpReviews, asReviews, rdReviews, twReviews, webReviews, ytReviews, igReviews, fbReviews] = await Promise.all([
    scrapePlayStore(realAppId),
    scrapeAppStore(realAppStoreId, displayName),
    scrapeReddit(displayName),
    scrapeTwitter(displayName),
    scrapeWebMentions(displayName),
    scrapeYouTube(displayName),
    scrapeInstagram(displayName),
    scrapeFacebook(displayName),
  ]);

  const allReviews = [...gpReviews, ...asReviews, ...rdReviews, ...twReviews, ...webReviews, ...ytReviews, ...igReviews, ...fbReviews];

  if (allReviews.length === 0) {
    return NextResponse.json(
      { error: "No reviews found. The app may be unavailable or rate-limited." },
      { status: 404 }
    );
  }

  // ── 4. AI classification + summary (single Gemini call) ─────────────────

  const negativeReviews = allReviews.filter((r) => r.rating != null ? r.rating <= 3 : true);
  const reviewsForAI    = negativeReviews.length > 0 ? negativeReviews : allReviews;

  const avg_rating = computeAvgRating(allReviews);

  const { categories: rawCategories, summary: ai_summary } = await analyzeReviews(
    reviewsForAI,
    displayName,
    allReviews.length,
    avg_rating,
    mockCompany?.industry,
  );

  const categories = rawCategories.sort((a, b) => b.score - a.score);
  const health_score = computeHealthScore(categories);

  // ── 5. Build snapshot ─────────────────────────────────────────────────────

  const snapshot: Snapshot = {
    id:                  `snap-${companyId}-${Date.now()}`,
    company_id:          companyId,
    health_score,
    categories,
    review_count:        allReviews.length,
    avg_rating,
    source_breakdown:    buildSourceBreakdown(allReviews),
    rating_distribution: buildRatingDist(allReviews),
    sentiment_trend:     [],
    ai_summary,
    created_at:          new Date().toISOString(),
  };

  // ── 6. Persist to Supabase ────────────────────────────────────────────────

  if (user && !config.USE_MOCK_DB) {
    await supabase.from("snapshots").insert({ ...snapshot, user_id: user.id });
  }

  return NextResponse.json(snapshot);
}

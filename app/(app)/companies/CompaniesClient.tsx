"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, Star, Download, Loader2, ArrowRight, Zap,
  AlertCircle, Bookmark, TrendingDown, Minus, TrendingUp,
} from "lucide-react";
import { searchCompanies } from "@/lib/services/companies";
import { useApp } from "@/providers/AppProvider";
import { MOCK_COMPANIES } from "@/lib/mock/companies";
import type { Company } from "@/types";
import { cn, timeAgo } from "@/lib/utils";

interface Props {
  searchParamsPromise: Promise<{ q?: string }>;
}

export default function CompaniesClient({ searchParamsPromise }: Props) {
  const { q } = use(searchParamsPromise);
  const router = useRouter();

  const [query, setQuery]       = useState(q ?? "");
  const [results, setResults]   = useState<Company[]>([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);

  const { watchlist, watchlistLoading } = useApp();

  // Auto-run if ?q= is preset
  useEffect(() => {
    if (q) runSearch(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  async function runSearch(searchQuery: string) {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchCompanies(searchQuery);
      setResults(data);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/companies?q=${encodeURIComponent(trimmed)}`);
    runSearch(trimmed);
  }

  // Show demo/recent companies when no search active
  const showDiscovery = !searched;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Companies</h1>
        <p className="mt-1 text-sm text-slate-500">
          Search, analyze, and monitor company app feedback.
        </p>
      </div>

      {/* Search form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" aria-hidden />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a company or app…"
              aria-label="Search for a company or app"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm shadow-sm placeholder:text-slate-400 focus:border-[#1a3a2e] focus:outline-none focus:ring-2 focus:ring-[#1a3a2e]/10 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="h-11 shrink-0 flex items-center gap-2 rounded-xl bg-[#1a3a2e] px-5 text-sm font-semibold text-white hover:bg-[#243f35] disabled:opacity-60 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a3a2e]/40"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            {loading ? "Searching…" : "Analyze"}
          </button>
        </form>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Find a company&apos;s app on the Play Store or App Store and analyze confirmed
          matches. Not every company name will resolve to an app.
        </p>
      </div>


      {/* Watchlist preview (when no search active) */}
      {showDiscovery && !watchlistLoading && watchlist.length > 0 && (
        <section aria-labelledby="watchlist-heading">
          <div className="flex items-center justify-between mb-3">
            <h2 id="watchlist-heading" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Bookmark className="h-4 w-4 text-slate-400" />
              Watchlist
            </h2>
            <Link
              href="/watchlist"
              className="text-xs font-medium text-[#1a3a2e] hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {watchlist.slice(0, 4).map((entry) => {
              const snap = entry.latest_snapshot;
              const topCat = snap.categories[0];
              const scoreColor =
                snap.health_score >= 70 ? "text-[#1a3a2e]" :
                snap.health_score >= 50 ? "text-amber-600" : "text-red-600";
              const TrendIconEl =
                entry.trend === "improving" ? TrendingUp :
                entry.trend === "worsening" ? TrendingDown : Minus;
              const trendColor =
                entry.trend === "improving" ? "text-[#1a3a2e]" :
                entry.trend === "worsening" ? "text-red-500" : "text-slate-400";

              return (
                <Link
                  key={entry.company.id}
                  href={`/companies/${entry.company.id}`}
                  className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 hover:border-[#1a3a2e]/30 hover:shadow-sm transition-all group"
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-100">
                    {entry.company.icon_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={entry.company.icon_url} alt={entry.company.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-400 bg-slate-50">
                        {entry.company.name[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-[#1a3a2e] truncate transition-colors">
                      {entry.company.name}
                    </p>
                    {topCat && (
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        Top: {topCat.name} · {topCat.score}/100
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <TrendIconEl className={cn("h-3.5 w-3.5", trendColor)} aria-hidden />
                    <span className={cn("text-lg font-extrabold", scoreColor)}>
                      {snap.health_score}
                    </span>
                    <span className="text-[10px] text-slate-400">risk</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#1a3a2e] transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3" aria-live="polite" aria-label="Loading search results">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-slate-100 bg-white p-5">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-slate-100" />
                  <div className="h-3 w-48 rounded bg-slate-100" />
                  <div className="h-3 w-24 rounded bg-slate-100" />
                </div>
                <div className="h-8 w-20 rounded-lg bg-slate-100 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && searched && results.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 text-center px-6">
          <AlertCircle className="h-10 w-10 text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-600">No confirmed matches found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Try a different company or app name. Not all names resolve to a Play Store app.
            {" Try searching by the exact app name as it appears on the Play Store."}
          </p>
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <section aria-labelledby="results-heading">
          <div className="flex items-center justify-between mb-3">
            <h2 id="results-heading" className="text-sm font-semibold text-slate-700">
              {results.length} confirmed match{results.length !== 1 ? "es" : ""} for &ldquo;{q}&rdquo;
            </h2>
          </div>

          {results.length > 1 && (
            <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" aria-hidden />
              <p className="text-xs text-amber-700">
                Multiple possible matches found. Confirm the correct app before starting analysis.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {results.map((company) => (
              <CompanyResultCard key={company.id} company={company} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Individual search result card ────────────────────────────────────────────

function CompanyResultCard({ company }: { company: Company }) {
  return (
    <Link
      href={`/companies/${company.id}`}
      className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 hover:border-[#1a3a2e]/30 hover:shadow-sm transition-all group"
    >
      {/* Icon */}
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
        {company.icon_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={company.icon_url} alt={company.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-lg font-bold text-slate-400">
            {company.name[0]}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900 group-hover:text-[#1a3a2e] transition-colors">
          {company.name}
        </p>
        {company.developer && (
          <p className="text-xs text-slate-500 mt-0.5">{company.developer}</p>
        )}
        <div className="flex items-center gap-4 mt-2 flex-wrap">
          {company.avg_rating != null && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden />
              {company.avg_rating.toFixed(1)}
            </span>
          )}
          {company.install_count && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Download className="h-3 w-3 text-slate-400" aria-hidden />
              {company.install_count}
            </span>
          )}
          {company.app_id && (
            <span className="text-[10px] text-slate-400 font-mono">{company.app_id}</span>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="shrink-0">
        <span className="flex items-center gap-1.5 rounded-lg bg-[#1a3a2e] px-3 py-1.5 text-xs font-semibold text-white group-hover:bg-[#243f35] transition-colors">
          Analyze <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </Link>
  );
}

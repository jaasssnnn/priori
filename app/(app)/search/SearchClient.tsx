"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Search, Star, Download, Loader2, ArrowRight, Zap } from "lucide-react";
import { searchCompanies } from "@/lib/services/companies";
import type { Company } from "@/types";
import Link from "next/link";

interface Props {
  searchParamsPromise: Promise<{ q?: string }>;
}

export default function SearchClient({ searchParamsPromise }: Props) {
  const { q } = use(searchParamsPromise);
  const router = useRouter();

  const [query, setQuery]         = useState(q ?? "");
  const [results, setResults]     = useState<Company[]>([]);
  const [loading, setLoading]     = useState(false);
  const [searched, setSearched]   = useState(false);

  // Auto-run search if ?q= is preset
  useEffect(() => {
    if (q) {
      runSearch(q);
    }
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
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    runSearch(query);
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Company Search</h1>
        <p className="mt-1 text-sm text-slate-500">
          Search any company to pull complaint data from Play Store, App Store, Reddit, and
          Twitter/X, then analyse with AI.
        </p>
      </div>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any company — CRED, PhonePe, Paytm, Razorpay…"
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm shadow-sm placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="h-11 shrink-0 flex items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {/* Demo hint */}
      {!searched && (
        <div className="mb-8 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
          <div className="flex items-start gap-3">
            <Zap className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-indigo-800">Try a demo search</p>
              <p className="text-xs text-indigo-600 mt-0.5">
                Search for{" "}
                {["CRED", "PhonePe", "Paytm"].map((name, i) => (
                  <span key={name}>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery(name);
                        router.push(`/search?q=${name}`);
                        runSearch(name);
                      }}
                      className="underline font-medium"
                    >
                      {name}
                    </button>
                    {i < 2 ? ", " : ""}
                  </span>
                ))}{" "}
                to see pre-loaded demo data with realistic complaint analysis.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-slate-100 bg-white p-5">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 rounded bg-slate-100" />
                  <div className="h-3 w-48 rounded bg-slate-100" />
                  <div className="h-3 w-24 rounded bg-slate-100" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && searched && results.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Search className="h-10 w-10 text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-600">No results found</p>
          <p className="text-xs text-slate-400 mt-1">
            Try a different company name. In demo mode, only CRED, PhonePe, and Paytm return results.
          </p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div>
          <p className="text-xs text-slate-400 mb-3">
            {results.length} result{results.length !== 1 ? "s" : ""} for &ldquo;{q}&rdquo;
          </p>
          <div className="space-y-3">
            {results.map((company) => (
              <Link
                key={company.id}
                href={`/dashboard/${company.id}`}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 hover:border-indigo-300 hover:shadow-sm transition-all group"
              >
                {/* Icon */}
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                  {company.icon_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={company.icon_url}
                      alt={company.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-bold text-slate-400">
                      {company.name[0]}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
                      {company.name}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{company.developer}</p>
                  <div className="flex items-center gap-4 mt-2">
                    {company.avg_rating != null && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {company.avg_rating.toFixed(1)}
                      </span>
                    )}
                    {company.install_count && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Download className="h-3 w-3 text-slate-400" />
                        {company.install_count}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">{company.app_id}</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="shrink-0">
                  <span className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    Analyse <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

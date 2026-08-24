"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, X, GitCompare, Sparkles, TrendingUp, TrendingDown, Minus, ShieldAlert, Loader2 } from "lucide-react";
import { MOCK_COMPANIES } from "@/lib/mock/companies";
import { MOCK_SNAPSHOTS } from "@/lib/mock/snapshots";
import type { Company, Snapshot } from "@/types";
import { cn } from "@/lib/utils";

// ─── Shared category row ──────────────────────────────────────────────────────

function SharedCategoryRow({
  categoryName,
  companies,
  snapshots,
}: {
  categoryName: string;
  companies: Company[];
  snapshots: Snapshot[];
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4">
      <p className="text-xs font-semibold text-slate-700 mb-3">{categoryName}</p>
      <div className="flex gap-4">
        {companies.map((company) => {
          const snap = snapshots.find((s) => s.company_id === company.id);
          const cat  = snap?.categories.find((c) => c.name === categoryName);

          return (
            <div key={company.id} className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-slate-400 truncate">{company.name}</span>
                <span className={cn(
                  "text-xs font-bold",
                  !cat ? "text-slate-300" :
                  cat.score >= 70 ? "text-red-600" :
                  cat.score >= 40 ? "text-orange-500" : "text-[#1a3a2e]"
                )}>
                  {cat ? cat.score : "—"}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100">
                {cat && (
                  <div
                    className={cn("h-full rounded-full",
                      cat.score >= 70 ? "bg-red-500" :
                      cat.score >= 40 ? "bg-orange-400" : "bg-[#1a3a2e]"
                    )}
                    style={{ width: `${cat.score}%` }}
                  />
                )}
              </div>
              {cat?.risk_relevance && (
                <div className="flex items-center gap-1 mt-1 text-[9px] text-violet-600">
                  <ShieldAlert className="h-2.5 w-2.5" /> Risk relevance
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Company column header ────────────────────────────────────────────────────

function CompanyColumn({ company, snapshot, onRemove }: {
  company: Company;
  snapshot: Snapshot;
  onRemove: () => void;
}) {
  const TrendIcon = Minus; // trend comparison added in Phase 6 when real snapshots flow

  const scoreColor =
    snapshot.health_score >= 70 ? "text-[#1a3a2e]" :
    snapshot.health_score >= 40 ? "text-amber-600" :
    "text-red-600";

  const scoreBg =
    snapshot.health_score >= 70 ? "bg-[#1a3a2e]/5 border-[#1a3a2e]/20" :
    snapshot.health_score >= 40 ? "bg-amber-50 border-amber-200" :
    "bg-red-50 border-red-200";

  return (
    <div className="flex-1 min-w-0">
      {/* Company header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 mb-3 relative">
        <button
          onClick={onRemove}
          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-slate-300 hover:bg-slate-100 hover:text-slate-500 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="flex flex-col items-center text-center gap-2">
          <div className="h-12 w-12 overflow-hidden rounded-xl border border-slate-100">
            {company.icon_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={company.icon_url} alt={company.name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-slate-400 bg-slate-50">{company.name[0]}</div>
            )}
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">{company.name}</p>
            <p className="text-xs text-slate-400">{company.developer}</p>
          </div>
        </div>

        {/* Health score */}
        <div className={cn("mt-4 rounded-xl border px-4 py-3 text-center", scoreBg)}>
          <p className={cn("text-3xl font-extrabold", scoreColor)}>{snapshot.health_score}</p>
          <p className="text-xs text-slate-500 mt-0.5">Health Score</p>
        </div>

        {/* Quick stats */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-slate-50 px-2 py-2 text-center">
            <p className="text-sm font-bold text-slate-700">{snapshot.avg_rating.toFixed(1)}★</p>
            <p className="text-[10px] text-slate-400">Rating</p>
          </div>
          <div className="rounded-lg bg-slate-50 px-2 py-2 text-center">
            <p className="text-sm font-bold text-slate-700">
              {snapshot.categories.filter((c) => c.risk_relevance).length}
            </p>
            <p className="text-[10px] text-slate-400">Risk flags</p>
          </div>
        </div>
      </div>

      {/* View dashboard link */}
      <Link
        href={`/companies/${company.id}`}
        className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-medium text-slate-600 hover:bg-[#1a3a2e]/5 hover:text-[#1a3a2e] hover:border-[#1a3a2e]/20 transition-colors"
      >
        Full Dashboard <TrendIcon className="h-3 w-3" />
      </Link>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CompareClient() {
  const [selectedIds, setSelectedIds] = useState<string[]>(["cred", "phonepe", "paytm"]);

  const companies = useMemo(
    () => MOCK_COMPANIES.filter((c) => selectedIds.includes(c.id)),
    [selectedIds]
  );
  const snapshots = useMemo(
    () => companies.map((c) => MOCK_SNAPSHOTS[c.id]).filter(Boolean) as Snapshot[],
    [companies]
  );

  // All complaint categories that appear in ANY of the selected companies
  const allCategoryNames = useMemo(() => {
    const names = new Set<string>();
    snapshots.forEach((s) => s.categories.forEach((c) => names.add(c.name)));
    // Sort by avg score across companies (highest first)
    return [...names].sort((a, b) => {
      const avgA = snapshots.reduce((sum, s) => sum + (s.categories.find((c) => c.name === a)?.score ?? 0), 0) / snapshots.length;
      const avgB = snapshots.reduce((sum, s) => sum + (s.categories.find((c) => c.name === b)?.score ?? 0), 0) / snapshots.length;
      return avgB - avgA;
    });
  }, [snapshots]);

  const [insight, setInsight]           = useState<string>("");
  const [insightLoading, setInsightLoading] = useState(false);

  const fetchInsight = useCallback(async (ids: string[]) => {
    if (ids.length < 2) { setInsight(""); return; }
    setInsightLoading(true);
    try {
      const res = await fetch("/api/compare/insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyIds: ids }),
      });
      if (res.ok) {
        const { insight: text } = await res.json();
        if (text) setInsight(text);
      }
    } catch {
      // silently ignore — insight panel just stays empty
    } finally {
      setInsightLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsight(selectedIds);
  }, [selectedIds, fetchInsight]);

  function toggleCompany(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : prev.length < 3
          ? [...prev, id]
          : prev
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Competitor Benchmarking</h1>
        <p className="mt-1 text-sm text-slate-500">
          Compare up to 3 companies side by side on health score, complaint categories, ratings,
          and risk relevance.
        </p>
      </div>

      {/* Company picker */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 mb-6">
        <p className="text-xs font-semibold text-slate-500 mb-3">Select up to 3 companies to compare:</p>
        <div className="flex flex-wrap gap-2">
          {MOCK_COMPANIES.map((company) => {
            const selected = selectedIds.includes(company.id);
            return (
              <button
                key={company.id}
                onClick={() => toggleCompany(company.id)}
                disabled={!selected && selectedIds.length >= 3}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors disabled:opacity-40",
                  selected
                    ? "border-[#1a3a2e]/50 bg-[#1a3a2e]/5 text-[#1a3a2e]"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                )}
              >
                {selected ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                {company.name}
              </button>
            );
          })}
        </div>
      </div>

      {companies.length < 2 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
          <GitCompare className="h-10 w-10 text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-600">Select at least 2 companies to compare</p>
        </div>
      ) : (
        <>
          {/* Column headers */}
          <div className={cn("grid gap-4 mb-6", companies.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
            {companies.map((company) => {
              const snap = MOCK_SNAPSHOTS[company.id];
              if (!snap) return null;
              return (
                <CompanyColumn
                  key={company.id}
                  company={company}
                  snapshot={snap}
                  onRemove={() => toggleCompany(company.id)}
                />
              );
            })}
          </div>

          {/* AI Insight */}
          {(insight || insightLoading) && (
            <div className="rounded-2xl border border-[#1a3a2e]/15 bg-gradient-to-br from-[#1a3a2e]/5 to-[#1a3a2e]/[0.03] p-6 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1a3a2e]">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </div>
                <p className="text-sm font-semibold text-[#1a3a2e]">AI Competitive Insight</p>
                <span className="ml-auto rounded-full bg-[#1a3a2e]/10 px-2 py-0.5 text-[10px] font-semibold text-[#1a3a2e]">
                  Groq · llama-3.3-70b
                </span>
              </div>
              {insightLoading ? (
                <div className="flex items-center gap-2 text-sm text-[#1a3a2e]/70">
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating insight…
                </div>
              ) : (
                <p className="text-sm text-slate-700 leading-relaxed">{insight}</p>
              )}
            </div>
          )}

          {/* Category-by-category comparison */}
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-3">
              Complaint Categories — Side by Side
            </h2>
            <div className="space-y-3">
              {allCategoryNames.map((name) => (
                <SharedCategoryRow
                  key={name}
                  categoryName={name}
                  companies={companies}
                  snapshots={snapshots}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck, Star, Clock, ExternalLink } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import HealthScoreCard from "@/components/dashboard/HealthScoreCard";
import ComplaintCategoryCard from "@/components/dashboard/ComplaintCategoryCard";
import SourceBreakdownChart from "@/components/dashboard/SourceBreakdownChart";
import RatingDistributionChart from "@/components/dashboard/RatingDistributionChart";
import SentimentTrendChart from "@/components/dashboard/SentimentTrendChart";
import AISummaryPanel from "@/components/dashboard/AISummaryPanel";
import CreateActionItemModal from "@/components/dashboard/CreateActionItemModal";
import LogDecisionModal from "@/components/dashboard/LogDecisionModal";
import type { Company, Snapshot, ComplaintCategory } from "@/types";
import { timeAgo } from "@/lib/utils";
import { getIndustryConfig, detectIndustry } from "@/lib/industries";

interface Props {
  company: Company;
  snapshot: Snapshot;
  previousSnapshot: Snapshot | null;
}

export default function DashboardClient({ company, snapshot, previousSnapshot }: Props) {
  const { isOnWatchlist, addToWatchlist, removeFromWatchlist } = useApp();
  const industryKey = company.industry ?? detectIndustry(company.app_id, company.name);
  const industryConfig = getIndustryConfig(industryKey);

  const [actionItemCategory, setActionItemCategory] = useState<ComplaintCategory | null>(null);
  const [decisionCategory, setDecisionCategory]     = useState<ComplaintCategory | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const onWatchlist = isOnWatchlist(company.id);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function toggleWatchlist() {
    if (onWatchlist) {
      await removeFromWatchlist(company.id);
      showToast(`${company.name} removed from watchlist`);
    } else {
      await addToWatchlist(company.id);
      showToast(`${company.name} added to watchlist`);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-slate-900 px-5 py-3 text-sm text-white shadow-xl animate-fade-in">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-100">
              {company.icon_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={company.icon_url} alt={company.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-slate-400 bg-slate-50">
                  {company.name[0]}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900">{company.name}</h1>
                <span className="rounded-full bg-[#1a3a2e]/8 border border-[#1a3a2e]/15 px-2 py-0.5 text-[11px] font-medium text-[#1a3a2e]">
                  {industryConfig.label}
                </span>
              </div>
              {company.developer && (
                <p className="text-sm text-slate-500 mt-0.5">{company.developer}</p>
              )}
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <span className="flex items-center gap-1 text-sm text-slate-600">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <strong>{snapshot.avg_rating.toFixed(1)}</strong>
                </span>
                <span className="text-xs text-slate-400">
                  {snapshot.review_count.toLocaleString()} feedback items analysed
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="h-3 w-3" />
                  {timeAgo(snapshot.created_at)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Risk lens: {industryConfig.riskLens}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`https://play.google.com/store/apps/details?id=${company.app_id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50 transition-colors"
            >
              Play Store <ExternalLink className="h-3 w-3" />
            </a>
            <button
              onClick={toggleWatchlist}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                onWatchlist
                  ? "bg-[#1a3a2e] text-white hover:bg-[#243f35]"
                  : "border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {onWatchlist ? (
                <><BookmarkCheck className="h-3.5 w-3.5" /> Watching</>
              ) : (
                <><Bookmark className="h-3.5 w-3.5" /> Add to Watchlist</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Top row: health + source + rating */}
      <div className="grid grid-cols-3 gap-4">
        <HealthScoreCard
          score={snapshot.health_score}
          previousScore={previousSnapshot?.health_score}
          reviewCount={snapshot.review_count}
          avgRating={snapshot.avg_rating}
          lastUpdated={snapshot.created_at}
        />
        <SourceBreakdownChart breakdown={snapshot.source_breakdown} />
        <RatingDistributionChart
          distribution={snapshot.rating_distribution}
          avgRating={snapshot.avg_rating}
        />
      </div>

      {/* Sentiment trend (full width) */}
      <SentimentTrendChart data={snapshot.sentiment_trend} />

      {/* Main content: categories (left) + AI summary (right) */}
      <div className="grid grid-cols-3 gap-4">
        {/* Complaint categories */}
        <div className="col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">
              Complaint Categories
              <span className="ml-2 text-xs font-normal text-slate-400">
                ranked by priority score
              </span>
            </h2>
            <span className="text-xs text-slate-400">{snapshot.categories.length} categories</span>
          </div>

          {snapshot.categories.map((cat, i) => (
            <ComplaintCategoryCard
              key={cat.name}
              category={cat}
              rank={i + 1}
              onCreateActionItem={(c) => setActionItemCategory(c)}
              onLogDecision={(c) => setDecisionCategory(c)}
            />
          ))}
        </div>

        {/* AI summary (sticky) */}
        <div className="col-span-1">
          <AISummaryPanel summary={snapshot.ai_summary} />
        </div>
      </div>

      {/* Modals */}
      {actionItemCategory && (
        <CreateActionItemModal
          category={actionItemCategory}
          company={company}
          onClose={() => setActionItemCategory(null)}
          onSuccess={() => showToast("Action item created!")}
        />
      )}
      {decisionCategory && (
        <LogDecisionModal
          category={decisionCategory}
          company={company}
          onClose={() => setDecisionCategory(null)}
          onSuccess={() => showToast("Decision logged to audit trail.")}
        />
      )}
    </div>
  );
}

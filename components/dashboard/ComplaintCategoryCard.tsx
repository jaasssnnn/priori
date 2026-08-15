"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ShieldAlert, ExternalLink, Plus } from "lucide-react";
import { cn, priorityBadgeClass, getPriorityBand } from "@/lib/utils";
import type { ComplaintCategory } from "@/types";

interface Props {
  category: ComplaintCategory;
  rank: number;
  onCreateActionItem: (category: ComplaintCategory) => void;
  onLogDecision: (category: ComplaintCategory) => void;
}

const SOURCE_LABELS: Record<string, string> = {
  play_store: "Play Store",
  app_store:  "App Store",
  reddit:     "Reddit",
  twitter:    "Twitter/X",
};

export default function ComplaintCategoryCard({ category, rank, onCreateActionItem, onLogDecision }: Props) {
  const [expanded, setExpanded] = useState(false);
  const band = getPriorityBand(category.score);

  const scoreColor = {
    critical: "bg-red-600",
    high:     "bg-orange-500",
    medium:   "bg-yellow-400",
    low:      "bg-green-500",
  }[band];

  const borderColor = {
    critical: "border-l-red-500",
    high:     "border-l-orange-400",
    medium:   "border-l-yellow-400",
    low:      "border-l-green-400",
  }[band];

  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white border-l-4 overflow-hidden", borderColor)}>
      {/* Header row */}
      <div className="flex items-start gap-4 p-5">
        {/* Rank */}
        <div className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 mt-0.5">
          {rank}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="font-semibold text-slate-900">{category.name}</h3>
            {/* Priority badge */}
            <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", priorityBadgeClass(category.score))}>
              {band}
            </span>
            {/* Regulatory badge */}
            {category.regulatory_flag && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700">
                <ShieldAlert className="h-2.5 w-2.5" />
                Regulatory
              </span>
            )}
          </div>

          {/* Score + severity bar */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="flex-1 h-1.5 rounded-full bg-slate-100">
                <div
                  className={cn("h-full rounded-full transition-all", scoreColor)}
                  style={{ width: `${category.score}%` }}
                />
              </div>
              <span className="text-sm font-bold text-slate-700 tabular-nums w-8 text-right">
                {category.score}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              {category.complaint_count.toLocaleString()} complaints
            </span>
          </div>

          {/* Top quote */}
          {category.quotes[0] && (
            <blockquote className="text-xs text-slate-600 italic leading-relaxed bg-slate-50 rounded-lg p-3 border-l-2 border-slate-200 mb-3">
              &ldquo;{category.quotes[0].text}&rdquo;
              <footer className="mt-1 text-[10px] text-slate-400 not-italic">
                — {SOURCE_LABELS[category.quotes[0].source]}
                {category.quotes[0].rating != null && ` · ${category.quotes[0].rating}★`}
                {" · "}{category.quotes[0].date}
              </footer>
            </blockquote>
          )}

          {/* AI recommendation */}
          <p className="text-xs text-indigo-700 bg-indigo-50 rounded-lg p-2.5 leading-relaxed">
            <span className="font-semibold">AI: </span>
            {category.ai_recommendation}
          </p>
        </div>

        {/* Score pill (right) */}
        <div className={cn("shrink-0 flex h-10 w-10 flex-col items-center justify-center rounded-xl text-white font-bold text-sm", scoreColor)}>
          {category.score}
        </div>
      </div>

      {/* Expanded: all quotes */}
      {expanded && category.quotes.length > 1 && (
        <div className="border-t border-slate-100 px-5 py-4 space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">All quotes</p>
          {category.quotes.map((q, i) => (
            <div key={i} className="text-xs text-slate-600 bg-slate-50 rounded-lg p-3 space-y-1">
              <p className="italic leading-relaxed">&ldquo;{q.text}&rdquo;</p>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>
                  {SOURCE_LABELS[q.source]}
                  {q.rating != null && ` · ${q.rating}★`}
                  {" · "}{q.date}
                </span>
                {q.url && (
                  <a href={q.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-indigo-500 hover:underline">
                    Source <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions row */}
      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 bg-slate-50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onCreateActionItem(category)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Action Item
          </button>
          <button
            onClick={() => onLogDecision(category)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Log Decision
          </button>
        </div>

        {category.quotes.length > 1 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            {expanded ? (
              <><ChevronUp className="h-3.5 w-3.5" /> Hide quotes</>
            ) : (
              <><ChevronDown className="h-3.5 w-3.5" /> +{category.quotes.length - 1} more quotes</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

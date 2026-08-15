"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, ShieldAlert, ExternalLink, Plus, ArrowUpRight } from "lucide-react";
import { cn, priorityBadgeClass, getPriorityBand } from "@/lib/utils";
import type { ComplaintCategory, Quote, DataSource } from "@/types";

interface Props {
  category: ComplaintCategory;
  rank: number;
  onCreateActionItem: (category: ComplaintCategory) => void;
  onLogDecision: (category: ComplaintCategory) => void;
}

// ─── Source meta ──────────────────────────────────────────────────────────────

const SOURCE_META: Record<DataSource, { label: string; badge: string; cta: string }> = {
  play_store: {
    label: "Google Play",
    badge: "bg-green-100 text-green-700",
    cta:   "View on Play Store",
  },
  app_store: {
    label: "App Store",
    badge: "bg-blue-100 text-blue-700",
    cta:   "View on App Store",
  },
  reddit: {
    label: "Reddit",
    badge: "bg-orange-100 text-orange-700",
    cta:   "View thread on Reddit",
  },
  twitter: {
    label: "Twitter/X",
    badge: "bg-sky-100 text-sky-700",
    cta:   "View tweet",
  },
};

// ─── Single quote card ────────────────────────────────────────────────────────

function QuoteCard({ quote, isTop = false }: { quote: Quote; isTop?: boolean }) {
  const meta = SOURCE_META[quote.source] ?? SOURCE_META.play_store;

  const inner = (
    <div className={cn(
      "text-xs text-slate-600 rounded-lg p-3 space-y-2 border-l-2 transition-colors",
      isTop ? "bg-slate-50 border-slate-200" : "bg-white border-slate-100",
      quote.url && "hover:border-indigo-300 hover:bg-indigo-50/30 group"
    )}>
      <p className="italic leading-relaxed">&ldquo;{quote.text}&rdquo;</p>
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* Source + rating + date */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold", meta.badge)}>
            {meta.label}
          </span>
          {quote.rating != null && (
            <span className="text-[10px] text-amber-600 font-medium">{quote.rating}★</span>
          )}
          {quote.author && (
            <span className="text-[10px] text-slate-400">{quote.author}</span>
          )}
          <span className="text-[10px] text-slate-400">{quote.date}</span>
        </div>

        {/* Citation link */}
        {quote.url && (
          <span className="flex items-center gap-1 text-[10px] font-medium text-indigo-600 group-hover:text-indigo-800">
            {meta.cta} <ArrowUpRight className="h-3 w-3" />
          </span>
        )}
      </div>
    </div>
  );

  if (quote.url) {
    return (
      <a href={quote.url} target="_blank" rel="noopener noreferrer" className="block">
        {inner}
      </a>
    );
  }
  return inner;
}

// ─── Source breakdown chips (top of expanded section) ─────────────────────────

function SourceChips({ quotes }: { quotes: Quote[] }) {
  const counts: Partial<Record<DataSource, number>> = {};
  quotes.forEach((q) => { counts[q.source] = (counts[q.source] ?? 0) + 1; });

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-[10px] text-slate-400 font-medium">Sources:</span>
      {(Object.entries(counts) as [DataSource, number][]).map(([source, count]) => {
        const meta = SOURCE_META[source];
        return (
          <span key={source} className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", meta.badge)}>
            {meta.label} ({count})
          </span>
        );
      })}
    </div>
  );
}

// ─── Main card ────────────────────────────────────────────────────────────────

export default function ComplaintCategoryCard({
  category, rank, onCreateActionItem, onLogDecision,
}: Props) {
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

  const citedCount = category.quotes.filter((q) => q.url).length;

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
            <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", priorityBadgeClass(category.score))}>
              {band}
            </span>
            {category.regulatory_flag && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-700">
                <ShieldAlert className="h-2.5 w-2.5" /> Regulatory
              </span>
            )}
            {citedCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                <ExternalLink className="h-2.5 w-2.5" /> {citedCount} cited
              </span>
            )}
          </div>

          {/* Score bar */}
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

          {/* Top quote — clickable if URL exists */}
          {category.quotes[0] && (
            <div className="mb-3">
              <QuoteCard quote={category.quotes[0]} isTop />
            </div>
          )}

          {/* AI recommendation */}
          <p className="text-xs text-indigo-700 bg-indigo-50 rounded-lg p-2.5 leading-relaxed">
            <span className="font-semibold">AI: </span>
            {category.ai_recommendation}
          </p>
        </div>

        {/* Score pill */}
        <div className={cn("shrink-0 flex h-10 w-10 flex-col items-center justify-center rounded-xl text-white font-bold text-sm", scoreColor)}>
          {category.score}
        </div>
      </div>

      {/* Expanded: all quotes */}
      {expanded && (
        <div className="border-t border-slate-100 px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              All citations ({category.quotes.length})
            </p>
            <SourceChips quotes={category.quotes} />
          </div>
          {category.quotes.map((q, i) => (
            <QuoteCard key={i} quote={q} />
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
            <Plus className="h-3.5 w-3.5" /> Create Action Item
          </button>
          <button
            onClick={() => onLogDecision(category)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Log Decision
          </button>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          {expanded ? (
            <><ChevronUp className="h-3.5 w-3.5" /> Hide citations</>
          ) : (
            <><ChevronDown className="h-3.5 w-3.5" /> {category.quotes.length} citations</>
          )}
        </button>
      </div>
    </div>
  );
}

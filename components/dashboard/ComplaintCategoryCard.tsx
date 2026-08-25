"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, ShieldAlert, ExternalLink, Plus, ArrowUpRight, Info } from "lucide-react";
import { cn, priorityBadgeClass, getPriorityBand } from "@/lib/utils";
import { deriveScoreBreakdown } from "@/lib/scoring";
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
    badge: "bg-[#1a3a2e]/10 text-[#1a3a2e]",
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
  instagram: {
    label: "Instagram",
    badge: "bg-pink-100 text-pink-700",
    cta:   "View on Instagram",
  },
  youtube: {
    label: "YouTube",
    badge: "bg-red-100 text-red-700",
    cta:   "Watch on YouTube",
  },
  facebook: {
    label: "Facebook",
    badge: "bg-blue-100 text-blue-800",
    cta:   "View on Facebook",
  },
};

// ─── Single quote card ────────────────────────────────────────────────────────

function QuoteCard({ quote, isTop = false }: { quote: Quote; isTop?: boolean }) {
  const meta = SOURCE_META[quote.source] ?? SOURCE_META.play_store;

  const inner = (
    <div className={cn(
      "text-xs text-slate-600 rounded-lg p-3 space-y-2 border-l-2 transition-colors",
      isTop ? "bg-slate-50 border-slate-200" : "bg-white border-slate-100",
      quote.url && "hover:border-[#1a3a2e]/30 hover:bg-[#1a3a2e]/5/30 group"
    )}>
      <p className="italic leading-relaxed">&ldquo;{quote.text}&rdquo;</p>
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* Source + rating + date */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("rounded-md px-1.5 py-0.5 text-[11px] font-semibold", meta.badge)}>
            {meta.label}
          </span>
          {quote.rating != null && (
            <span className="text-[11px] text-amber-600 font-medium">{quote.rating}★</span>
          )}
          {quote.author && (
            <span className="text-[11px] text-slate-400">{quote.author}</span>
          )}
          <span className="text-[11px] text-slate-400">{quote.date}</span>
        </div>

        {/* Citation link */}
        {quote.url && (
          <span className="flex items-center gap-1 text-[11px] font-medium text-[#1a3a2e] group-hover:text-[#1a3a2e]">
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
      <span className="text-[11px] text-slate-400 font-medium">Sources:</span>
      {(Object.entries(counts) as [DataSource, number][]).map(([source, count]) => {
        const meta = SOURCE_META[source];
        return (
          <span key={source} className={cn("rounded-md px-2 py-0.5 text-[11px] font-semibold", meta.badge)}>
            {meta.label} ({count})
          </span>
        );
      })}
    </div>
  );
}

// ─── Score breakdown panel ────────────────────────────────────────────────────

function ScoreBreakdown({ score, avgSeverity, riskRelevance }: {
  score: number;
  avgSeverity: number;
  riskRelevance: boolean;
}) {
  const b = deriveScoreBreakdown(score, avgSeverity, riskRelevance);
  // Grow the bars from 0 the frame after the panel opens (§6 mount animation)
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const rows = [
    { label: "Frequency",  pts: b.frequency,  max: 40, tip: "How widespread — share of all reviews mentioning this issue" },
    { label: "Severity",   pts: b.severity,   max: 35, tip: "How badly users are affected (AI-computed sentiment intensity)" },
    { label: "Risk relevance", pts: b.riskRelevance, max: 25, tip: "Elevated risk dimension — e.g. fulfillment, compliance, safety, billing, or customer-trust risk" },
  ] as const;

  return (
    <div className="animate-panel mt-3 rounded-lg border border-slate-100 bg-slate-50 p-3 space-y-2.5">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Why this score?</p>
      {rows.map(({ label, pts, max, tip }) => (
        <div key={label} className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-600" title={tip}>{label}</span>
            <span className="text-[11px] font-bold text-slate-700 tabular-nums">
              {pts}<span className="font-normal text-slate-400">/{max}</span>
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[#1a3a2e] transition-[width] duration-700 ease-out"
              style={{ width: grown ? `${(pts / max) * 100}%` : "0%" }}
            />
          </div>
        </div>
      ))}
      <div className="flex justify-between border-t border-slate-200 pt-2 mt-1">
        <span className="text-[11px] font-semibold text-slate-500">Total</span>
        <span className="text-[11px] font-bold text-slate-800 tabular-nums">
          {score}<span className="font-normal text-slate-400">/100</span>
        </span>
      </div>
    </div>
  );
}

// ─── Main card ────────────────────────────────────────────────────────────────

export default function ComplaintCategoryCard({
  category, rank, onCreateActionItem, onLogDecision,
}: Props) {
  const [expanded, setExpanded]     = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [grown, setGrown] = useState(false);
  const band = getPriorityBand(category.score);

  // §6 — fill the score bar from 0 the frame after mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const scoreColor = {
    critical: "bg-red-600",
    high:     "bg-orange-500",
    medium:   "bg-yellow-400",
    low:      "bg-[#1a3a2e]",
  }[band];

  // Urgency is signalled by border weight + colour, not a left stripe or a shadow
  const cardBorder = {
    critical: "border-red-200",
    high:     "border-orange-200",
    medium:   "border-slate-200",
    low:      "border-slate-200",
  }[band];

  const citedCount = category.quotes.filter((q) => q.url).length;

  return (
    <div className={cn("rounded-xl border bg-white overflow-hidden", cardBorder)}>
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
            <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", priorityBadgeClass(category.score))}>
              {band}
            </span>
            {category.risk_relevance && (
              <span className="inline-flex items-center gap-1 rounded-md bg-violet-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-violet-700" title={category.risk_dimensions?.join(", ") || "Elevated risk relevance"}>
                <ShieldAlert className="h-2.5 w-2.5" />
                {category.risk_dimensions?.[0] ?? "Risk relevance"}
              </span>
            )}
            {citedCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                <ExternalLink className="h-2.5 w-2.5" /> {citedCount} cited
              </span>
            )}
          </div>

          {/* Score bar */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="flex-1 h-1.5 rounded-full bg-slate-100">
                <div
                  className={cn("h-full rounded-full transition-[width] duration-700 ease-out", scoreColor)}
                  style={{ width: grown ? `${category.score}%` : "0%" }}
                />
              </div>
              <span className="text-sm font-bold text-slate-700 tabular-nums w-8 text-right">
                {category.score}
              </span>
            </div>
            <span className="text-xs text-slate-400">
              {category.complaint_count.toLocaleString()} complaints
            </span>
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-[#1a3a2e] transition-colors shrink-0"
              title="Why this score?"
            >
              <Info className="h-3 w-3" />
              Why?
            </button>
          </div>

          {/* Score breakdown panel */}
          {showBreakdown && (
            <ScoreBreakdown
              score={category.score}
              avgSeverity={category.avg_severity}
              riskRelevance={category.risk_relevance}
            />
          )}

          {/* Top quote — clickable if URL exists */}
          {category.quotes[0] && (
            <div className="mb-3">
              <QuoteCard quote={category.quotes[0]} isTop />
            </div>
          )}

          {/* AI recommendation */}
          <p className="text-xs text-[#1a3a2e] bg-[#1a3a2e]/5 rounded-lg p-2.5 leading-relaxed">
            <span className="font-semibold">AI: </span>
            {category.ai_recommendation}
          </p>
        </div>
      </div>

      {/* Expanded: all quotes */}
      {expanded && (
        <div className="animate-panel border-t border-slate-100 px-5 py-4 space-y-3">
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
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-start gap-0.5">
            <button
              onClick={() => onCreateActionItem(category)}
              className="flex items-center gap-1.5 rounded-lg bg-[#1a3a2e] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#243f35] transition-colors"
            >
              <Plus className="h-3.5 w-3.5" /> Create Action Item
            </button>
            <span className="text-[11px] text-slate-400 pl-1">Assign work → Workflows</span>
          </div>
          <div className="flex flex-col items-start gap-0.5">
            <button
              onClick={() => onLogDecision(category)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Log Decision
            </button>
            <span className="text-[11px] text-slate-400 pl-1">Record triage → Audit Trail</span>
          </div>
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

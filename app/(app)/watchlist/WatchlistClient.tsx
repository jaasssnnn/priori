"use client";

import { useState } from "react";
import Link from "next/link";
import {
  TrendingUp, TrendingDown, Minus, Bell, Plus, Loader2,
  BookmarkX, ArrowRight, BarChart2,
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import type { WatchlistEntry } from "@/types";
import { cn, timeAgo } from "@/lib/utils";

// ─── Health score badge ───────────────────────────────────────────────────────

function HealthBadge({ score }: { score: number }) {
  const color =
    score >= 70 ? "bg-green-100 text-green-700" :
    score >= 40 ? "bg-amber-100 text-amber-700" :
    "bg-red-100 text-red-700";
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold", color)}>
      {score}
    </span>
  );
}

// ─── Trend indicator ──────────────────────────────────────────────────────────

function TrendIcon({ trend }: { trend: WatchlistEntry["trend"] }) {
  if (trend === "improving")  return <TrendingUp  className="h-4 w-4 text-green-500" />;
  if (trend === "worsening")  return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-slate-400" />;
}

// ─── Company card ─────────────────────────────────────────────────────────────

function WatchlistCard({ entry, onRemove }: { entry: WatchlistEntry; onRemove: () => void }) {
  const { company, latest_snapshot, previous_snapshot, trend, unread_alerts } = entry;
  const topCategory = latest_snapshot.categories[0];
  const delta = previous_snapshot
    ? latest_snapshot.health_score - previous_snapshot.health_score
    : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-indigo-200 hover:shadow-sm transition-all group">
      {/* Card header */}
      <div className="flex items-center gap-3 p-5 pb-3">
        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-100">
          {company.icon_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={company.icon_url} alt={company.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-base font-bold text-slate-400 bg-slate-50">
              {company.name[0]}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 truncate">{company.name}</h3>
            {unread_alerts > 0 && (
              <span className="shrink-0 flex items-center gap-1 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                <Bell className="h-2.5 w-2.5" /> {unread_alerts}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{company.developer}</p>
        </div>
        <button
          onClick={(e) => { e.preventDefault(); onRemove(); }}
          className="opacity-0 group-hover:opacity-100 transition-opacity flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-red-500"
          title="Remove from watchlist"
        >
          <BookmarkX className="h-4 w-4" />
        </button>
      </div>

      {/* Health score row */}
      <div className="flex items-center gap-3 px-5 pb-3">
        <HealthBadge score={latest_snapshot.health_score} />
        <TrendIcon trend={trend} />
        {delta != null && (
          <span className={cn("text-xs font-medium",
            delta > 0 ? "text-green-600" : delta < 0 ? "text-red-500" : "text-slate-400"
          )}>
            {delta > 0 ? `+${delta}` : delta} vs last week
          </span>
        )}
        <span className="ml-auto text-[10px] text-slate-400">
          {timeAgo(latest_snapshot.created_at)}
        </span>
      </div>

      {/* Top complaint */}
      {topCategory && (
        <div className="mx-5 mb-4 rounded-xl bg-slate-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">
            Top Complaint
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-700">{topCategory.name}</span>
            <span className={cn(
              "text-xs font-bold",
              topCategory.score >= 70 ? "text-red-600" :
              topCategory.score >= 40 ? "text-orange-500" :
              "text-green-600"
            )}>
              {topCategory.score}/100
            </span>
          </div>
          <div className="mt-1.5 h-1 rounded-full bg-slate-200">
            <div
              className={cn("h-full rounded-full", topCategory.score >= 70 ? "bg-red-500" : topCategory.score >= 40 ? "bg-orange-400" : "bg-green-500")}
              style={{ width: `${topCategory.score}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="border-t border-slate-100 grid grid-cols-3 divide-x divide-slate-100">
        <div className="px-4 py-3 text-center">
          <p className="text-base font-bold text-slate-800">{latest_snapshot.avg_rating.toFixed(1)}★</p>
          <p className="text-[10px] text-slate-400">Rating</p>
        </div>
        <div className="px-4 py-3 text-center">
          <p className="text-base font-bold text-slate-800">{(latest_snapshot.review_count / 1000).toFixed(0)}k</p>
          <p className="text-[10px] text-slate-400">Reviews</p>
        </div>
        <div className="px-4 py-3 text-center">
          <p className="text-base font-bold text-slate-800">{latest_snapshot.categories.length}</p>
          <p className="text-[10px] text-slate-400">Categories</p>
        </div>
      </div>

      {/* CTA */}
      <Link
        href={`/dashboard/${company.id}`}
        className="flex items-center justify-center gap-2 border-t border-slate-100 py-3 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
      >
        View Dashboard <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function WatchlistClient() {
  const { watchlist, watchlistLoading, removeFromWatchlist, addToWatchlist } = useApp();
  const [removing, setRemoving] = useState<string | null>(null);

  async function handleRemove(companyId: string) {
    setRemoving(companyId);
    try {
      await removeFromWatchlist(companyId);
    } finally {
      setRemoving(null);
    }
  }

  if (watchlistLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Watchlist</h1>
          <p className="mt-1 text-sm text-slate-500">
            Saved companies with weekly complaint trend tracking and spike alerts.
          </p>
        </div>
        <Link
          href="/search"
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Company
        </Link>
      </div>

      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
          <BarChart2 className="h-12 w-12 text-slate-300 mb-4" />
          <p className="text-base font-semibold text-slate-600">Your watchlist is empty</p>
          <p className="text-sm text-slate-400 mt-1 max-w-xs">
            Add companies to track complaint trends week over week and get spike alerts.
          </p>
          <Link
            href="/search"
            className="mt-5 flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" /> Search & Add
          </Link>
        </div>
      ) : (
        <>
          {/* Summary bar */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Companies tracked",   value: watchlist.length },
              { label: "Unread alerts",        value: watchlist.reduce((s, e) => s + e.unread_alerts, 0) },
              { label: "Worsening trend",      value: watchlist.filter((e) => e.trend === "worsening").length },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
              </div>
            ))}
          </div>

          {/* Cards grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {watchlist.map((entry) => (
              <div
                key={entry.company.id}
                className={cn("transition-opacity", removing === entry.company.id && "opacity-50 pointer-events-none")}
              >
                <WatchlistCard
                  entry={entry}
                  onRemove={() => handleRemove(entry.company.id)}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  score: number;
  previousScore?: number;
  reviewCount: number;
  avgRating: number;
  lastUpdated: string;
}

export default function HealthScoreCard({ score, previousScore, reviewCount, avgRating, lastUpdated }: Props) {
  const delta = previousScore != null ? score - previousScore : null;

  const scoreColor =
    score >= 70 ? "text-green-600" :
    score >= 40 ? "text-amber-600" :
    "text-red-600";

  const ringColor =
    score >= 70 ? "stroke-green-500" :
    score >= 40 ? "stroke-amber-500" :
    "stroke-red-500";

  // SVG circle progress
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference * (1 - score / 100);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Health Score</p>
        <p className="mt-0.5 text-xs text-slate-400">
          Based on {reviewCount.toLocaleString()} reviews · Updated {new Date(lastUpdated).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </p>
      </div>

      <div className="flex items-center gap-6">
        {/* Ring */}
        <div className="relative shrink-0">
          <svg width="128" height="128" className="-rotate-90">
            <circle cx="64" cy="64" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="10" />
            <circle
              cx="64" cy="64" r={radius}
              fill="none"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              className={cn("transition-all duration-700", ringColor)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-3xl font-extrabold leading-none", scoreColor)}>{score}</span>
            <span className="text-xs text-slate-400 mt-0.5">/ 100</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-3 flex-1">
          {/* Trend */}
          {delta != null && (
            <div className={cn(
              "flex items-center gap-1.5 text-sm font-medium",
              delta > 0 ? "text-green-600" : delta < 0 ? "text-red-500" : "text-slate-500"
            )}>
              {delta > 0 ? <TrendingUp className="h-4 w-4" /> :
               delta < 0 ? <TrendingDown className="h-4 w-4" /> :
               <Minus className="h-4 w-4" />}
              {delta > 0 ? `+${delta}` : delta} vs last week
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-slate-50 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Avg Rating</p>
              <p className="text-lg font-bold text-slate-800 mt-0.5">{avgRating.toFixed(1)} <span className="text-sm text-amber-400">★</span></p>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Reviews</p>
              <p className="text-lg font-bold text-slate-800 mt-0.5">{(reviewCount / 1000).toFixed(1)}k</p>
            </div>
          </div>
        </div>
      </div>

      {/* Score interpretation */}
      <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-100 pt-3">
        {score >= 70
          ? "Overall user sentiment is healthy. Monitor for emerging complaint trends."
          : score >= 40
          ? "Moderate complaint activity detected. Some categories need attention."
          : "High complaint volumes across multiple categories. Immediate action recommended."}
      </p>
    </div>
  );
}

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

// Arc geometry
// cx=110, cy=94, r=78, strokeWidth=22
// Left end  → (32, 94)   Right end  → (188, 94)
// Caps extend ±11px from path, so:
//   bottom extent: 94+11=105  → viewBox height 110 gives 5px spare ✓
//   top    extent: 94-78-11=5 → within viewBox top=0 ✓
//   left   extent: 32-11=21   → within viewBox left=0 ✓
//   right  extent: 188+11=199 → within viewBox right=220 ✓
const CX = 110, CY = 94, R = 78, SW = 22;

function buildPaths(score: number) {
  const pct = Math.max(0.5, Math.min(99.5, score));

  // sweep-flag=1 → clockwise in SVG → arc goes UP through the top (the dome shape)
  const track = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;

  // Fill: pct% of 180° clockwise from the left endpoint
  const rad = Math.PI * (1 - pct / 100);
  const ex  = (CX + R * Math.cos(rad)).toFixed(2);
  const ey  = (CY - R * Math.sin(rad)).toFixed(2);
  const fill = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${ex} ${ey}`;

  return { track, fill };
}

// Score sits at the vertical midpoint of the arc opening (between peak and base)
// Arc peak y=16, flat base y=94 → midpoint y=55 → 55/110 = 50%
// "/100" sits right at the flat base: y=94 → 94/110 = 85.5%
const SCORE_TOP_PCT  = "63%";
const LABEL_TOP_PCT  = "85.5%";

export default function HealthScoreCard({ score, previousScore, reviewCount, avgRating }: Props) {
  const delta = previousScore != null ? score - previousScore : null;
  const { track, fill } = buildPaths(score);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col gap-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Observed public-feedback risk</p>

      {/* Gauge */}
      <div className="relative">
        <svg viewBox="0 0 220 110" className="w-full" aria-hidden="true">
          {/* Track — light gray */}
          <path d={track} fill="none" stroke="#e5e7eb" strokeWidth={SW} strokeLinecap="round" />
          {/* Fill — single dark green */}
          <path d={fill}  fill="none" stroke="#1a3a2e" strokeWidth={SW} strokeLinecap="round" />
        </svg>

        {/* Score — vertically centred in the arc opening */}
        <div
          className="absolute left-0 right-0 text-center"
          style={{ top: SCORE_TOP_PCT, transform: "translateY(-50%)" }}
        >
          <p className="text-5xl font-bold text-slate-900 leading-none tracking-tight">
            {score}<span className="text-xl font-normal text-slate-400">%</span>
          </p>
        </div>

        {/* "/ 100" — pinned to the flat base of the arc */}
        <div
          className="absolute left-0 right-0 text-center"
          style={{ top: LABEL_TOP_PCT, transform: "translateY(-50%)" }}
        >
          <p className="text-[11px] text-slate-400">/ 100</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 border-t border-slate-100 pt-4 divide-x divide-slate-100">
        <div className="flex flex-col items-center gap-0.5 px-2">
          <span className={cn(
            "flex items-center gap-0.5 text-sm font-semibold",
            delta == null ? "text-slate-400"
              : delta > 0  ? "text-[#1a3a2e]"
              : delta < 0  ? "text-red-500"
              : "text-slate-400"
          )}>
            {delta == null ? <Minus className="h-3.5 w-3.5" />
              : delta > 0  ? <TrendingUp className="h-3.5 w-3.5" />
              : <TrendingDown className="h-3.5 w-3.5" />}
            {delta != null ? (delta > 0 ? `+${delta}` : delta) : "—"}
          </span>
          <span className="text-[10px] text-slate-400">vs last wk</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 px-2">
          <span className="text-sm font-semibold text-slate-800">
            {avgRating.toFixed(1)}<span className="text-amber-400"> ★</span>
          </span>
          <span className="text-[10px] text-slate-400">avg rating</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 px-2">
          <span className="text-sm font-semibold text-slate-800">
            {(reviewCount / 1000).toFixed(1)}k
          </span>
          <span className="text-[10px] text-slate-400">reviews</span>
        </div>
      </div>
    </div>
  );
}

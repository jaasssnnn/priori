"use client";

import * as React from "react";
import { motion } from "framer-motion";

interface Props {
  distribution: Record<"1" | "2" | "3" | "4" | "5", number>;
  avgRating: number;
}

// Lightest → darkest as rating goes 1★ → 5★
const SHADES: Record<string, string> = {
  "1": "#b4ddd0",
  "2": "#7abfa0",
  "3": "#4a8c6e",
  "4": "#2d5a47",
  "5": "#1a3a2e",
};

const chartVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const barVariants = {
  hidden:   { scaleY: 0, opacity: 0, transformOrigin: "bottom" },
  visible:  {
    scaleY: 1,
    opacity: 1,
    transformOrigin: "bottom",
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
  },
};

export default function RatingDistributionChart({ distribution, avgRating }: Props) {
  const data = (["1", "2", "3", "4", "5"] as const).map((star) => ({
    star,
    count: distribution[star],
    color: SHADES[star],
  }));

  const total    = data.reduce((s, d) => s + d.count, 0);
  const maxValue = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Rating Distribution
        </p>
        <div className="flex items-center gap-1">
          <span className="text-lg font-extrabold text-slate-800">
            {avgRating.toFixed(1)}
          </span>
          <span className="text-amber-400 text-lg">★</span>
          <span className="text-xs text-slate-400">avg</span>
        </div>
      </div>

      {/* Bars */}
      <motion.div
        className="flex h-36 items-end justify-between gap-2"
        variants={chartVariants}
        initial="hidden"
        animate="visible"
      >
        {data.map((item) => {
          const heightPct = (item.count / maxValue) * 100;
          const pct       = total > 0 ? Math.round((item.count / total) * 100) : 0;

          return (
            <div
              key={item.star}
              className="group flex h-full w-full flex-col items-center justify-end gap-2"
            >
              {/* Tooltip on hover */}
              <div className="relative w-full flex justify-center">
                <span className="absolute -top-6 hidden group-hover:block text-[10px] font-semibold text-slate-600 whitespace-nowrap bg-white border border-slate-100 rounded px-1.5 py-0.5 shadow-sm">
                  {item.count.toLocaleString()} ({pct}%)
                </span>
              </div>

              <motion.div
                className="w-full rounded-t-md"
                style={{
                  height:          `${heightPct}%`,
                  background:      item.color,
                  transformOrigin: "bottom",
                }}
                variants={barVariants}
              />
              <span className="text-[11px] text-slate-400">{item.star}★</span>
            </div>
          );
        })}
      </motion.div>

      {/* Total */}
      <div className="mt-4 border-t border-slate-100 pt-3 flex justify-between">
        <span className="text-xs font-semibold text-slate-500">Total reviews</span>
        <span className="text-sm font-bold text-slate-800">{total.toLocaleString()}</span>
      </div>
    </div>
  );
}

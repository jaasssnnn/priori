"use client";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine,
} from "recharts";
import type { SentimentTrendPoint } from "@/types";

interface Props {
  data: SentimentTrendPoint[];
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export default function SentimentTrendChart({ data }: Props) {
  const chartData = data.map((p) => ({
    week: fmt(p.week),
    score: Math.round(p.score * 100),
    reviews: p.review_count,
  }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Negative Sentiment Trend (12 weeks)
        </p>
        <div className="flex items-center gap-3 text-[10px] text-slate-400">
          <span className="flex items-center gap-1"><span className="h-2 w-4 rounded bg-red-400 inline-block" /> High</span>
          <span className="flex items-center gap-1"><span className="h-2 w-4 rounded bg-amber-400 inline-block" /> Medium</span>
          <span className="flex items-center gap-1"><span className="h-2 w-4 rounded bg-green-400 inline-block" /> Low</span>
        </div>
      </div>

      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              formatter={(v) => [`${Number(v ?? 0)}% negative`, "Sentiment"]}
              labelFormatter={(l) => `Week of ${l}`}
            />
            <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="4 2" strokeOpacity={0.5} />
            <ReferenceLine y={40} stroke="#f97316" strokeDasharray="4 2" strokeOpacity={0.4} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={{ fill: "#6366f1", r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[10px] text-slate-400 mt-2">
        Higher = more negative sentiment. Reference lines at 40% (medium risk) and 60% (high risk).
      </p>
    </div>
  );
}

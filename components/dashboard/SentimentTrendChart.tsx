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
        {chartData.length > 0 && (
          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="h-px w-4 inline-block border-t-2 border-dashed border-slate-400" /> High risk
            </span>
            <span className="flex items-center gap-1">
              <span className="h-px w-4 inline-block border-t-2 border-dashed border-slate-300" /> Medium risk
            </span>
          </div>
        )}
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-52 flex-col items-center justify-center gap-2 rounded-xl bg-slate-50">
          <p className="text-sm font-medium text-slate-400">No trend data yet</p>
          <p className="text-xs text-slate-300 text-center max-w-xs">
            Trend builds over multiple analyses. Re-analyze this company weekly to see the 12-week chart.
          </p>
        </div>
      ) : (
        <>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f2" />
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
                <ReferenceLine y={60} stroke="#1a3a2e" strokeDasharray="4 2" strokeOpacity={0.4} />
                <ReferenceLine y={40} stroke="#4a8c6e" strokeDasharray="4 2" strokeOpacity={0.35} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#1a3a2e"
                  strokeWidth={2.5}
                  dot={{ fill: "#1a3a2e", r: 3 }}
                  activeDot={{ r: 5, fill: "#1a3a2e" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            Higher = more negative sentiment. Reference lines at 40% (medium risk) and 60% (high risk).
          </p>
        </>
      )}
    </div>
  );
}

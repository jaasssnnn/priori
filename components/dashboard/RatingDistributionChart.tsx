"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Props {
  distribution: Record<"1" | "2" | "3" | "4" | "5", number>;
  avgRating: number;
}

const COLORS: Record<string, string> = {
  "1": "#ef4444",
  "2": "#f97316",
  "3": "#eab308",
  "4": "#84cc16",
  "5": "#22c55e",
};

export default function RatingDistributionChart({ distribution, avgRating }: Props) {
  const data = (["5", "4", "3", "2", "1"] as const).map((star) => ({
    star: `${star}★`,
    count: distribution[star],
    fill: COLORS[star],
  }));

  const total = Object.values(distribution).reduce((s, v) => s + v, 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Rating Distribution</p>
        <div className="flex items-center gap-1">
          <span className="text-lg font-extrabold text-slate-800">{avgRating.toFixed(1)}</span>
          <span className="text-amber-400 text-lg">★</span>
          <span className="text-xs text-slate-400">avg</span>
        </div>
      </div>

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="star" width={28} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "#f8fafc" }}
              formatter={(v) => { const n = Number(v ?? 0); return [`${n.toLocaleString()} (${Math.round((n / total) * 100)}%)`, ""]; }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={18}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

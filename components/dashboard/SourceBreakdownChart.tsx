"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { DataSource } from "@/types";

interface Props {
  breakdown: Record<DataSource, number>;
}

const COLORS: Record<DataSource, string> = {
  play_store: "#6366f1",
  app_store:  "#8b5cf6",
  reddit:     "#f97316",
  twitter:    "#06b6d4",
};

const LABELS: Record<DataSource, string> = {
  play_store: "Play Store",
  app_store:  "App Store",
  reddit:     "Reddit",
  twitter:    "Twitter/X",
};

export default function SourceBreakdownChart({ breakdown }: Props) {
  const data = (Object.keys(breakdown) as DataSource[]).map((key) => ({
    name: LABELS[key],
    value: breakdown[key],
    color: COLORS[key],
  }));

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-4">Source Breakdown</p>

      <div className="flex items-center gap-4">
        <div className="h-44 w-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={72}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => {
                  const v = Number(value ?? 0);
                  return [`${v.toLocaleString()} (${Math.round((v / total) * 100)}%)`, ""];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-2.5 flex-1">
          {data.map((d) => (
            <div key={d.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                <span className="text-xs text-slate-600">{d.name}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-slate-800">{d.value.toLocaleString()}</span>
                <span className="ml-1.5 text-[10px] text-slate-400">
                  {Math.round((d.value / total) * 100)}%
                </span>
              </div>
            </div>
          ))}
          <div className="border-t border-slate-100 pt-2 mt-1 flex justify-between">
            <span className="text-xs font-semibold text-slate-500">Total</span>
            <span className="text-sm font-bold text-slate-800">{total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

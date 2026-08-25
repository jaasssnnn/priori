"use client";

import { Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DataSource } from "@/types";

interface Props {
  breakdown: Record<DataSource, number>;
}

const COLORS: Record<DataSource, string> = {
  play_store: "#1a3a2e",
  app_store:  "#2d5a47",
  reddit:     "#4a8c6e",
  twitter:    "#7abfa0",
  instagram:  "#e1306c",
  youtube:    "#ff0000",
  facebook:   "#1877f2",
};

const LABELS: Record<DataSource, string> = {
  play_store: "Play Store",
  app_store:  "App Store",
  reddit:     "Reddit",
  twitter:    "Twitter/X",
  instagram:  "Instagram",
  youtube:    "YouTube",
  facebook:   "Facebook",
};

const chartConfig = {
  value:      { label: "Reviews" },
  play_store: { label: "Play Store", color: "#1a3a2e" },
  app_store:  { label: "App Store",  color: "#2d5a47" },
  reddit:     { label: "Reddit",     color: "#4a8c6e" },
  twitter:    { label: "Twitter/X",  color: "#7abfa0" },
  instagram:  { label: "Instagram",  color: "#e1306c" },
  youtube:    { label: "YouTube",    color: "#ff0000" },
  facebook:   { label: "Facebook",   color: "#1877f2" },
} satisfies ChartConfig;

export default function SourceBreakdownChart({ breakdown }: Props) {
  const data = (Object.keys(breakdown) as DataSource[])
    .filter((k) => breakdown[k] > 0)
    .map((key) => ({
      source: key,
      name:   LABELS[key],
      value:  breakdown[key],
      fill:   `var(--color-${key})`,
    }));

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-4">
        Source Breakdown
      </p>

      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[220px] [&_.recharts-pie-label-text]:fill-slate-600 [&_.recharts-pie-label-text]:text-[11px]"
      >
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <Pie data={data} dataKey="value" nameKey="name" label paddingAngle={2} />
        </PieChart>
      </ChartContainer>

      <div className="flex flex-col gap-2 mt-4">
        {data.map((d) => (
          <div key={d.source} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ background: COLORS[d.source as DataSource] }}
              />
              <span className="text-xs text-slate-600">{d.name}</span>
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-800">
                {d.value.toLocaleString()}
              </span>
              <span className="ml-1.5 text-[11px] text-slate-400">
                {Math.round((d.value / total) * 100)}%
              </span>
            </div>
          </div>
        ))}
        <div className="border-t border-slate-100 pt-2 mt-1 flex justify-between">
          <span className="text-xs font-semibold text-slate-500">Total</span>
          <span className="text-sm font-bold text-slate-800">
            {total.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

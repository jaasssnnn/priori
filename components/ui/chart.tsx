"use client";

import * as React from "react";
import { Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    color?: string;
  };
};

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

export function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<typeof ResponsiveContainer>["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn("flex justify-center text-xs", className)}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <ResponsiveContainer>{children}</ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const entries = Object.entries(config).filter(([, v]) => v.color);
  if (!entries.length) return null;
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: entries
          .map(([key, value]) => `[data-chart=${id}] { --color-${key}: ${value.color}; }`)
          .join("\n"),
      }}
    />
  );
}

export const ChartTooltip = Tooltip;

export function ChartTooltipContent({
  active,
  payload,
  hideLabel = false,
  className,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload?: { fill?: string };
  }>;
  label?: string;
  hideLabel?: boolean;
  className?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className={cn(
        "rounded-lg border border-slate-200 bg-white px-3 py-2",
        className,
      )}
    >
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: entry.payload?.fill }}
          />
          {!hideLabel && (
            <span className="text-slate-600">{entry.name}</span>
          )}
          <span className="ml-1 font-semibold text-slate-800">
            {entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

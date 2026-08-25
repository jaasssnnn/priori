"use client";

import { useEffect, useRef, useState } from "react";
import DashboardClient from "@/app/(app)/dashboard/[companyId]/DashboardClient";
import { cn } from "@/lib/utils";
import { getCachedSnapshot, setCachedSnapshot } from "@/lib/localStore";
import type { Company, Snapshot } from "@/types";

interface Props {
  company: Company;
  previousSnapshot: Snapshot | null;
}

const LOG_STEPS = [
  { label: "Starting the analysis",          pct: 5  },
  { label: "Connecting to data sources",     pct: 12 },
  { label: "Reading Play Store reviews",     pct: 28 },
  { label: "Fetching App Store ratings",     pct: 38 },
  { label: "Searching Reddit threads",       pct: 55 },
  { label: "Scanning web mentions",          pct: 68 },
  { label: "Classifying complaints with AI", pct: 80 },
  { label: "Computing priority scores",      pct: 88 },
  { label: "Writing the summary",            pct: 94 },
  { label: "Finalizing the report",          pct: 99 },
];

// Non-linear easing: fast start, slows near 95%, caps there until API responds
function easedPercent(elapsedMs: number): number {
  const t = Math.min(elapsedMs / 70_000, 1);
  return Math.min(95, Math.round(100 * (1 - Math.pow(1 - t, 1.6))));
}

export default function AnalysisLoader({ company, previousSnapshot }: Props) {
  const [pct, setPct]           = useState(0);
  const [done, setDone]         = useState(false);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [analyzing, setAnalyzing]       = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const startRef                = useRef<number | null>(null);
  const apiDoneRef              = useRef(false);

  // Decide on mount: use the saved analysis (survives refresh) or run a fresh one
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const cached = getCachedSnapshot(company.id);
      if (cached) {
        setSnapshot(cached);
        setShowDashboard(true);
      } else {
        setAnalyzing(true);
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [company.id]);

  // Animate percentage — only while a fresh analysis is running
  useEffect(() => {
    if (!analyzing) return;
    startRef.current = Date.now();
    const id = setInterval(() => {
      if (apiDoneRef.current) return;
      setPct(easedPercent(Date.now() - (startRef.current ?? Date.now())));
    }, 400);
    return () => clearInterval(id);
  }, [analyzing]);

  // Fire the actual analysis request — only while analyzing
  useEffect(() => {
    if (!analyzing) return;
    const BASE = window.location.origin;
    fetch(`${BASE}/api/analyze`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ companyId: company.id, companyName: company.name }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Snapshot | null) => {
        apiDoneRef.current = true;
        if (data) setCachedSnapshot(company.id, data); // persist across refreshes
        setSnapshot(data);
        setPct(100);
        setDone(true);
      })
      .catch(() => {
        apiDoneRef.current = true;
        setPct(100);
        setDone(true);
      });
  }, [analyzing, company.id, company.name]);

  // Once done, short pause then unmount loader
  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => setShowDashboard(true), 900);
    return () => clearTimeout(id);
  }, [done]);

  if (showDashboard) {
    if (!snapshot) {
      return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-20 text-center px-6">
          <p className="text-sm font-semibold text-slate-700">Analysis unavailable</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Could not fetch reviews for {company.name} right now. Try again in a moment.
          </p>
          <a
            href={`/companies/${company.id}`}
            className="mt-5 rounded-xl bg-[#1a3a2e] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#243f35] transition-colors"
          >
            Retry analysis
          </a>
        </div>
      );
    }
    return (
      <DashboardClient
        company={company}
        snapshot={snapshot}
        previousSnapshot={previousSnapshot}
      />
    );
  }

  // Brief initial frame before the cache check decides — render nothing
  if (!analyzing) return null;

  // Which step is currently active
  const activeIdx = LOG_STEPS.findLastIndex((s) => pct >= s.pct);

  return (
    // Fixed overlay covering the main content area (sidebar is w-60 = 240px)
    <div
      className="fixed top-0 right-0 bottom-0 z-50 flex items-center justify-center bg-white"
      style={{ left: "240px" }}
    >
      <div className="w-full max-w-md px-6">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Analyzing</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{company.name}</h1>

        {/* Progress */}
        <div className="mt-6 flex items-center gap-4">
          <div className="h-1.5 flex-1 rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[#1a3a2e] transition-[width] duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="w-10 text-right text-sm font-bold tabular-nums text-slate-900">{pct}%</span>
        </div>

        {/* Steps */}
        <ul className="mt-8 space-y-3">
          {LOG_STEPS.map((step, i) => {
            const isActive = i === activeIdx;
            const isPast   = i < activeIdx;
            return (
              <li key={step.label} className="flex items-center gap-3">
                <span
                  className={cn(
                    "h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-300",
                    isActive ? "bg-[#1a3a2e] ring-4 ring-[#1a3a2e]/15"
                      : isPast ? "bg-[#1a3a2e]"
                      : "bg-slate-200"
                  )}
                />
                <span
                  className={cn(
                    "text-sm transition-colors duration-300",
                    isActive ? "font-medium text-slate-900"
                      : isPast ? "text-slate-400"
                      : "text-slate-300"
                  )}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

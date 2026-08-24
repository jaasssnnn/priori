"use client";

import { useEffect, useRef, useState } from "react";
import DashboardClient from "@/app/(app)/dashboard/[companyId]/DashboardClient";
import type { Company, Snapshot } from "@/types";

interface Props {
  company: Company;
  previousSnapshot: Snapshot | null;
}

const LOG_STEPS = [
  { label: "// INITIALIZING ANALYSIS ENGINE...", pct: 5  },
  { label: "// CONNECTING TO DATA SOURCES...",   pct: 12 },
  { label: "// SCRAPING PLAY STORE REVIEWS...",  pct: 28 },
  { label: "// FETCHING APP STORE RATINGS...",   pct: 38 },
  { label: "// SEARCHING REDDIT THREADS...",     pct: 55 },
  { label: "// MINING WEB MENTIONS VIA EXA...",  pct: 68 },
  { label: "// RUNNING AI CLASSIFICATION...",    pct: 80 },
  { label: "// COMPUTING PRIORITY SCORES...",    pct: 88 },
  { label: "// GENERATING AI SUMMARY...",        pct: 94 },
  { label: "// FINALIZING REPORT...",            pct: 99 },
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
  const startRef                = useRef<number>(Date.now());
  const apiDoneRef              = useRef(false);

  // Animate percentage
  useEffect(() => {
    const id = setInterval(() => {
      if (apiDoneRef.current) return;
      setPct(easedPercent(Date.now() - startRef.current));
    }, 400);
    return () => clearInterval(id);
  }, []);

  // Fire the actual analysis request
  useEffect(() => {
    const BASE = window.location.origin;
    fetch(`${BASE}/api/analyze`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ companyId: company.id, companyName: company.name }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Snapshot | null) => {
        apiDoneRef.current = true;
        setSnapshot(data);
        setPct(100);
        setDone(true);
      })
      .catch(() => {
        apiDoneRef.current = true;
        setPct(100);
        setDone(true);
      });
  }, [company.id, company.name]);

  // Once done, short pause then unmount loader
  const [showDashboard, setShowDashboard] = useState(false);
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

  // Which log line is currently active
  const activeIdx = LOG_STEPS.findLastIndex((s) => pct >= s.pct);

  return (
    // Fixed overlay covering main content area (sidebar is w-60 = 240px)
    <div
      className="fixed top-0 right-0 bottom-0 z-50 flex flex-col"
      style={{ left: "240px", background: "#ffffff" }}
    >
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: terminal log ── */}
        <div className="flex w-[38%] flex-col justify-center gap-0 overflow-hidden px-10 py-12">
          {LOG_STEPS.map((step, i) => {
            const isActive = i === activeIdx;
            const isPast   = i < activeIdx;
            return (
              <div
                key={step.label}
                className="px-2 py-[3px] text-[13px] leading-relaxed tracking-widest transition-all duration-300"
                style={{
                  color:               isActive ? "#1a3a2e" : isPast ? "rgba(26,58,46,0.35)" : "rgba(26,58,46,0.18)",
                  background:          isActive ? "rgba(26,58,46,0.06)" : "transparent",
                  borderLeft:          isActive ? "2px solid #1a3a2e" : "2px solid transparent",
                  textDecoration:      isPast ? "line-through" : "none",
                  textDecorationColor: "rgba(26,58,46,0.25)",
                }}
              >
                {step.label}
              </div>
            );
          })}
        </div>

        {/* ── Right: percentage + hang tight side by side ── */}
        <div className="flex flex-1 items-center gap-10 px-12">

          {/* ( 47% ) / ( DONE ) */}
          <div
            className="shrink-0 text-[15px] tracking-widest"
            style={{ color: "#1a3a2e", whiteSpace: "nowrap" }}
          >
            {done ? "( DONE )" : `( ${pct}% )`}
          </div>

          {/* Vertical divider */}
          <div
            className="h-8 w-[1px] shrink-0"
            style={{ background: "rgba(26,58,46,0.15)" }}
          />

          {/* Two-line hang tight message */}
          <div
            className="text-[13px] leading-relaxed tracking-widest"
            style={{ color: "rgba(26,58,46,0.6)" }}
          >
            {"// HANG TIGHT, ANALYSIS IN PROGRESS."}
            <br />
            {"FETCHING REVIEWS ACROSS PLAY STORE, APP STORE, REDDIT + THE WEB."}
            <span
              className="ml-1 inline-block animate-pulse"
              style={{ color: "#1a3a2e" }}
            >
              ▋
            </span>
          </div>

        </div>

      </div>

      {/* Bottom: company name */}
      <div
        className="border-t px-10 py-4 text-[11px] tracking-[0.3em]"
        style={{
          borderColor: "rgba(26,58,46,0.1)",
          color:       "rgba(26,58,46,0.3)",
        }}
      >
        PRIORI — ANALYZING {company.name.toUpperCase()}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle2, Monitor, GitFork } from "lucide-react";
import { GITHUB_REPO_URL } from "@/lib/config";

const STORAGE_KEY = "priori_scraping_notice_v1";

export default function ScrapingOnboardingModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="animate-scrim fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
      <div className="animate-modal w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">About data sources</p>
            <p className="text-xs text-slate-400">What gets scraped depends on how you run Priori</p>
          </div>
          <button onClick={dismiss} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {/* Cloud tier */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#1a3a2e] shrink-0" />
              <p className="text-xs font-semibold text-slate-800">Works on Vercel (cloud)</p>
            </div>
            <ul className="space-y-1 pl-6">
              {["Google Play Store", "Apple App Store", "Twitter / X (with API key)"].map((s) => (
                <li key={s} className="text-xs text-slate-600 flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-slate-400 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {/* Local tier */}
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-amber-600 shrink-0" />
              <p className="text-xs font-semibold text-slate-800">Needs local setup (OpenCLI)</p>
            </div>
            <ul className="space-y-1 pl-6">
              {["Reddit", "Instagram", "YouTube", "Facebook"].map((s) => (
                <li key={s} className="text-xs text-slate-600 flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-amber-400 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-500 pt-0.5">
              Clone the repo, install OpenCLI, and run <code className="rounded bg-slate-200 px-1 py-0.5 text-[11px] font-mono">npm run dev</code> locally to unlock social scraping.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 gap-3">
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors"
          >
            <GitFork className="h-3.5 w-3.5" />
            View on GitHub
          </a>
          <button
            onClick={dismiss}
            className="rounded-xl bg-[#1a3a2e] px-5 py-2 text-xs font-semibold text-white hover:bg-[#243f35] transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

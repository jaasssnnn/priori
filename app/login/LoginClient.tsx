"use client";

import Link from "next/link";
import { CloudShader } from "@/components/ui/cloud-shader";
import GoogleButton from "./GoogleButton";

export default function LoginClient() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Airy sky — light blue/white so clouds pop */}
      <CloudShader
        className="absolute inset-0"
        skyTopColor="#3a7ab8"
        skyBottomColor="#c8e6f5"
        cloudColor="#ffffff"
        count={6}
      />

      {/* Navbar */}
      <nav className="relative z-20 flex w-full items-center justify-between px-6 py-5 md:px-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1a3a2e]">
            <img src="/logo.png" alt="" className="h-3.5 w-3.5 invert" />
          </div>
          <span className="text-base font-bold text-white drop-shadow">Priori</span>
        </Link>

        <GoogleButton className="hidden sm:flex" label="Get started" />
      </nav>

      {/* Hero */}
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 pt-10 text-center md:pt-16">
        <h1 className="text-5xl font-bold tracking-tight text-[#1a3a2e] md:text-6xl lg:text-7xl"
          style={{ textShadow: "0 2px 20px rgba(255,255,255,0.45)" }}>
          Every complaint.<br className="hidden md:block" /> Scored, ranked, resolved.
        </h1>

        <p className="mt-5 max-w-xl text-base text-white/80 drop-shadow md:text-lg">
          Priori scores every app, surfaces what&apos;s breaking, and helps your team
          close the loop on every complaint, powered by AI.
        </p>

        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row">
          <GoogleButton />
          <Link
            href="/overview"
            className="tap rounded-full border border-white/40 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            Try the demo, no sign-in
          </Link>
        </div>

      </div>

      {/* Dashboard mockup */}
      <div className="relative z-10 mx-auto mt-10 w-full max-w-6xl px-4 pb-4 md:mt-14 md:px-8">
        <div className="rounded-2xl border border-white/30 bg-white/15 p-2 shadow-2xl backdrop-blur-sm md:rounded-[2rem] md:p-3">
          <div className="overflow-hidden rounded-xl bg-[#0f172a] md:rounded-3xl">

            {/* Browser chrome */}
            <div className="flex items-center gap-2 bg-[#1e293b] px-4 py-2.5">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
                <div className="h-3 w-3 rounded-full bg-green-400/80" />
              </div>
              <div className="mx-4 flex-1">
                <div className="rounded-md bg-[#334155] px-3 py-1 text-center text-xs text-slate-400">
                  priori.app/companies/cred
                </div>
              </div>
            </div>

            {/* App UI */}
            <div className="flex h-64 md:h-[420px]">
              {/* Sidebar */}
              <div className="flex w-40 shrink-0 flex-col gap-0.5 bg-[#1a3a2e] p-3">
                <div className="mb-3 flex items-center gap-2 px-2 py-1">
                  <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-white/20">
                    <img src="/logo.png" alt="" className="h-3 w-3 invert opacity-80" />
                  </div>
                  <span className="text-xs font-bold text-white/90">Priori</span>
                </div>
                <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">Intelligence</p>
                {[
                  ["Overview", false],
                  ["Companies", true],
                  ["Workflows", false],
                  ["Audit Trail", false],
                  ["Watchlist", false],
                  ["Alerts", false],
                  ["Compare", false],
                ].map(([label, active]) => (
                  <div
                    key={label as string}
                    className={`rounded-lg px-2 py-1.5 text-xs ${
                      active ? "bg-white font-semibold text-[#1a3a2e]" : "text-white/50"
                    }`}
                  >
                    {label as string}
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="flex flex-1 flex-col overflow-hidden bg-[#f0f4f2]">
                {/* Topbar */}
                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-slate-200" />
                    <div>
                      <span className="text-sm font-semibold text-slate-800">CRED</span>
                      <span className="ml-2 rounded-full bg-[#1a3a2e]/10 px-2 py-0.5 text-[10px] font-medium text-[#1a3a2e]">Fintech</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-[#1a3a2e] px-3 py-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#7abfa0]" />
                    <span className="text-xs font-semibold text-white">Health 72 / 100</span>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-4 gap-3 border-b border-slate-200 bg-white p-4">
                  {[
                    ["486", "Reviews analyzed"],
                    ["3.8 ★", "Avg rating"],
                    ["8", "Complaint categories"],
                    ["3", "Risk-flagged"],
                  ].map(([val, label]) => (
                    <div key={label} className="rounded-xl border border-slate-100 bg-[#f0f4f2] p-3">
                      <div className="text-lg font-bold text-slate-800">{val}</div>
                      <div className="text-xs text-slate-400">{label}</div>
                    </div>
                  ))}
                </div>

                {/* Complaint categories */}
                <div className="flex-1 overflow-hidden p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Top complaint categories</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { name: "Payment Failures", score: 78, band: "Critical", dot: "bg-red-500", bar: "bg-red-500", badge: "bg-red-50 text-red-700" },
                      { name: "KYC Verification Issues", score: 54, band: "High", dot: "bg-orange-500", bar: "bg-orange-500", badge: "bg-orange-50 text-orange-700" },
                      { name: "App Performance & Crashes", score: 38, band: "Medium", dot: "bg-amber-400", bar: "bg-amber-400", badge: "bg-amber-50 text-amber-700" },
                      { name: "Reward Redemption Problems", score: 24, band: "Medium", dot: "bg-amber-400", bar: "bg-amber-400", badge: "bg-amber-50 text-amber-700" },
                    ].map((cat) => (
                      <div
                        key={cat.name}
                        className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-2.5"
                      >
                        <div className={`h-2 w-2 shrink-0 rounded-full ${cat.dot}`} />
                        <span className="flex-1 text-xs font-medium text-slate-700">{cat.name}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cat.badge}`}>{cat.band}</span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                            <div className={`h-full rounded-full ${cat.bar}`} style={{ width: `${cat.score}%` }} />
                          </div>
                          <span className="w-6 text-right text-xs font-semibold text-slate-500">{cat.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

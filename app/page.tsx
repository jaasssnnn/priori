import Link from "next/link";
import { Search, BarChart2, Kanban, ArrowRight, Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Priori — Know what users are saying. Know what to fix first.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a3a2e]">
              <img src="/logo.png" alt="" className="h-5 w-5 invert" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">Priori</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/search"
              className="rounded-lg bg-[#1a3a2e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#243f35] transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-24 pb-16 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#1a3a2e]/20 bg-[#1a3a2e]/5 px-3 py-1 text-xs font-medium text-[#1a3a2e] mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-[#1a3a2e] animate-pulse" />
          Now in beta
        </span>
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Turn scattered public feedback{" "}
          <span className="text-[#1a3a2e]">into evidence-backed priorities.</span>
        </h1>
        <p className="mt-6 text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Priori analyzes public feedback from any digital product — fintech, food delivery,
          e-commerce, travel, SaaS, and more. It identifies recurring issues, scores them by
          frequency, severity, and risk relevance, and connects insights to accountable work.
        </p>

        {/* Search bar */}
        <form action="/companies" method="get" className="mt-10 flex max-w-lg mx-auto gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              name="q"
              placeholder="Search any app — Swiggy, CRED, MakeMyTrip, Notion…"
              className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm shadow-sm focus:border-[#1a3a2e]/50 focus:outline-none focus:ring-2 focus:ring-[#1a3a2e]/20 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="h-12 shrink-0 rounded-xl bg-[#1a3a2e] px-5 text-sm font-semibold text-white hover:bg-[#243f35] transition-colors flex items-center gap-2"
          >
            Analyse <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* CTA links */}
        <div className="mt-5 flex items-center justify-center gap-4 text-sm">
          <Link href="/overview" className="font-medium text-[#1a3a2e] hover:underline">
            → Try demo (no sign-in needed)
          </Link>
          <span className="text-slate-300">|</span>
          <Link href="/login" className="text-slate-500 hover:text-slate-700 hover:underline">
            Continue with Google
          </Link>
        </div>
      </section>

      {/* Value prop cards */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 mb-4">
              <BarChart2 className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Track</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Monitor complaint trends across Play Store, App Store, Reddit, and Twitter for
              any digital product — fintech, food delivery, e-commerce, SaaS, and more.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1a3a2e]/10 mb-4">
              <Search className="h-6 w-6 text-[#1a3a2e]" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Prioritize</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              AI scores every complaint category by frequency, severity, and risk relevance —
              adapted to the industry — so you always know what to fix first.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1a3a2e]/10 mb-4">
              <Kanban className="h-6 w-6 text-[#1a3a2e]" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Act</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Create action items directly from complaint categories, assign owners, set
              deadlines, push to Slack, and log every decision in an audit trail.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 text-center text-sm text-slate-400">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="h-3.5 w-3.5 text-[#1a3a2e]/70" />
          <span className="font-semibold text-slate-600">Priori</span>
        </div>
        <p>B2B product intelligence platform · Built with Next.js, Supabase &amp; Groq</p>
      </footer>
    </div>
  );
}

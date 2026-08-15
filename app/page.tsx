import Link from "next/link";
import { Search, BarChart2, Kanban, Zap, ArrowRight } from "lucide-react";
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
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
              <Zap className="h-4 w-4 text-white" />
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
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-24 pb-16 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Now in beta
        </span>
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Know what users are saying.{" "}
          <span className="text-indigo-600">Know what to fix first.</span>
        </h1>
        <p className="mt-6 text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Priori pulls live reviews from Play Store, App Store, Reddit, and Twitter — categorises
          every complaint with AI, scores them by frequency, severity, and regulatory risk, and
          outputs a ranked fix list your team can act on today.
        </p>

        {/* Search bar */}
        <form action="/search" method="get" className="mt-10 flex max-w-lg mx-auto gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              name="q"
              placeholder="Search any company — CRED, PhonePe, Paytm…"
              className="h-12 w-full rounded-xl border border-slate-200 pl-11 pr-4 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="h-12 shrink-0 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            Analyse <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* CTA links */}
        <div className="mt-5 flex items-center justify-center gap-4 text-sm">
          <Link href="/search" className="font-medium text-indigo-600 hover:underline">
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
              Monitor complaint trends week over week across Play Store, App Store, Reddit, and
              Twitter — all in one place, automatically updated.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 mb-4">
              <Search className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Prioritize</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              AI scores every complaint category by frequency, sentiment severity, and regulatory
              risk — so you always know what to fix first.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-7">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 mb-4">
              <Kanban className="h-6 w-6 text-violet-600" />
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
          <Zap className="h-3.5 w-3.5 text-indigo-400" />
          <span className="font-semibold text-slate-600">Priori</span>
        </div>
        <p>B2B product intelligence platform · Built with Next.js, Supabase &amp; Groq</p>
      </footer>
    </div>
  );
}

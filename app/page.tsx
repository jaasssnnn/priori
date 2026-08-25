import Link from "next/link";
import { SearchIcon } from "@/components/icons";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Priori: Know what users are saying, and what to fix first.",
};

const steps = [
  {
    n: "01",
    title: "Track",
    body: "Monitor complaint trends across the Play Store, App Store, Reddit, and Twitter for any digital product you care about.",
  },
  {
    n: "02",
    title: "Prioritize",
    body: "AI scores every complaint category by frequency, severity, and risk relevance, adapted to each industry, so you always know what to fix first.",
  },
  {
    n: "03",
    title: "Act",
    body: "Create action items straight from a complaint category. Assign owners, set deadlines, push to Slack, and log every decision in an audit trail.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav — solid, one honest border */}
      <nav className="sticky top-0 z-10 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#1a3a2e]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="" className="h-5 w-5 invert" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">Priori</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="tap rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/search"
              className="tap rounded-lg bg-[#1a3a2e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#243f35] transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-6 pt-24 pb-16 text-center">
        <span className="mb-6 inline-flex items-center gap-1.5 rounded-md border border-[#1a3a2e]/20 bg-[#1a3a2e]/5 px-3 py-1 text-xs font-medium text-[#1a3a2e]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#1a3a2e]" />
          Now in beta
        </span>
        <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-slate-900">
          Turn scattered public feedback{" "}
          <span className="text-[#1a3a2e]">into evidence-backed priorities.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-slate-500">
          Priori analyzes public feedback from any digital product across fintech, food delivery,
          e-commerce, travel, and SaaS. It surfaces recurring issues, scores them by frequency,
          severity, and risk relevance, then connects every insight to accountable work.
        </p>

        {/* Search bar */}
        <form action="/companies" method="get" className="mx-auto mt-10 flex max-w-lg gap-2">
          <div className="relative flex-1">
            <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              name="q"
              placeholder="Try Swiggy, CRED, MakeMyTrip, or Notion"
              className="h-12 w-full rounded-lg border border-slate-200 pl-11 pr-4 text-sm focus:border-[#1a3a2e]/50 focus:outline-none focus:ring-2 focus:ring-[#1a3a2e]/20 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="tap h-12 shrink-0 rounded-lg bg-[#1a3a2e] px-6 text-sm font-semibold text-white hover:bg-[#243f35] transition-colors"
          >
            Analyse
          </button>
        </form>

        {/* CTA links */}
        <div className="mt-5 flex items-center justify-center gap-4 text-sm">
          <Link href="/overview" className="font-medium text-[#1a3a2e] hover:underline">
            Try the demo, no sign-in needed
          </Link>
          <span className="text-slate-300">·</span>
          <Link href="/login" className="text-slate-500 hover:text-slate-700 hover:underline">
            Continue with Google
          </Link>
        </div>
      </section>

      {/* How it works — editorial numbered list, not a card row */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-x-16 gap-y-10 md:grid-cols-[240px_1fr]">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              From noise to next steps
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Three moves, one loop. Priori takes you from scattered reviews to assigned,
              auditable work.
            </p>
          </div>

          <ol className="border-t border-slate-100">
            {steps.map((s) => (
              <li key={s.n} className="flex gap-6 border-b border-slate-100 py-6">
                <span className="text-3xl font-bold tabular-nums text-[#1a3a2e]/25">{s.n}</span>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <span className="text-sm font-semibold text-slate-600">Priori</span>
          <nav className="flex items-center gap-6 text-sm text-slate-400">
            <Link href="/privacy" className="hover:text-slate-600 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-slate-600 transition-colors">Terms</Link>
          </nav>
          <p className="text-sm text-slate-400">B2B product intelligence, built on Next.js and Supabase.</p>
        </div>
      </footer>
    </div>
  );
}

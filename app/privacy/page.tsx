import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-slate-200">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">Priori</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="mb-2 text-sm font-medium text-[#1a3a2e]">Placeholder — not legal advice</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-400">Last updated: placeholder draft</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-slate-600">
          <section>
            <h2 className="mb-2 text-base font-semibold text-slate-900">What we collect</h2>
            <p>
              This is a placeholder Privacy Policy for the Priori demo. Priori uses Google sign-in
              to identify your account and stores your watchlist, action items, and audit entries in
              a Supabase database tied to your user ID.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-base font-semibold text-slate-900">Public feedback data</h2>
            <p>
              The platform reads publicly available reviews and posts to generate analysis. That
              public content is processed to produce complaint categories and summaries.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-base font-semibold text-slate-900">Third parties</h2>
            <p>
              Analysis runs through Google Gemini. Optional integrations such as Slack and email
              are only used when you connect them.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-base font-semibold text-slate-900">Your choices</h2>
            <p>
              You can sign out at any time and request deletion of your stored data. Replace this
              document with a reviewed policy before any commercial launch.
            </p>
          </section>
        </div>

        <div className="mt-12">
          <Link href="/" className="text-sm font-medium text-[#1a3a2e] hover:underline">Back to home</Link>
        </div>
      </main>
    </div>
  );
}

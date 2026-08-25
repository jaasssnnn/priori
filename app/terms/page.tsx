import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-slate-200">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">Priori</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="mb-2 text-sm font-medium text-[#1a3a2e]">Placeholder — not legal advice</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Terms of Service</h1>
        <p className="mt-2 text-sm text-slate-400">Last updated: placeholder draft</p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-slate-600">
          <section>
            <h2 className="mb-2 text-base font-semibold text-slate-900">1. Acceptance</h2>
            <p>
              This is a placeholder Terms of Service for the Priori demo. By using the product you
              agree to these terms once a final version is published. Replace this document with
              reviewed legal copy before any commercial launch.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-base font-semibold text-slate-900">2. Use of the service</h2>
            <p>
              Priori analyzes publicly available product feedback and presents it for internal
              triage. You are responsible for how you act on the insights it surfaces.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-base font-semibold text-slate-900">3. Data sources</h2>
            <p>
              The platform reads public reviews and posts from third-party sources. It does not
              guarantee completeness or accuracy, and it is not a measure of legal compliance or
              business performance.
            </p>
          </section>
          <section>
            <h2 className="mb-2 text-base font-semibold text-slate-900">4. Contact</h2>
            <p>Questions about these terms can go to the project maintainer.</p>
          </section>
        </div>

        <div className="mt-12">
          <Link href="/" className="text-sm font-medium text-[#1a3a2e] hover:underline">Back to home</Link>
        </div>
      </main>
    </div>
  );
}

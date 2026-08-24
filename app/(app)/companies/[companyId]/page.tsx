import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getCompany } from "@/lib/services/companies";
import { getPreviousSnapshot } from "@/lib/services/analysis";
import CompanySearchBar from "../CompanySearchBar";
import AnalysisLoader from "./AnalysisLoader";

interface Props {
  params: Promise<{ companyId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { companyId } = await params;
  const company = await getCompany(companyId);
  return {
    title: company ? `${company.name} — Priori` : "Company Analysis",
  };
}

export default async function CompanyAnalysisPage({ params }: Props) {
  const { companyId } = await params;

  const company = await getCompany(companyId);
  if (!company) notFound();

  // Previous snapshot is fast (mock data or cached Supabase row)
  const previousSnapshot = await getPreviousSnapshot(companyId);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Breadcrumb + compact search */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
          <Link
            href="/companies"
            className="text-slate-500 hover:text-[#1a3a2e] transition-colors font-medium"
          >
            Companies
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" aria-hidden />
          <span className="font-semibold text-slate-900">{company.name}</span>
        </nav>

        <CompanySearchBar placeholder="Search another company…" />
      </div>

      {/* Loading screen → transitions to dashboard when analysis completes */}
      <AnalysisLoader company={company} previousSnapshot={previousSnapshot} />
    </div>
  );
}

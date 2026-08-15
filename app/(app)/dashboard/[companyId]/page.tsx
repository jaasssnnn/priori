import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCompany } from "@/lib/services/companies";
import { getSnapshot, getPreviousSnapshot } from "@/lib/services/analysis";
import DashboardClient from "./DashboardClient";

interface Props {
  params: Promise<{ companyId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { companyId } = await params;
  const company = await getCompany(companyId);
  return { title: company ? `${company.name} Dashboard` : "Dashboard" };
}

export default async function DashboardPage({ params }: Props) {
  const { companyId } = await params;

  const company = await getCompany(companyId);
  const [snapshot, previousSnapshot] = await Promise.all([
    getSnapshot(companyId, company?.name),
    getPreviousSnapshot(companyId),
  ]);

  if (!company || !snapshot) notFound();

  return (
    <DashboardClient
      company={company}
      snapshot={snapshot}
      previousSnapshot={previousSnapshot}
    />
  );
}

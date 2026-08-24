import type { Metadata } from "next";
import CompaniesClient from "./CompaniesClient";

export const metadata: Metadata = {
  title: "Companies — Priori",
};

export default function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  return <CompaniesClient searchParamsPromise={searchParams} />;
}

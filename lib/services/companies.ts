import { config } from "@/lib/config";
import { getMockCompany, searchMockCompanies } from "@/lib/mock/companies";
import type { Company } from "@/types";

export async function searchCompanies(query: string): Promise<Company[]> {
  if (config.USE_MOCK_SCRAPERS) {
    await delay(400); // simulate network
    return searchMockCompanies(query);
  }
  const res = await fetch(`/api/search/company?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Company search failed");
  return res.json();
}

export async function getCompany(id: string): Promise<Company | null> {
  if (config.USE_MOCK_SCRAPERS) {
    await delay(100);
    return getMockCompany(id) ?? null;
  }
  const res = await fetch(`/api/companies/${id}`);
  if (!res.ok) return null;
  return res.json();
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

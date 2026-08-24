import { config } from "@/lib/config";
import { getMockCompany, searchMockCompanies, MOCK_COMPANIES } from "@/lib/mock/companies";
import type { Company } from "@/types";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export async function searchCompanies(query: string): Promise<Company[]> {
  if (config.USE_MOCK_SCRAPERS) {
    await delay(400);
    return searchMockCompanies(query);
  }
  try {
    const res = await fetch(`${BASE}/api/search/company?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`Search ${res.status}`);
    const results: Company[] = await res.json();
    // Use local icons for known demo companies (CDN URLs can be unreliable)
    return results.map((r) => {
      const mock = MOCK_COMPANIES.find((m) => m.app_id === r.app_id);
      return mock ? { ...r, icon_url: mock.icon_url } : r;
    });
  } catch (err) {
    console.error("[companies] search failed, falling back to mock:", err);
    return searchMockCompanies(query);
  }
}

export async function getCompany(id: string): Promise<Company | null> {
  // Always check mock first (handles demo companies + cached real companies)
  const mock = getMockCompany(id);
  if (mock) return mock;

  if (config.USE_MOCK_SCRAPERS) return null;

  // For real package names, look up via Play Store search
  try {
    const res = await fetch(
      `${BASE}/api/search/company?q=${encodeURIComponent(id)}`
    );
    if (!res.ok) return null;
    const results: Company[] = await res.json();
    // Find exact match on app_id
    return results.find((c) => c.app_id === id) ?? results[0] ?? null;
  } catch {
    return null;
  }
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

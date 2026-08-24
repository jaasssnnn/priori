import type { Company } from "@/types";

export const MOCK_COMPANIES: Company[] = [
  // ── Fintech ──────────────────────────────────────────────────────────────
  {
    id: "cred",
    user_id: "demo-user",
    app_id: "com.dreamplug.androidapp",
    app_store_id: "1498417521",
    name: "CRED",
    icon_url: "/icons/cred.png",
    added_at: "2026-08-01T00:00:00Z",
    industry: "fintech",
    product_type: "Mobile app",
    developer: "CRED",
    avg_rating: 3.8,
    install_count: "50M+",
  },
  {
    id: "phonepe",
    user_id: "demo-user",
    app_id: "com.phonepe.app",
    app_store_id: "1170055821",
    name: "PhonePe",
    icon_url: "/icons/phonepe.png",
    added_at: "2026-08-01T00:00:00Z",
    industry: "fintech",
    product_type: "Mobile app",
    developer: "PhonePe Private Limited",
    avg_rating: 3.6,
    install_count: "500M+",
  },
  {
    id: "paytm",
    user_id: "demo-user",
    app_id: "net.one97.paytm",
    app_store_id: "473941634",
    name: "Paytm",
    icon_url: "/icons/paytm.png",
    added_at: "2026-08-01T00:00:00Z",
    industry: "fintech",
    product_type: "Mobile app",
    developer: "One97 Communications Limited",
    avg_rating: 3.2,
    install_count: "100M+",
  },
  // ── Food delivery ─────────────────────────────────────────────────────────
  {
    id: "swiggy",
    user_id: "demo-user",
    app_id: "in.swiggy.android",
    app_store_id: "989540920",
    name: "Swiggy",
    icon_url: "/icons/swiggy.png",
    added_at: "2026-08-01T00:00:00Z",
    industry: "food_delivery",
    product_type: "Mobile app",
    developer: "Bundl Technologies Pvt. Ltd.",
    avg_rating: 3.9,
    install_count: "100M+",
  },
  // ── Quick commerce ────────────────────────────────────────────────────────
  {
    id: "blinkit",
    user_id: "demo-user",
    app_id: "com.grofers.customerapp",
    app_store_id: "1138388077",
    name: "Blinkit",
    icon_url: "/icons/blinkit.png",
    added_at: "2026-08-01T00:00:00Z",
    industry: "quick_commerce",
    product_type: "Mobile app",
    developer: "Blinkit (formerly Grofers)",
    avg_rating: 4.1,
    install_count: "50M+",
  },
  // ── Travel ────────────────────────────────────────────────────────────────
  {
    id: "makemytrip",
    user_id: "demo-user",
    app_id: "com.makemytrip",
    app_store_id: "530488359",
    name: "MakeMyTrip",
    icon_url: "/icons/makemytrip.png",
    added_at: "2026-08-01T00:00:00Z",
    industry: "travel",
    product_type: "Mobile app",
    developer: "MakeMyTrip Pvt. Ltd.",
    avg_rating: 3.7,
    install_count: "100M+",
  },
];

export function searchMockCompanies(query: string): Company[] {
  const q = query.toLowerCase().trim();
  if (!q) return MOCK_COMPANIES;
  return MOCK_COMPANIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.app_id.toLowerCase().includes(q) ||
      (c.developer ?? "").toLowerCase().includes(q)
  );
}

export function getMockCompany(id: string): Company | undefined {
  return MOCK_COMPANIES.find((c) => c.id === id);
}

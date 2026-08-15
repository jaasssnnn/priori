import type { Company } from "@/types";

export const MOCK_COMPANIES: Company[] = [
  {
    id: "cred",
    user_id: "demo-user",
    app_id: "com.dreamplug.androidapp",
    app_store_id: "1498417521",
    name: "CRED",
    icon_url: "https://play-lh.googleusercontent.com/o9AuDMUMNbFYeIaFNz1khc7PNBCB2WX2oCeEcyLdAMvE0UM9sJMDlsb0DGe1cL-9d0",
    added_at: "2026-08-01T00:00:00Z",
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
    icon_url: "https://play-lh.googleusercontent.com/iRMKmtPB0USPWo2lIgJGSmr-3hkTOYSJqV4fmtqVMFJD6hGhUMvPIJ5L7N3qdaGl6w",
    added_at: "2026-08-01T00:00:00Z",
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
    icon_url: "https://play-lh.googleusercontent.com/vkshNNIFZfmPLtMH1AJmcnRVFYyBJ5VhIGkwm_I3O4PvAP_rM4_ICIgHE47WZMU2cA",
    added_at: "2026-08-01T00:00:00Z",
    developer: "One97 Communications Limited",
    avg_rating: 3.2,
    install_count: "100M+",
  },
];

/** Search mock companies by name (case-insensitive substring match). */
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

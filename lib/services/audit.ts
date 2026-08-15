import { config } from "@/lib/config";
import { MOCK_AUDIT_ENTRIES } from "@/lib/mock/audit";
import type { AuditEntry, AuditDecision } from "@/types";

let _mockEntries: AuditEntry[] = [...MOCK_AUDIT_ENTRIES];

export async function getAuditEntries(companyId?: string): Promise<AuditEntry[]> {
  if (config.USE_MOCK_DB) {
    await delay(200);
    const entries = companyId
      ? _mockEntries.filter((e) => e.company_id === companyId)
      : _mockEntries;
    return [...entries].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
  const url = companyId ? `/api/audit?companyId=${companyId}` : "/api/audit";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch audit entries");
  return res.json();
}

export async function logDecision(data: {
  company_id: string;
  company_name: string;
  company_icon?: string;
  category_name: string;
  decision: AuditDecision;
  reasoning: string;
  decided_by: string;
  priority_score?: number;
}): Promise<AuditEntry> {
  if (config.USE_MOCK_DB) {
    await delay(300);
    const entry: AuditEntry = {
      ...data,
      id: `ae-${Date.now()}`,
      user_id: "demo-user",
      created_at: new Date().toISOString(),
    };
    _mockEntries = [entry, ..._mockEntries];
    return entry;
  }
  const res = await fetch("/api/audit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to log decision");
  return res.json();
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

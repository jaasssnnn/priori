import { config } from "@/lib/config";
import { MOCK_ACTION_ITEMS } from "@/lib/mock/workflows";
import type { ActionItem, ActionItemStatus } from "@/types";

// In-memory store for mock mutations (initialised from static data)
let _mockItems: ActionItem[] = [...MOCK_ACTION_ITEMS];

export async function getActionItems(companyId?: string): Promise<ActionItem[]> {
  if (config.USE_MOCK_DB) {
    await delay(200);
    const items = companyId
      ? _mockItems.filter((i) => i.company_id === companyId)
      : _mockItems;
    return [...items].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
  const url = companyId ? `/api/action-items?companyId=${companyId}` : "/api/action-items";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch action items");
  return res.json();
}

export async function createActionItem(
  data: Omit<ActionItem, "id" | "created_at" | "status">
): Promise<ActionItem> {
  if (config.USE_MOCK_DB) {
    await delay(300);
    const item: ActionItem = {
      ...data,
      id: `ai-${Date.now()}`,
      status: "open",
      created_at: new Date().toISOString(),
    };
    _mockItems = [item, ..._mockItems];
    return item;
  }
  const res = await fetch("/api/action-items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create action item");
  return res.json();
}

export async function updateActionItemStatus(
  id: string,
  status: ActionItemStatus
): Promise<ActionItem> {
  if (config.USE_MOCK_DB) {
    await delay(200);
    _mockItems = _mockItems.map((item) =>
      item.id === id
        ? {
            ...item,
            status,
            resolved_at:
              status === "resolved" || status === "closed"
                ? new Date().toISOString()
                : item.resolved_at,
          }
        : item
    );
    return _mockItems.find((i) => i.id === id)!;
  }
  const res = await fetch(`/api/action-items/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update action item");
  return res.json();
}

export function resetMockWorkflows() {
  _mockItems = [...MOCK_ACTION_ITEMS];
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

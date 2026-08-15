import { config } from "@/lib/config";
import { MOCK_ALERTS } from "@/lib/mock/alerts";
import type { Alert } from "@/types";

let _mockAlerts: Alert[] = [...MOCK_ALERTS];

export async function getAlerts(): Promise<Alert[]> {
  if (config.USE_MOCK_DB) {
    await delay(200);
    return [..._mockAlerts].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
  const res = await fetch("/api/alerts");
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
}

export async function markAlertRead(id: string): Promise<void> {
  if (config.USE_MOCK_DB) {
    await delay(100);
    _mockAlerts = _mockAlerts.map((a) => (a.id === id ? { ...a, read: true } : a));
    return;
  }
  await fetch(`/api/alerts/${id}/read`, { method: "POST" });
}

export async function dismissAlert(id: string): Promise<void> {
  if (config.USE_MOCK_DB) {
    await delay(100);
    _mockAlerts = _mockAlerts.filter((a) => a.id !== id);
    return;
  }
  await fetch(`/api/alerts/${id}`, { method: "DELETE" });
}

export async function markAllRead(): Promise<void> {
  if (config.USE_MOCK_DB) {
    await delay(100);
    _mockAlerts = _mockAlerts.map((a) => ({ ...a, read: true }));
    return;
  }
  await fetch("/api/alerts/mark-all-read", { method: "POST" });
}

export function getUnreadCount(alerts: Alert[]): number {
  return alerts.filter((a) => !a.read).length;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

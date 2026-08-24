"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ActionItem, AuditEntry, Alert, WatchlistEntry, ActionItemStatus, AuditDecision } from "@/types";
import * as workflowsService from "@/lib/services/workflows";
import * as auditService from "@/lib/services/audit";
import * as alertsService from "@/lib/services/alerts";
import * as watchlistService from "@/lib/services/watchlist";

// ─── Context shape ────────────────────────────────────────────────────────────

interface AppContextValue {
  // Watchlist
  watchlist: WatchlistEntry[];
  watchlistLoading: boolean;
  addToWatchlist: (companyId: string) => void;
  removeFromWatchlist: (companyId: string) => void;
  isOnWatchlist: (companyId: string) => boolean;
  refreshWatchlist: () => void;

  // Action items
  actionItems: ActionItem[];
  actionItemsLoading: boolean;
  createActionItem: (data: Omit<ActionItem, "id" | "created_at" | "status">) => Promise<ActionItem>;
  updateActionItemStatus: (id: string, status: ActionItemStatus) => Promise<void>;

  // Audit trail
  auditEntries: AuditEntry[];
  auditLoading: boolean;
  logDecision: (data: {
    company_id: string;
    company_name: string;
    company_icon?: string;
    category_name: string;
    decision: AuditDecision;
    reasoning: string;
    decided_by: string;
    priority_score?: number;
  }) => Promise<void>;

  // Alerts
  alerts: Alert[];
  alertsLoading: boolean;
  unreadAlertCount: number;
  markAlertRead: (id: string) => Promise<void>;
  dismissAlert: (id: string) => Promise<void>;
  markAllAlertsRead: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState<WatchlistEntry[]>([]);
  const [watchlistLoading, setWatchlistLoading] = useState(true);

  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [actionItemsLoading, setActionItemsLoading] = useState(true);

  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(true);

  // ── Initial load ───────────────────────────────────────────────────────────

  const refreshWatchlist = useCallback(async () => {
    setWatchlistLoading(true);
    try {
      const data = await watchlistService.getWatchlist();
      setWatchlist(data);
    } catch {
      setWatchlist([]);
    } finally {
      setWatchlistLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshWatchlist();

    workflowsService.getActionItems()
      .then((data) => setActionItems(data))
      .catch(() => {})
      .finally(() => setActionItemsLoading(false));

    auditService.getAuditEntries()
      .then((data) => setAuditEntries(data))
      .catch(() => {})
      .finally(() => setAuditLoading(false));

    alertsService.getAlerts()
      .then((data) => setAlerts(data))
      .catch(() => {})
      .finally(() => setAlertsLoading(false));
  }, [refreshWatchlist]);

  // ── Watchlist mutations ───────────────────────────────────────────────────

  const addToWatchlist = useCallback(
    async (companyId: string) => {
      const entry = await import("@/lib/mock/companies").then((m) =>
        m.MOCK_COMPANIES.find((c) => c.id === companyId)
      );
      if (entry) {
        await watchlistService.addToWatchlist(entry);
        await refreshWatchlist();
      }
    },
    [refreshWatchlist]
  );

  const removeFromWatchlist = useCallback(
    async (companyId: string) => {
      await watchlistService.removeFromWatchlist(companyId);
      setWatchlist((prev) => prev.filter((e) => e.company.id !== companyId));
    },
    []
  );

  const isOnWatchlist = useCallback(
    (companyId: string) => watchlist.some((e) => e.company.id === companyId),
    [watchlist]
  );

  // ── Action items mutations ────────────────────────────────────────────────

  const createActionItem = useCallback(
    async (data: Omit<ActionItem, "id" | "created_at" | "status">) => {
      const item = await workflowsService.createActionItem(data);
      setActionItems((prev) => [item, ...prev]);
      return item;
    },
    []
  );

  const updateActionItemStatus = useCallback(
    async (id: string, status: ActionItemStatus) => {
      const updated = await workflowsService.updateActionItemStatus(id, status);
      setActionItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    },
    []
  );

  // ── Audit mutations ───────────────────────────────────────────────────────

  const logDecision = useCallback(
    async (data: Parameters<typeof auditService.logDecision>[0]) => {
      const entry = await auditService.logDecision(data);
      setAuditEntries((prev) => [entry, ...prev]);
    },
    []
  );

  // ── Alert mutations ───────────────────────────────────────────────────────

  const markAlertRead = useCallback(async (id: string) => {
    await alertsService.markAlertRead(id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  }, []);

  const dismissAlert = useCallback(async (id: string) => {
    await alertsService.dismissAlert(id);
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const markAllAlertsRead = useCallback(async () => {
    await alertsService.markAllRead();
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  }, []);

  const unreadAlertCount = alertsService.getUnreadCount(alerts);

  // ── Value ─────────────────────────────────────────────────────────────────

  return (
    <AppContext.Provider
      value={{
        watchlist,
        watchlistLoading,
        addToWatchlist,
        removeFromWatchlist,
        isOnWatchlist,
        refreshWatchlist,
        actionItems,
        actionItemsLoading,
        createActionItem,
        updateActionItemStatus,
        auditEntries,
        auditLoading,
        logDecision,
        alerts,
        alertsLoading,
        unreadAlertCount,
        markAlertRead,
        dismissAlert,
        markAllAlertsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

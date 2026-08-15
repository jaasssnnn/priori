"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, BellOff, TrendingUp, Sparkles, X, CheckCheck, Loader2 } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import type { Alert } from "@/types";
import { cn, timeAgo } from "@/lib/utils";

// ─── Alert card ───────────────────────────────────────────────────────────────

function AlertCard({
  alert,
  onMarkRead,
  onDismiss,
}: {
  alert: Alert;
  onMarkRead: (id: string) => Promise<void>;
  onDismiss: (id: string) => Promise<void>;
}) {
  const [acting, setActing] = useState(false);

  const isSpike    = alert.type === "spike";
  const Icon       = isSpike ? TrendingUp : Sparkles;
  const iconColor  = isSpike ? "text-red-500" : "text-violet-500";
  const iconBg     = isSpike ? "bg-red-50"    : "bg-violet-50";
  const borderColor= isSpike ? "border-l-red-400" : "border-l-violet-400";

  async function act(fn: () => Promise<void>) {
    setActing(true);
    try { await fn(); } finally { setActing(false); }
  }

  return (
    <div className={cn(
      "rounded-xl border border-slate-200 bg-white p-5 border-l-4 transition-opacity",
      borderColor,
      !alert.read && "shadow-sm",
      acting && "opacity-50 pointer-events-none"
    )}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", iconBg)}>
          <Icon className={cn("h-4.5 w-4.5", iconColor)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {/* Company icon + name */}
            {alert.company_icon && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={alert.company_icon} alt={alert.company_name} className="h-4 w-4 rounded object-cover" />
            )}
            <span className="text-xs font-semibold text-slate-700">{alert.company_name}</span>
            <span className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
              isSpike ? "bg-red-100 text-red-700" : "bg-violet-100 text-violet-700"
            )}>
              {isSpike ? `↑ ${alert.change_percent}% spike` : "New trend"}
            </span>
            {!alert.read && (
              <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
            )}
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{alert.message}</p>

          {/* Delivery status */}
          <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
            {alert.email_sent && <span>✉ Email sent</span>}
            {alert.slack_sent && <span>💬 Slack sent</span>}
            <span>·</span>
            <span>{timeAgo(alert.created_at)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {!alert.read && (
            <button
              onClick={() => act(() => onMarkRead(alert.id))}
              title="Mark as read"
              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={() => act(() => onDismiss(alert.id))}
            title="Dismiss"
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <Link
            href={`/dashboard/${alert.company_id}`}
            className="ml-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
          >
            View →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AlertsClient() {
  const { alerts, alertsLoading, markAlertRead, dismissAlert, markAllAlertsRead, unreadAlertCount } = useApp();
  const [filter, setFilter] = useState<"all" | "unread" | "spike" | "new_trend">("all");
  const [markingAll, setMarkingAll] = useState(false);

  const filtered = alerts.filter((a) => {
    if (filter === "unread")    return !a.read;
    if (filter === "spike")     return a.type === "spike";
    if (filter === "new_trend") return a.type === "new_trend";
    return true;
  });

  async function handleMarkAll() {
    setMarkingAll(true);
    try { await markAllAlertsRead(); } finally { setMarkingAll(false); }
  }

  if (alertsLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Alerts</h1>
          <p className="mt-1 text-sm text-slate-500">
            Spike alerts and new trend notifications for your watchlisted companies.
          </p>
        </div>
        {unreadAlertCount > 0 && (
          <button
            onClick={handleMarkAll}
            disabled={markingAll}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            {markingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
            Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-5 border-b border-slate-200">
        {[
          { key: "all",       label: "All",        count: alerts.length },
          { key: "unread",    label: "Unread",     count: unreadAlertCount },
          { key: "spike",     label: "Spikes",     count: alerts.filter((a) => a.type === "spike").length },
          { key: "new_trend", label: "New Trends", count: alerts.filter((a) => a.type === "new_trend").length },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              filter === key
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            {label}
            <span className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
              filter === key ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"
            )}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Alert list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
          {filter === "unread"
            ? <><CheckCheck className="h-10 w-10 text-green-400 mb-3" /><p className="text-sm font-medium text-slate-600">All caught up!</p><p className="text-xs text-slate-400 mt-1">No unread alerts.</p></>
            : <><BellOff className="h-10 w-10 text-slate-300 mb-3" /><p className="text-sm font-medium text-slate-600">No alerts in this category</p><p className="text-xs text-slate-400 mt-1">Add companies to your watchlist to receive alerts.</p></>
          }
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onMarkRead={markAlertRead}
              onDismiss={dismissAlert}
            />
          ))}
        </div>
      )}
    </div>
  );
}

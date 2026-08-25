"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  TrendingUp,
  Clock,
  Bookmark,
  Search,
  Plus,
  ArrowUpRight,
  ChevronRight,
  CheckCircle2,
  MinusCircle,
  Clock3,
  Activity,
  Zap,
  BarChart2,
  ArrowRight,
  Kanban,
  Eye,
  Building2,
  ShieldAlert,
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { cn, formatDate, timeAgo, getPriorityBand } from "@/lib/utils";
import type {
  ActionItem,
  Alert,
  AuditEntry,
  WatchlistEntry,
  AuditDecision,
} from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

// ─── Local types ──────────────────────────────────────────────────────────────

type AttentionType = "spike" | "new_trend" | "overdue" | "open_action" | "needs_triage";
type StateVariant  = "danger" | "warning" | "info" | "neutral";

interface AttentionItem {
  id: string;
  type: AttentionType;
  company_id: string;
  company_name: string;
  company_icon?: string;
  category_name: string;
  description: string;
  priority_score?: number;
  change_percent?: number;
  state: string;
  state_variant: StateVariant;
  detected_at: string;
  action_item_id?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isOverdue(item: ActionItem): boolean {
  if (item.status === "resolved" || item.status === "closed") return false;
  return new Date(item.deadline) < new Date(new Date().toDateString());
}

function stateChipClass(variant: StateVariant): string {
  return {
    danger:  "bg-red-100 text-red-700",
    warning: "bg-amber-100 text-amber-700",
    info:    "bg-blue-100 text-blue-700",
    neutral: "bg-slate-100 text-slate-600",
  }[variant];
}

// ─── Skeleton loaders ─────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 min-h-[150px] flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="h-3.5 w-28 rounded bg-slate-100" />
        <div className="h-8 w-8 rounded-full bg-slate-100 shrink-0" />
      </div>
      <div className="h-12 w-16 rounded bg-slate-100 flex-1 mb-3" />
      <div className="h-5 w-40 rounded-full bg-slate-100" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-center gap-4 px-5 py-4 border-b border-slate-100 last:border-0">
      <div className="h-5 w-16 rounded-md bg-slate-100 shrink-0" />
      <div className="h-4 w-28 rounded bg-slate-100 shrink-0" />
      <div className="h-4 flex-1 rounded bg-slate-100" />
      <div className="h-4 w-12 rounded bg-slate-100 shrink-0" />
      <div className="h-6 w-22 rounded-full bg-slate-100 shrink-0" />
      <div className="h-4 w-14 rounded bg-slate-100 shrink-0" />
      <div className="h-7 w-16 rounded-lg bg-slate-100 shrink-0" />
    </div>
  );
}

// ─── Summary card ─────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  support,
  icon: Icon,
  href,
  variant = "white",
}: {
  label: string;
  value: number;
  support: string;
  icon: React.ElementType;
  href?: string;
  variant?: "green" | "white";
}) {
  const isGreen = variant === "green";
  const inner = (
    <div
      className={cn(
        "rounded-2xl p-5 transition-all h-full flex flex-col min-h-[150px]",
        isGreen
          ? "bg-gradient-to-br from-[#1a3a2e] to-[#2a5240]"
          : "bg-white border border-slate-200 hover:border-slate-300",
        href && "cursor-pointer"
      )}
    >
      {/* label + circular arrow button */}
      <div className="flex items-start justify-between mb-3">
        <p className={cn(
          "text-sm font-semibold leading-snug pr-2",
          isGreen ? "text-white" : "text-slate-800"
        )}>
          {label}
        </p>
        <div className={cn(
          "h-8 w-8 shrink-0 flex items-center justify-center rounded-full border transition-colors",
          isGreen
            ? "border-white/30 text-white hover:bg-white/10"
            : "border-slate-200 text-slate-500 hover:border-slate-300"
        )}>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* big number */}
      <p className={cn(
        "text-5xl font-extrabold tracking-tight flex-1",
        isGreen ? "text-white" : "text-slate-900"
      )}>
        {value}
      </p>

      {/* bottom badge + support text */}
      <div className="flex items-center gap-1.5 mt-3">
        <span className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0",
          isGreen
            ? "bg-white/20 text-white"
            : "bg-[#1a3a2e]/5 text-[#1a3a2e] border border-[#1a3a2e]/15"
        )}>
          <Icon className="h-3 w-3" />
          {value}
        </span>
        <span className={cn(
          "text-[11px] leading-snug",
          isGreen ? "text-white/60" : "text-slate-400"
        )}>
          {support}
        </span>
      </div>
    </div>
  );
  if (href) return <Link href={href} className="block h-full">{inner}</Link>;
  return inner;
}

// ─── Priority badge ───────────────────────────────────────────────────────────

function PriorityBadge({ score }: { score?: number }) {
  if (score == null) return <span className="text-[10px] text-slate-300">—</span>;
  const band = getPriorityBand(score);
  const styles: Record<string, string> = {
    critical: "border-red-200 bg-red-50 text-red-700",
    high:     "border-orange-200 bg-orange-50 text-orange-700",
    medium:   "border-amber-200 bg-amber-50 text-amber-700",
    low:      "border-[#1a3a2e]/20 bg-[#1a3a2e]/5 text-[#1a3a2e]",
  };
  const labels: Record<string, string> = {
    critical: "Critical", high: "High", medium: "Medium", low: "Low",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        styles[band]
      )}
      aria-label={`Priority: ${labels[band]}`}
    >
      {labels[band]}
    </span>
  );
}

// ─── Company icon ─────────────────────────────────────────────────────────────

function CompanyIcon({
  url,
  name,
  size = "sm",
}: {
  url?: string;
  name: string;
  size?: "sm" | "md";
}) {
  const dim = size === "md" ? "h-9 w-9 rounded-xl" : "h-6 w-6 rounded-lg";
  if (url)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name}
        className={cn(dim, "object-cover border border-slate-100 shrink-0")}
      />
    );
  return (
    <div
      className={cn(
        dim,
        "bg-slate-100 flex items-center justify-center shrink-0 text-xs font-bold text-slate-500"
      )}
    >
      {name[0]}
    </div>
  );
}

// ─── Attention row (desktop table) ────────────────────────────────────────────

function AttentionRow({ item }: { item: AttentionItem }) {
  const href = item.action_item_id ? "/workflows" : `/companies/${item.company_id}`;

  const actionLabel =
    item.type === "overdue" ? "View action" :
    item.type === "open_action" ? "View action" :
    item.type === "spike" || item.type === "new_trend" ? "View spike" :
    "Review";

  return (
    <div className="grid grid-cols-[96px_176px_1fr_76px_116px_96px_88px] items-center gap-3 px-4 py-3.5 border-b border-slate-100 hover:bg-slate-50/60 transition-colors last:border-0">
      <PriorityBadge score={item.priority_score} />

      <div className="flex flex-col gap-0.5 min-w-0">
        <Link
          href={`/companies/${item.company_id}`}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-[#1a3a2e] hover:underline truncate"
        >
          <CompanyIcon url={item.company_icon} name={item.company_name} />
          {item.company_name}
        </Link>
        <span className="text-[11px] text-slate-500 truncate pl-7">
          {item.category_name}
        </span>
      </div>

      <p className="text-xs text-slate-600 truncate leading-snug">{item.description}</p>

      <div className="tabular-nums">
        {item.priority_score != null ? (
          <span className="text-sm font-bold text-slate-800">{item.priority_score}</span>
        ) : (
          <span className="text-xs text-slate-300">—</span>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold w-fit",
            stateChipClass(item.state_variant)
          )}
        >
          {item.state}
        </span>
        {item.change_percent != null && (
          <span className="text-[10px] text-red-500 font-medium">
            +{item.change_percent}%
          </span>
        )}
      </div>

      <p className="text-[11px] text-slate-400">{timeAgo(item.detected_at)}</p>

      <Link
        href={href}
        className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-[#1a3a2e] hover:text-white hover:border-[#1a3a2e] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a3a2e]/30"
        aria-label={`${actionLabel} for ${item.company_name} ${item.category_name}`}
      >
        {actionLabel} <ArrowRight className="h-2.5 w-2.5" />
      </Link>
    </div>
  );
}

// ─── Attention card (mobile) ──────────────────────────────────────────────────

function AttentionCard({ item }: { item: AttentionItem }) {
  const href = item.action_item_id ? "/workflows" : `/companies/${item.company_id}`;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-start gap-2 min-w-0">
          <CompanyIcon url={item.company_icon} name={item.company_name} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{item.company_name}</p>
            <p className="text-xs text-slate-500 truncate">{item.category_name}</p>
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          <PriorityBadge score={item.priority_score} />
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
              stateChipClass(item.state_variant)
            )}
          >
            {item.state}
          </span>
        </div>
      </div>
      <p className="text-xs text-slate-600 mb-3 leading-relaxed">{item.description}</p>
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-slate-400">{timeAgo(item.detected_at)}</p>
        <Link
          href={href}
          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-[#1a3a2e] hover:text-white hover:border-[#1a3a2e] transition-colors"
        >
          Review <ArrowRight className="h-2.5 w-2.5" />
        </Link>
      </div>
    </div>
  );
}

// ─── Spike item ───────────────────────────────────────────────────────────────

function SpikeItem({ alert }: { alert: Alert }) {
  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-slate-100 last:border-0">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-50 mt-0.5">
        <TrendingUp className="h-3.5 w-3.5 text-red-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <CompanyIcon url={alert.company_icon} name={alert.company_name ?? "?"} />
          <Link
            href={`/companies/${alert.company_id}`}
            className="text-xs font-semibold text-slate-900 hover:text-[#1a3a2e] hover:underline"
          >
            {alert.company_name}
          </Link>
          <span className="text-slate-200" aria-hidden>·</span>
          <span className="text-xs text-slate-500 truncate">{alert.category_name}</span>
        </div>
        {alert.change_percent != null && (
          <p className="text-xs font-semibold text-red-600 mb-0.5">
            +{alert.change_percent}% complaint rate increase
          </p>
        )}
        <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">{alert.message}</p>
        <p className="text-[10px] text-slate-400 mt-1">{timeAgo(alert.created_at)}</p>
      </div>
      <Link
        href={`/companies/${alert.company_id}`}
        className="shrink-0 text-slate-300 hover:text-[#1a3a2e] transition-colors mt-1"
        aria-label={`Inspect ${alert.company_name} ${alert.category_name}`}
      >
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

// ─── Work item row ────────────────────────────────────────────────────────────

function WorkItemRow({ item }: { item: ActionItem }) {
  const overdue = isOverdue(item);
  const deadline = new Date(item.deadline);
  const today = new Date(new Date().toDateString());
  const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / 86_400_000);

  return (
    <div className="flex items-center gap-3 py-3.5 border-b border-slate-100 last:border-0">
      <div
        className={cn(
          "h-2 w-2 rounded-full shrink-0 mt-0.5",
          overdue
            ? "bg-red-500"
            : item.status === "in_progress"
            ? "bg-amber-400"
            : "bg-blue-400"
        )}
        aria-hidden
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className="text-xs font-medium text-slate-800 truncate">{item.category_name}</p>
          {overdue && (
            <span className="shrink-0 rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-600 uppercase">
              Overdue
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-500 truncate">
          {item.company_name ?? item.company_id} · {item.owner}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p
          className={cn(
            "text-[11px] font-semibold",
            overdue
              ? "text-red-600"
              : daysLeft <= 2
              ? "text-amber-600"
              : "text-slate-500"
          )}
        >
          {overdue
            ? `${Math.abs(daysLeft)}d overdue`
            : daysLeft === 0
            ? "Due today"
            : `${daysLeft}d left`}
        </p>
        <p className="text-[10px] text-slate-400">{item.deadline}</p>
      </div>
    </div>
  );
}

// ─── Watchlist company card ───────────────────────────────────────────────────

function WatchlistCard({ entry }: { entry: WatchlistEntry }) {
  const snap = entry.latest_snapshot;
  const topCat = snap.categories[0];

  const trendLabel =
    entry.trend === "improving" ? "↓ Improving" :
    entry.trend === "worsening" ? "↑ Worsening" : "→ Stable";
  const trendColor =
    entry.trend === "improving" ? "text-[#1a3a2e]" :
    entry.trend === "worsening" ? "text-red-600" : "text-slate-400";

  const scoreColor =
    snap.health_score >= 70 ? "text-[#1a3a2e]" :
    snap.health_score >= 50 ? "text-amber-600" : "text-red-600";

  return (
    <Link
      href={`/companies/${entry.company.id}`}
      className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:border-[#1a3a2e]/30 transition-all group"
    >
      <CompanyIcon url={entry.company.icon_url} name={entry.company.name} size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 group-hover:text-[#1a3a2e] truncate transition-colors">
          {entry.company.name}
        </p>
        {topCat && (
          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            Top: {topCat.name}
          </p>
        )}
        <p className={cn("text-[11px] font-medium mt-1", trendColor)}>{trendLabel}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className={cn("text-xl font-extrabold", scoreColor)}>{snap.health_score}</p>
        <p className="text-[10px] text-slate-400">Risk index</p>
        {entry.unread_alerts > 0 && (
          <span className="inline-flex mt-1 items-center rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-600">
            {entry.unread_alerts} alert{entry.unread_alerts > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </Link>
  );
}

// ─── Audit decision item ──────────────────────────────────────────────────────

const DECISION_META: Record<
  AuditDecision,
  { label: string; color: string; icon: React.ElementType }
> = {
  acted_on:      { label: "Acted on",      color: "bg-blue-100 text-blue-700",   icon: CheckCircle2 },
  deprioritized: { label: "Deprioritized", color: "bg-slate-100 text-slate-600", icon: MinusCircle  },
  deferred:      { label: "Deferred",      color: "bg-amber-100 text-amber-700", icon: Clock3       },
};

function DecisionItem({ entry }: { entry: AuditEntry }) {
  const meta = DECISION_META[entry.decision];
  const Icon = meta.icon;
  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-slate-100 last:border-0">
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg mt-0.5",
          meta.color
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="text-xs font-semibold text-slate-800 truncate">
            {entry.category_name}
          </span>
          <span
            className={cn(
              "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
              meta.color
            )}
          >
            {meta.label}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 truncate">
          {entry.company_name ?? entry.company_id}
        </p>
        <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1 leading-snug">
          {entry.reasoning}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          {entry.decided_by} · {timeAgo(entry.created_at)}
        </p>
      </div>
      <Link
        href="/audit"
        className="shrink-0 text-slate-300 hover:text-[#1a3a2e] transition-colors mt-1"
        aria-label="View audit entry"
      >
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

// ─── Widget shell ─────────────────────────────────────────────────────────────

function Widget({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  href,
  hrefLabel,
  children,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  href: string;
  hrefLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className={cn("h-7 w-7 flex items-center justify-center rounded-lg", iconBg)}>
            <Icon className={cn("h-3.5 w-3.5", iconColor)} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-snug">{title}</h2>
            {subtitle && (
              <p className="text-[10px] text-slate-400 leading-none mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        <Link
          href={href}
          className="flex items-center gap-0.5 text-xs font-medium text-[#1a3a2e] hover:underline shrink-0"
        >
          {hrefLabel} <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="flex-1 px-5">{children}</div>
    </div>
  );
}

// ─── Filter options ───────────────────────────────────────────────────────────

const FILTER_OPTIONS = [
  { value: "all",          label: "All" },
  { value: "needs_triage", label: "Needs triage" },
  { value: "spike",        label: "Complaint spikes" },
  { value: "open_action",  label: "Open actions" },
  { value: "overdue",      label: "Overdue" },
] as const;

type FilterValue = (typeof FILTER_OPTIONS)[number]["value"];

// ─── Main component ───────────────────────────────────────────────────────────

export default function OverviewClient() {
  const {
    watchlist,
    watchlistLoading,
    actionItems,
    actionItemsLoading,
    auditEntries,
    auditLoading,
    alerts,
    alertsLoading,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");

  const isLoading =
    watchlistLoading || actionItemsLoading || auditLoading || alertsLoading;

  // ── Summary counts ──────────────────────────────────────────────────────────

  const summary = useMemo(() => {
    const decidedKeys = new Set(
      auditEntries.map((e) => `${e.company_id}:${e.category_name}`)
    );
    const issuesRequiringTriage = watchlist.reduce(
      (count, entry) =>
        count +
        entry.latest_snapshot.categories.filter(
          (cat) =>
            cat.score >= 40 &&
            !decidedKeys.has(`${entry.company.id}:${cat.name}`)
        ).length,
      0
    );
    const complaintSpikes = alerts.filter((a) => a.type === "spike").length;
    const openActions = actionItems.filter(
      (i) => i.status === "open" || i.status === "in_progress"
    ).length;
    const overdueActions = actionItems.filter(isOverdue).length;

    return {
      issuesRequiringTriage,
      complaintSpikes,
      openActions,
      overdueActions,
    };
  }, [auditEntries, watchlist, alerts, actionItems]);

  // ── Synthesize attention items ──────────────────────────────────────────────

  const allAttentionItems = useMemo((): AttentionItem[] => {
    const items: AttentionItem[] = [];

    const coveredByAlerts = new Set(
      alerts.map((a) => `${a.company_id}:${a.category_name ?? ""}`)
    );
    const decidedKeys = new Set(
      auditEntries.map((e) => `${e.company_id}:${e.category_name}`)
    );

    // 1. Overdue action items (highest urgency)
    actionItems.filter(isOverdue).forEach((item) => {
      items.push({
        id: `overdue-${item.id}`,
        type: "overdue",
        company_id: item.company_id,
        company_name: item.company_name ?? item.company_id,
        company_icon: item.company_icon,
        category_name: item.category_name,
        description: `Action item past deadline — owner: ${item.owner}`,
        priority_score: item.priority_score,
        state: "Overdue",
        state_variant: "danger",
        detected_at: item.deadline,
        action_item_id: item.id,
      });
    });

    // 2. Spike alerts
    alerts
      .filter((a) => a.type === "spike")
      .forEach((alert) => {
        items.push({
          id: `spike-${alert.id}`,
          type: "spike",
          company_id: alert.company_id,
          company_name: alert.company_name ?? alert.company_id,
          company_icon: alert.company_icon,
          category_name: alert.category_name ?? "Complaint spike",
          description:
            alert.message.length > 120
              ? alert.message.slice(0, 120) + "…"
              : alert.message,
          change_percent: alert.change_percent,
          state: "Complaint spike",
          state_variant: "danger",
          detected_at: alert.created_at,
        });
      });

    // 3. New trend alerts
    alerts
      .filter((a) => a.type === "new_trend")
      .forEach((alert) => {
        items.push({
          id: `trend-${alert.id}`,
          type: "new_trend",
          company_id: alert.company_id,
          company_name: alert.company_name ?? alert.company_id,
          company_icon: alert.company_icon,
          category_name: alert.category_name ?? "New trend",
          description:
            alert.message.length > 120
              ? alert.message.slice(0, 120) + "…"
              : alert.message,
          state: "New pattern",
          state_variant: "warning",
          detected_at: alert.created_at,
        });
      });

    // 4. Open action items (not overdue)
    actionItems
      .filter(
        (i) =>
          (i.status === "open" || i.status === "in_progress") && !isOverdue(i)
      )
      .forEach((item) => {
        items.push({
          id: `action-${item.id}`,
          type: "open_action",
          company_id: item.company_id,
          company_name: item.company_name ?? item.company_id,
          company_icon: item.company_icon,
          category_name: item.category_name,
          description:
            item.status === "in_progress"
              ? `In progress — owner: ${item.owner}, due ${item.deadline}`
              : `Assigned to ${item.owner} — due ${item.deadline}`,
          priority_score: item.priority_score,
          state: item.status === "in_progress" ? "In progress" : "Open",
          state_variant: item.status === "in_progress" ? "info" : "neutral",
          detected_at: item.created_at,
          action_item_id: item.id,
        });
      });

    // 5. Categories needing triage (not already covered by alerts or decisions)
    watchlist.forEach((entry) => {
      entry.latest_snapshot.categories
        .filter(
          (cat) =>
            cat.score >= 40 &&
            !decidedKeys.has(`${entry.company.id}:${cat.name}`) &&
            !coveredByAlerts.has(`${entry.company.id}:${cat.name}`)
        )
        .slice(0, 4)
        .forEach((cat) => {
          items.push({
            id: `triage-${entry.company.id}-${cat.name}`,
            type: "needs_triage",
            company_id: entry.company.id,
            company_name: entry.company.name,
            company_icon: entry.company.icon_url,
            category_name: cat.name,
            description: `${cat.complaint_count} complaints · severity ${Math.round(cat.avg_severity * 100)}%${cat.risk_relevance ? ` · ${cat.risk_dimensions?.[0] ?? "Risk relevance"}` : ""}`,
            priority_score: cat.score,
            state: "Needs triage",
            state_variant: "warning",
            detected_at: entry.latest_snapshot.created_at,
          });
        });
    });

    // Sort: overdue first, then by priority score desc, then recency
    return items.sort((a, b) => {
      if (a.type === "overdue" && b.type !== "overdue") return -1;
      if (b.type === "overdue" && a.type !== "overdue") return 1;
      const scoreDiff = (b.priority_score ?? 0) - (a.priority_score ?? 0);
      if (scoreDiff !== 0) return scoreDiff;
      return new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime();
    });
  }, [alerts, actionItems, auditEntries, watchlist]);

  // ── Filter ──────────────────────────────────────────────────────────────────

  const filteredItems = useMemo(() => {
    if (activeFilter === "all") return allAttentionItems;
    if (activeFilter === "needs_triage")
      return allAttentionItems.filter((i) => i.type === "needs_triage");
    if (activeFilter === "spike")
      return allAttentionItems.filter(
        (i) => i.type === "spike" || i.type === "new_trend"
      );
    if (activeFilter === "open_action")
      return allAttentionItems.filter((i) => i.type === "open_action");
    if (activeFilter === "overdue")
      return allAttentionItems.filter((i) => i.type === "overdue");
    return allAttentionItems;
  }, [allAttentionItems, activeFilter]);

  // Filter counts (used in tab badges)
  const filterCounts = useMemo(
    () => ({
      all: allAttentionItems.length,
      needs_triage: allAttentionItems.filter((i) => i.type === "needs_triage").length,
      spike: allAttentionItems.filter(
        (i) => i.type === "spike" || i.type === "new_trend"
      ).length,
      open_action: allAttentionItems.filter((i) => i.type === "open_action").length,
      overdue: allAttentionItems.filter((i) => i.type === "overdue").length,
    }),
    [allAttentionItems]
  );

  // ── Widget data ─────────────────────────────────────────────────────────────

  const spikes = useMemo(
    () => alerts.filter((a) => a.type === "spike").slice(0, 5),
    [alerts]
  );

  const workInProgress = useMemo(() => {
    const overdue = actionItems.filter(isOverdue);
    const active = actionItems
      .filter(
        (i) =>
          (i.status === "open" || i.status === "in_progress") && !isOverdue(i)
      )
      .sort(
        (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      );
    return [...overdue, ...active].slice(0, 6);
  }, [actionItems]);

  const recentDecisions = useMemo(
    () =>
      [...auditEntries]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 5),
    [auditEntries]
  );

  const workCounts = useMemo(
    () => ({
      open: actionItems.filter((i) => i.status === "open").length,
      inProgress: actionItems.filter((i) => i.status === "in_progress").length,
      resolved: actionItems.filter((i) => i.status === "resolved").length,
      closed: actionItems.filter((i) => i.status === "closed").length,
    }),
    [actionItems]
  );
  const totalWork =
    workCounts.open +
    workCounts.inProgress +
    workCounts.resolved +
    workCounts.closed;

  const refreshStatus = useMemo(() => {
    if (watchlist.length === 0) return null;
    const dates = watchlist.map(
      (e) => new Date(e.latest_snapshot.created_at)
    );
    const lastRefresh = dates.reduce((max, d) => (d > max ? d : max), dates[0]);
    return { lastRefreshAt: lastRefresh.toISOString(), total: watchlist.length };
  }, [watchlist]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto space-y-6">


      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Your product intelligence command center ·{" "}
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/watchlist"
            className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a3a2e]/20"
          >
            <Eye className="h-4 w-4" />
            View watchlist
          </Link>
          <Link
            href="/companies"
            className="flex items-center gap-1.5 rounded-xl bg-[#1a3a2e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#243f35] transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a3a2e]/40"
          >
            <Search className="h-4 w-4" />
            Analyze a company
          </Link>
        </div>
      </div>

      {/* ── Summary cards ─────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <SummaryCard
            label="Issues requiring triage"
            value={summary.issuesRequiringTriage}
            support="Across monitored companies"
            icon={AlertTriangle}
            href="/watchlist"
            variant="green"
          />
          <SummaryCard
            label="Complaint spikes"
            value={summary.complaintSpikes}
            support="Versus previous snapshot"
            icon={TrendingUp}
            href="/alerts"
          />
          <SummaryCard
            label="Open actions"
            value={summary.openActions}
            support="Assigned work in progress"
            icon={Kanban}
            href="/workflows"
          />
          <SummaryCard
            label="Overdue actions"
            value={summary.overdueActions}
            support="Requires immediate attention"
            icon={Clock}
            href="/workflows"
          />
        </div>
      )}

      {/* ── Attention queue ───────────────────────────────────────────────── */}
      <section aria-labelledby="attention-heading">
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h2
                id="attention-heading"
                className="text-base font-bold text-slate-900"
              >
                Needs your attention
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Prioritized signals and work across your workspace.
              </p>
            </div>
            <Link
              href="/alerts"
              className="flex items-center gap-0.5 text-xs font-medium text-[#1a3a2e] hover:underline shrink-0"
            >
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Filter tabs */}
          <div
            className="flex items-center gap-1 overflow-x-auto px-4 py-2.5 border-b border-slate-100"
            role="tablist"
            aria-label="Filter attention items"
          >
            {FILTER_OPTIONS.map((opt) => {
              const count = filterCounts[opt.value];
              return (
                <button
                  key={opt.value}
                  role="tab"
                  aria-selected={activeFilter === opt.value}
                  onClick={() => setActiveFilter(opt.value)}
                  className={cn(
                    "flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#1a3a2e]/30",
                    activeFilter === opt.value
                      ? "bg-[#1a3a2e] text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {opt.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-[10px] font-bold min-w-[18px] text-center",
                      activeFilter === opt.value
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          {isLoading ? (
            <div>
              {[...Array(4)].map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="h-12 w-12 rounded-2xl bg-[#1a3a2e]/5 flex items-center justify-center mb-3">
                <CheckCircle2 className="h-6 w-6 text-[#1a3a2e]" />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                All clear for now
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                No untriaged signals or overdue actions were found.
              </p>
              <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
                <Link
                  href="/companies"
                  className="flex items-center gap-1.5 rounded-lg bg-[#1a3a2e] px-4 py-2 text-xs font-semibold text-white hover:bg-[#243f35] transition-colors"
                >
                  <Search className="h-3.5 w-3.5" /> Analyze a company
                </Link>
                <Link
                  href="/watchlist"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" /> View watchlist
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block" role="table" aria-label="Attention items">
                <div
                  className="grid grid-cols-[96px_176px_1fr_76px_116px_96px_88px] gap-3 px-4 py-2.5 border-b border-slate-100 bg-slate-50/60"
                  role="row"
                >
                  {[
                    "Priority",
                    "Company / Category",
                    "Description",
                    "Score",
                    "State",
                    "Detected",
                    "Action",
                  ].map((col) => (
                    <span
                      key={col}
                      role="columnheader"
                      className="text-[10px] font-bold uppercase tracking-wider text-slate-400"
                    >
                      {col}
                    </span>
                  ))}
                </div>
                {filteredItems.slice(0, 10).map((item) => (
                  <AttentionRow key={item.id} item={item} />
                ))}
                {filteredItems.length > 10 && (
                  <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/40">
                    <p className="text-xs text-slate-500">
                      Showing 10 of {filteredItems.length} items.{" "}
                      <Link
                        href="/alerts"
                        className="font-medium text-[#1a3a2e] hover:underline"
                      >
                        View all →
                      </Link>
                    </p>
                  </div>
                )}
              </div>

              {/* Mobile cards */}
              <div className="md:hidden space-y-3 p-4">
                {filteredItems.slice(0, 8).map((item) => (
                  <AttentionCard key={item.id} item={item} />
                ))}
                {filteredItems.length > 8 && (
                  <Link
                    href="/alerts"
                    className="block text-center text-xs font-medium text-[#1a3a2e] hover:underline py-2"
                  >
                    +{filteredItems.length - 8} more items →
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Two column: Spikes + Work ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Complaint spikes */}
        <Widget
          icon={TrendingUp}
          iconBg="bg-red-50"
          iconColor="text-red-500"
          title="Recent complaint spikes"
          href="/alerts"
          hrefLabel="View all"
        >
          {isLoading ? (
            [...Array(3)].map((_, i) => <SkeletonRow key={i} />)
          ) : spikes.length === 0 ? (
            <div className="py-10 text-center">
              <Activity className="h-8 w-8 text-slate-200 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-500">
                No complaint spikes detected
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                In the latest refresh.
              </p>
            </div>
          ) : (
            spikes.map((alert) => (
              <SpikeItem key={alert.id} alert={alert} />
            ))
          )}
        </Widget>

        {/* Work in progress */}
        <Widget
          icon={Kanban}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          title="Work in progress"
          subtitle="Overdue first, then by deadline"
          href="/workflows"
          hrefLabel="View workflows"
        >
          {/* Progress bar */}
          {!isLoading && totalWork > 0 && (
            <div className="pt-3 pb-2">
              <div className="flex h-1.5 rounded-full overflow-hidden bg-slate-100 gap-px">
                {workCounts.inProgress > 0 && (
                  <div
                    className="bg-amber-400 transition-all"
                    style={{
                      width: `${(workCounts.inProgress / totalWork) * 100}%`,
                    }}
                    aria-label={`In progress: ${workCounts.inProgress}`}
                  />
                )}
                {workCounts.open > 0 && (
                  <div
                    className="bg-blue-400 transition-all"
                    style={{ width: `${(workCounts.open / totalWork) * 100}%` }}
                    aria-label={`Open: ${workCounts.open}`}
                  />
                )}
                {workCounts.resolved > 0 && (
                  <div
                    className="bg-[#1a3a2e] transition-all"
                    style={{
                      width: `${(workCounts.resolved / totalWork) * 100}%`,
                    }}
                    aria-label={`Resolved: ${workCounts.resolved}`}
                  />
                )}
                {workCounts.closed > 0 && (
                  <div
                    className="bg-slate-300 transition-all"
                    style={{
                      width: `${(workCounts.closed / totalWork) * 100}%`,
                    }}
                    aria-label={`Closed: ${workCounts.closed}`}
                  />
                )}
              </div>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                {[
                  {
                    label: "In progress",
                    count: workCounts.inProgress,
                    color: "bg-amber-400",
                  },
                  { label: "Open", count: workCounts.open, color: "bg-blue-400" },
                  {
                    label: "Resolved",
                    count: workCounts.resolved,
                    color: "bg-[#1a3a2e]",
                  },
                  {
                    label: "Closed",
                    count: workCounts.closed,
                    color: "bg-slate-300",
                  },
                ].map(({ label, count, color }) => (
                  <div key={label} className="flex items-center gap-1">
                    <div className={cn("h-2 w-2 rounded-full", color)} aria-hidden />
                    <span className="text-[10px] text-slate-500">
                      {label} ({count})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isLoading ? (
            [...Array(3)].map((_, i) => <SkeletonRow key={i} />)
          ) : workInProgress.length === 0 ? (
            <div className="py-10 text-center">
              <CheckCircle2 className="h-8 w-8 text-slate-200 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-500">
                No active work items
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Create an action from any complaint category.
              </p>
            </div>
          ) : (
            workInProgress.map((item) => (
              <WorkItemRow key={item.id} item={item} />
            ))
          )}
        </Widget>
      </div>

      {/* ── Watchlist overview ─────────────────────────────────────────────── */}
      <section aria-labelledby="watchlist-heading">
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 flex items-center justify-center rounded-lg bg-purple-50">
                <Bookmark className="h-3.5 w-3.5 text-purple-500" />
              </div>
              <div>
                <h2
                  id="watchlist-heading"
                  className="text-sm font-bold text-slate-900"
                >
                  Watchlist
                </h2>
                <p className="text-[10px] text-slate-400">
                  Observed public-feedback risk per company
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/companies"
                className="hidden sm:flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Plus className="h-3 w-3" /> Add company
              </Link>
              <Link
                href="/watchlist"
                className="flex items-center gap-0.5 text-xs font-medium text-[#1a3a2e] hover:underline"
              >
                View all <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="p-5">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[...Array(3)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : watchlist.length === 0 ? (
              <div className="py-12 text-center">
                <Building2 className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-600">
                  Your watchlist is empty
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Add a company to monitor complaint trends over time.
                </p>
                <Link
                  href="/companies"
                  className="inline-flex items-center gap-1.5 mt-4 rounded-lg bg-[#1a3a2e] px-4 py-2 text-xs font-semibold text-white hover:bg-[#243f35] transition-colors"
                >
                  <Search className="h-3.5 w-3.5" /> Find a company
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {watchlist.map((entry) => (
                  <WatchlistCard key={entry.company.id} entry={entry} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Two column: Decisions + Refresh status ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">

        {/* Recent triage decisions */}
        <Widget
          icon={BarChart2}
          iconBg="bg-slate-100"
          iconColor="text-slate-500"
          title="Recent triage decisions"
          subtitle="Audit Trail"
          href="/audit"
          hrefLabel="View audit trail"
        >
          {isLoading ? (
            [...Array(3)].map((_, i) => <SkeletonRow key={i} />)
          ) : recentDecisions.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-slate-500">
                No decisions logged yet.
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Log decisions from complaint category cards on any dashboard.
              </p>
            </div>
          ) : (
            recentDecisions.map((entry) => (
              <DecisionItem key={entry.id} entry={entry} />
            ))
          )}
        </Widget>

        {/* Data quality & refresh status */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
            <div className="h-7 w-7 flex items-center justify-center rounded-lg bg-[#1a3a2e]/5">
              <Activity className="h-3.5 w-3.5 text-[#1a3a2e]" />
            </div>
            <h2 className="text-sm font-bold text-slate-900">
              Data quality &amp; refresh status
            </h2>
          </div>

          <div className="px-5 py-4 space-y-3">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-10 rounded-xl bg-slate-100 animate-pulse"
                  />
                ))}
              </div>
            ) : refreshStatus ? (
              <div className="space-y-0">
                {[
                  {
                    label: "Last successful refresh",
                    value: formatDate(refreshStatus.lastRefreshAt),
                    color: "text-slate-800",
                  },
                  {
                    label: "Companies refreshed",
                    value: `${refreshStatus.total} of ${refreshStatus.total} successful`,
                    color: "text-[#1a3a2e]",
                  },
                  {
                    label: "Partial source coverage",
                    value: "0 companies",
                    color: "text-slate-600",
                  },
                  {
                    label: "Failed or stale",
                    value: "None",
                    color: "text-slate-600",
                  },
                ].map(({ label, value, color }, i, arr) => (
                  <div
                    key={label}
                    className={cn(
                      "flex items-center justify-between py-2.5",
                      i < arr.length - 1 && "border-b border-slate-100"
                    )}
                  >
                    <span className="text-xs text-slate-500">{label}</span>
                    <span className={cn("text-xs font-semibold", color)}>
                      {value}
                    </span>
                  </div>
                ))}

                {/* Source coverage */}
                <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Source coverage
                  </p>
                  <div className="grid grid-cols-2 gap-y-1.5 gap-x-3">
                    {[
                      "Play Store",
                      "App Store",
                      "Reddit",
                      "Twitter / X",
                    ].map((src) => (
                      <div key={src} className="flex items-center gap-1.5">
                        <div
                          className="h-1.5 w-1.5 rounded-full bg-[#1a3a2e] shrink-0"
                          aria-hidden
                        />
                        <span className="text-[11px] text-slate-600">{src}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm font-medium text-slate-500">
                  No refresh data
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Add companies to your watchlist to see refresh status.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import {
  Plus, ChevronDown, ChevronUp, Filter, Clock, CheckCircle2,
  Circle, XCircle, Loader2, MessageSquare,
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import CreateActionItemModal from "@/components/dashboard/CreateActionItemModal";
import type { ActionItem, ActionItemStatus } from "@/types";
import { cn, formatDate, timeAgo } from "@/lib/utils";

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_OPTIONS: ActionItemStatus[] = ["open", "in_progress", "resolved", "closed"];

const STATUS_META: Record<ActionItemStatus, { label: string; chip: string; icon: React.ElementType }> = {
  open:        { label: "Open",        chip: "status-chip-open",        icon: Circle },
  in_progress: { label: "In Progress", chip: "status-chip-in_progress", icon: Loader2 },
  resolved:    { label: "Resolved",    chip: "status-chip-resolved",    icon: CheckCircle2 },
  closed:      { label: "Closed",      chip: "status-chip-closed",      icon: XCircle },
};

function isOverdue(item: ActionItem): boolean {
  if (item.status === "resolved" || item.status === "closed") return false;
  return new Date(item.deadline) < new Date(new Date().toDateString());
}

// ─── Status chip ─────────────────────────────────────────────────────────────

function StatusChip({ status }: { status: ActionItemStatus }) {
  const { label, chip, icon: Icon } = STATUS_META[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold", chip)}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

// ─── Slack message preview (in expanded row) ──────────────────────────────────

function SlackPreview({ item }: { item: ActionItem }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2">
        <MessageSquare className="h-3.5 w-3.5 text-[#4A154B]" />
        <span className="text-xs font-medium text-slate-600">
          Mock Slack · {item.slack_channel}
        </span>
        <span className="ml-auto text-[10px] text-slate-400">
          {timeAgo(item.created_at)}
        </span>
      </div>
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-start gap-2">
          <div className="h-7 w-7 shrink-0 rounded bg-[#1a3a2e] flex items-center justify-center text-white text-[10px] font-bold mt-0.5">P</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">Priori Bot</span>
              <span className="text-[10px] text-slate-400">APP</span>
              <span className="text-[10px] text-slate-400">{formatDate(item.created_at)}</span>
            </div>
            {/* Block Kit preview */}
            <div className="mt-2 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs space-y-2 border-l-4 border-l-[#1a3a2e]">
              <p className="font-bold text-slate-800">📋 {item.category_name} — New Action Item</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-600">
                <div><span className="font-semibold">Company:</span> {item.company_name}</div>
                <div><span className="font-semibold">Severity:</span> {item.priority_score ?? "—"}/100</div>
                <div><span className="font-semibold">Owner:</span> {item.owner}</div>
                <div><span className="font-semibold">Deadline:</span> {item.deadline}</div>
              </div>
              <div className="text-slate-600">
                <span className="font-semibold">Steps:</span> {item.resolution_steps.split("\n")[0]}…
              </div>
              <button className="rounded bg-[#1a3a2e] px-3 py-1 text-white text-[11px] font-medium">
                View in Priori →
              </button>
            </div>
          </div>
        </div>

        {/* Resolution update if resolved */}
        {(item.status === "resolved" || item.status === "closed") && item.resolved_at && (
          <div className="flex items-start gap-2">
            <div className="h-7 w-7 shrink-0 rounded bg-[#1a3a2e] flex items-center justify-center text-white text-[10px] font-bold mt-0.5">P</div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">Priori Bot</span>
                <span className="text-[10px] text-slate-400">APP</span>
                <span className="text-[10px] text-slate-400">{formatDate(item.resolved_at)}</span>
              </div>
              <div className="mt-2 rounded-lg border border-[#1a3a2e]/15 bg-[#1a3a2e]/5 p-3 text-xs border-l-4 border-l-[#1a3a2e]">
                <p className="font-bold text-[#1a3a2e]">✓ {item.category_name} — Marked {item.status}</p>
                <p className="text-[#1a3a2e] mt-1">Status updated by team. View full history in Priori.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Expanded row ─────────────────────────────────────────────────────────────

function ExpandedRow({ item }: { item: ActionItem }) {
  const steps = item.resolution_steps.split("\n").filter(Boolean);

  return (
    <div className="grid grid-cols-2 gap-4 bg-slate-50 px-6 py-4 border-t border-slate-100">
      {/* Resolution steps */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2">Resolution Steps</p>
        <ol className="space-y-1.5">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#1a3a2e]/10 text-[9px] font-bold text-[#1a3a2e]">
                {i + 1}
              </span>
              {step.replace(/^\d+\.\s*/, "")}
            </li>
          ))}
        </ol>
        {item.resolved_at && (
          <p className="mt-3 text-[10px] text-[#1a3a2e]">
            ✓ Resolved on {formatDate(item.resolved_at)}
          </p>
        )}
      </div>

      {/* Slack preview */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2">Slack Notification History</p>
        <SlackPreview item={item} />
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function WorkflowsClient() {
  const { actionItems, actionItemsLoading, updateActionItemStatus } = useApp();

  const [filterCompany, setFilterCompany] = useState("all");
  const [filterStatus,  setFilterStatus]  = useState("all");
  const [filterOverdue, setFilterOverdue] = useState(false);
  const [expandedId, setExpandedId]       = useState<string | null>(null);
  const [showCreate, setShowCreate]       = useState(false);
  const [updatingId, setUpdatingId]       = useState<string | null>(null);

  const companies = useMemo(() => {
    const names = [...new Set(actionItems.map((i) => i.company_name ?? i.company_id))];
    return names;
  }, [actionItems]);

  const filtered = useMemo(() => {
    return actionItems.filter((item) => {
      if (filterCompany !== "all" && item.company_id !== filterCompany) return false;
      if (filterStatus  !== "all" && item.status       !== filterStatus)  return false;
      if (filterOverdue && !isOverdue(item)) return false;
      return true;
    });
  }, [actionItems, filterCompany, filterStatus, filterOverdue]);

  // Summary counts
  const openCount       = actionItems.filter((i) => i.status === "open").length;
  const inProgressCount = actionItems.filter((i) => i.status === "in_progress").length;
  const overdueCount    = actionItems.filter(isOverdue).length;

  async function handleStatusChange(id: string, status: ActionItemStatus) {
    setUpdatingId(id);
    try {
      await updateActionItemStatus(id, status);
    } finally {
      setUpdatingId(null);
    }
  }

  if (actionItemsLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-[#1a3a2e]" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Workflow Tracker</h1>
          <p className="mt-1 text-sm text-slate-500">
            Assigned work items created from complaint categories — owners, deadlines, and Slack assignments. Triage decisions (deprioritize / defer) are recorded separately in the Audit Trail.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-[#1a3a2e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#243f35] transition-colors"
        >
          <Plus className="h-4 w-4 shrink-0" /> New Action Item
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total",       value: actionItems.length, color: "text-slate-800" },
          { label: "Open",        value: openCount,          color: "text-blue-600"  },
          { label: "In Progress", value: inProgressCount,    color: "text-amber-600" },
          { label: "Overdue",     value: overdueCount,       color: "text-red-600"   },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-400">{label}</p>
            <p className={cn("text-2xl font-bold mt-0.5", color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <Filter className="h-4 w-4 text-slate-400 shrink-0" />

        <select
          value={filterCompany}
          onChange={(e) => setFilterCompany(e.target.value)}
          className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs focus:border-[#1a3a2e]/50 focus:outline-none"
        >
          <option value="all">All companies</option>
          {companies.map((name) => {
            const id = actionItems.find((i) => (i.company_name ?? i.company_id) === name)?.company_id;
            return <option key={id} value={id}>{name}</option>;
          })}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs focus:border-[#1a3a2e]/50 focus:outline-none"
        >
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_META[s].label}</option>
          ))}
        </select>

        <button
          onClick={() => setFilterOverdue(!filterOverdue)}
          className={cn(
            "flex items-center gap-1.5 h-8 rounded-lg border px-3 text-xs font-medium transition-colors",
            filterOverdue
              ? "border-red-300 bg-red-50 text-red-700"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          )}
        >
          <Clock className="h-3.5 w-3.5" />
          Overdue only
        </button>

        {(filterCompany !== "all" || filterStatus !== "all" || filterOverdue) && (
          <button
            onClick={() => { setFilterCompany("all"); setFilterStatus("all"); setFilterOverdue(false); }}
            className="text-xs text-slate-400 hover:text-slate-600 underline ml-1"
          >
            Clear filters
          </button>
        )}

        <span className="ml-auto text-xs text-slate-400">{filtered.length} items</span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
          <CheckCircle2 className="h-10 w-10 text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-600">No action items match your filters</p>
          <p className="text-xs text-slate-400 mt-1">
            Create one from the dashboard or change your filters.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_140px_120px_110px_140px_100px] gap-0 border-b border-slate-100 px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span>Category / Company</span>
            <span>Owner</span>
            <span>Deadline</span>
            <span>Status</span>
            <span>Change Status</span>
            <span className="text-right">Created</span>
          </div>

          {filtered.map((item) => {
            const overdue = isOverdue(item);
            const expanded = expandedId === item.id;

            return (
              <div key={item.id} className="border-b border-slate-100 last:border-0">
                {/* Main row */}
                <div
                  className={cn(
                    "grid grid-cols-[1fr_140px_120px_110px_140px_100px] gap-0 items-center px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors",
                    expanded && "bg-slate-50"
                  )}
                  onClick={() => setExpandedId(expanded ? null : item.id)}
                >
                  {/* Category + company */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0">
                      {expanded
                        ? <ChevronUp className="h-4 w-4 text-slate-400" />
                        : <ChevronDown className="h-4 w-4 text-slate-400" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-slate-900 truncate">{item.category_name}</p>
                        {overdue && (
                          <span className="shrink-0 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600 uppercase">
                            Overdue
                          </span>
                        )}
                        {item.priority_score != null && (
                          <span className={cn(
                            "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                            item.priority_score >= 70 ? "bg-red-100 text-red-700" :
                            item.priority_score >= 40 ? "bg-orange-100 text-orange-700" :
                            "bg-[#1a3a2e]/10 text-[#1a3a2e]"
                          )}>
                            {item.priority_score}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">{item.company_name ?? item.company_id}</p>
                    </div>
                  </div>

                  {/* Owner */}
                  <div className="text-sm text-slate-700 truncate">{item.owner}</div>

                  {/* Deadline */}
                  <div className={cn("text-xs", overdue ? "font-semibold text-red-600" : "text-slate-600")}>
                    <div className="flex items-center gap-1">
                      {overdue && <Clock className="h-3 w-3 shrink-0" />}
                      {item.deadline}
                    </div>
                  </div>

                  {/* Status chip */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <StatusChip status={item.status} />
                  </div>

                  {/* Change status */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <select
                      value={item.status}
                      disabled={updatingId === item.id}
                      onChange={(e) => handleStatusChange(item.id, e.target.value as ActionItemStatus)}
                      className="h-7 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs focus:border-[#1a3a2e]/50 focus:outline-none disabled:opacity-50"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{STATUS_META[s].label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Created */}
                  <div className="text-right text-xs text-slate-400">{timeAgo(item.created_at)}</div>
                </div>

                {/* Expanded content */}
                {expanded && <ExpandedRow item={item} />}
              </div>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <CreateActionItemModal
          onClose={() => setShowCreate(false)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}

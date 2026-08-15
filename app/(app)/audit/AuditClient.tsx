"use client";

import { useState, useMemo } from "react";
import {
  Download, Filter, Loader2, ScrollText,
  CheckCircle2, MinusCircle, Clock3,
} from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import type { AuditDecision, AuditEntry } from "@/types";
import { cn, formatDate } from "@/lib/utils";

// ─── Decision helpers ─────────────────────────────────────────────────────────

const DECISION_META: Record<AuditDecision, { label: string; chip: string; icon: React.ElementType }> = {
  acted_on:      { label: "Acted On",     chip: "bg-blue-100 text-blue-700",    icon: CheckCircle2 },
  deprioritized: { label: "Deprioritized",chip: "bg-slate-100 text-slate-600",  icon: MinusCircle  },
  deferred:      { label: "Deferred",     chip: "bg-amber-100 text-amber-700",  icon: Clock3       },
};

function DecisionChip({ decision }: { decision: AuditDecision }) {
  const { label, chip, icon: Icon } = DECISION_META[decision];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold", chip)}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

// ─── CSV export ───────────────────────────────────────────────────────────────

function exportCSV(entries: AuditEntry[]) {
  const headers = ["Date", "Company", "Category", "Decision", "Reasoning", "Decided By", "Score"];
  const rows = entries.map((e) => [
    formatDate(e.created_at),
    e.company_name ?? e.company_id,
    e.category_name,
    DECISION_META[e.decision].label,
    `"${e.reasoning.replace(/"/g, '""')}"`,
    e.decided_by,
    e.priority_score ?? "",
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href     = url;
  link.download = `priori-audit-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AuditClient() {
  const { auditEntries, auditLoading } = useApp();

  const [filterCompany,  setFilterCompany]  = useState("all");
  const [filterDecision, setFilterDecision] = useState("all");
  const [filterFrom,     setFilterFrom]     = useState("");
  const [filterTo,       setFilterTo]       = useState("");

  // ── Filter logic ─────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return auditEntries.filter((e) => {
      if (filterCompany  !== "all" && e.company_id !== filterCompany) return false;
      if (filterDecision !== "all" && e.decision   !== filterDecision) return false;
      if (filterFrom && new Date(e.created_at) < new Date(filterFrom)) return false;
      if (filterTo   && new Date(e.created_at) > new Date(filterTo + "T23:59:59")) return false;
      return true;
    });
  }, [auditEntries, filterCompany, filterDecision, filterFrom, filterTo]);

  // ── Summary stats (across ALL entries, not filtered) ─────────────────────

  const stats = useMemo(() => {
    const total = auditEntries.length;
    if (total === 0) return { total: 0, actedPct: 0, deprioritizedPct: 0, deferredPct: 0 };
    const acted        = auditEntries.filter((e) => e.decision === "acted_on").length;
    const deprioritized= auditEntries.filter((e) => e.decision === "deprioritized").length;
    const deferred     = auditEntries.filter((e) => e.decision === "deferred").length;
    return {
      total,
      actedPct:          Math.round((acted         / total) * 100),
      deprioritizedPct:  Math.round((deprioritized / total) * 100),
      deferredPct:       Math.round((deferred      / total) * 100),
    };
  }, [auditEntries]);

  // ── Unique companies for filter ───────────────────────────────────────────

  const companies = useMemo(() => {
    const seen = new Map<string, string>();
    auditEntries.forEach((e) => seen.set(e.company_id, e.company_name ?? e.company_id));
    return [...seen.entries()];
  }, [auditEntries]);

  if (auditLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit Trail</h1>
          <p className="mt-1 text-sm text-slate-500">
            Every decision logged — acted on, deprioritized, or deferred — with reasoning and
            timestamps.
          </p>
        </div>
        <button
          onClick={() => exportCSV(filtered)}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs text-slate-400">Total Decisions</p>
          <p className="text-2xl font-bold text-slate-800 mt-0.5">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
          <p className="text-xs text-blue-400">Acted On</p>
          <p className="text-2xl font-bold text-blue-700 mt-0.5">{stats.actedPct}%</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-xs text-slate-400">Deprioritized</p>
          <p className="text-2xl font-bold text-slate-600 mt-0.5">{stats.deprioritizedPct}%</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
          <p className="text-xs text-amber-400">Deferred</p>
          <p className="text-2xl font-bold text-amber-700 mt-0.5">{stats.deferredPct}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <Filter className="h-4 w-4 text-slate-400 shrink-0" />

        <select
          value={filterCompany}
          onChange={(e) => setFilterCompany(e.target.value)}
          className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs focus:border-indigo-400 focus:outline-none"
        >
          <option value="all">All companies</option>
          {companies.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>

        <select
          value={filterDecision}
          onChange={(e) => setFilterDecision(e.target.value)}
          className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs focus:border-indigo-400 focus:outline-none"
        >
          <option value="all">All decisions</option>
          {(Object.keys(DECISION_META) as AuditDecision[]).map((d) => (
            <option key={d} value={d}>{DECISION_META[d].label}</option>
          ))}
        </select>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400">From</span>
          <input
            type="date"
            value={filterFrom}
            onChange={(e) => setFilterFrom(e.target.value)}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs focus:border-indigo-400 focus:outline-none"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={filterTo}
            onChange={(e) => setFilterTo(e.target.value)}
            className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs focus:border-indigo-400 focus:outline-none"
          />
        </div>

        {(filterCompany !== "all" || filterDecision !== "all" || filterFrom || filterTo) && (
          <button
            onClick={() => { setFilterCompany("all"); setFilterDecision("all"); setFilterFrom(""); setFilterTo(""); }}
            className="text-xs text-slate-400 hover:text-slate-600 underline"
          >
            Clear
          </button>
        )}

        <span className="ml-auto text-xs text-slate-400">{filtered.length} entries</span>
      </div>

      {/* Feed */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
          <ScrollText className="h-10 w-10 text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-600">No decisions match your filters</p>
          <p className="text-xs text-slate-400 mt-1">
            Log decisions from complaint category cards on any dashboard page.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((entry) => (
            <AuditEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Audit entry card ─────────────────────────────────────────────────────────

function AuditEntryCard({ entry }: { entry: AuditEntry }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-4">
        {/* Company icon */}
        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-slate-100">
          {entry.company_icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={entry.company_icon} alt={entry.company_name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-400 bg-slate-50">
              {(entry.company_name ?? "?")[0]}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Top row */}
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-sm font-semibold text-slate-900">{entry.category_name}</span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">{entry.company_name ?? entry.company_id}</span>
            {entry.priority_score != null && (
              <span className={cn(
                "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                entry.priority_score >= 70 ? "bg-red-100 text-red-700" :
                entry.priority_score >= 40 ? "bg-orange-100 text-orange-700" :
                "bg-green-100 text-green-700"
              )}>
                {entry.priority_score}/100
              </span>
            )}
            <DecisionChip decision={entry.decision} />
          </div>

          {/* Reasoning */}
          <p className="text-sm text-slate-700 leading-relaxed">{entry.reasoning}</p>

          {/* Footer */}
          <div className="flex items-center gap-3 mt-3 text-xs text-slate-400">
            <span>By <strong className="text-slate-600">{entry.decided_by}</strong></span>
            <span>·</span>
            <span>{formatDate(entry.created_at)}</span>
          </div>
        </div>

        {/* Timestamp (right) */}
        <div className="shrink-0 text-right">
          <p className="text-[10px] text-slate-400">
            {new Date(entry.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
    </div>
  );
}

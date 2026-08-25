"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { useDisplayName } from "@/lib/hooks/useCurrentUser";
import type { ComplaintCategory, Company, AuditDecision } from "@/types";

interface Props {
  category: ComplaintCategory;
  company: Company;
  onClose: () => void;
  onSuccess: () => void;
}

const DECISIONS: { value: AuditDecision; label: string; description: string }[] = [
  { value: "acted_on",     label: "Act on it",     description: "Record your intent to act on this issue. Then use 'Create Action Item' on the complaint card to assign and track the actual fix." },
  { value: "deprioritized",label: "Deprioritize",  description: "Acknowledge the issue but don't work on it now — too low-impact or low-urgency." },
  { value: "deferred",     label: "Defer",         description: "Revisit later — blocked by other priorities or timing." },
];

export default function LogDecisionModal({ category, company, onClose, onSuccess }: Props) {
  const { logDecision } = useApp();
  const [decision, setDecision]   = useState<AuditDecision>("acted_on");
  const [reasoning, setReasoning] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const displayName = useDisplayName();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await logDecision({
        company_id:   company.id,
        company_name: company.name,
        company_icon: company.icon_url,
        category_name: category.name,
        decision,
        reasoning,
        decided_by:   displayName || "Unknown",
        priority_score: category.score,
      });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 400);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="animate-scrim fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="animate-modal w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Log Triage Decision</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {category.name} · {company.name} · Score {category.score}/100
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Context note */}
          <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-[11px] text-slate-500 leading-relaxed">
            This records a triage decision in the <span className="font-semibold text-slate-700">Audit Trail</span>. It does not create a work item — use <span className="font-semibold text-slate-700">Create Action Item</span> on the complaint card for that.
          </div>

          {/* Decision selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Decision *</label>
            <div className="space-y-2">
              {DECISIONS.map((d) => (
                <label
                  key={d.value}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-colors ${
                    decision === d.value
                      ? "border-[#1a3a2e]/50 bg-[#1a3a2e]/5"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="decision"
                    value={d.value}
                    checked={decision === d.value}
                    onChange={() => setDecision(d.value)}
                    className="mt-0.5 accent-[#1a3a2e]"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{d.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{d.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Reasoning */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Reasoning *</label>
            <textarea
              value={reasoning}
              onChange={(e) => setReasoning(e.target.value)}
              required
              rows={3}
              placeholder="Why this decision? What context should future reviewers know?"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm resize-none focus:border-[#1a3a2e]/50 focus:outline-none focus:ring-2 focus:ring-[#1a3a2e]/20"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-[#1a3a2e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#243f35] disabled:opacity-60 transition-colors"
            >
              {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {submitting ? "Logging…" : "Log Decision"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

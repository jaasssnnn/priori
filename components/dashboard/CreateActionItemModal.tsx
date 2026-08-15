"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useApp } from "@/providers/AppProvider";
import { buildAssignmentMessage, sendSlackMessage, getSlackConnection } from "@/lib/services/slack";
import { MOCK_COMPANIES } from "@/lib/mock/companies";
import type { ComplaintCategory, Company } from "@/types";

interface Props {
  /** Pre-filled from dashboard — omit to show manual entry fields */
  category?: ComplaintCategory;
  company?: Company;
  onClose: () => void;
  onSuccess: () => void;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export default function CreateActionItemModal({ category, company, onClose, onSuccess }: Props) {
  const { createActionItem } = useApp();

  // Manual-entry state (used only when category/company are not pre-filled)
  const [categoryName, setCategoryName] = useState(category?.name ?? "");
  const [selectedCompanyId, setSelectedCompanyId] = useState(company?.id ?? MOCK_COMPANIES[0].id);

  const [owner, setOwner]           = useState("");
  const [deadline, setDeadline]     = useState("");
  const [steps, setSteps]           = useState("");
  const [channel, setChannel]       = useState("#payments-ops");
  const [submitting, setSubmitting] = useState(false);
  const [slackSent, setSlackSent]   = useState(false);

  const resolvedCompany = company ?? MOCK_COMPANIES.find((c) => c.id === selectedCompanyId)!;
  const resolvedCategory = categoryName;
  const preFilled = Boolean(category && company);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const item = await createActionItem({
        company_id: resolvedCompany.id,
        company_name: resolvedCompany.name,
        company_icon: resolvedCompany.icon_url,
        user_id: "demo-user",
        category_name: resolvedCategory,
        owner,
        deadline,
        resolution_steps: steps,
        slack_channel: channel,
        priority_score: category?.score,
      });

      const connection = await getSlackConnection();
      const message = buildAssignmentMessage(item, BASE_URL);
      await sendSlackMessage(channel, message, connection);
      setSlackSent(true);

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 800);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Create Action Item</h2>
            {preFilled && (
              <p className="text-xs text-slate-500 mt-0.5">
                {category!.name} · {company!.name} · Score {category!.score}/100
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Company + category (manual mode only) */}
          {!preFilled && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Company *</label>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  required
                  className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white"
                >
                  {MOCK_COMPANIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Complaint Category *</label>
                <input
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                  placeholder="e.g. Payment Failures"
                  className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
          )}

          {/* Pre-filled category (read-only) */}
          {preFilled && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Complaint Category</label>
              <input
                value={category!.name}
                readOnly
                className="w-full h-9 rounded-lg border border-slate-100 bg-slate-50 px-3 text-sm text-slate-500"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Owner *</label>
              <input
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                required
                placeholder="e.g. Riya Sharma"
                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Deadline *</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                min={new Date().toISOString().split("T")[0]}
                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Resolution Steps *</label>
            <textarea
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              required
              rows={4}
              placeholder="1. Investigate root cause&#10;2. Assign to engineering&#10;3. Deploy fix by deadline"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm resize-none focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Slack Channel</label>
            <input
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              placeholder="#channel-name"
              className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm font-mono focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Owner will be notified via Slack (mock in demo mode).
            </p>
          </div>

          {slackSent && (
            <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-xs text-green-700">
              ✓ Action item created · Mock Slack message sent to {channel}
            </div>
          )}

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
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {submitting ? "Creating…" : "Create & Notify"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

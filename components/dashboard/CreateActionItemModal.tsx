"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { CloseIcon } from "@/components/icons";
import { useApp } from "@/providers/AppProvider";
import {
  buildAssignmentMessage,
  sendSlackMessage,
  getSlackConnection,
  getSlackChannels,
} from "@/lib/services/slack";
import type { ComplaintCategory, Company, SlackChannel, SlackConnection } from "@/types";

interface Props {
  /** Pre-filled from dashboard — omit to show manual entry fields */
  category?: ComplaintCategory;
  company?: Company;
  onClose: () => void;
  onSuccess: () => void;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export default function CreateActionItemModal({ category, company, onClose, onSuccess }: Props) {
  const { createActionItem, watchlist } = useApp();

  // Companies come from the user's watchlist, not a hardcoded list
  const watchlistCompanies = watchlist.map((w) => w.company);

  const [categoryName, setCategoryName]         = useState(category?.name ?? "");
  const [selectedCompanyId, setSelectedCompanyId] = useState(
    company?.id ?? watchlistCompanies[0]?.id ?? ""
  );

  const [owner, setOwner]           = useState("");
  const [deadline, setDeadline]     = useState("");
  const [steps, setSteps]           = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]         = useState<{ ok: boolean; text: string } | null>(null);

  // Slack state — loaded live from the connected workspace
  const [slackConn, setSlackConn]   = useState<SlackConnection | null>(null);
  const [channels, setChannels]     = useState<SlackChannel[]>([]);
  const [channelId, setChannelId]   = useState("");
  const [slackLoading, setSlackLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const conn = await getSlackConnection();
      if (cancelled) return;
      setSlackConn(conn);
      if (conn) {
        const chs = await getSlackChannels();
        if (cancelled) return;
        setChannels(chs);
        // Prefer the saved default channel, else the first available
        const def = chs.find((c) => c.id === conn.default_channel || c.name === conn.default_channel);
        setChannelId(def?.id ?? chs[0]?.id ?? "");
      }
      setSlackLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const preFilled       = Boolean(category && company);
  const resolvedCompany = company ?? watchlistCompanies.find((c) => c.id === selectedCompanyId);
  const slackConnected  = Boolean(slackConn);
  const selectedChannel = channels.find((c) => c.id === channelId);

  // In manual mode we can only create items for watched companies
  const noWatchlist = !preFilled && watchlistCompanies.length === 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resolvedCompany) return;
    setSubmitting(true);
    setResult(null);
    try {
      const item = await createActionItem({
        company_id:       resolvedCompany.id,
        company_name:     resolvedCompany.name,
        company_icon:     resolvedCompany.icon_url,
        user_id:          "demo-user",
        category_name:    categoryName,
        owner,
        deadline,
        resolution_steps: steps,
        slack_channel:    selectedChannel ? `#${selectedChannel.name}` : "",
        priority_score:   category?.score,
      });

      // Notify Slack only when a real channel is available
      if (slackConnected && selectedChannel) {
        const message = buildAssignmentMessage(item, BASE_URL);
        const res = await sendSlackMessage(selectedChannel.id, message);
        const failText =
          res.error === "not_in_private_channel"
            ? `Action item created, but #${selectedChannel.name} is private. Invite the Priori bot with "/invite @Priori" in that channel, then try again.`
            : `Action item created, but the Slack message failed (${res.error ?? "unknown"}).`;
        setResult(
          res.ok
            ? { ok: true, text: `Action item created and posted to #${selectedChannel.name}.` }
            : { ok: false, text: failText }
        );
      } else {
        setResult({ ok: true, text: "Action item created. Connect Slack to notify a channel." });
      }

      setTimeout(() => { onSuccess(); onClose(); }, 1100);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="animate-scrim fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="animate-modal w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
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
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Empty watchlist notice (manual mode) */}
          {noWatchlist && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              You have no companies on your watchlist yet. {" "}
              <Link href="/watchlist" className="font-semibold underline">Add a company</Link> to create action items for it.
            </div>
          )}

          {/* Company + category (manual mode only) */}
          {!preFilled && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Company *</label>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  required
                  disabled={noWatchlist}
                  className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:border-[#1a3a2e]/50 focus:outline-none focus:ring-2 focus:ring-[#1a3a2e]/20 bg-white disabled:bg-slate-50 disabled:text-slate-400"
                >
                  {watchlistCompanies.length === 0 ? (
                    <option value="">No watched companies</option>
                  ) : (
                    watchlistCompanies.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Complaint Category *</label>
                <input
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                  placeholder="e.g. Payment Failures"
                  className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:border-[#1a3a2e]/50 focus:outline-none focus:ring-2 focus:ring-[#1a3a2e]/20"
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
                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:border-[#1a3a2e]/50 focus:outline-none focus:ring-2 focus:ring-[#1a3a2e]/20"
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
                className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:border-[#1a3a2e]/50 focus:outline-none focus:ring-2 focus:ring-[#1a3a2e]/20"
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
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm resize-none focus:border-[#1a3a2e]/50 focus:outline-none focus:ring-2 focus:ring-[#1a3a2e]/20"
            />
          </div>

          {/* Slack channel — real channels when connected */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Slack channel</label>
            {slackLoading ? (
              <div className="flex h-9 items-center gap-2 text-xs text-slate-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking Slack connection…
              </div>
            ) : !slackConnected ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                Slack is not connected.{" "}
                <Link href="/settings" className="font-semibold text-[#1a3a2e] underline">
                  Connect it in Settings
                </Link>{" "}
                to post this to a channel. You can still create the item without notifying.
              </div>
            ) : channels.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                No channels found. Invite the Priori bot to a channel in Slack, then reopen this.
              </div>
            ) : (
              <>
                <select
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm bg-white focus:border-[#1a3a2e]/50 focus:outline-none focus:ring-2 focus:ring-[#1a3a2e]/20"
                >
                  {channels.map((c) => (
                    <option key={c.id} value={c.id}>#{c.name}</option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Connected to {slackConn?.team_name || "your workspace"}. The bot must be a member of the channel.
                </p>
              </>
            )}
          </div>

          {result && (
            <div className={
              result.ok
                ? "rounded-lg bg-[#1a3a2e]/5 border border-[#1a3a2e]/20 p-3 text-xs text-[#1a3a2e]"
                : "rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800"
            }>
              {result.text}
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
              disabled={submitting || noWatchlist}
              className="flex items-center gap-2 rounded-lg bg-[#1a3a2e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#243f35] disabled:opacity-60 transition-colors"
            >
              {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {submitting
                ? "Creating…"
                : slackConnected && selectedChannel
                  ? "Create & Notify"
                  : "Create Action Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

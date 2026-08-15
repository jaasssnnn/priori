"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare, Mail, Bell, Trash2, CheckCircle2,
  AlertCircle, ChevronRight, Loader2, Eye,
} from "lucide-react";
import { getSlackConnection, buildAssignmentMessage } from "@/lib/services/slack";
import { MOCK_ACTION_ITEMS } from "@/lib/mock/workflows";
import { useApp } from "@/providers/AppProvider";
import type { SlackConnection, SlackMessage } from "@/types";
import { cn } from "@/lib/utils";

// ─── Slack Block Kit renderer ──────────────────────────────────────────────────

function SlackMessagePreview({ message }: { message: SlackMessage }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-[#1a1d21] overflow-hidden text-white text-xs">
      <div className="flex items-center gap-2 bg-[#19171D] px-4 py-2.5 border-b border-white/5">
        <div className="h-2 w-2 rounded-full bg-[#4A154B]" />
        <span className="text-[11px] font-medium text-slate-300">Priori Bot</span>
        <span className="rounded bg-[#4A154B]/30 px-1.5 py-0.5 text-[9px] font-semibold text-violet-300">APP</span>
      </div>
      <div className="p-4">
        <p className="text-slate-400 text-[10px] mb-3">{message.text}</p>
        {message.blocks.map((block, i) => {
          if (block.type === "header") {
            return (
              <p key={i} className="font-bold text-sm text-white mb-2">{block.text?.text}</p>
            );
          }
          if (block.type === "divider") {
            return <div key={i} className="h-px bg-white/10 my-2" />;
          }
          if (block.type === "section" && block.fields) {
            return (
              <div key={i} className="grid grid-cols-2 gap-x-6 gap-y-1.5 mb-3">
                {block.fields.map((f, j) => {
                  const [label, val] = f.text.split("\n");
                  return (
                    <div key={j}>
                      <p className="text-[10px] text-slate-500">{label?.replace(/\*/g, "")}</p>
                      <p className="text-xs text-slate-200">{val}</p>
                    </div>
                  );
                })}
              </div>
            );
          }
          if (block.type === "section" && block.text) {
            return (
              <p key={i} className="text-xs text-slate-300 mb-3 leading-relaxed">
                {block.text.text.replace(/\*([^*]+)\*/g, "$1")}
              </p>
            );
          }
          if (block.type === "actions") {
            return (
              <div key={i} className="flex gap-2">
                {"elements" in block && block.elements?.map((el, j) => (
                  <span
                    key={j}
                    className={cn(
                      "rounded px-3 py-1.5 text-[11px] font-semibold cursor-default",
                      el.style === "primary" ? "bg-[#007a5a] text-white" : "bg-white/10 text-slate-200"
                    )}
                  >
                    {el.text?.text}
                  </span>
                ))}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}

// ─── Section card ────────────────────────────────────────────────────────────

function Section({ title, description, icon: Icon, children }: {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50">
          <Icon className="h-4.5 w-4.5 text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="text-xs text-slate-400">{description}</p>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, label }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-slate-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-5 w-9 rounded-full transition-colors duration-200",
          checked ? "bg-indigo-600" : "bg-slate-200"
        )}
      >
        <span className={cn(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200",
          checked ? "translate-x-4" : "translate-x-0.5"
        )} />
      </button>
    </label>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export default function SettingsClient() {
  const { watchlist, removeFromWatchlist } = useApp();

  // Slack state
  const [slackConn, setSlackConn]         = useState<SlackConnection | null>(null);
  const [slackLoading, setSlackLoading]   = useState(true);
  const [previewMsg, setPreviewMsg]       = useState<SlackMessage | null>(null);
  const [showPreview, setShowPreview]     = useState(false);
  const [defaultChannel, setDefaultChannel] = useState("C0MOCK0001");

  // Email state
  const [emailEnabled, setEmailEnabled]   = useState(true);
  const [emailAddr, setEmailAddr]         = useState("jasonabhishek897@gmail.com");
  const [frequency, setFrequency]         = useState<"instant" | "daily_digest">("instant");

  // Notification toggles
  const [spikeAlerts, setSpikeAlerts]     = useState(true);
  const [trendAlerts, setTrendAlerts]     = useState(true);
  const [overdueNudges, setOverdueNudges] = useState(true);

  const [saved, setSaved]   = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    import("@/lib/services/slack").then(({ getSlackConnection }) =>
      getSlackConnection().then((c) => { setSlackConn(c); setSlackLoading(false); })
    );
  }, []);

  function handlePreview() {
    const sampleItem = MOCK_ACTION_ITEMS[0];
    const msg = buildAssignmentMessage(sampleItem, BASE_URL);
    setPreviewMsg(msg);
    setShowPreview(true);
  }

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage Slack connection, notification preferences, watchlist, and account settings.
        </p>
      </div>

      {/* ── Slack Integration ─────────────────────────────────────────── */}
      <Section
        title="Slack Integration"
        description="Connect your workspace to receive alerts and push action item assignments"
        icon={MessageSquare}
      >
        {slackLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : slackConn ? (
          <div className="space-y-4">
            {/* Connected status */}
            <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 p-4">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800">Connected to {slackConn.team_name}</p>
                <p className="text-xs text-green-600 mt-0.5">Workspace ID: {slackConn.team_id}</p>
              </div>
              <button className="ml-auto text-xs text-red-500 hover:underline">Disconnect</button>
            </div>

            {/* Default channel picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Default alert channel
              </label>
              <select
                value={defaultChannel}
                onChange={(e) => setDefaultChannel(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-indigo-400 focus:outline-none"
              >
                {slackConn.channels?.map((ch) => (
                  <option key={ch.id} value={ch.id}>#{ch.name}</option>
                ))}
              </select>
            </div>

            {/* Preview button */}
            <button
              onClick={handlePreview}
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Eye className="h-4 w-4" /> Preview Slack Message
            </button>

            {/* Slack message preview */}
            {showPreview && previewMsg && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-500">Action Item Assignment — Block Kit Preview</p>
                  <button onClick={() => setShowPreview(false)} className="text-xs text-slate-400 hover:text-slate-600">
                    Hide
                  </button>
                </div>
                <SlackMessagePreview message={previewMsg} />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-200 p-4">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Slack not connected</p>
                <p className="text-xs text-amber-600 mt-0.5">Connect your workspace to receive alerts and push assignments.</p>
              </div>
            </div>
            <button
              onClick={() => alert("OAuth flow — wired in Phase 6 when Slack app credentials are configured.")}
              className="flex items-center gap-2 rounded-xl bg-[#4A154B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3b1039] transition-colors"
            >
              <MessageSquare className="h-4 w-4" /> Connect Slack Workspace
            </button>
          </div>
        )}
      </Section>

      {/* ── Email Notifications ───────────────────────────────────────── */}
      <Section
        title="Email Notifications"
        description="Configure alert delivery to your email address"
        icon={Mail}
      >
        <div className="space-y-4">
          <Toggle
            checked={emailEnabled}
            onChange={setEmailEnabled}
            label="Email notifications enabled"
          />

          {emailEnabled && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email address
                </label>
                <input
                  type="email"
                  value={emailAddr}
                  onChange={(e) => setEmailAddr(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Alert frequency
                </label>
                <div className="flex gap-3">
                  {(["instant", "daily_digest"] as const).map((f) => (
                    <label key={f} className={cn(
                      "flex-1 flex items-center gap-2 rounded-xl border px-4 py-3 cursor-pointer transition-colors",
                      frequency === f ? "border-indigo-400 bg-indigo-50" : "border-slate-200 hover:border-slate-300"
                    )}>
                      <input
                        type="radio"
                        checked={frequency === f}
                        onChange={() => setFrequency(f)}
                        className="accent-indigo-600"
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-800 capitalize">
                          {f === "instant" ? "Instant" : "Daily digest"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {f === "instant" ? "As soon as spike is detected" : "One summary email per day"}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </Section>

      {/* ── Alert Preferences ─────────────────────────────────────────── */}
      <Section
        title="Alert Preferences"
        description="Choose which types of alerts you want to receive"
        icon={Bell}
      >
        <div className="space-y-4">
          <Toggle checked={spikeAlerts}    onChange={setSpikeAlerts}    label="Complaint volume spikes (≥30% WoW)" />
          <Toggle checked={trendAlerts}    onChange={setTrendAlerts}    label="New complaint patterns detected"     />
          <Toggle checked={overdueNudges}  onChange={setOverdueNudges}  label="Overdue action item nudges"          />
        </div>
      </Section>

      {/* ── Watchlist Management ──────────────────────────────────────── */}
      <Section
        title="Watchlist Management"
        description={`${watchlist.length} companies being tracked`}
        icon={ChevronRight}
      >
        {watchlist.length === 0 ? (
          <p className="text-sm text-slate-400">No companies on your watchlist yet.</p>
        ) : (
          <ul className="space-y-2">
            {watchlist.map(({ company }) => (
              <li key={company.id} className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3">
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-slate-100">
                  {company.icon_url
                    ? <img src={company.icon_url} alt={company.name} className="h-full w-full object-cover" />
                    : <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-400 bg-slate-50">{company.name[0]}</div>
                  }
                </div>
                <span className="text-sm font-medium text-slate-800 flex-1">{company.name}</span>
                <button
                  onClick={() => removeFromWatchlist(company.id)}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* ── Save button ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pb-4">
        {saved && (
          <div className="flex items-center gap-1.5 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" /> Settings saved
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
        >
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

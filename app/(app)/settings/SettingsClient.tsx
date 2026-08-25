"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import {
  MessageSquare, Mail, Bell, Trash2, CheckCircle2,
  AlertCircle, ChevronRight, Loader2, Eye, XCircle, LogOut,
  GitFork, Monitor,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { buildAssignmentMessage } from "@/lib/services/slack";
import { MOCK_ACTION_ITEMS } from "@/lib/mock/workflows";
import { useApp } from "@/providers/AppProvider";
import { GITHUB_REPO_URL } from "@/lib/config";
import type { SlackConnection, SlackChannel, SlackMessage } from "@/types";
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
      <div className="p-4 space-y-2">
        <p className="text-slate-400 text-[10px] mb-3">{message.text}</p>
        {message.blocks.map((block, i) => {
          if (block.type === "header")
            return <p key={i} className="font-bold text-sm text-white mb-2">{block.text?.text}</p>;
          if (block.type === "divider")
            return <div key={i} className="h-px bg-white/10 my-2" />;
          if (block.type === "section" && "fields" in block && block.fields) {
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
          if (block.type === "section" && "text" in block && block.text)
            return <p key={i} className="text-xs text-slate-300 mb-3 leading-relaxed">{block.text.text.replace(/\*([^*]+)\*/g, "$1")}</p>;
          if (block.type === "actions" && "elements" in block)
            return (
              <div key={i} className="flex gap-2">
                {block.elements?.map((el, j) => (
                  <span key={j} className={cn("rounded px-3 py-1.5 text-[11px] font-semibold cursor-default", el.style === "primary" ? "bg-[#007a5a] text-white" : "bg-white/10 text-slate-200")}>
                    {el.text?.text}
                  </span>
                ))}
              </div>
            );
          return null;
        })}
      </div>
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function Section({ title, description, icon: Icon, children }: {
  title: string; description: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1a3a2e]/5">
          <Icon className="h-4.5 w-4.5 text-[#1a3a2e]" />
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

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-slate-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1a3a2e]/40",
          checked ? "bg-[#1a3a2e]" : "bg-slate-200"
        )}
      >
        <span
          className={cn(
            "h-5 w-5 rounded-full bg-white transition-transform duration-200",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </label>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

export default function SettingsClient() {
  const router = useRouter();
  const { watchlist, removeFromWatchlist } = useApp();
  const searchParams = useSearchParams();
  const slackStatus  = searchParams.get("slack"); // "connected" | "error" | null

  // Slack state
  const [slackConn, setSlackConn]           = useState<SlackConnection | null>(null);
  const [slackLoading, setSlackLoading]     = useState(true);
  const [channels, setChannels]             = useState<SlackChannel[]>([]);
  const [defaultChannel, setDefaultChannel] = useState("");
  const [previewMsg, setPreviewMsg]         = useState<SlackMessage | null>(null);
  const [showPreview, setShowPreview]       = useState(false);
  const [disconnecting, setDisconnecting]   = useState(false);
  const [savingChannel, setSavingChannel]   = useState(false);

  // Email state
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [emailAddr, setEmailAddr]       = useState("jasonabhishek897@gmail.com");
  const [frequency, setFrequency]       = useState<"instant" | "daily_digest">("instant");

  // Notification toggles
  const [spikeAlerts, setSpikeAlerts]   = useState(true);
  const [trendAlerts, setTrendAlerts]   = useState(true);
  const [overdueNudges, setOverdueNudges] = useState(true);

  const [saved, setSaved]   = useState(false);
  const [saving, setSaving] = useState(false);

  // Load Slack connection
  useEffect(() => {
    fetch("/api/slack/connection")
      .then((r) => r.json())
      .then((conn: SlackConnection | null) => {
        setSlackConn(conn);
        setSlackLoading(false);
        if (conn) {
          setDefaultChannel(conn.default_channel ?? "");
          // Fetch channel list
          fetch("/api/slack/channels")
            .then((r) => r.json())
            .then((chs: SlackChannel[]) => setChannels(chs));
        }
      })
      .catch(() => setSlackLoading(false));
  }, [slackStatus]); // re-fetch after OAuth redirect

  function handlePreview() {
    const sampleItem = MOCK_ACTION_ITEMS[0];
    setPreviewMsg(buildAssignmentMessage(sampleItem, BASE_URL));
    setShowPreview(true);
  }

  async function handleDisconnect() {
    setDisconnecting(true);
    await fetch("/api/slack/connection", { method: "DELETE" });
    setSlackConn(null);
    setChannels([]);
    setDisconnecting(false);
  }

  async function handleSaveChannel(channelId: string) {
    setDefaultChannel(channelId);
    setSavingChannel(true);
    await fetch("/api/slack/connection", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ default_channel: channelId }),
    });
    setSavingChannel(false);
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

      {/* OAuth result banner */}
      {slackStatus === "connected" && (
        <div className="flex items-center gap-3 rounded-xl bg-[#1a3a2e]/5 border border-[#1a3a2e]/20 p-4">
          <CheckCircle2 className="h-5 w-5 text-[#1a3a2e] shrink-0" />
          <p className="text-sm font-semibold text-[#1a3a2e]">Slack workspace connected successfully!</p>
        </div>
      )}
      {slackStatus === "error" && (
        <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 p-4">
          <XCircle className="h-5 w-5 text-red-500 shrink-0" />
          <p className="text-sm font-semibold text-red-700">Slack connection failed — please try again.</p>
        </div>
      )}

      {/* ── Slack Integration ─────────────────────────────────────────── */}
      <Section title="Slack Integration" description="Connect your workspace to receive alerts and push action item assignments" icon={MessageSquare}>
        {slackLoading ? (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : slackConn ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-[#1a3a2e]/5 border border-[#1a3a2e]/20 p-4">
              <CheckCircle2 className="h-5 w-5 text-[#1a3a2e] shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#1a3a2e]">Connected to {slackConn.team_name}</p>
                <p className="text-xs text-[#1a3a2e] mt-0.5">Workspace ID: {slackConn.team_id}</p>
              </div>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="ml-auto text-xs text-red-500 hover:underline disabled:opacity-50"
              >
                {disconnecting ? "Disconnecting…" : "Disconnect"}
              </button>
            </div>

            {/* Channel picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Default alert channel</label>
              {channels.length > 0 ? (
                <div className="flex items-center gap-2">
                  <select
                    value={defaultChannel}
                    onChange={(e) => handleSaveChannel(e.target.value)}
                    className="flex-1 h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-[#1a3a2e]/50 focus:outline-none"
                  >
                    <option value="">Select a channel…</option>
                    {channels.map((ch) => (
                      <option key={ch.id} value={ch.id}>#{ch.name}</option>
                    ))}
                  </select>
                  {savingChannel && <Loader2 className="h-4 w-4 animate-spin text-slate-400 shrink-0" />}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No channels found — ensure your Slack app has the channels:read scope.</p>
              )}
            </div>

            {/* Preview */}
            <button onClick={handlePreview} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <Eye className="h-4 w-4" /> Preview Slack Message
            </button>
            {showPreview && previewMsg && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-slate-500">Action Item Assignment — Block Kit Preview</p>
                  <button onClick={() => setShowPreview(false)} className="text-xs text-slate-400 hover:text-slate-600">Hide</button>
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
            <a
              href="/api/slack/auth"
              className="inline-flex items-center gap-2 rounded-xl bg-[#4A154B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#3b1039] transition-colors"
            >
              <MessageSquare className="h-4 w-4" /> Connect Slack Workspace
            </a>
          </div>
        )}
      </Section>

      {/* ── Email Notifications ───────────────────────────────────────── */}
      <Section title="Email Notifications" description="Configure alert delivery to your email address" icon={Mail}>
        <div className="space-y-4">
          <Toggle checked={emailEnabled} onChange={setEmailEnabled} label="Email notifications enabled" />
          {emailEnabled && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email address</label>
                <input type="email" value={emailAddr} onChange={(e) => setEmailAddr(e.target.value)}
                  className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm focus:border-[#1a3a2e]/50 focus:outline-none focus:ring-2 focus:ring-[#1a3a2e]/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Alert frequency</label>
                <div className="flex gap-3">
                  {(["instant", "daily_digest"] as const).map((f) => (
                    <label key={f} className={cn("flex-1 flex items-center gap-2 rounded-xl border px-4 py-3 cursor-pointer transition-colors",
                      frequency === f ? "border-[#1a3a2e]/50 bg-[#1a3a2e]/5" : "border-slate-200 hover:border-slate-300")}>
                      <input type="radio" checked={frequency === f} onChange={() => setFrequency(f)} className="accent-[#1a3a2e]" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{f === "instant" ? "Instant" : "Daily digest"}</p>
                        <p className="text-xs text-slate-400">{f === "instant" ? "As soon as spike is detected" : "One summary email per day"}</p>
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
      <Section title="Alert Preferences" description="Choose which types of alerts you want to receive" icon={Bell}>
        <div className="space-y-4">
          <Toggle checked={spikeAlerts}   onChange={setSpikeAlerts}   label="Complaint volume spikes (≥30% WoW)" />
          <Toggle checked={trendAlerts}   onChange={setTrendAlerts}   label="New complaint patterns detected" />
          <Toggle checked={overdueNudges} onChange={setOverdueNudges} label="Overdue action item nudges" />
        </div>
      </Section>

      {/* ── Watchlist Management ──────────────────────────────────────── */}
      <Section title="Watchlist Management" description={`${watchlist.length} companies being tracked`} icon={ChevronRight}>
        {watchlist.length === 0 ? (
          <p className="text-sm text-slate-400">No companies on your watchlist yet.</p>
        ) : (
          <ul className="space-y-2">
            {watchlist.map(({ company }) => (
              <li key={company.id} className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3">
                <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-slate-100">
                  {company.icon_url
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={company.icon_url} alt={company.name} className="h-full w-full object-cover" />
                    : <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-400 bg-slate-50">{company.name[0]}</div>
                  }
                </div>
                <span className="text-sm font-medium text-slate-800 flex-1">{company.name}</span>
                <button onClick={() => removeFromWatchlist(company.id)}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors">
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* ── Open Source / Local Scraping ────────────────────────────── */}
      <Section title="Data Sources & Open Source" description="What gets scraped depends on how you run Priori" icon={GitFork}>
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#1a3a2e]" /> Works on Vercel (cloud)
            </p>
            <p className="text-xs text-slate-500">Google Play Store, Apple App Store, Twitter/X (with API key)</p>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Monitor className="h-3.5 w-3.5 text-amber-600" /> Needs local setup (OpenCLI)
            </p>
            <p className="text-xs text-slate-500">Reddit, Instagram, YouTube, Facebook — clone the repo, install OpenCLI, and run <code className="rounded bg-slate-200 px-1 font-mono text-[10px]">npm run dev</code> locally.</p>
          </div>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors"
          >
            <GitFork className="h-4 w-4" />
            View Priori on GitHub
          </a>
        </div>
      </Section>

      {/* ── Save + Sign out ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 pb-4">
        <button
          onClick={async () => {
            await createClient().auth.signOut();
            router.push("/login");
          }}
          className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>

        <div className="flex items-center gap-3">
          {saved && <div className="flex items-center gap-1.5 text-sm text-[#1a3a2e]"><CheckCircle2 className="h-4 w-4" /> Settings saved</div>}
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-[#1a3a2e] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#243f35] disabled:opacity-60 transition-colors">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {saving ? "Saving…" : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}

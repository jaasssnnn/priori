"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Copy, Download, Check, RefreshCw } from "lucide-react";
import { CloseIcon } from "@/components/icons";
import {
  buildIssueMemoMessage,
  getSlackConnection,
  getSlackChannels,
  sendSlackMessage,
} from "@/lib/services/slack";
import { getCachedMemo, setCachedMemo } from "@/lib/localStore";
import { detectIndustry } from "@/lib/industries";
import type { ComplaintCategory, Company, IssueMemo, SlackChannel, SlackConnection } from "@/types";

interface Props {
  category: ComplaintCategory;
  company: Company;
  onClose: () => void;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

const SECTIONS: { key: keyof IssueMemo; label: string }[] = [
  { key: "introduction",    label: "Introduction" },
  { key: "objectives",      label: "Objectives" },
  { key: "hypothesis",      label: "Hypothesis" },
  { key: "current_state",   label: "Current state" },
  { key: "lessons_learned", label: "Lessons learned" },
  { key: "strategy",        label: "Strategy" },
];

function memoToMarkdown(memo: IssueMemo, category: ComplaintCategory, company: Company): string {
  const cites = category.quotes.slice(0, 3)
    .map((q) => `> "${q.text}" — ${q.source}${q.rating != null ? `, ${q.rating}★` : ""}`)
    .join("\n");
  return [
    `# Issue Memo — ${company.name}`,
    `**Theme:** ${category.name} · Priority ${category.score}/100 · ${category.complaint_count} complaints`,
    "",
    ...SECTIONS.map((s) => `## ${s.label}\n${memo[s.key]}`),
    cites ? `## What users say\n${cites}` : "",
  ].filter(Boolean).join("\n\n");
}

export default function IssueMemoModal({ category, company, onClose }: Props) {
  const [memo, setMemo]       = useState<IssueMemo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const [copied, setCopied]   = useState(false);

  // Slack
  const [slackConn, setSlackConn] = useState<SlackConnection | null>(null);
  const [channels, setChannels]   = useState<SlackChannel[]>([]);
  const [channelId, setChannelId] = useState("");
  const [sharing, setSharing]     = useState(false);
  const [shareResult, setShareResult] = useState<{ ok: boolean; text: string } | null>(null);

  const industry = useMemo(
    () => company.industry ?? detectIndustry(company.app_id, company.name),
    [company],
  );

  async function generate() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/memo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: company.name, category, industry }),
      });
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as IssueMemo;
      setMemo(data);
      setCachedMemo(company.id, category.name, data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  // On open: use the saved memo if present, else generate
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const cached = getCachedMemo(company.id, category.name);
      if (cached) {
        setMemo(cached);
        setLoading(false);
      } else {
        generate();
      }
    });
    // Load Slack connection + channels in the background
    (async () => {
      const conn = await getSlackConnection();
      setSlackConn(conn);
      if (conn) {
        const chs = await getSlackChannels();
        setChannels(chs);
        const def = chs.find((c) => c.id === conn.default_channel || c.name === conn.default_channel);
        setChannelId(def?.id ?? chs[0]?.id ?? "");
      }
    })();
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateField(key: keyof IssueMemo, value: string) {
    if (!memo) return;
    const next = { ...memo, [key]: value };
    setMemo(next);
    setCachedMemo(company.id, category.name, next);
  }

  function handleCopy() {
    if (!memo) return;
    navigator.clipboard.writeText(memoToMarkdown(memo, category, company));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function handleDownload() {
    if (!memo) return;
    const blob = new Blob([memoToMarkdown(memo, category, company)], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `issue-memo-${company.name}-${category.name}`.replace(/[^a-z0-9]+/gi, "-").toLowerCase() + ".md";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleShare() {
    if (!memo) return;
    const channel = channels.find((c) => c.id === channelId);
    if (!channel) return;
    setSharing(true);
    setShareResult(null);
    const message = buildIssueMemoMessage(memo, category, company, BASE_URL);
    const res = await sendSlackMessage(channel.id, message);
    setShareResult(
      res.ok
        ? { ok: true, text: `Memo posted to #${channel.name}.` }
        : res.error === "not_in_private_channel"
          ? { ok: false, text: `#${channel.name} is private — invite the Priori bot, then retry.` }
          : { ok: false, text: `Slack post failed (${res.error ?? "unknown"}).` },
    );
    setSharing(false);
  }

  const slackConnected = Boolean(slackConn);
  const selectedChannel = channels.find((c) => c.id === channelId);

  return (
    <div className="animate-scrim fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="animate-modal flex max-h-[88vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-900">Issue Memo</h2>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {category.name} · {company.name} · Priority {category.score}/100
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={generate}
              disabled={loading}
              title="Regenerate"
              className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={loading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} /> Regenerate
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#1a3a2e]" />
              <p className="text-sm text-slate-500">Writing the memo from the evidence…</p>
            </div>
          ) : error || !memo ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <p className="text-sm font-semibold text-slate-700">Could not generate the memo</p>
              <button
                onClick={generate}
                className="rounded-lg bg-[#1a3a2e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#243f35] transition-colors"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {SECTIONS.map((s) => (
                <div key={s.key}>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    {s.label}
                  </label>
                  <textarea
                    value={memo[s.key]}
                    onChange={(e) => updateField(s.key, e.target.value)}
                    rows={Math.max(2, Math.ceil((memo[s.key]?.length ?? 0) / 80))}
                    className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm leading-relaxed text-slate-700 focus:border-[#1a3a2e]/50 focus:outline-none focus:ring-2 focus:ring-[#1a3a2e]/20"
                  />
                </div>
              ))}

              {/* Real citations */}
              {category.quotes.length > 0 && (
                <div>
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    What users say
                  </p>
                  <div className="space-y-2">
                    {category.quotes.slice(0, 3).map((q, i) => (
                      <div key={i} className="rounded-lg border-l-2 border-slate-200 bg-slate-50 px-3 py-2 text-xs italic text-slate-600">
                        &ldquo;{q.text}&rdquo;
                        <span className="ml-1.5 not-italic text-[11px] text-slate-400">— {q.source}{q.rating != null ? `, ${q.rating}★` : ""}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        {!loading && !error && memo && (
          <div className="border-t border-slate-100 px-6 py-4 space-y-3">
            {shareResult && (
              <div className={
                shareResult.ok
                  ? "rounded-lg bg-[#1a3a2e]/5 border border-[#1a3a2e]/20 p-2.5 text-xs text-[#1a3a2e]"
                  : "rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-xs text-amber-800"
              }>
                {shareResult.text}
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-[#1a3a2e]" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" /> Download
                </button>
              </div>

              {/* Share to Slack */}
              {slackConnected && selectedChannel ? (
                <div className="flex items-center gap-2">
                  <select
                    value={channelId}
                    onChange={(e) => setChannelId(e.target.value)}
                    className="h-9 max-w-[10rem] rounded-lg border border-slate-200 px-2 text-xs bg-white focus:border-[#1a3a2e]/50 focus:outline-none focus:ring-2 focus:ring-[#1a3a2e]/20"
                  >
                    {channels.map((c) => (
                      <option key={c.id} value={c.id}>#{c.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleShare}
                    disabled={sharing}
                    className="flex items-center gap-2 rounded-lg bg-[#1a3a2e] px-4 py-2 text-xs font-semibold text-white hover:bg-[#243f35] disabled:opacity-60 transition-colors"
                  >
                    {sharing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    {sharing ? "Posting…" : "Share to Slack"}
                  </button>
                </div>
              ) : (
                <span className="text-[11px] text-slate-400">Connect Slack in Settings to share this.</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

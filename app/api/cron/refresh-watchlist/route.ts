import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { detectSpike, detectNewTrend } from "@/lib/services/watchlist";
import { generateAlertMessage } from "@/lib/ai/groq";
import { sendAlertEmail } from "@/lib/services/email";
import { buildSpikeMessage } from "@/lib/services/slack";
import type { Snapshot } from "@/types";

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

/**
 * Weekly watchlist refresh — runs every Sunday midnight UTC via Vercel Cron.
 * Secured with CRON_SECRET env var (set in Vercel dashboard).
 */
export async function GET(request: Request) {
  // Verify Vercel Cron secret
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  // Get all watchlist entries across all users
  const { data: watchlistRows, error } = await supabase
    .from("watchlist")
    .select("user_id, company_id, company_name, company_icon");

  if (error || !watchlistRows?.length) {
    return NextResponse.json({ refreshed: 0 });
  }

  // Deduplicate by company_id (analyze each company once, share across users)
  const uniqueCompanies = [
    ...new Map(watchlistRows.map((r) => [r.company_id, r])).values(),
  ];

  let alertsCreated = 0;

  for (const company of uniqueCompanies) {
    try {
      // ── Fetch fresh analysis ────────────────────────────────────────────
      const res = await fetch(`${BASE}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId:   company.company_id,
          companyName: company.company_name,
        }),
        cache: "no-store",
      });
      if (!res.ok) continue;
      const newSnapshot: Snapshot = await res.json();

      // ── Get previous snapshot for comparison ───────────────────────────
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 14); // compare against up to 2 weeks ago

      const { data: prevRows } = await supabase
        .from("snapshots")
        .select("*")
        .eq("company_id", company.company_id)
        .lt("created_at", new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString())
        .gte("created_at", cutoff.toISOString())
        .order("created_at", { ascending: false })
        .limit(1);

      const prevSnapshot = prevRows?.[0] as Snapshot | undefined;
      const prevCategoryNames =
        prevSnapshot?.categories.map((c) => c.name) ?? [];

      // ── Detect spikes and new trends per user ──────────────────────────
      const usersForCompany = watchlistRows
        .filter((r) => r.company_id === company.company_id)
        .map((r) => r.user_id);

      for (const category of newSnapshot.categories) {
        const prevCat = prevSnapshot?.categories.find(
          (c) => c.name === category.name
        );

        const isSpike = prevCat
          ? detectSpike(
              category.complaint_count,
              prevCat.complaint_count,
              newSnapshot.review_count,
              prevSnapshot?.review_count ?? newSnapshot.review_count,
            )
          : false;

        const isNewTrend = detectNewTrend(
          category.name,
          category.complaint_count,
          prevCategoryNames,
        );

        if (!isSpike && !isNewTrend) continue;

        // Smoothed % change — same α=5 as detectSpike to stay consistent
        const α = 5;
        const changePercent = prevCat
          ? Math.round(
              ((category.complaint_count + α) / (prevCat.complaint_count + α) - 1) * 100,
            )
          : undefined;

        // Generate AI alert message
        let message = `${category.name} complaints ${isSpike ? `up ${changePercent}%` : "newly detected"} for ${company.company_name}.`;
        try {
          message = await generateAlertMessage(
            company.company_name,
            category.name,
            changePercent ?? 0,
            category.complaint_count,
            prevCat?.complaint_count ?? 0
          );
        } catch {
          // fallback message already set
        }

        // Insert alert for every user watching this company
        for (const userId of usersForCompany) {
          const { data: alertRow } = await supabase
            .from("alerts")
            .insert({
              user_id:        userId,
              company_id:     company.company_id,
              company_name:   company.company_name,
              company_icon:   company.company_icon,
              type:           isSpike ? "spike" : "new_trend",
              message,
              category_name:  category.name,
              change_percent: changePercent ?? null,
              read:           false,
              email_sent:     false,
              slack_sent:     false,
            })
            .select()
            .single();

          if (!alertRow) continue;
          alertsCreated++;

          // ── Deliver notifications ────────────────────────────────────
          const { data: prefs } = await supabase
            .from("notification_preferences")
            .select("*")
            .eq("user_id", userId)
            .single();

          // Email
          if (prefs?.email_enabled !== false && prefs?.email_address) {
            const { ok } = await sendAlertEmail(prefs.email_address, alertRow);
            if (ok) {
              await supabase
                .from("alerts")
                .update({ email_sent: true })
                .eq("id", alertRow.id);
            }
          }

          // Slack
          const { data: slackConn } = await supabase
            .from("slack_connections")
            .select("access_token, default_channel")
            .eq("user_id", userId)
            .single();

          if (slackConn?.access_token && slackConn.default_channel) {
            const slackMsg = buildSpikeMessage(alertRow, BASE);
            const slackRes = await fetch("https://slack.com/api/chat.postMessage", {
              method: "POST",
              headers: {
                Authorization:  `Bearer ${slackConn.access_token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                channel: slackConn.default_channel,
                text:    slackMsg.text,
                blocks:  slackMsg.blocks,
              }),
            });
            const slackJson = await slackRes.json().catch(() => ({ ok: false }));
            if (slackJson.ok) {
              await supabase
                .from("alerts")
                .update({ slack_sent: true })
                .eq("id", alertRow.id);
            }
          }
        }
      }
    } catch (err) {
      console.error(`[cron] Failed to refresh ${company.company_id}:`, err);
    }
  }

  return NextResponse.json({
    refreshed: uniqueCompanies.length,
    alerts:    alertsCreated,
  });
}

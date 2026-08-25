import type { ActionItem, Alert, SlackChannel, SlackConnection, SlackMessage } from "@/types";

/** Current user's saved Slack connection, or null if not connected. */
export async function getSlackConnection(): Promise<SlackConnection | null> {
  try {
    const res = await fetch("/api/slack/connection");
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/** The channels the connected workspace exposes (empty if not connected). */
export async function getSlackChannels(): Promise<SlackChannel[]> {
  try {
    const res = await fetch("/api/slack/channels");
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

/** Build Block Kit message for a new action item assignment. */
export function buildAssignmentMessage(item: ActionItem, baseUrl: string): SlackMessage {
  return {
    text: `New action item: ${item.category_name} for ${item.company_name ?? ""}`,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: `📋 ${item.category_name} — New Action Item` },
      },
      { type: "divider" },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Company:*\n${item.company_name ?? "—"}` },
          { type: "mrkdwn", text: `*Severity:*\n${item.priority_score ?? "—"}/100` },
          { type: "mrkdwn", text: `*Owner:*\n${item.owner}` },
          { type: "mrkdwn", text: `*Deadline:*\n${item.deadline}` },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Resolution Steps:*\n${item.resolution_steps}`,
        },
      },
      { type: "divider" },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "View in Priori →" },
            url: `${baseUrl}/workflows`,
            action_id: "view_action_item",
            style: "primary",
          },
        ],
      },
    ],
  };
}

/** Build Block Kit message for an overdue nudge. */
export function buildOverdueMessage(item: ActionItem, daysOverdue: number, baseUrl: string): SlackMessage {
  return {
    text: `Overdue: ${item.category_name} for ${item.company_name ?? ""}`,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: `⚠️ Overdue: ${item.category_name} for ${item.company_name}` },
      },
      { type: "divider" },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Deadline was:*\n${item.deadline} (${daysOverdue} days ago)` },
          { type: "mrkdwn", text: `*Owner:*\n${item.owner}` },
          { type: "mrkdwn", text: `*Current Status:*\n${item.status.replace("_", " ")}` },
        ],
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "Update Status →" },
            url: `${baseUrl}/workflows`,
            action_id: "update_status",
          },
        ],
      },
    ],
  };
}

/** Build Block Kit message for a spike alert. */
export function buildSpikeMessage(alert: Alert, baseUrl: string): SlackMessage {
  const changeText = alert.change_percent != null ? `up ${alert.change_percent}%` : "newly detected";
  return {
    text: `Complaint Spike: ${alert.category_name} for ${alert.company_name}`,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: `🚨 Complaint Spike — ${alert.company_name}` },
      },
      { type: "divider" },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Category:*\n${alert.category_name}` },
          { type: "mrkdwn", text: `*Change:*\n${changeText} this week` },
        ],
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: alert.message },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "View Details →" },
            url: `${baseUrl}/dashboard/${alert.company_id}`,
            action_id: "view_dashboard",
            style: "primary",
          },
        ],
      },
    ],
  };
}

/** Post a Slack message via the server route (uses the stored workspace token). */
export async function sendSlackMessage(
  channelId: string,
  message: SlackMessage,
): Promise<{ ok: boolean; ts?: string; error?: string }> {
  try {
    const res = await fetch("/api/slack/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel: channelId, message }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) return { ok: false, error: json.error ?? "send_failed" };
    return { ok: true, ts: json.ts };
  } catch {
    return { ok: false, error: "network_error" };
  }
}

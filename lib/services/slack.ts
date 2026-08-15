import { config } from "@/lib/config";
import { MOCK_SLACK_CONNECTION } from "@/lib/mock/slack";
import type { ActionItem, Alert, SlackConnection, SlackMessage } from "@/types";

export async function getSlackConnection(): Promise<SlackConnection | null> {
  if (config.USE_MOCK_SLACK) {
    await delay(100);
    return MOCK_SLACK_CONNECTION;
  }
  const res = await fetch("/api/slack/connection");
  if (!res.ok) return null;
  return res.json();
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

/** Send a Slack message. In mock mode, logs to console. */
export async function sendSlackMessage(
  channelId: string,
  message: SlackMessage,
  connection?: SlackConnection | null
): Promise<{ ok: boolean; ts?: string }> {
  if (config.USE_MOCK_SLACK) {
    await delay(500);
    console.log("[MOCK SLACK]", channelId, JSON.stringify(message, null, 2));
    return { ok: true, ts: `${Date.now()}.000000` };
  }
  const res = await fetch("/api/slack/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      channel: channelId,
      message,
      access_token: connection?.access_token,
    }),
  });
  return res.json();
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

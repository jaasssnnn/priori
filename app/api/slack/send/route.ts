import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SlackMessage } from "@/types";

interface SlackPostResponse { ok: boolean; ts?: string; error?: string }

async function postMessage(token: string, channel: string, message: SlackMessage): Promise<SlackPostResponse> {
  const res = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization:  `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ channel, text: message.text, blocks: message.blocks }),
  });
  return res.json() as Promise<SlackPostResponse>;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { channel, message } = await request.json() as {
    channel: string;
    message: SlackMessage;
  };

  const { data: conn } = await supabase
    .from("slack_connections")
    .select("access_token")
    .eq("user_id", user.id)
    .single();

  if (!conn?.access_token) {
    return NextResponse.json({ error: "Slack not connected" }, { status: 400 });
  }

  const token = conn.access_token;

  try {
    let json = await postMessage(token, channel, message);

    // If the bot isn't in the channel, self-join (public channels only) and retry once.
    if (!json.ok && json.error === "not_in_channel") {
      const joinRes = await fetch("https://slack.com/api/conversations.join", {
        method: "POST",
        headers: {
          Authorization:  `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ channel }),
      });
      const joinJson = await joinRes.json() as { ok: boolean; error?: string };

      if (joinJson.ok) {
        json = await postMessage(token, channel, message);
      } else {
        console.error("[slack/send] auto-join failed:", joinJson.error);
        // Private channels can't be self-joined — the bot must be invited.
        return NextResponse.json(
          { error: joinJson.error === "method_not_supported_for_channel_type"
              ? "not_in_private_channel"
              : joinJson.error ?? "not_in_channel" },
          { status: 400 }
        );
      }
    }

    if (!json.ok) {
      console.error("[slack/send] Slack API error:", json.error);
      return NextResponse.json({ error: json.error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, ts: json.ts });
  } catch (err) {
    console.error("[slack/send] Failed:", err);
    return NextResponse.json({ error: "Send failed" }, { status: 500 });
  }
}

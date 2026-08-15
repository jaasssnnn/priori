import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SlackMessage } from "@/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { channel, message } = await request.json() as {
    channel: string;
    message: SlackMessage;
  };

  // Get access token from Supabase
  const { data: conn } = await supabase
    .from("slack_connections")
    .select("access_token")
    .eq("user_id", user.id)
    .single();

  if (!conn?.access_token) {
    return NextResponse.json({ error: "Slack not connected" }, { status: 400 });
  }

  try {
    const res = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        Authorization:  `Bearer ${conn.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        channel,
        text:   message.text,
        blocks: message.blocks,
      }),
    });

    const json = await res.json() as { ok: boolean; ts?: string; error?: string };

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

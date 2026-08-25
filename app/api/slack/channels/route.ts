import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface SlackListResponse {
  ok: boolean;
  error?: string;
  channels?: Array<{ id: string; name: string; is_member?: boolean }>;
}

async function listChannels(token: string, types: string): Promise<SlackListResponse> {
  const url =
    `https://slack.com/api/conversations.list?types=${types}` +
    `&exclude_archived=true&limit=1000`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  return res.json() as Promise<SlackListResponse>;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json([]);

  const { data: conn } = await supabase
    .from("slack_connections")
    .select("access_token")
    .eq("user_id", user.id)
    .single();

  if (!conn?.access_token) return NextResponse.json([]);

  try {
    // Ask for public + private, but private channels need the groups:read scope.
    // If that scope isn't granted, Slack rejects the whole call with missing_scope,
    // so fall back to public channels only.
    let json = await listChannels(conn.access_token, "public_channel,private_channel");
    if (!json.ok && json.error === "missing_scope") {
      json = await listChannels(conn.access_token, "public_channel");
    }

    if (!json.ok) {
      console.error("[slack/channels] Slack API error:", json.error);
      return NextResponse.json([]);
    }

    const channels = (json.channels ?? [])
      .map((c) => ({ id: c.id, name: c.name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    console.log(`[slack/channels] returning ${channels.length} channels`);
    return NextResponse.json(channels);
  } catch (err) {
    console.error("[slack/channels] request failed:", err);
    return NextResponse.json([]);
  }
}

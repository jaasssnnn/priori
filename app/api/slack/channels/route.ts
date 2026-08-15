import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
    const res = await fetch(
      "https://slack.com/api/conversations.list?types=public_channel,private_channel&limit=200",
      { headers: { Authorization: `Bearer ${conn.access_token}` } }
    );
    const json = await res.json() as {
      ok: boolean;
      channels?: Array<{ id: string; name: string }>;
    };

    if (!json.ok) return NextResponse.json([]);

    const channels = (json.channels ?? [])
      .map((c) => ({ id: c.id, name: c.name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(channels);
  } catch {
    return NextResponse.json([]);
  }
}

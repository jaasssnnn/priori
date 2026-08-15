import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BASE         = process.env.NEXT_PUBLIC_BASE_URL!;
const REDIRECT_URI = `${BASE}/api/slack/callback`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code  = searchParams.get("code");
  const state = searchParams.get("state"); // user_id passed in auth route
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${BASE}/settings?slack=error`);
  }

  // Exchange code for access token
  const tokenRes = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id:     process.env.SLACK_CLIENT_ID!,
      client_secret: process.env.SLACK_CLIENT_SECRET!,
      redirect_uri:  REDIRECT_URI,
    }),
  });

  const token = await tokenRes.json() as {
    ok: boolean;
    access_token?: string;
    team?: { id: string; name: string };
    error?: string;
  };

  if (!token.ok || !token.access_token) {
    console.error("[slack/callback] Token exchange failed:", token.error);
    return NextResponse.redirect(`${BASE}/settings?slack=error`);
  }

  // Save to Supabase
  const supabase  = await createClient();
  const userId    = state; // user_id from state param

  const { error: dbError } = await supabase
    .from("slack_connections")
    .upsert(
      {
        user_id:         userId,
        team_id:         token.team?.id ?? "",
        team_name:       token.team?.name ?? "",
        access_token:    token.access_token,
        default_channel: "",
      },
      { onConflict: "user_id" }
    );

  if (dbError) {
    console.error("[slack/callback] DB upsert failed:", dbError);
    return NextResponse.redirect(`${BASE}/settings?slack=error`);
  }

  return NextResponse.redirect(`${BASE}/settings?slack=connected`);
}

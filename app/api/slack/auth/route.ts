import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SCOPES        = "chat:write,channels:read,channels:join,groups:read,users:read";
const REDIRECT_URI  = `${process.env.NEXT_PUBLIC_BASE_URL}/api/slack/callback`;

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login`);
  }

  const params = new URLSearchParams({
    client_id:    process.env.SLACK_CLIENT_ID!,
    scope:        SCOPES,
    redirect_uri: REDIRECT_URI,
    state:        user.id, // used in callback to identify user
  });

  return NextResponse.redirect(
    `https://slack.com/oauth/v2/authorize?${params.toString()}`
  );
}

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

// Resend free-tier from address (no domain verification needed)
const FROM = "Priori Alerts <onboarding@resend.dev>";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { to, subject, html } = await request.json() as {
    to: string;
    subject: string;
    html: string;
  };

  try {
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, id: data?.id });
  } catch (err) {
    console.error("[email/send] Failed:", err);
    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }
}

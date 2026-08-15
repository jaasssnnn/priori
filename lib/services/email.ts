import { config } from "@/lib/config";
import type { Alert } from "@/types";

export async function sendAlertEmail(
  to: string,
  alert: Alert
): Promise<{ ok: boolean }> {
  if (config.USE_MOCK_EMAIL) {
    console.log("[MOCK EMAIL] Alert email to:", to, alert.message);
    return { ok: true };
  }

  const subject =
    alert.type === "spike"
      ? `⚠️ Complaint Spike: ${alert.category_name} — ${alert.company_name}`
      : `🆕 New Trend Detected: ${alert.category_name} — ${alert.company_name}`;

  const html = buildAlertHtml(alert);

  try {
    const res = await fetch("/api/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, html }),
    });
    if (!res.ok) return { ok: false };
    return res.json();
  } catch {
    return { ok: false };
  }
}

function buildAlertHtml(alert: Alert): string {
  const changeText =
    alert.change_percent != null
      ? `up <strong>${alert.change_percent}%</strong> this week`
      : "newly detected";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: -apple-system, sans-serif; background: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; }
    .header { background: #4f46e5; padding: 24px 32px; }
    .header h1 { color: #fff; margin: 0; font-size: 18px; font-weight: 700; }
    .body { padding: 28px 32px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; }
    .spike    { background: #fee2e2; color: #b91c1c; }
    .newtrend { background: #ede9fe; color: #6d28d9; }
    .message  { font-size: 15px; color: #374151; line-height: 1.6; margin: 0 0 20px; }
    .cta { display: inline-block; background: #4f46e5; color: #fff !important; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 32px; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Priori Alert — ${alert.company_name}</h1>
    </div>
    <div class="body">
      <span class="badge ${alert.type === "spike" ? "spike" : "newtrend"}">
        ${alert.type === "spike" ? "Complaint Spike" : "New Trend"}
      </span>
      <p class="message">
        <strong>${alert.category_name}</strong> complaints are ${changeText} for <strong>${alert.company_name}</strong>.<br /><br />
        ${alert.message}
      </p>
      <a class="cta" href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/${alert.company_id}">
        View Dashboard →
      </a>
    </div>
    <div class="footer">
      You're receiving this because you watchlisted ${alert.company_name} on Priori.
      Manage preferences in <a href="${process.env.NEXT_PUBLIC_BASE_URL}/settings">Settings</a>.
    </div>
  </div>
</body>
</html>`;
}

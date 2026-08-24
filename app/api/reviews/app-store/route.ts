import { NextResponse } from "next/server";
import { scrapeAppStore } from "@/lib/scrapers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const appId   = searchParams.get("appId")   ?? undefined;
  const appName = searchParams.get("appName") ?? undefined;

  if (!appId && !appName) {
    return NextResponse.json({ error: "appId or appName required" }, { status: 400 });
  }

  const reviews = await scrapeAppStore(appId, appName);
  return NextResponse.json({ reviews, total: reviews.length });
}

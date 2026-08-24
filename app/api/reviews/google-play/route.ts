import { NextResponse } from "next/server";
import { scrapePlayStore } from "@/lib/scrapers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const appId = searchParams.get("appId");
  if (!appId) return NextResponse.json({ error: "appId required" }, { status: 400 });

  const reviews = await scrapePlayStore(appId);
  return NextResponse.json({ reviews, total: reviews.length });
}

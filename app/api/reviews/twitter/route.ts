import { NextResponse } from "next/server";
import { scrapeTwitter } from "@/lib/scrapers";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyName = searchParams.get("companyName");
  if (!companyName) return NextResponse.json({ error: "companyName required" }, { status: 400 });

  const reviews = await scrapeTwitter(companyName);
  return NextResponse.json({ reviews, total: reviews.length });
}

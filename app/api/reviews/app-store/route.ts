import { NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const store = require("app-store-scraper");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const appName = searchParams.get("appName");
  const appId   = searchParams.get("appId");   // numeric, optional if we have name

  if (!appName && !appId) {
    return NextResponse.json({ error: "appName or appId required" }, { status: 400 });
  }

  try {
    let numericId = appId;

    // Resolve numeric App Store ID from name if not provided
    if (!numericId && appName) {
      const searchResults = await store.search({
        term:    appName,
        num:     3,
        country: "in",
        lang:    "en",
      });
      if (searchResults.length === 0) {
        return NextResponse.json({ reviews: [], total: 0 });
      }
      numericId = String(searchResults[0].id);
    }

    const reviews = await store.reviews({
      id:      numericId,
      country: "in",
      sort:    store.sort.RECENT,
      num:     500,
      page:    1,
    });

    const mapped = (
      reviews as Array<{
        text: string | null;
        rating: number;
        date: string;
        userName: string;
      }>
    )
      .filter((r) => r.text && r.text.trim().length > 20)
      .map((r) => ({
        text:   r.text!.trim(),
        source: "app_store",
        rating: r.rating,
        date:   new Date(r.date).toISOString().split("T")[0],
        author: r.userName,
        url:    `https://apps.apple.com/in/app/id${numericId}`,
      }));

    return NextResponse.json({ reviews: mapped, total: mapped.length });
  } catch (err) {
    console.error("[reviews/app-store] Failed:", err);
    return NextResponse.json({ reviews: [], total: 0 });
  }
}

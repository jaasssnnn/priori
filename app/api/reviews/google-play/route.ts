import { NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const gplay = require("google-play-scraper");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const appId = searchParams.get("appId");
  if (!appId) return NextResponse.json({ error: "appId required" }, { status: 400 });

  try {
    const { data } = await gplay.reviews({
      appId,
      lang:    "en",
      country: "in",
      sort:    gplay.sort.NEWEST,
      num:     500,
    });

    const reviews = (
      data as Array<{
        text: string | null;
        score: number;
        date: string | Date;
        userName: string;
      }>
    )
      .filter((r) => r.text && r.text.trim().length > 20)
      .map((r) => ({
        text:   r.text!.trim(),
        source: "play_store",
        rating: r.score,
        date:   new Date(r.date).toISOString().split("T")[0],
        author: r.userName,
      }));

    return NextResponse.json({ reviews, total: reviews.length });
  } catch (err) {
    console.error("[reviews/google-play] Failed:", err);
    return NextResponse.json({ reviews: [], total: 0 });
  }
}

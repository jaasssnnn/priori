import { NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const gplay = require("google-play-scraper");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  if (!q) return NextResponse.json([]);

  try {
    const results = await gplay.search({
      term: q,
      num: 6,
      lang: "en",
      country: "in", // India — target market
    });

    const companies = results.map(
      (app: {
        appId: string;
        title: string;
        developer: string;
        icon: string;
        score: number;
        installs: string;
      }) => ({
        id:           app.appId,
        user_id:      "real",
        app_id:       app.appId,
        app_store_id: "",     // resolved in App Store route
        name:         app.title,
        icon_url:     app.icon,
        added_at:     new Date().toISOString(),
        developer:    app.developer,
        avg_rating:   app.score,
        install_count:app.installs,
      })
    );

    return NextResponse.json(companies);
  } catch (err) {
    console.error("[search/company] Play Store search failed:", err);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}

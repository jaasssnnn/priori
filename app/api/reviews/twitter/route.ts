import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const bearer = process.env.TWITTER_BEARER_TOKEN;
  if (!bearer) {
    // No key — return empty gracefully; analyze route uses other sources
    return NextResponse.json({ reviews: [], total: 0 });
  }

  const { searchParams } = new URL(request.url);
  const companyName = searchParams.get("companyName");
  if (!companyName) return NextResponse.json({ error: "companyName required" }, { status: 400 });

  try {
    const query = `${companyName} (complaint OR issue OR problem OR worst OR terrible OR broken) -is:retweet lang:en`;
    const url   = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=100&tweet.fields=created_at,public_metrics,author_id`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${bearer}` },
      next:    { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`Twitter API ${res.status}`);

    const json = await res.json() as {
      data?: Array<{ text: string; created_at: string }>;
    };

    const reviews = (json.data ?? [])
      .filter((t) => t.text.length > 20)
      .map((t) => ({
        text:   t.text,
        source: "twitter",
        date:   new Date(t.created_at).toISOString().split("T")[0],
      }));

    return NextResponse.json({ reviews, total: reviews.length });
  } catch (err) {
    console.error("[reviews/twitter] Failed:", err);
    return NextResponse.json({ reviews: [], total: 0 });
  }
}

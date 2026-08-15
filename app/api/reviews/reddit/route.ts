import { NextResponse } from "next/server";

interface RedditPost {
  data: {
    title: string;
    selftext: string;
    score: number;
    num_comments: number;
    subreddit: string;
    permalink: string;
    created_utc: number;
  };
}

interface RedditResponse {
  data: { children: RedditPost[] };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyName = searchParams.get("companyName");
  if (!companyName) return NextResponse.json({ error: "companyName required" }, { status: 400 });

  try {
    const query   = `${companyName} (complaint OR issue OR problem OR worst OR scam) -site:reddit.com/r/wallstreetbets`;
    const encoded = encodeURIComponent(query);
    const url     = `https://www.reddit.com/search.json?q=${encoded}&sort=new&limit=100&type=link`;

    const res = await fetch(url, {
      headers: { "User-Agent": "priori-product-intelligence/1.0" },
      next:    { revalidate: 3600 }, // cache 1 hour
    });

    if (!res.ok) throw new Error(`Reddit API ${res.status}`);

    const json = (await res.json()) as RedditResponse;
    const posts = json.data.children;

    const reviews = posts
      .filter((p) => {
        const combined = `${p.data.title} ${p.data.selftext}`.trim();
        return combined.length > 30;
      })
      .map((p) => ({
        text:   `${p.data.title}. ${p.data.selftext}`.trim().slice(0, 1000),
        source: "reddit",
        date:   new Date(p.data.created_utc * 1000).toISOString().split("T")[0],
        url:    `https://reddit.com${p.data.permalink}`,
      }));

    return NextResponse.json({ reviews, total: reviews.length });
  } catch (err) {
    console.error("[reviews/reddit] Failed:", err);
    return NextResponse.json({ reviews: [], total: 0 });
  }
}

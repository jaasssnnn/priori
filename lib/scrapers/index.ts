// google-play-scraper is ESM — must use dynamic import(), not require()
// app-store-scraper is CommonJS — require() is fine
// eslint-disable-next-line @typescript-eslint/no-require-imports
const store = require("app-store-scraper");

import { exec } from "child_process";
import { promisify } from "util";
import type { RawReview } from "@/lib/ai/groq";

const execAsync = promisify(exec);

const OPENCLI  = "/usr/local/bin/opencli";
const MCPORTER = "/usr/local/bin/mcporter";

function safeDate(d: unknown): string {
  if (!d) return new Date().toISOString().split("T")[0];
  const parsed = d instanceof Date ? d : new Date(String(d));
  return isNaN(parsed.getTime())
    ? new Date().toISOString().split("T")[0]
    : parsed.toISOString().split("T")[0];
}

// ── Play Store ────────────────────────────────────────────────────────────────

export async function scrapePlayStore(appId: string): Promise<RawReview[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gplayModule = await import("google-play-scraper") as any;
    const gplay = gplayModule.default ?? gplayModule;

    const { data } = await gplay.reviews({
      appId,
      lang:    "en",
      country: "in",
      sort:    gplay.sort.NEWEST,
      num:     500,
    });

    type GPReview = { text: string | null; score: number; date: string | Date; userName: string };
    const reviews: RawReview[] = ((data ?? []) as GPReview[])
      .filter((r) => r.text && r.text.trim().length > 20)
      .map((r) => ({
        text:   r.text!.trim(),
        source: "play_store",
        rating: r.score,
        date:   safeDate(r.date),
        author: r.userName,
        url:    `https://play.google.com/store/apps/details?id=${appId}&showAllReviews=true`,
      }));

    console.log(`[scraper/play-store] ${appId} → ${reviews.length} reviews`);
    return reviews;
  } catch (err) {
    console.error("[scraper/play-store] FAILED:", err);
    return [];
  }
}

// ── App Store ─────────────────────────────────────────────────────────────────

export async function scrapeAppStore(appId?: string, appName?: string): Promise<RawReview[]> {
  try {
    let numericId = appId;
    if (!numericId && appName) {
      const results = await store.search({ term: appName, num: 3, country: "in", lang: "en" });
      if (!results.length) return [];
      numericId = String(results[0].id);
    }
    if (!numericId) return [];

    const reviews = await store.reviews({
      id:      numericId,
      country: "in",
      sort:    store.sort.RECENT,
      num:     500,
      page:    1,
    });

    const mapped: RawReview[] = (reviews as Array<{ text: string | null; rating: number; date: unknown; userName: string }>)
      .filter((r) => r.text && r.text.trim().length > 20)
      .map((r) => ({
        text:   r.text!.trim(),
        source: "app_store",
        rating: r.rating,
        date:   safeDate(r.date),
        author: r.userName,
        url:    `https://apps.apple.com/in/app/id${numericId}`,
      }));

    console.log(`[scraper/app-store] id=${numericId} → ${mapped.length} reviews`);
    return mapped;
  } catch (err) {
    console.error("[scraper/app-store] FAILED:", err);
    return [];
  }
}

// ── Reddit via OpenCLI (uses Chrome browser session) ─────────────────────────
//
// Strategy:
//   1. Try the company's own subreddit (r/PhonePe, r/CRED, etc.) — most signal-rich
//   2. Fall back to global Reddit search if subreddit is empty or doesn't exist
//
// Requires one-time setup:
//   1. Install OpenCLI Chrome extension (load unpacked from Downloads/OpenCLI-main/extension)
//   2. Be logged into reddit.com in Chrome
//   3. Run `opencli doctor` to verify

interface OpenCLIRedditPost {
  id:          string;
  title:       string;
  selftext:    string;
  url:         string;
  subreddit:   string;
  author:      string;
  score:       number;
  created_utc: number;
}

// Known subreddit name overrides where r/{companyName} doesn't exist
const SUBREDDIT_MAP: Record<string, string> = {
  "cred":        "CREDclub",
  "makemytrip":  "makemytrip",
  "phonepe":     "PhonePe",
  "paytm":       "Paytm",
  "swiggy":      "swiggy",
  "blinkit":     "blinkit",
};

function resolveSubreddit(companyName: string): string {
  const key = companyName.toLowerCase().replace(/\s+/g, "");
  return SUBREDDIT_MAP[key] ?? companyName.replace(/\s+/g, "");
}

function parsePosts(stdout: string): RawReview[] {
  const posts: OpenCLIRedditPost[] = JSON.parse(stdout);
  return posts
    .filter((p) => `${p.title} ${p.selftext}`.trim().length > 30)
    .map((p) => ({
      text:   `${p.title}. ${p.selftext}`.trim().slice(0, 1000),
      source: "reddit" as const,
      date:   safeDate(new Date(p.created_utc * 1000)),
      url:    p.url.startsWith("http") ? p.url : `https://reddit.com${p.url}`,
      author: p.author,
    }));
}

export async function scrapeReddit(companyName: string): Promise<RawReview[]> {
  // ── Step 1: company subreddit ─────────────────────────────────────────────
  try {
    const subreddit = resolveSubreddit(companyName);
    const query = "complaint OR issue OR problem OR worst OR refund OR scam OR bug";
    const cmd = `"${OPENCLI}" reddit search ${JSON.stringify(query)} --subreddit ${subreddit} -f json --sort new --limit 25 --window background`;
    const { stdout } = await execAsync(cmd, { timeout: 45_000 });
    const reviews = parsePosts(stdout);

    if (reviews.length >= 3) {
      console.log(`[scraper/reddit] r/${subreddit} → ${reviews.length} posts`);
      return reviews;
    }
    console.log(`[scraper/reddit] r/${subreddit} too sparse (${reviews.length}), falling back to global search`);
  } catch {
    // subreddit doesn't exist or opencli not configured — fall through
  }

  // ── Step 2: search high-signal India subreddits ──────────────────────────
  const indiaSubreddits = ["india", "IndiaInvestments", "personalfinanceindia", "TwentiesIndia"];
  const subQuery = `${companyName} complaint OR issue OR problem OR refund`;

  const subResults = await Promise.all(
    indiaSubreddits.map(async (sub) => {
      try {
        const cmd = `"${OPENCLI}" reddit search ${JSON.stringify(subQuery)} --subreddit ${sub} -f json --sort new --limit 10 --window background`;
        const { stdout } = await execAsync(cmd, { timeout: 30_000 });
        return parsePosts(stdout);
      } catch {
        return [] as RawReview[];
      }
    })
  );

  const combined = subResults.flat();
  if (combined.length >= 3) {
    console.log(`[scraper/reddit] India subreddits → ${combined.length} posts for "${companyName}"`);
    return combined;
  }

  // ── Step 3: global Reddit search ─────────────────────────────────────────
  try {
    const query = `${companyName} complaint OR issue OR problem OR worst OR scam`;
    const cmd = `"${OPENCLI}" reddit search ${JSON.stringify(query)} -f json --sort new --limit 25 --window background`;
    const { stdout } = await execAsync(cmd, { timeout: 45_000 });
    const reviews = parsePosts(stdout);
    console.log(`[scraper/reddit] global search "${companyName}" → ${reviews.length} posts`);
    return reviews;
  } catch (err) {
    console.warn(`[scraper/reddit] skipped (${(err as Error).message?.split("\n")[0]})`);
    return [];
  }
}

// ── Web mentions via Exa (mcporter) ──────────────────────────────────────────
//
// Semantic web search — finds review sites, forums, news articles.
// mcporter is pre-configured with Exa; falls back to [] if unavailable.

interface ExaResult {
  url?:        string;
  title?:      string;
  text?:       string;
  highlights?: string[];
}

// mcporter outputs plain text blocks separated by "---", each with:
//   Title: ...\nURL: ...\nHighlights:\n### snippet title\n...text...\n
function parseExaText(stdout: string): RawReview[] {
  const reviews: RawReview[] = [];
  const blocks = stdout.split(/\n---\n/);

  for (const block of blocks) {
    const urlMatch  = block.match(/^URL:\s*(.+)$/m);
    const url       = urlMatch?.[1]?.trim();
    const hlSection = block.split(/^Highlights:/m)[1] ?? "";

    // Each highlight starts with "### title" then "..." then text then "..."
    const snippets = hlSection
      .split(/^###\s+/m)
      .slice(1)
      .map((h) =>
        h
          .split("\n")
          .filter((l) => l.trim() !== "..." && l.trim().length > 0)
          .slice(1) // skip the title line
          .join(" ")
          .trim()
      )
      .filter((s) => s.length > 60);

    for (const snippet of snippets) {
      reviews.push({
        text:   snippet.slice(0, 1000),
        source: "reddit" as const,
        date:   new Date().toISOString().split("T")[0],
        url,
      });
    }
  }

  return reviews.slice(0, 20);
}

export async function scrapeWebMentions(companyName: string): Promise<RawReview[]> {
  try {
    const query = `${companyName} app user complaints problems poor experience reviews`;
    const cmd = `"${MCPORTER}" call exa.web_search_exa query=${JSON.stringify(query)} numResults=15`;
    const { stdout } = await execAsync(cmd, { timeout: 30_000 });

    const reviews = parseExaText(stdout);
    console.log(`[scraper/exa] "${companyName}" → ${reviews.length} web mentions`);
    return reviews;
  } catch (err) {
    console.warn(`[scraper/exa] skipped (${(err as Error).message?.split("\n")[0]})`);
    return [];
  }
}

// ── Twitter/X ─────────────────────────────────────────────────────────────────

export async function scrapeTwitter(companyName: string): Promise<RawReview[]> {
  const bearer = process.env.TWITTER_BEARER_TOKEN;

  // Preferred: Twitter API v2
  if (bearer) {
    try {
      const query = `${companyName} (complaint OR issue OR problem OR worst OR terrible OR broken) -is:retweet lang:en`;
      const url   = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=100&tweet.fields=created_at,author_id`;
      const res   = await fetch(url, { headers: { Authorization: `Bearer ${bearer}` } });
      if (res.ok) {
        const json = await res.json() as { data?: Array<{ id: string; text: string; created_at: string }> };
        const reviews: RawReview[] = (json.data ?? [])
          .filter((t) => t.text.length > 20)
          .map((t) => ({
            text:   t.text,
            source: "twitter",
            date:   safeDate(t.created_at),
            url:    `https://twitter.com/i/web/status/${t.id}`,
          }));
        if (reviews.length > 0) {
          console.log(`[scraper/twitter] API ${companyName} → ${reviews.length} tweets`);
          return reviews;
        }
      }
    } catch {
      // fall through to opencli
    }
  }

  // Fallback: browser-based via opencli
  try {
    const query = `${companyName} (complaint OR issue OR problem OR worst OR terrible OR broken) -filter:retweets lang:en`;
    const cmd = `"${OPENCLI}" twitter search ${JSON.stringify(query)} --product live --exclude retweets -f json --limit 50 --window background`;
    const { stdout } = await execAsync(cmd, { timeout: 45_000 });
    type OCTweet = { id?: string; text: string; created_at?: string; url?: string; author?: string };
    const tweets: OCTweet[] = JSON.parse(stdout);
    const reviews: RawReview[] = tweets
      .filter((t) => t.text && t.text.length > 20)
      .map((t) => ({
        text:   t.text,
        source: "twitter",
        date:   safeDate(t.created_at),
        url:    t.url ?? (t.id ? `https://twitter.com/i/web/status/${t.id}` : undefined),
        author: t.author,
      }));
    console.log(`[scraper/twitter] opencli ${companyName} → ${reviews.length} tweets`);
    return reviews;
  } catch (err) {
    console.warn(`[scraper/twitter] skipped (${(err as Error).message?.split("\n")[0]})`);
    return [];
  }
}

// ── YouTube ────────────────────────────────────────────────────────────────────

type YTVideo   = { title: string; channel?: string; url: string };
type YTComment = { author?: string; text: string };

export async function scrapeYouTube(companyName: string): Promise<RawReview[]> {
  const reviews: RawReview[] = [];
  try {
    const query = `${companyName} complaint OR problem OR issue OR scam OR worst`;
    const searchCmd = `"${OPENCLI}" youtube search ${JSON.stringify(query)} -f json --type video --sort relevance --limit 20 --window background`;
    const { stdout: videoJson } = await execAsync(searchCmd, { timeout: 45_000 });
    const videos: YTVideo[] = JSON.parse(videoJson);

    for (const v of videos) {
      if (v.title && v.title.trim().length > 20) {
        reviews.push({ text: v.title.trim().slice(0, 500), source: "youtube", date: new Date().toISOString().split("T")[0], url: v.url, author: v.channel });
      }
    }

    // Pull comments from top 3 most relevant videos
    const commentResults = await Promise.all(
      videos.slice(0, 3).filter((v) => v.url).map(async (v) => {
        try {
          const commentCmd = `"${OPENCLI}" youtube comments ${JSON.stringify(v.url)} -f json --limit 30 --window background`;
          const { stdout } = await execAsync(commentCmd, { timeout: 45_000 });
          const comments: YTComment[] = JSON.parse(stdout);
          return comments
            .filter((c) => c.text && c.text.trim().length > 20)
            .map((c) => ({ text: c.text.trim().slice(0, 800), source: "youtube" as const, date: new Date().toISOString().split("T")[0], url: v.url, author: c.author }));
        } catch { return [] as RawReview[]; }
      })
    );
    reviews.push(...commentResults.flat());

    console.log(`[scraper/youtube] "${companyName}" → ${reviews.length} items`);
    return reviews;
  } catch (err) {
    console.warn(`[scraper/youtube] skipped (${(err as Error).message?.split("\n")[0]})`);
    return [];
  }
}

// ── Instagram ─────────────────────────────────────────────────────────────────

type IGUser = { username: string };
type IGPost = { caption?: string; date?: string };

export async function scrapeInstagram(companyName: string): Promise<RawReview[]> {
  // Step 1: find the brand's official handle, grab post captions
  try {
    const searchCmd = `"${OPENCLI}" instagram search ${JSON.stringify(companyName)} -f json --limit 5 --window background`;
    const { stdout: userJson } = await execAsync(searchCmd, { timeout: 30_000 });
    const users: IGUser[] = JSON.parse(userJson);
    const handle = users[0]?.username;
    if (handle) {
      const postsCmd = `"${OPENCLI}" instagram user ${JSON.stringify(handle)} -f json --limit 30 --window background`;
      const { stdout: postsJson } = await execAsync(postsCmd, { timeout: 45_000 });
      const posts: IGPost[] = JSON.parse(postsJson);
      const reviews: RawReview[] = posts
        .filter((p) => p.caption && p.caption.trim().length > 20)
        .map((p) => ({ text: p.caption!.trim().slice(0, 800), source: "instagram", date: safeDate(p.date), url: `https://www.instagram.com/${handle}/`, author: handle }));
      if (reviews.length > 0) {
        console.log(`[scraper/instagram] @${handle} → ${reviews.length} posts`);
        return reviews;
      }
    }
  } catch {
    // fall through to Exa
  }

  // Step 2: Exa web search for indexed Instagram posts mentioning the brand
  try {
    const query = `site:instagram.com ${companyName} complaint OR issue OR problem`;
    const cmd = `"${MCPORTER}" call exa.web_search_exa query=${JSON.stringify(query)} numResults=10`;
    const { stdout } = await execAsync(cmd, { timeout: 30_000 });
    const reviews = parseExaText(stdout).map((r) => ({ ...r, source: "instagram" as const }));
    console.log(`[scraper/instagram] Exa → ${reviews.length} items for "${companyName}"`);
    return reviews;
  } catch (err) {
    console.warn(`[scraper/instagram] skipped (${(err as Error).message?.split("\n")[0]})`);
    return [];
  }
}

// ── Facebook ──────────────────────────────────────────────────────────────────

type FBPost = { title?: string; text?: string; url?: string };

export async function scrapeFacebook(companyName: string): Promise<RawReview[]> {
  try {
    const query = `${companyName} complaint OR issue OR problem OR scam OR worst`;
    const cmd = `"${OPENCLI}" facebook search ${JSON.stringify(query)} -f json --limit 20 --window background`;
    const { stdout } = await execAsync(cmd, { timeout: 45_000 });
    const posts: FBPost[] = JSON.parse(stdout);
    const reviews: RawReview[] = posts
      .filter((p) => (p.text || p.title) && `${p.title ?? ""} ${p.text ?? ""}`.trim().length > 20)
      .map((p) => ({
        text:   `${p.title ? p.title + ". " : ""}${p.text ?? ""}`.trim().slice(0, 800),
        source: "facebook",
        date:   new Date().toISOString().split("T")[0],
        url:    p.url,
      }));
    console.log(`[scraper/facebook] "${companyName}" → ${reviews.length} posts`);
    return reviews;
  } catch (err) {
    console.warn(`[scraper/facebook] skipped (${(err as Error).message?.split("\n")[0]})`);
    return [];
  }
}

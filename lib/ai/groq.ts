import Groq from "groq-sdk";
import { computePriorityScore } from "@/lib/scoring";
import type { ComplaintCategory, AISummary, Snapshot, Company, DataSource } from "@/types";

const VALID_SOURCES = new Set<DataSource>(["play_store", "app_store", "reddit", "twitter"]);
function toSource(s: string): DataSource {
  return VALID_SOURCES.has(s as DataSource) ? (s as DataSource) : "play_store";
}

const MODEL = "llama-3.3-70b-versatile";

function getClient() {
  return new Groq({ apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY });
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RawReview {
  text: string;
  source: string;
  rating?: number | null;
  date: string;
  url?: string;   // source URL for citations (Reddit permalink, app store page, etc.)
  author?: string;
}

interface RawQuote {
  text: string;
  source: string;
  date: string;
  rating?: number | null;
  review_id?: number; // index into the original reviews array for URL lookup
}

interface RawCategory {
  name: string;
  complaint_count: number;
  avg_severity: number;
  regulatory_flag: boolean;
  quotes: RawQuote[];
  ai_recommendation: string;
}

// ─── Classify complaints ──────────────────────────────────────────────────────

export async function classifyComplaints(
  reviews: RawReview[],
  companyName: string,
  totalReviews: number
): Promise<ComplaintCategory[]> {
  const groq = getClient();

  const capped = reviews.slice(0, 60);

  // Number each review so Groq can reference them by ID for URL attribution
  const reviewText = capped
    .map(
      (r, i) =>
        `[${i}] [${r.source}${r.rating != null ? `, ${r.rating}★` : ""}] "${r.text}"`
    )
    .join("\n\n");

  // Build URL lookup map: review index → URL
  const urlMap = new Map<number, string>(
    capped.map((r, i) => [i, r.url ?? ""])
  );

  const prompt = `You are a product intelligence analyst specialising in fintech apps.

Analyse the following user reviews for "${companyName}" and group them into complaint categories.

REVIEWS (each prefixed with its ID in brackets):
${reviewText}

INSTRUCTIONS:
- Create between 5 and 10 complaint categories based on themes you find.
- Prioritise categories by frequency × severity.
- Regulatory areas (flag true): payments, data privacy, KYC, lending terms, refunds, account access.
- ai_recommendation: one concrete, actionable sentence for the product team.
- quotes: pick the 2-3 most representative quotes. Copy the text exactly as written.
  IMPORTANT: for each quote, include "review_id" — the number in brackets before that review.
- avg_severity: 0.0 (mild) to 1.0 (critical: financial loss, regulatory complaint).

Respond with ONLY a valid JSON object:
{
  "categories": [
    {
      "name": "string",
      "complaint_count": number,
      "avg_severity": number,
      "regulatory_flag": boolean,
      "ai_recommendation": "string",
      "quotes": [
        {
          "text": "string (exact quote from review)",
          "source": "string (play_store | app_store | reddit | twitter)",
          "date": "string",
          "rating": number | null,
          "review_id": number
        }
      ]
    }
  ]
}`;

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const raw = JSON.parse(response.choices[0].message.content ?? "{}") as {
    categories?: RawCategory[];
  };

  const rawCategories: RawCategory[] = raw.categories ?? [];

  return rawCategories.map((cat) => ({
    ...cat,
    score: computePriorityScore({
      complaintCount:    cat.complaint_count,
      totalReviews,
      sentimentSeverity: cat.avg_severity,
      regulatoryFlag:    cat.regulatory_flag,
    }).score,
    quotes: cat.quotes.map((q) => ({
      text:   q.text,
      source: toSource(q.source),
      date:   q.date,
      rating: q.rating ?? undefined,
      // Attach the source URL via the review_id Groq returned
      url:    q.review_id != null ? (urlMap.get(q.review_id) || undefined) : undefined,
    })),
  }));
}

// ─── Generate health summary ──────────────────────────────────────────────────

export async function generateHealthSummary(
  companyName: string,
  healthScore: number,
  categories: ComplaintCategory[],
  avgRating: number,
  reviewCount: number
): Promise<AISummary> {
  const groq = getClient();

  const topCategories = categories
    .slice(0, 4)
    .map((c) => `- ${c.name}: score ${c.score}/100, ${c.complaint_count} complaints, regulatory=${c.regulatory_flag}`)
    .join("\n");

  const prompt = `You are a product intelligence analyst. Write a concise health summary for "${companyName}".

Data:
- Health score: ${healthScore}/100
- Average rating: ${avgRating}/5
- Reviews analysed: ${reviewCount.toLocaleString()}
- Top complaint categories:
${topCategories}

Write exactly 3 short paragraphs (2-4 sentences each). Return a JSON object:
{
  "health_assessment": "Overall health assessment paragraph...",
  "urgent_problem": "Most urgent problem and why paragraph...",
  "improving": "What is improving or positive paragraph..."
}

Be specific, reference actual category names and scores. No generic filler. Return only JSON.`;

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
    response_format: { type: "json_object" },
  });

  const result = JSON.parse(
    response.choices[0].message.content ?? "{}"
  ) as AISummary;

  return {
    health_assessment: result.health_assessment ?? "",
    urgent_problem:    result.urgent_problem    ?? "",
    improving:         result.improving         ?? "",
  };
}

// ─── Generate competitive insight ─────────────────────────────────────────────

export async function generateCompetitiveInsight(
  companies: Company[],
  snapshots: Snapshot[]
): Promise<string> {
  const groq = getClient();

  const summaries = companies.map((company) => {
    const snap = snapshots.find((s) => s.company_id === company.id);
    if (!snap) return "";
    const top        = snap.categories[0];
    const regulatory = snap.categories.filter((c) => c.regulatory_flag).length;
    return `${company.name}: health ${snap.health_score}/100, rating ${snap.avg_rating}/5, top issue "${top?.name}" (${top?.score}/100), ${regulatory} regulatory categories`;
  }).filter(Boolean).join("\n");

  const prompt = `You are a product strategist. Write a sharp competitive analysis paragraph (3-5 sentences) comparing these fintech apps:

${summaries}

Be specific: name the leader, their advantage, the laggard's biggest weakness, and one concrete strategic recommendation. Return only the paragraph text, no JSON.`;

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.5,
  });

  return response.choices[0].message.content?.trim() ?? "";
}

// ─── Generate alert message ───────────────────────────────────────────────────

export async function generateAlertMessage(
  companyName: string,
  categoryName: string,
  changePercent: number,
  currentCount: number,
  previousCount: number
): Promise<string> {
  const groq = getClient();

  const prompt = `Write a concise (1-2 sentence) alert message for a product ops team about a complaint spike.

Company: ${companyName}
Category: ${categoryName}
Change: +${changePercent}% week-over-week (${previousCount} → ${currentCount} complaints)

Be direct and urgent. Return only the message text.`;

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
  });

  return response.choices[0].message.content?.trim() ?? "";
}

import { NextResponse } from "next/server";
import { generateCompetitiveInsight } from "@/lib/ai/groq";
import { MOCK_COMPANIES } from "@/lib/mock/companies";
import { MOCK_SNAPSHOTS } from "@/lib/mock/snapshots";

export async function POST(request: Request) {
  const { companyIds } = await request.json() as { companyIds: string[] };

  if (!companyIds || companyIds.length < 2) {
    return NextResponse.json({ error: "At least 2 companyIds required" }, { status: 400 });
  }

  const companies = MOCK_COMPANIES.filter((c) => companyIds.includes(c.id));
  const snapshots = companyIds
    .map((id) => MOCK_SNAPSHOTS[id])
    .filter(Boolean);

  try {
    const insight = await generateCompetitiveInsight(companies, snapshots);
    return NextResponse.json({ insight });
  } catch (err) {
    console.error("[Groq] Competitive insight failed:", err);
    return NextResponse.json(
      { error: "AI unavailable", insight: null },
      { status: 500 }
    );
  }
}

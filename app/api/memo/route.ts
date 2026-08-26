import { NextResponse } from "next/server";
import { generateIssueMemo } from "@/lib/ai/groq";
import type { ComplaintCategory } from "@/types";
import type { Industry } from "@/lib/industries";

export const maxDuration = 30;

export async function POST(request: Request) {
  const { companyName, category, industry } = await request.json() as {
    companyName: string;
    category: ComplaintCategory;
    industry?: Industry;
  };

  if (!companyName || !category?.name) {
    return NextResponse.json({ error: "companyName and category required" }, { status: 400 });
  }

  try {
    const memo = await generateIssueMemo(companyName, category, industry);
    return NextResponse.json(memo);
  } catch (err) {
    console.error("[api/memo] generation failed:", err);
    return NextResponse.json({ error: "Memo generation failed" }, { status: 500 });
  }
}

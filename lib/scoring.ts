/**
 * Priori Priority Score — fully bounded, industry-neutral formula.
 *
 *   Score = 100 × (frequency × 0.40 + severity × 0.35 + riskRelevance × 0.25)
 *
 * Every component is 0–1, so the maximum raw value is exactly 1.0
 * and the maximum score is exactly 100. No clamping needed.
 *
 * Components:
 *   frequency     — share of all retrieved feedback that mentions this category
 *   severity      — average negative sentiment intensity (AI-computed, 0–1)
 *   riskRelevance — 1.0 if any feedback in this category touches an elevated risk
 *                   dimension (compliance, safety, fraud, fulfillment, etc.), else 0
 *
 * The "risk relevance" component is industry-neutral. For fintech/banking it maps
 * to potential compliance or payment risk. For food delivery it maps to fulfillment
 * or food-safety risk. For SaaS it maps to billing or data-export risk.
 */

export interface ScoringInputs {
  /** Number of complaints in this category. */
  complaintCount: number;
  /** Total feedback items analyzed across all sources. */
  totalReviews: number;
  /** Average sentiment severity for this category (0–1, AI-computed). */
  sentimentSeverity: number;
  /** Whether any feedback in this category touches an elevated risk dimension. */
  riskRelevance: boolean;
}

export interface ScoreComponents {
  /** Points contributed by frequency (0–40). */
  frequency: number;
  /** Points contributed by severity (0–35). */
  severity: number;
  /** Points contributed by risk relevance (0 or 25). */
  riskRelevance: number;
}

export interface ScoringResult {
  /** Final priority score 0–100. */
  score: number;
  /** Breakdown of each component's contribution to the final score. */
  components: ScoreComponents;
  /** Raw frequency ratio 0–1 (before weighting). */
  frequencyScore: number;
  /** Raw severity 0–1 (before weighting). */
  severityScore: number;
  /** Raw risk relevance 0–1 (before weighting). */
  riskRelevanceScore: number;
}

const WEIGHTS = {
  frequency:     0.40,
  severity:      0.35,
  riskRelevance: 0.25,
} as const;

export function computePriorityScore(inputs: ScoringInputs): ScoringResult {
  const { complaintCount, totalReviews, sentimentSeverity, riskRelevance } = inputs;

  const frequencyScore     = Math.min(complaintCount / Math.max(totalReviews, 1), 1);
  const severityScore      = Math.min(Math.max(sentimentSeverity, 0), 1);
  const riskRelevanceScore = riskRelevance ? 1.0 : 0.0;

  const raw =
    frequencyScore     * WEIGHTS.frequency     +
    severityScore      * WEIGHTS.severity      +
    riskRelevanceScore * WEIGHTS.riskRelevance;

  const score = Math.round(raw * 100);

  return {
    score,
    components: {
      frequency:     Math.round(frequencyScore     * WEIGHTS.frequency     * 100),
      severity:      Math.round(severityScore      * WEIGHTS.severity      * 100),
      riskRelevance: Math.round(riskRelevanceScore * WEIGHTS.riskRelevance * 100),
    },
    frequencyScore,
    severityScore,
    riskRelevanceScore,
  };
}

/**
 * Derives the score breakdown from a complaint category's stored fields.
 * Used for display in the "Why this score?" panel.
 */
export function deriveScoreBreakdown(
  score: number,
  avgSeverity: number,
  riskRelevance: boolean,
): ScoreComponents {
  const severity      = Math.round(Math.min(Math.max(avgSeverity, 0), 1) * 35);
  const riskRelevancePoints = riskRelevance ? 25 : 0;
  const frequency     = Math.max(0, Math.min(score - severity - riskRelevancePoints, 40));
  return { frequency, severity, riskRelevance: riskRelevancePoints };
}

/** Returns the priority band for a given score. */
export function getPriorityBand(score: number): "critical" | "high" | "medium" | "low" {
  if (score >= 70) return "critical";
  if (score >= 40) return "high";
  if (score >= 20) return "medium";
  return "low";
}

/** Human-readable priority label. */
export function getPriorityLabel(score: number): string {
  return {
    critical: "Critical",
    high:     "High",
    medium:   "Medium",
    low:      "Low",
  }[getPriorityBand(score)];
}

/**
 * Priori prioritization scoring formula (from spec):
 *
 *   Score = (Frequency × 0.4) + (Sentiment Severity × 0.3) + (Regulatory Relevance × 0.3)
 *
 * Where:
 *   - frequency:          0–1, normalized complaint count per 100 reviews
 *   - sentimentSeverity:  0–1, average negative sentiment intensity (AI-computed)
 *   - regulatoryFlag:     1.5 if any complaints are regulatory-tagged, else 1.0
 *
 * Result is multiplied by 100 and clamped to [0, 100].
 */

export interface ScoringInputs {
  /** Number of complaints in this category. */
  complaintCount: number;
  /** Total reviews analyzed across all sources. */
  totalReviews: number;
  /** Average sentiment severity for this category (0–1). */
  sentimentSeverity: number;
  /** Whether any complaint in this category touches a regulatory area. */
  regulatoryFlag: boolean;
}

export interface ScoringResult {
  /** Final priority score 0–100. */
  score: number;
  /** Normalized frequency component (0–1). */
  frequencyNorm: number;
  /** Regulatory multiplier applied (1.0 or 1.5). */
  regulatoryMultiplier: number;
}

const WEIGHTS = { frequency: 0.4, sentiment: 0.3, regulatory: 0.3 } as const;
const REGULATORY_MULTIPLIER = 1.5;

export function computePriorityScore(inputs: ScoringInputs): ScoringResult {
  const { complaintCount, totalReviews, sentimentSeverity, regulatoryFlag } = inputs;

  // Frequency: complaints per 100 reviews, normalized to [0,1] (caps at 1)
  const frequencyNorm = Math.min(complaintCount / Math.max(totalReviews, 1), 1);

  const regulatoryMultiplier = regulatoryFlag ? REGULATORY_MULTIPLIER : 1.0;

  const raw =
    (frequencyNorm       * WEIGHTS.frequency) +
    (sentimentSeverity   * WEIGHTS.sentiment) +
    (regulatoryMultiplier * WEIGHTS.regulatory);

  // Scale to 0–100 and clamp
  const score = Math.round(Math.min(Math.max(raw * 100, 0), 100));

  return { score, frequencyNorm, regulatoryMultiplier };
}

/** Returns the priority band label for a given score. */
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

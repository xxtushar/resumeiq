import type { RequirementMatch } from "@/lib/ai/schemas";

const IMPORTANCE_WEIGHT = { required: 2, preferred: 1 } as const;
const STATUS_CREDIT = { met: 1, partial: 0.5, missing: 0 } as const;

/**
 * Match score (0-100) computed from per-requirement verdicts rather than
 * asked of the model, so it's explainable: required items count double, a
 * partial match earns half credit. Returns null with nothing to score.
 */
export function computeMatchScore(matches: RequirementMatch[]): number | null {
  let earned = 0;
  let possible = 0;

  for (const match of matches) {
    const weight = IMPORTANCE_WEIGHT[match.importance];
    earned += weight * STATUS_CREDIT[match.status];
    possible += weight;
  }

  return possible === 0 ? null : Math.round((earned / possible) * 100);
}

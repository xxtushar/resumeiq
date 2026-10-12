import { describe, expect, it } from "vitest";
import { computeMatchScore } from "@/lib/matching/score";
import type { RequirementMatch } from "@/lib/ai/schemas";

const req = (
  importance: RequirementMatch["importance"],
  status: RequirementMatch["status"]
): RequirementMatch => ({ requirement: "x", importance, status, evidence: null });

describe("computeMatchScore", () => {
  it("returns null with nothing to score", () => {
    expect(computeMatchScore([])).toBeNull();
  });

  it("scores all met as 100 and all missing as 0", () => {
    expect(computeMatchScore([req("required", "met"), req("preferred", "met")])).toBe(100);
    expect(computeMatchScore([req("required", "missing")])).toBe(0);
  });

  it("weights required items double and gives half credit for partial", () => {
    // required met (2/2) + required partial (1/2) + preferred missing (0/1) = 3/5
    expect(
      computeMatchScore([
        req("required", "met"),
        req("required", "partial"),
        req("preferred", "missing"),
      ])
    ).toBe(60);
  });

  it("penalizes a missing required item more than a missing preferred one", () => {
    const missingRequired = computeMatchScore([req("required", "missing"), req("preferred", "met")]);
    const missingPreferred = computeMatchScore([req("required", "met"), req("preferred", "missing")]);
    expect(missingRequired!).toBeLessThan(missingPreferred!);
  });
});

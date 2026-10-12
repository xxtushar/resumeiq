import { describe, expect, it } from "vitest";
import { analysisResultSchema, builderSectionSchema } from "@/lib/ai/schemas";

describe("analysisResultSchema", () => {
  it("accepts a well-formed analysis result", () => {
    const result = analysisResultSchema.safeParse({
      jobTitle: "Senior Frontend Engineer",
      company: "Linear",
      summary: "Solid resume, needs more quantified impact.",
      overallScore: 78,
      atsScore: 85,
      skillMatchPercent: 70,
      matchedSkills: [{ skill: "TypeScript", present: true, strength: 90 }],
      missingSkills: ["GraphQL"],
      keywordGaps: ["Kubernetes"],
      suggestions: ["Add metrics to your experience bullets."],
    });
    expect(result.success).toBe(true);
  });

  it("accepts a null company", () => {
    const result = analysisResultSchema.safeParse({
      jobTitle: "General resume review",
      company: null,
      summary: "x",
      overallScore: 50,
      atsScore: 50,
      skillMatchPercent: 50,
      matchedSkills: [],
      missingSkills: [],
      keywordGaps: [],
      suggestions: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a score outside 0-100", () => {
    const result = analysisResultSchema.safeParse({
      jobTitle: "x",
      company: null,
      summary: "x",
      overallScore: 150,
      atsScore: 50,
      skillMatchPercent: 50,
      matchedSkills: [],
      missingSkills: [],
      keywordGaps: [],
      suggestions: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a missing required field", () => {
    const result = analysisResultSchema.safeParse({
      jobTitle: "x",
      company: null,
      overallScore: 50,
      atsScore: 50,
      skillMatchPercent: 50,
      matchedSkills: [],
      missingSkills: [],
      keywordGaps: [],
      suggestions: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("builderSectionSchema", () => {
  it("allows bullets to be omitted", () => {
    const result = builderSectionSchema.safeParse({ content: "Some text" });
    expect(result.success).toBe(true);
  });
});

describe("parsedJobSchema", () => {
  it("requires at least one requirement with a known importance", async () => {
    const { parsedJobSchema } = await import("@/lib/ai/schemas");
    const base = { title: "Engineer", company: null, seniority: null, keywords: [] };
    expect(parsedJobSchema.safeParse({ ...base, requirements: [] }).success).toBe(false);
    expect(
      parsedJobSchema.safeParse({
        ...base,
        requirements: [{ text: "React", importance: "required", category: "skill" }],
      }).success
    ).toBe(true);
    expect(
      parsedJobSchema.safeParse({
        ...base,
        requirements: [{ text: "React", importance: "must", category: "skill" }],
      }).success
    ).toBe(false);
  });
});

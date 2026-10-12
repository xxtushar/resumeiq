import { z } from "zod";

export const skillMatchSchema = z.object({
  skill: z.string(),
  present: z.boolean(),
  strength: z.number().int().min(0).max(100).optional(),
});

export const requirementMatchSchema = z.object({
  requirement: z.string(),
  importance: z.enum(["required", "preferred"]),
  status: z.enum(["met", "partial", "missing"]),
  evidence: z.string().nullable(),
});

export type RequirementMatch = z.infer<typeof requirementMatchSchema>;

export const analysisResultSchema = z.object({
  jobTitle: z.string(),
  company: z.string().nullable(),
  summary: z.string(),
  overallScore: z.number().int().min(0).max(100),
  atsScore: z.number().int().min(0).max(100),
  skillMatchPercent: z.number().int().min(0).max(100),
  matchedSkills: z.array(skillMatchSchema),
  missingSkills: z.array(z.string()),
  keywordGaps: z.array(z.string()),
  suggestions: z.array(z.string()),
  /** Present when analyzed against a parsed job (Phase 4 matching). */
  requirementMatches: z.array(requirementMatchSchema).optional(),
  /** Computed from requirementMatches by lib/matching/score.ts. */
  matchScore: z.number().int().min(0).max(100).optional(),
});

export type SkillMatch = z.infer<typeof skillMatchSchema>;
export type AnalysisResult = z.infer<typeof analysisResultSchema>;

export const builderSectionSchema = z.object({
  content: z.string(),
  bullets: z.array(z.string()).optional(),
});

export type BuilderSection = z.infer<typeof builderSectionSchema>;

export const jobRequirementSchema = z.object({
  text: z.string().min(1),
  importance: z.enum(["required", "preferred"]),
  category: z.enum(["skill", "experience", "education", "other"]),
});

export const parsedJobSchema = z.object({
  title: z.string().min(1),
  company: z.string().nullable(),
  seniority: z.string().nullable(),
  requirements: z.array(jobRequirementSchema).min(1).max(25),
  keywords: z.array(z.string()),
});

export type JobRequirement = z.infer<typeof jobRequirementSchema>;
export type ParsedJob = z.infer<typeof parsedJobSchema>;

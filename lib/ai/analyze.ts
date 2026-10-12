import { runStructured } from "@/lib/ai/client";
import { z } from "zod";
import {
  analysisResultSchema,
  requirementMatchSchema,
  type AnalysisResult,
  type ParsedJob,
} from "@/lib/ai/schemas";

/** When matching against a parsed job, every requirement needs a verdict. */
const jobAnalysisSchema = analysisResultSchema.extend({
  requirementMatches: z.array(requirementMatchSchema).min(1),
});

export type AnalysisJobContext = {
  description: string;
  /** Parsed requirements; enables per-requirement matching. */
  parsed?: ParsedJob;
  /** Retrieved resume excerpts per requirement (RAG), if available. */
  evidenceContext?: string;
};

const ANALYSIS_SYSTEM_PROMPT = `You are an expert resume reviewer and ATS (Applicant Tracking System) analyst.
Score resumes honestly and specifically — avoid generic praise. When a job description is
provided, weight every score toward that specific role: overallScore and skillMatchPercent
should reflect fit against THIS posting, matchedSkills/missingSkills should be the posting's
actual requirements, and keywordGaps should be language from the posting missing in the resume.

When no job description is provided, there is nothing to match against — instead infer the
resume's likely target role for "jobTitle", leave "company" null, treat skillMatchPercent as
a general skill-breadth/strength score, matchedSkills as the resume's key evidenced skills,
missingSkills as commonly-expected skills for that inferred role that seem absent, and
keywordGaps as an empty array.

When a numbered REQUIREMENTS list is provided, return one requirementMatches entry per
requirement, in the same order, copying its text and importance. Judge status strictly from
the resume: "met" when clearly evidenced, "partial" when related but weaker (fewer years,
adjacent tool), "missing" otherwise. Quote or closely paraphrase the resume in "evidence"
(null when missing). Retrieved excerpts are the most semantically similar resume passages
for each requirement — use them as leads, but the full resume is the source of truth.

All scores are estimates, not certified ATS pass/fail results — do not claim more precision
than that in the summary.`;

export async function analyzeResume(
  resumeText: string,
  job?: AnalysisJobContext
): Promise<AnalysisResult> {
  const sections = [
    job
      ? "Analyze this resume against the target job description."
      : "Analyze this resume for general quality, clarity, and ATS-friendliness. No job description was provided.",
    `--- RESUME ---\n${resumeText}`,
  ];
  if (job) {
    sections.push(`--- JOB DESCRIPTION ---\n${job.description}`);
  }
  if (job?.parsed) {
    sections.push(
      `--- REQUIREMENTS ---\n${job.parsed.requirements
        .map((r, i) => `${i + 1}. [${r.importance}] ${r.text}`)
        .join("\n")}`
    );
  }
  if (job?.evidenceContext) {
    sections.push(`--- RETRIEVED RESUME EXCERPTS PER REQUIREMENT ---\n${job.evidenceContext}`);
  }
  const prompt = sections.join("\n\n");

  return runStructured({
    system: ANALYSIS_SYSTEM_PROMPT,
    prompt,
    toolName: "submit_resume_analysis",
    toolDescription:
      "Submit the structured resume analysis: scores, matched/missing skills, keyword gaps, and suggestions.",
    inputSchema: {
      type: "object",
      properties: {
        jobTitle: {
          type: "string",
          description:
            "The job title from the posting, or the resume's inferred target role if no posting was given.",
        },
        company: {
          type: ["string", "null"],
          description: "Company name from the posting, or null.",
        },
        summary: {
          type: "string",
          description: "2-3 sentence overview of the resume's fit and quality.",
        },
        overallScore: {
          type: "integer",
          minimum: 0,
          maximum: 100,
          description: "Overall estimated match/quality score out of 100.",
        },
        atsScore: {
          type: "integer",
          minimum: 0,
          maximum: 100,
          description: "Estimated ATS compatibility score out of 100 (formatting, structure, parseability).",
        },
        skillMatchPercent: {
          type: "integer",
          minimum: 0,
          maximum: 100,
          description: "Percent of the role's required skills the resume evidences (or general skill strength if no posting).",
        },
        matchedSkills: {
          type: "array",
          items: {
            type: "object",
            properties: {
              skill: { type: "string" },
              present: { type: "boolean" },
              strength: {
                type: "integer",
                minimum: 0,
                maximum: 100,
                description: "How strongly the resume evidences this skill.",
              },
            },
            required: ["skill", "present"],
          },
          description: "Skills the resume evidences (present: true for all entries here).",
        },
        missingSkills: {
          type: "array",
          items: { type: "string" },
          description: "Required (or commonly-expected) skills the resume doesn't evidence.",
        },
        keywordGaps: {
          type: "array",
          items: { type: "string" },
          description: "Language from the job description missing in the resume. Empty if no job description was given.",
        },
        suggestions: {
          type: "array",
          items: { type: "string" },
          description: "Specific, actionable, ranked-by-impact suggestions — not generic resume tips.",
        },
        requirementMatches: {
          type: "array",
          items: {
            type: "object",
            properties: {
              requirement: { type: "string" },
              importance: { type: "string", enum: ["required", "preferred"] },
              status: { type: "string", enum: ["met", "partial", "missing"] },
              evidence: { type: ["string", "null"] },
            },
            required: ["requirement", "importance", "status", "evidence"],
          },
          description:
            "Only when a REQUIREMENTS list is given: one verdict per requirement, in order. Omit otherwise.",
        },
      },
      required: [
        "jobTitle",
        "company",
        "summary",
        "overallScore",
        "atsScore",
        "skillMatchPercent",
        "matchedSkills",
        "missingSkills",
        "keywordGaps",
        "suggestions",
      ],
    },
    schema: job?.parsed ? jobAnalysisSchema : analysisResultSchema,
    maxTokens: job?.parsed ? 4096 : 2048,
  });
}

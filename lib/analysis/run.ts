import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import { analyzeResume } from "@/lib/ai/analyze";
import { parseJobDescription } from "@/lib/ai/job";
import type { ParsedJob } from "@/lib/ai/schemas";
import { consumeDailyAiCall } from "@/lib/db/rate-limit";
import { createJob, getJob } from "@/lib/db/jobs";
import { saveAnalysis } from "@/lib/db/resumes";
import { computeMatchScore } from "@/lib/matching/score";
import {
  buildEvidenceContext,
  hasResumeIndex,
  indexResume,
  retrieveEvidence,
} from "@/lib/rag/retrieval";

type Client = SupabaseClient<Database>;

export type ResolvedJob = { id?: string; description: string; parsed?: ParsedJob };

export class JobNotFoundError extends Error {
  constructor() {
    super("That saved job no longer exists.");
    this.name = "JobNotFoundError";
  }
}

/**
 * Loads a saved job, or parses and saves a newly pasted description.
 * If parsing fails the analysis still runs on the raw description, just
 * without per-requirement matching.
 */
export async function resolveJob(
  supabase: Client,
  userId: string,
  input: { jobId?: string; description?: string }
): Promise<ResolvedJob | undefined> {
  if (input.jobId) {
    const job = await getJob(supabase, userId, input.jobId);
    if (!job) throw new JobNotFoundError();
    return { id: job.id, description: job.description, parsed: job.parsed };
  }
  if (!input.description) return undefined;

  await consumeDailyAiCall(supabase, userId, "job_parse");
  try {
    const parsed = await parseJobDescription(input.description);
    const job = await createJob(supabase, userId, input.description, parsed);
    return { id: job.id, description: job.description, parsed };
  } catch (error) {
    console.error("[resolveJob] parsing failed; continuing without requirements", error);
    return { description: input.description };
  }
}

/**
 * Retrieval step (RAG): embeds the resume on first use, then pulls the most
 * relevant excerpts per requirement. Best-effort — if embeddings are
 * unavailable the model still has the full resume text.
 */
async function getEvidenceContext(
  supabase: Client,
  userId: string,
  resume: { id: string; text: string },
  parsed: ParsedJob
) {
  try {
    if (!(await hasResumeIndex(supabase, resume.id))) {
      await indexResume(supabase, userId, resume.id, resume.text);
    }
    const evidence = await retrieveEvidence(
      supabase,
      resume.id,
      parsed.requirements.map((r) => r.text)
    );
    return buildEvidenceContext(evidence);
  } catch (error) {
    console.error("[runAnalysis] retrieval failed; continuing without excerpts", error);
    return undefined;
  }
}

/** Runs one analysis (resume, optionally against a job) and saves it. */
export async function runAnalysis(
  supabase: Client,
  userId: string,
  resume: { id: string; text: string },
  job: ResolvedJob | undefined
) {
  await consumeDailyAiCall(supabase, userId, "analysis");

  const evidenceContext = job?.parsed
    ? await getEvidenceContext(supabase, userId, resume, job.parsed)
    : undefined;

  const result = await analyzeResume(
    resume.text,
    job && { description: job.description, parsed: job.parsed, evidenceContext }
  );

  const matchScore = result.requirementMatches
    ? computeMatchScore(result.requirementMatches)
    : null;
  if (matchScore !== null) {
    // Against a parsed job, the headline score is the computed match score.
    result.matchScore = matchScore;
    result.overallScore = matchScore;
  }

  return saveAnalysis(supabase, userId, {
    resumeId: resume.id,
    jobDescription: job?.description,
    jobId: job?.id,
    score: result.overallScore,
    result: result as unknown as Json,
  });
}

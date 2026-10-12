import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  extractResumeText,
  resolveMimeType,
  UnsupportedFileTypeError,
} from "@/lib/parsing";
import { createResume, deleteResume, getResume } from "@/lib/db/resumes";
import { removeResumeFile, uploadResumeFile } from "@/lib/db/resume-files";
import { DailyLimitExceededError } from "@/lib/db/rate-limit";
import { MAX_JOB_DESCRIPTION_CHARS, MAX_RESUME_CHARS } from "@/lib/ai/limits";
import { JobNotFoundError, resolveJob, runAnalysis } from "@/lib/analysis/run";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

const optionalId = z
  .string()
  .uuid()
  .optional()
  .or(z.literal("").transform(() => undefined));

/**
 * Analyzes a resume — a new upload (`file`) or an existing one (`resumeId`)
 * — optionally against a job: newly pasted (`jobDescription`) or saved
 * (`jobId`).
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const ids = z
    .object({ resumeId: optionalId, jobId: optionalId })
    .safeParse({
      resumeId: formData.get("resumeId") ?? undefined,
      jobId: formData.get("jobId") ?? undefined,
    });
  if (!ids.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { resumeId: existingResumeId, jobId } = ids.data;

  const hasFile = file instanceof File && file.size > 0;
  if (!hasFile && !existingResumeId) {
    return NextResponse.json(
      { error: "Upload a resume file or pick one you've already uploaded." },
      { status: 400 }
    );
  }
  if (hasFile && file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "File too large (max 5MB)." }, { status: 400 });
  }

  const rawJobDescription = formData.get("jobDescription");
  const jobDescriptionText =
    !jobId && typeof rawJobDescription === "string" && rawJobDescription.trim()
      ? rawJobDescription.trim()
      : undefined;

  if (jobDescriptionText && jobDescriptionText.length > MAX_JOB_DESCRIPTION_CHARS) {
    return NextResponse.json(
      { error: `Job description is too long (max ${MAX_JOB_DESCRIPTION_CHARS.toLocaleString()} characters).` },
      { status: 400 }
    );
  }

  // Track what this request created so a failure doesn't leave behind a
  // resume card with no result (or an orphaned file in Storage).
  let createdResumeId: string | undefined;
  let storagePath: string | undefined;

  try {
    let resume: { id: string; text: string };

    if (hasFile) {
      const mimeType = resolveMimeType(file.name, file.type);
      const buffer = Buffer.from(await file.arrayBuffer());
      const resumeText = await extractResumeText(buffer, mimeType);

      if (resumeText.trim().length < 50) {
        return NextResponse.json(
          { error: "Couldn't extract enough text from that file. Try a different format." },
          { status: 422 }
        );
      }
      if (resumeText.length > MAX_RESUME_CHARS) {
        return NextResponse.json(
          { error: "That resume is too long to analyze. Try a shorter version." },
          { status: 422 }
        );
      }

      storagePath = await uploadResumeFile(supabase, userId, buffer, mimeType);
      const created = await createResume(supabase, userId, {
        title: file.name.replace(/\.[^.]+$/, ""),
        source: "uploaded",
        storagePath,
        rawText: resumeText,
      });
      createdResumeId = created.id;
      resume = { id: created.id, text: resumeText };
    } else {
      const existing = await getResume(supabase, userId, existingResumeId!).catch(() => null);
      if (!existing?.raw_text) {
        return NextResponse.json(
          { error: "That resume can't be re-analyzed. Upload it again instead." },
          { status: 404 }
        );
      }
      resume = { id: existing.id, text: existing.raw_text };
    }

    const job = await resolveJob(supabase, userId, {
      jobId,
      description: jobDescriptionText,
    });
    const analysis = await runAnalysis(supabase, userId, resume, job);

    return NextResponse.json({ resumeId: resume.id, analysisId: analysis.id });
  } catch (error) {
    await cleanUp(supabase, userId, createdResumeId, storagePath);

    if (error instanceof UnsupportedFileTypeError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof DailyLimitExceededError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    if (error instanceof JobNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error("[/api/analyze]", error);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}

async function cleanUp(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  resumeId: string | undefined,
  storagePath: string | undefined
) {
  try {
    if (resumeId) await deleteResume(supabase, userId, resumeId);
    if (storagePath) await removeResumeFile(supabase, storagePath);
  } catch (cleanupError) {
    console.error("[/api/analyze] cleanup failed", cleanupError);
  }
}

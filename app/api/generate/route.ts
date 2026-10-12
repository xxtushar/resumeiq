import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { generateBuilderSection, type BuilderSectionType } from "@/lib/ai/generate";
import { consumeDailyAiCall, DailyLimitExceededError } from "@/lib/db/rate-limit";
import { MAX_JOB_DESCRIPTION_CHARS, MAX_SECTION_NOTES_CHARS } from "@/lib/ai/limits";

const bodySchema = z.object({
  section: z.enum(["summary", "experience", "skills", "education"]),
  input: z
    .string()
    .trim()
    .min(1, "Add some notes for this section first.")
    .max(MAX_SECTION_NOTES_CHARS, "Those notes are too long — trim them down a bit."),
  jobDescription: z
    .string()
    .max(MAX_JOB_DESCRIPTION_CHARS, "Job description is too long.")
    .optional(),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub as string | undefined;

  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 }
    );
  }

  try {
    await consumeDailyAiCall(supabase, userId, "generate");

    const result = await generateBuilderSection(
      parsed.data.section as BuilderSectionType,
      parsed.data.input,
      parsed.data.jobDescription || undefined
    );

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof DailyLimitExceededError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    console.error("[/api/generate]", error);
    return NextResponse.json(
      { error: "Generation failed. Please try again." },
      { status: 500 }
    );
  }
}

"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createResume, saveVersion } from "@/lib/db/resumes";
import { LAYOUTS, resumeDocSchema } from "@/lib/builder/schema";
import { defaultResume } from "@/lib/builder/default-resume";
import type { Json } from "@/types/database";

const draftSchema = z.object({
  title: z.string().trim().min(1).max(120),
  layout: z.enum(LAYOUTS).catch("experienced"),
});

export type CreateDraftState = { error: string } | null;

/** New in-app draft, pre-filled with the default (ATS score 90+) resume. */
export async function createDraft(
  _prevState: CreateDraftState,
  formData: FormData
): Promise<CreateDraftState> {
  const parsed = draftSchema.safeParse({
    title: formData.get("title"),
    layout: formData.get("layout"),
  });
  if (!parsed.success) {
    return { error: "Give your draft a title." };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub as string | undefined;
  if (!userId) {
    return { error: "Not authenticated." };
  }

  const resume = await createResume(supabase, userId, {
    title: parsed.data.title,
    source: "builder",
  });

  await saveVersion(
    supabase,
    userId,
    resume.id,
    defaultResume(parsed.data.layout) as unknown as Json
  );

  redirect(`/builder/${resume.id}`);
}

export type SaveGuestDraftResult =
  | { ok: true; resumeId: string }
  | { ok: false; error: string; needsLogin?: boolean };

/** Saves a resume built on the public /resume-builder page to the signed-in
 * user's account as a new builder draft. */
export async function saveGuestDraft(content: unknown): Promise<SaveGuestDraftResult> {
  const parsed = resumeDocSchema.safeParse(content);
  if (!parsed.success) {
    return { ok: false, error: "Something in the resume isn't valid. Check the dates and try again." };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub as string | undefined;
  if (!userId) {
    return { ok: false, error: "Log in to save this to your account.", needsLogin: true };
  }

  const { fullName, headline } = parsed.data.contact;
  const title =
    [fullName.trim(), headline.trim()].filter(Boolean).join(", ").slice(0, 120) || "My resume";

  const resume = await createResume(supabase, userId, { title, source: "builder" });
  await saveVersion(supabase, userId, resume.id, parsed.data as unknown as Json);

  return { ok: true, resumeId: resume.id };
}

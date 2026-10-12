"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { deleteResume, renameResume } from "@/lib/db/resumes";
import { removeResumeFile } from "@/lib/db/resume-files";

const resumeIdSchema = z.string().uuid();
const titleSchema = z
  .string()
  .trim()
  .min(1, "Title can't be empty.")
  .max(120, "Keep the title under 120 characters.");

export type ResumeActionResult = { error: string } | { ok: true };

async function getUserId() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return { supabase, userId: data?.claims.sub as string | undefined };
}

export async function renameResumeAction(
  resumeId: string,
  title: string
): Promise<ResumeActionResult> {
  const id = resumeIdSchema.safeParse(resumeId);
  const parsedTitle = titleSchema.safeParse(title);
  if (!id.success) return { error: "Invalid resume." };
  if (!parsedTitle.success) {
    return { error: parsedTitle.error.issues[0]?.message ?? "Invalid title." };
  }

  const { supabase, userId } = await getUserId();
  if (!userId) return { error: "Not authenticated." };

  try {
    const updated = await renameResume(supabase, userId, id.data, parsedTitle.data);
    if (!updated) return { error: "Resume not found." };
  } catch (error) {
    console.error("[renameResumeAction]", error);
    return { error: "Couldn't rename that resume. Please try again." };
  }

  refresh();
  return { ok: true };
}

/** Pass `redirectToDashboard` when deleting from the resume's own page, which
 * would otherwise re-render as a 404. */
export async function deleteResumeAction(
  resumeId: string,
  redirectToDashboard = false
): Promise<ResumeActionResult> {
  const id = resumeIdSchema.safeParse(resumeId);
  if (!id.success) return { error: "Invalid resume." };

  const { supabase, userId } = await getUserId();
  if (!userId) return { error: "Not authenticated." };

  try {
    const deleted = await deleteResume(supabase, userId, id.data);
    if (!deleted) return { error: "Resume not found." };

    if (deleted.storage_path) {
      // The resume is already gone; a leftover file is only wasted space,
      // so log instead of reporting the delete as failed.
      await removeResumeFile(supabase, deleted.storage_path).catch((error) =>
        console.error("[deleteResumeAction] file cleanup failed", error)
      );
    }
  } catch (error) {
    console.error("[deleteResumeAction]", error);
    return { error: "Couldn't delete that resume. Please try again." };
  }

  if (redirectToDashboard) redirect("/dashboard");
  refresh();
  return { ok: true };
}

"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { deleteJob } from "@/lib/db/jobs";

export type JobActionResult = { error: string } | { ok: true };

/** Deletes a saved job. Its past analyses stay (they keep the job text). */
export async function deleteJobAction(jobId: string): Promise<JobActionResult> {
  const id = z.string().uuid().safeParse(jobId);
  if (!id.success) return { error: "Invalid job." };

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub as string | undefined;
  if (!userId) return { error: "Not authenticated." };

  try {
    const deleted = await deleteJob(supabase, userId, id.data);
    if (!deleted) return { error: "Job not found." };
  } catch (error) {
    console.error("[deleteJobAction]", error);
    return { error: "Couldn't delete that job. Please try again." };
  }

  refresh();
  return { ok: true };
}

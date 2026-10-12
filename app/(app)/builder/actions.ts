"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createResume } from "@/lib/db/resumes";

const titleSchema = z.string().trim().min(1).max(120);

export type CreateDraftState = { error: string } | null;

export async function createDraft(
  _prevState: CreateDraftState,
  formData: FormData
): Promise<CreateDraftState> {
  const parsed = titleSchema.safeParse(formData.get("title"));
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
    title: parsed.data,
    source: "builder",
  });

  redirect(`/builder/${resume.id}`);
}

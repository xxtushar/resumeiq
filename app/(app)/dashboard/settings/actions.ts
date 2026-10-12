"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { updateProfileName } from "@/lib/db/profiles";

export type SettingsActionState = { error: string } | { message: string } | null;

const nameSchema = z.string().trim().max(100, "Keep your name under 100 characters.");

export async function updateProfileAction(
  _prevState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const parsed = nameSchema.safeParse(formData.get("fullName") ?? "");
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid name." };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub as string | undefined;
  if (!userId) return { error: "Not authenticated." };

  try {
    const updated = await updateProfileName(supabase, userId, parsed.data || null);
    if (!updated) return { error: "Profile not found." };
  } catch (error) {
    console.error("[updateProfileAction]", error);
    return { error: "Couldn't save your profile. Please try again." };
  }

  refresh();
  return { message: "Profile saved." };
}

/**
 * Permanently deletes the account: stored files first (Storage isn't
 * covered by foreign keys), then the auth user via the `delete_own_account`
 * database function, which cascades to every table. Requires typing the
 * account email to confirm.
 */
export async function deleteAccountAction(
  _prevState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims.sub as string | undefined;
  const email = typeof data?.claims.email === "string" ? data.claims.email : undefined;
  if (!userId) return { error: "Not authenticated." };

  const typed = String(formData.get("confirmEmail") ?? "").trim().toLowerCase();
  if (!email || typed !== email.toLowerCase()) {
    return { error: "Type your account email exactly to confirm." };
  }

  try {
    const { data: files, error: listError } = await supabase.storage
      .from("resumes")
      .list(userId, { limit: 1000 });
    if (listError) throw listError;
    if (files.length > 0) {
      const { error: removeError } = await supabase.storage
        .from("resumes")
        .remove(files.map((f) => `${userId}/${f.name}`));
      if (removeError) throw removeError;
    }

    const { error } = await supabase.rpc("delete_own_account");
    if (error) throw error;
  } catch (error) {
    console.error("[deleteAccountAction]", error);
    return { error: "Couldn't delete your account. Please try again." };
  }

  // The user is gone; clear this browser's session cookies.
  await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
  redirect("/");
}

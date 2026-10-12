"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const credentialsSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

/** Where email links should return to: the origin the user is actually on
 * (any port or domain), falling back to NEXT_PUBLIC_SITE_URL. */
async function getSiteOrigin() {
  const origin = (await headers()).get("origin");
  return origin ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";
}

export type AuthActionState =
  | { error: string; unconfirmedEmail?: string }
  | { message: string }
  | null;

export async function login(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error?.code === "email_not_confirmed") {
    return {
      error: "Please confirm your email before logging in. Check your inbox (and spam folder).",
      unconfirmedEmail: parsed.data.email,
    };
  }
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signup(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  // The default "Confirm signup" email sends the user back here via
  // emailRedirectTo; /auth/confirm completes the sign-in.
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: `${await getSiteOrigin()}/auth/confirm` },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/login?confirmEmail=1");
}

/** Re-sends the signup confirmation email for an account that hasn't been
 * confirmed yet (offered on the login form after "email not confirmed"). */
export async function resendConfirmation(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = credentialsSchema.shape.email.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { error: "Enter a valid email address." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data,
    options: { emailRedirectTo: `${await getSiteOrigin()}/auth/confirm` },
  });

  if (error) {
    console.error("[resendConfirmation]", error);
    return {
      error:
        error.status === 429
          ? "Too many emails sent. Please wait a minute and try again."
          : "Couldn't send the email right now. Please try again shortly.",
    };
  }

  return { message: "Confirmation email sent. Click the link in it, then log in." };
}

export async function requestPasswordReset(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = credentialsSchema.shape.email.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { error: "Enter a valid email address." };
  }

  // The reset email links back through /auth/confirm, which signs the user
  // in and continues to /reset-password.
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${await getSiteOrigin()}/auth/confirm?next=/reset-password`,
  });

  if (error && error.status !== 400) {
    console.error("[requestPasswordReset]", error);
    return { error: "Couldn't send the email right now. Please try again shortly." };
  }

  // Same message whether or not the account exists, so this form can't be
  // used to discover which emails are registered.
  return {
    message: "If an account exists for that email, a reset link is on its way.",
  };
}

const newPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "Passwords don't match." });

/** Sets a new password for the logged-in user (reset link or settings). */
export async function updatePassword(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = newPasswordSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { error: error.message };
  }

  if (formData.get("redirectTo") === "/dashboard") {
    redirect("/dashboard");
  }
  return { message: "Password updated." };
}

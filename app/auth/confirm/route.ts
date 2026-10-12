import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Landing point for every auth email link (signup confirmation, password
 * reset). Handles both link styles, so no email template changes are needed:
 * - default templates: Supabase verifies the link, then redirects here with
 *   a PKCE `code` (the verifier cookie was set when the email was requested)
 * - customized templates: `token_hash` + `type`, verified here directly
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const flowId = searchParams.get("sb_flow_id");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next");

  const redirectTo = request.nextUrl.clone();
  // Only same-site paths, so the link can't bounce users to another domain.
  redirectTo.pathname =
    next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  redirectTo.search = "";

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(
      code,
      flowId ? { flowId } : undefined
    );
    if (!error) return NextResponse.redirect(redirectTo);
    console.error("[/auth/confirm] code exchange failed", error.message);
  } else if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) return NextResponse.redirect(redirectTo);
    console.error("[/auth/confirm] OTP verification failed", error.message);
  }

  redirectTo.pathname = "/error";
  return NextResponse.redirect(redirectTo);
}

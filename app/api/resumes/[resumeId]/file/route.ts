import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getResume } from "@/lib/db/resumes";
import { getResumeFileDownloadUrl } from "@/lib/db/resume-files";

/** Redirects to a short-lived signed URL for the original uploaded file. */
export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/resumes/[resumeId]/file">
) {
  const { resumeId } = await params;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub as string | undefined;

  if (!userId) {
    return new Response("Not authenticated", { status: 401 });
  }

  const resume = await getResume(supabase, userId, resumeId).catch(() => null);
  if (!resume?.storage_path) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const url = await getResumeFileDownloadUrl(
      supabase,
      resume.storage_path,
      resume.title
    );
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("[/api/resumes/file]", error);
    return new Response("Couldn't fetch that file.", { status: 500 });
  }
}

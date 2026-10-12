import { createClient } from "@/lib/supabase/server";
import { getResume, getLatestVersion } from "@/lib/db/resumes";
import { renderResumePdfBuffer } from "@/lib/pdf/resume-document";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/api/builder/[resumeId]/pdf">
) {
  const { resumeId } = await params;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub as string | undefined;

  if (!userId) {
    return new Response("Not authenticated", { status: 401 });
  }

  const resume = await getResume(supabase, userId, resumeId).catch(() => null);
  if (!resume) {
    return new Response("Not found", { status: 404 });
  }

  const version = await getLatestVersion(supabase, userId, resumeId);
  const sections = (version?.content ?? {}) as Record<
    string,
    { content: string }
  >;

  const buffer = await renderResumePdfBuffer(resume.title, sections);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${resume.title.replace(/[^a-z0-9-_ ]/gi, "")}.pdf"`,
    },
  });
}

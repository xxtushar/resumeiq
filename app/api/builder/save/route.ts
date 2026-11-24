import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { saveVersion, getResume } from "@/lib/db/resumes";
import { resumeDocSchema } from "@/lib/builder/schema";
import type { Json } from "@/types/database";

const bodySchema = z.object({
  resumeId: z.string().uuid(),
  content: resumeDocSchema,
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
    const issue = parsed.error.issues[0];
    const where = issue?.path.slice(1).join(" › ");
    return NextResponse.json(
      {
        error: issue
          ? `Couldn't save: ${where ? `${where} — ` : ""}${issue.message}`
          : "Invalid request.",
      },
      { status: 400 }
    );
  }

  // getResume enforces the RLS-equivalent ownership check at the app layer too.
  const resume = await getResume(supabase, userId, parsed.data.resumeId).catch(
    () => null
  );
  if (!resume || resume.source !== "builder") {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  const version = await saveVersion(
    supabase,
    userId,
    parsed.data.resumeId,
    parsed.data.content as unknown as Json
  );

  return NextResponse.json({ versionId: version.id, savedAt: version.created_at });
}

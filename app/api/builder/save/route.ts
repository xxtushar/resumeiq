import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { saveVersion, getResume } from "@/lib/db/resumes";
import type { Json } from "@/types/database";

const sectionContentSchema = z.object({
  input: z.string(),
  content: z.string(),
  bullets: z.array(z.string()).optional(),
});

const bodySchema = z.object({
  resumeId: z.string().uuid(),
  content: z.record(z.string(), sectionContentSchema),
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
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // getResume enforces the RLS-equivalent ownership check at the app layer too.
  const resume = await getResume(supabase, userId, parsed.data.resumeId).catch(
    () => null
  );
  if (!resume) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  const version = await saveVersion(
    supabase,
    userId,
    parsed.data.resumeId,
    parsed.data.content as unknown as Json
  );

  return NextResponse.json({ versionId: version.id });
}

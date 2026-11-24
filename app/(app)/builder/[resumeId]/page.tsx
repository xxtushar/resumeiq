import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getResume, getLatestVersion } from "@/lib/db/resumes";
import { ResumeTitle } from "@/components/resume-title";
import { BuilderEditor } from "@/components/builder-editor";
import { normalizeResume } from "@/lib/builder/schema";

export default async function BuilderPage(
  props: PageProps<"/builder/[resumeId]">
) {
  const { resumeId } = await props.params;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data!.claims.sub as string;

  const resume = await getResume(supabase, userId, resumeId).catch(() => null);
  if (!resume) notFound();
  if (resume.source !== "builder") redirect(`/analyze/${resume.id}`);

  const version = await getLatestVersion(supabase, userId, resumeId);

  return (
    <BuilderEditor
      resumeId={resumeId}
      initial={normalizeResume(version?.content)}
      title={
        <ResumeTitle
          resumeId={resume.id}
          title={resume.title}
          hasFile={false}
          redirectOnDelete
          titleClassName="font-display text-[1.5rem] leading-tight text-ink"
        />
      }
    />
  );
}

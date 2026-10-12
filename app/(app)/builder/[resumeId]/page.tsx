import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getResume, getLatestVersion } from "@/lib/db/resumes";
import { buttonVariants } from "@/components/ui/button";
import { ResumeTitle } from "@/components/resume-title";
import { BuilderEditor, type EditorState } from "@/components/builder-editor";

export default async function BuilderPage(
  props: PageProps<"/builder/[resumeId]">
) {
  const { resumeId } = await props.params;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data!.claims.sub as string;

  const resume = await getResume(supabase, userId, resumeId).catch(() => null);
  if (!resume) notFound();

  const version = await getLatestVersion(supabase, userId, resumeId);

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <ResumeTitle
          resumeId={resume.id}
          title={resume.title}
          hasFile={false}
          redirectOnDelete
          titleClassName="font-display text-[1.5rem] text-ink"
        />
        <a
          href={`/api/builder/${resumeId}/pdf`}
          className={buttonVariants({ variant: "secondary" })}
        >
          Download PDF
        </a>
      </div>
      <BuilderEditor
        resumeId={resumeId}
        initial={(version?.content as Partial<EditorState> | null) ?? {}}
      />
    </div>
  );
}

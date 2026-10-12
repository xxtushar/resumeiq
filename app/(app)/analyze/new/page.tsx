import { createClient } from "@/lib/supabase/server";
import { listResumes } from "@/lib/db/resumes";
import { listJobs } from "@/lib/db/jobs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AnalyzeForm } from "./analyze-form";

export default async function NewAnalysisPage(
  props: PageProps<"/analyze/new">
) {
  const { resume } = await props.searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data!.claims.sub as string;

  const [resumes, jobs] = await Promise.all([
    listResumes(supabase, userId),
    listJobs(supabase, userId),
  ]);

  // Only uploads keep extracted text, so only they can be re-analyzed.
  const uploaded = resumes
    .filter((r) => r.source === "uploaded")
    .map((r) => ({ id: r.id, label: r.title }));
  const initialResumeId =
    typeof resume === "string" && uploaded.some((r) => r.id === resume)
      ? resume
      : undefined;

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Analyze a resume</CardTitle>
            <CardDescription>
              Match it against a job requirement by requirement, or get a
              general ATS and quality review.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <AnalyzeForm
            resumes={uploaded}
            jobs={jobs.map((j) => ({
              id: j.id,
              label: j.company ? `${j.title} · ${j.company}` : j.title,
            }))}
            initialResumeId={initialResumeId}
          />
        </CardContent>
      </Card>
    </div>
  );
}

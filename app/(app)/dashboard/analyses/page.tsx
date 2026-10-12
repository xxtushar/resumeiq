import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listAllAnalyses } from "@/lib/db/resumes";
import { listJobs } from "@/lib/db/jobs";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScoreRing } from "@/components/ui/score-ring";
import { DeleteJobButton } from "@/components/delete-job-button";
import type { AnalysisResult } from "@/lib/ai/schemas";

export default async function AnalysesPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data!.claims.sub as string;

  const [analyses, jobs] = await Promise.all([
    listAllAnalyses(supabase, userId),
    listJobs(supabase, userId),
  ]);

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>All analyses</CardTitle>
            <CardDescription>
              Every resume you&apos;ve analyzed, newest first.
            </CardDescription>
          </div>
          <Link href="/analyze/new" className={buttonVariants({ size: "sm" })}>
            New analysis
          </Link>
        </CardHeader>
        <CardContent className="pt-0">
          {analyses.length === 0 ? (
            <p className="py-10 text-center text-[13.5px] text-ink-muted">
              No analyses yet.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {analyses.map((row) => {
                const result = row.result as unknown as AnalysisResult;
                return (
                  <li key={row.id}>
                    <Link
                      href={`/analyze/${row.resume_id}?analysis=${row.id}`}
                      className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0"
                    >
                      <ScoreRing score={row.score} size={44} strokeWidth={4} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14.5px] font-medium text-ink">
                          {result.jobTitle}
                          {result.company ? (
                            <span className="text-ink-muted"> · {result.company}</span>
                          ) : null}
                        </p>
                        <p className="mt-0.5 truncate text-[12.5px] text-ink-muted">
                          {row.resume_title} ·{" "}
                          {new Date(row.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                          {result.requirementMatches
                            ? ` · ${result.requirementMatches.filter((m) => m.status === "met").length}/${result.requirementMatches.length} requirements met`
                            : ""}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Saved jobs</CardTitle>
            <CardDescription>
              Postings you&apos;ve pasted, parsed once and reusable from
              &ldquo;Saved job&rdquo; when you run a new analysis.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {jobs.length === 0 ? (
            <p className="py-6 text-center text-[13.5px] text-ink-muted">
              Jobs you paste into an analysis are saved here.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {jobs.map((job) => (
                <li
                  key={job.id}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-medium text-ink">
                      {job.title}
                      {job.company ? (
                        <span className="text-ink-muted"> · {job.company}</span>
                      ) : null}
                    </p>
                    <p className="text-[12.5px] text-ink-muted">
                      Saved {new Date(job.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <DeleteJobButton jobId={job.id} title={job.title} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listResumes, listRecentAnalyses } from "@/lib/db/resumes";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResumeTitle } from "@/components/resume-title";
import { RecentAnalysesSection } from "@/components/dashboard/recent-analyses-section";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data!.claims.sub as string;

  const [resumes, recentAnalyses] = await Promise.all([
    listResumes(supabase, userId),
    listRecentAnalyses(supabase, userId),
  ]);

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-[1.5rem] text-ink">Your resumes</h2>
          <p className="text-[13.5px] text-ink-muted">
            Upload a resume for AI analysis, or build one from scratch.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/builder/new" className={buttonVariants({ variant: "secondary" })}>
            New builder draft
          </Link>
          <Link href="/analyze/new" className={buttonVariants()}>
            Analyze a resume
          </Link>
        </div>
      </div>

      {resumes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-[13.5px] text-ink-muted">
            No resumes yet. Upload one to get an AI analysis, or start a
            builder draft.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {resumes.map((resume) => (
            <Card
              key={resume.id}
              className="relative h-full transition-colors hover:bg-paper"
            >
              <CardHeader className="flex-col gap-2">
                <ResumeTitle
                  resumeId={resume.id}
                  title={resume.title}
                  hasFile={Boolean(resume.storage_path)}
                  href={
                    resume.source === "uploaded"
                      ? `/analyze/${resume.id}`
                      : `/builder/${resume.id}`
                  }
                  titleClassName="text-[15px] font-semibold text-ink"
                />
                <div className="flex w-full items-center justify-between gap-2">
                  <CardDescription>
                    Updated {new Date(resume.updated_at).toLocaleDateString()}
                  </CardDescription>
                  <Badge variant={resume.source === "uploaded" ? "brand" : "neutral"}>
                    {resume.source === "uploaded" ? "Analyzed" : "Builder"}
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <RecentAnalysesSection analyses={recentAnalyses} />
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getAnalysis,
  getLatestAnalysis,
  getResume,
  listResumeAnalyses,
} from "@/lib/db/resumes";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScoreRing } from "@/components/ui/score-ring";
import { Badge } from "@/components/ui/badge";
import { ResumeTitle } from "@/components/resume-title";
import type { AnalysisResult, RequirementMatch } from "@/lib/ai/schemas";
import { cn } from "@/lib/utils";

export default async function AnalysisResultPage(
  props: PageProps<"/analyze/[resumeId]">
) {
  const { resumeId } = await props.params;
  const { analysis: analysisParam } = await props.searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data!.claims.sub as string;

  const resume = await getResume(supabase, userId, resumeId).catch(() => null);
  if (!resume) notFound();

  const [selected, history] = await Promise.all([
    typeof analysisParam === "string"
      ? getAnalysis(supabase, userId, resumeId, analysisParam).catch(() => null)
      : getLatestAnalysis(supabase, userId, resumeId),
    listResumeAnalyses(supabase, userId, resumeId),
  ]);
  const analysis = selected;
  if (!analysis) notFound();

  const result = analysis.result as unknown as AnalysisResult;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <ResumeTitle
            resumeId={resume.id}
            title={resume.title}
            hasFile={Boolean(resume.storage_path)}
            redirectOnDelete
            titleClassName="font-display text-[1.75rem] text-ink"
          />
          <p className="text-[13.5px] text-ink-muted">
            {result.jobTitle}
            {result.company ? ` · ${result.company}` : ""} — analyzed{" "}
            {new Date(analysis.created_at).toLocaleString()}
          </p>
        </div>
        {resume.raw_text && (
          <Link
            href={`/analyze/new?resume=${resume.id}`}
            className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "shrink-0")}
          >
            Analyze against another job
          </Link>
        )}
      </div>

      {history.length > 1 && (
        <nav aria-label="Analysis history" className="flex flex-wrap gap-2">
          {history.map((h) => {
            const r = h.result as unknown as AnalysisResult;
            const active = h.id === analysis.id;
            return (
              <Link
                key={h.id}
                href={`/analyze/${resume.id}?analysis=${h.id}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-[4px] border px-3 py-1.5 text-[12.5px] transition-colors",
                  active
                    ? "border-brand bg-brand-soft text-brand-strong"
                    : "border-line text-ink-muted hover:border-line-strong hover:text-ink"
                )}
              >
                <span className="font-mono tabular-nums">{h.score}</span> ·{" "}
                {r.jobTitle} ·{" "}
                {new Date(h.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </Link>
            );
          })}
        </nav>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Match breakdown</CardTitle>
          <CardDescription>
            An AI estimate, not a certified ATS pass/fail result.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <ScoreRing
            score={result.overallScore}
            label={result.matchScore !== undefined ? "Requirement match" : "Overall score"}
          />
          <div className="flex-1 space-y-4">
            <MiniMetric label="ATS compatibility" value={result.atsScore} />
            <MiniMetric label="Skill match" value={result.skillMatchPercent} />
          </div>
        </CardContent>
        <CardContent className="border-t border-line pt-5">
          <p className="text-[14px] text-ink">{result.summary}</p>
        </CardContent>
      </Card>

      {result.requirementMatches && result.requirementMatches.length > 0 && (
        <RequirementsCard matches={result.requirementMatches} />
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Matched skills</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {result.matchedSkills.length === 0 ? (
              <p className="text-[13.5px] text-ink-muted">None identified.</p>
            ) : (
              result.matchedSkills.map((s) => (
                <Badge key={s.skill} variant="brand">
                  {s.skill}
                  {s.strength !== undefined ? ` · ${s.strength}` : ""}
                </Badge>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Missing skills</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {result.missingSkills.length === 0 ? (
              <p className="text-[13.5px] text-ink-muted">None identified.</p>
            ) : (
              result.missingSkills.map((skill) => (
                <Badge key={skill} variant="warn">
                  {skill}
                </Badge>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {result.keywordGaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Keyword gaps</CardTitle>
            <CardDescription>
              Present in the job description but missing from this resume.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {result.keywordGaps.map((k) => (
              <Badge key={k} variant="signal">
                {k}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-4 text-[14px] text-ink">
            {result.suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[12.5px]">
        <span className="text-ink-muted">{label}</span>
        <span className="font-mono tabular-nums text-ink">{value}</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-paper">
        <div
          className="h-full rounded-full bg-brand"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

const STATUS_BADGE = {
  met: { variant: "brand", label: "Met" },
  partial: { variant: "signal", label: "Partial" },
  missing: { variant: "warn", label: "Missing" },
} as const;

function RequirementsCard({ matches }: { matches: RequirementMatch[] }) {
  const met = matches.filter((m) => m.status === "met").length;

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Requirements</CardTitle>
          <CardDescription>
            {met} of {matches.length} met. The match score weights required
            items double and gives half credit for partial matches.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="divide-y divide-line">
          {matches.map((m, i) => {
            const badge = STATUS_BADGE[m.status];
            return (
              <li key={i} className="flex items-start gap-4 py-3 first:pt-0 last:pb-0">
                <Badge variant={badge.variant} className="mt-0.5 w-16 shrink-0 justify-center">
                  {badge.label}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] text-ink">
                    {m.requirement}
                    {m.importance === "preferred" && (
                      <span className="ml-2 text-[12px] text-ink-faint">preferred</span>
                    )}
                  </p>
                  {m.evidence && (
                    <p className="mt-1 text-[12.5px] text-ink-muted">“{m.evidence}”</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

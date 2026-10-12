import Link from "next/link";
import { Inbox } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreRing } from "@/components/ui/score-ring";
import type { AnalysisResult } from "@/lib/ai/schemas";

interface RecentAnalysisRow {
  id: string;
  resume_id: string;
  created_at: string;
  result: unknown;
}

export function RecentAnalysesSection({
  analyses,
}: {
  analyses: RecentAnalysisRow[];
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Recent analyses</CardTitle>
          <CardDescription>
            Every job you&apos;ve analyzed a resume against.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {analyses.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="divide-y divide-line">
            {analyses.map((row) => {
              const result = row.result as AnalysisResult;
              return (
                <li key={row.id}>
                  <Link
                    href={`/analyze/${row.resume_id}?analysis=${row.id}`}
                    className="flex items-center gap-5 py-4 first:pt-0 last:pb-0"
                  >
                    <ScoreRing score={result.overallScore} size={48} strokeWidth={4} />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14.5px] font-medium text-ink">
                        {result.jobTitle}
                        {result.company ? (
                          <span className="text-ink-muted"> · {result.company}</span>
                        ) : null}
                      </p>
                      <p className="mt-1 text-[12.5px] text-ink-muted">
                        Analyzed{" "}
                        {new Date(row.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="hidden shrink-0 items-center gap-4 sm:flex">
                      <Metric label="ATS" value={result.atsScore} />
                      <Metric label="Skills" value={result.skillMatchPercent} />
                    </div>

                    {result.missingSkills.length > 0 ? (
                      <Badge variant="warn" className="hidden shrink-0 md:inline-flex">
                        {result.missingSkills.length} gap
                        {result.missingSkills.length === 1 ? "" : "s"}
                      </Badge>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-right">
      <p className="font-mono tabular-nums text-[14px] text-ink">{value}</p>
      <p className="text-[11.5px] text-ink-muted">{label}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Inbox className="text-ink-faint" size={26} strokeWidth={1.5} />
      <p className="mt-4 text-[14.5px] font-medium text-ink">No analyses yet</p>
      <p className="mt-1.5 max-w-[36ch] text-[13px] text-ink-muted">
        Run your first analysis and it&apos;ll show up here, with its full
        score breakdown.
      </p>
    </div>
  );
}

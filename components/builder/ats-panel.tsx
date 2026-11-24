"use client";

import { AlertTriangle, Check, X } from "lucide-react";

import { ScoreRing } from "@/components/ui/score-ring";
import { TEMPLATE_GUARANTEES, type AtsCheck, type AtsReport } from "@/lib/builder/ats-checks";
import { cn } from "@/lib/utils";

const ORDER = { fail: 0, warn: 1, pass: 2 } as const;

function StatusIcon({ status }: { status: AtsCheck["status"] }) {
  const base = "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full";
  if (status === "pass")
    return (
      <span className={cn(base, "bg-success-soft text-success")} aria-label="Passing">
        <Check size={12} strokeWidth={3} />
      </span>
    );
  if (status === "warn")
    return (
      <span className={cn(base, "bg-signal-soft text-signal")} aria-label="Could be better">
        <AlertTriangle size={11} strokeWidth={2.5} />
      </span>
    );
  return (
    <span className={cn(base, "bg-warn-soft text-warn")} aria-label="Needs fixing">
      <X size={12} strokeWidth={3} />
    </span>
  );
}

export function scoreVerdict(score: number) {
  if (score >= 85) return "Ready to send";
  if (score >= 65) return "Nearly there";
  if (score >= 40) return "Needs work";
  return "Just getting started";
}

export function AtsPanel({ report }: { report: AtsReport }) {
  const sorted = [...report.checks].sort((a, b) => ORDER[a.status] - ORDER[b.status]);
  const open = sorted.filter((c) => c.status !== "pass");
  const passed = sorted.filter((c) => c.status === "pass");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-5 rounded-[6px] border border-line bg-paper-raised p-5">
        <ScoreRing score={report.score} size={84} strokeWidth={6} />
        <div>
          <p className="font-display text-[1.6rem] italic leading-none text-brand">
            {scoreVerdict(report.score)}
          </p>
          <p className="mt-2 max-w-[36ch] text-[13px] leading-relaxed text-ink-muted">
            ATS readiness of the content. It isn&apos;t a job match — run an analysis against a
            posting for that.
          </p>
        </div>
      </div>

      {open.length ? (
        <div>
          <h4 className="text-[13.5px] font-semibold text-ink">
            To fix <span className="tabular-nums text-ink-muted">({open.length})</span>
          </h4>
          <ul className="mt-3 flex flex-col gap-3.5">
            {open.map((c) => (
              <li key={c.id} className="flex gap-3">
                <StatusIcon status={c.status} />
                <div>
                  <p className="text-[13.5px] font-medium text-ink">{c.label}</p>
                  <p className="text-[13px] leading-relaxed text-ink-muted">{c.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {passed.length ? (
        <div>
          <h4 className="text-[13.5px] font-semibold text-ink">
            Passing <span className="tabular-nums text-ink-muted">({passed.length})</span>
          </h4>
          <ul className="mt-3 flex flex-col gap-2">
            {passed.map((c) => (
              <li key={c.id} className="flex gap-3">
                <StatusIcon status="pass" />
                <p className="text-[13px] leading-relaxed text-ink-muted">
                  <span className="font-medium text-ink">{c.label}.</span> {c.detail}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="border-l-2 border-accent-blue pl-4">
        <h4 className="text-[13.5px] font-semibold text-ink">Handled by the template</h4>
        <ul className="mt-2 flex flex-col gap-1.5">
          {TEMPLATE_GUARANTEES.map((g) => (
            <li key={g} className="flex items-center gap-2 text-[13px] text-ink-muted">
              <Check size={13} className="shrink-0 text-accent-blue" strokeWidth={2.5} />
              {g}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

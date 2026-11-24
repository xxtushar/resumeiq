"use client";

import { useDeferredValue, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { ScoreRing } from "@/components/ui/score-ring";
import { ContactEditor, SECTION_EDITORS, type Update } from "@/components/builder/section-editors";
import { ResumePreview } from "@/components/builder/resume-preview";
import { RobotView } from "@/components/builder/robot-view";
import { AtsPanel, scoreVerdict } from "@/components/builder/ats-panel";
import { runAtsChecks, type AtsReport } from "@/lib/builder/ats-checks";
import { SECTION_HEADINGS, SECTION_ORDER, toPlainText } from "@/lib/builder/format";
import { isSampleResume } from "@/lib/builder/default-resume";
import { emptyResume, type PageSize, type ResumeDoc, type ResumeLayout } from "@/lib/builder/schema";
import { cn } from "@/lib/utils";

type Tab = "page" | "robot" | "checks";

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-[5px] border border-line-strong bg-paper-raised p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "h-7 rounded-[3px] px-2.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
            value === o.value ? "bg-brand text-white" : "text-ink-muted hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Live ATS report and robot text for a document, trailing typing slightly. */
export function useResumeInsights(doc: ResumeDoc) {
  const deferred = useDeferredValue(doc);
  const report = useMemo(() => runAtsChecks(deferred), [deferred]);
  const plainText = useMemo(() => toPlainText(deferred), [deferred]);
  return { deferred, report, plainText };
}

/**
 * The builder body shared by the in-app editor and the public page: format
 * settings, section editors, and the sticky preview (page, robot view, ATS
 * checks). Saving and downloading live in the wrapper's toolbar.
 */
export function ResumeWorkspace({
  doc,
  update,
  insights,
  previewStickyClass,
  footer,
}: {
  doc: ResumeDoc;
  update: Update;
  insights: { deferred: ResumeDoc; report: AtsReport; plainText: string };
  /** Sticky offset for the preview column, which depends on the page chrome. */
  previewStickyClass: string;
  footer?: ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("page");
  const [mobileView, setMobileView] = useState<"edit" | "preview">("edit");
  const [pages, setPages] = useState(1);
  const { deferred, report, plainText } = insights;
  const toFix = report.checks.filter((c) => c.status !== "pass").length;

  const order = SECTION_ORDER[doc.settings.layout];
  const setLayout = (layout: ResumeLayout) => update((d) => ({ ...d, settings: { ...d.settings, layout } }));
  const setPageSize = (pageSize: PageSize) => update((d) => ({ ...d, settings: { ...d.settings, pageSize } }));

  function startBlank() {
    const previous = doc;
    update((d) => ({ ...emptyResume(d.settings.layout), settings: d.settings }));
    toast.success("Cleared the sample. Start with your name and email.", {
      action: { label: "Undo", onClick: () => update(() => previous) },
    });
  }

  return (
    <>
      {/* Mobile: switch between the form and the page. */}
      <div className="mx-auto mt-5 w-full max-w-[1320px] lg:hidden">
        <Segmented
          label="View"
          value={mobileView}
          onChange={setMobileView}
          options={[
            { value: "edit", label: "Edit" },
            { value: "preview", label: `Preview (${report.score})` },
          ]}
        />
      </div>

      <div className="mx-auto mt-6 grid w-full max-w-[1320px] gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:gap-10">
        {/* Editor */}
        <div className={cn("flex min-w-0 flex-col gap-5", mobileView === "preview" && "hidden lg:flex")}>
          {isSampleResume(doc) ? (
            <div className="flex flex-col gap-3 rounded-[6px] border border-accent-blue/25 bg-blue-soft p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[14px] font-semibold text-brand">This is a sample resume that already passes the ATS checks.</p>
                <p className="mt-1 max-w-[56ch] text-[13px] leading-relaxed text-ink-muted">
                  Keep the structure and replace each line with your own details. The ATS score updates as you type.
                </p>
              </div>
              <button
                type="button"
                onClick={startBlank}
                className="h-9 shrink-0 self-start rounded-[4px] border border-line-strong bg-paper-raised px-3 text-[13.5px] font-medium text-ink transition-colors hover:border-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:self-center"
              >
                Start blank instead
              </button>
            </div>
          ) : null}

          <div className="flex flex-col gap-4 rounded-[6px] border border-line bg-paper-raised p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[13.5px] font-semibold text-ink">Section order</p>
                <p className="mt-0.5 max-w-[42ch] text-[12.5px] leading-relaxed text-ink-muted">
                  {doc.settings.layout === "experienced"
                    ? "Experience leads. Best once you have a year or more of work to show."
                    : "Education and skills lead. Best for students, freshers and career changers."}
                </p>
              </div>
              <Segmented
                label="Section order"
                value={doc.settings.layout}
                onChange={setLayout}
                options={[
                  { value: "experienced", label: "Experienced" },
                  { value: "early-career", label: "Student / fresher" },
                ]}
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
              <div>
                <p className="text-[13.5px] font-semibold text-ink">Paper size</p>
                <p className="mt-0.5 text-[12.5px] text-ink-muted">A4 for India, UK and Europe. Letter for the US and Canada.</p>
              </div>
              <Segmented
                label="Paper size"
                value={doc.settings.pageSize}
                onChange={setPageSize}
                options={[
                  { value: "A4", label: "A4" },
                  { value: "LETTER", label: "Letter" },
                ]}
              />
            </div>
          </div>

          <nav aria-label="Jump to section" className="flex flex-wrap gap-x-4 gap-y-1.5 px-1">
            {(["contact", ...order] as const).map((key) => (
              <a
                key={key}
                href={`#${key}`}
                className="text-[13px] font-medium text-ink-muted underline decoration-line-strong underline-offset-4 hover:text-brand hover:decoration-accent-blue"
              >
                {key === "contact" ? "Contact" : SECTION_HEADINGS[key]}
              </a>
            ))}
          </nav>

          <ContactEditor doc={doc} update={update} />
          {order.map((key) => {
            const Editor = SECTION_EDITORS[key];
            return <Editor key={key} doc={doc} update={update} />;
          })}

          {footer}
        </div>

        {/* Preview */}
        <aside
          aria-label="Preview"
          className={cn(
            "min-w-0 lg:sticky lg:self-start lg:overflow-y-auto lg:pb-4",
            previewStickyClass,
            mobileView === "edit" && "hidden lg:block",
          )}
        >
          <div className="mb-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTab("checks")}
              className="flex items-center gap-3 rounded-[6px] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <ScoreRing score={report.score} size={50} strokeWidth={4} className="[&_span]:text-[0.9rem]" />
              <span>
                <span className="block text-[13.5px] font-semibold text-ink">
                  ATS score {report.score}: {scoreVerdict(report.score)}
                </span>
                <span className="block text-[12.5px] text-ink-muted">
                  {toFix ? `${toFix} thing${toFix === 1 ? "" : "s"} to fix` : "Nothing left to fix"}
                  {pages > 1 ? `, ${pages} pages` : ", 1 page"}
                </span>
              </span>
            </button>
          </div>

          <div role="tablist" aria-label="Preview mode" className="mb-4 flex gap-6 border-b border-line">
            {(
              [
                { value: "page", label: "Page" },
                { value: "robot", label: "What the robot sees" },
                { value: "checks", label: "ATS checks" },
              ] as const
            ).map((t) => (
              <button
                key={t.value}
                type="button"
                role="tab"
                aria-selected={tab === t.value}
                onClick={() => setTab(t.value)}
                className={cn(
                  "-mb-px border-b-2 pb-2.5 text-[13.5px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
                  tab === t.value ? "border-brand text-brand" : "border-transparent text-ink-muted hover:text-ink",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div role="tabpanel">
            {tab === "page" ? <ResumePreview doc={deferred} onPageCount={setPages} /> : null}
            {tab === "robot" ? <RobotView text={plainText} /> : null}
            {tab === "checks" ? <AtsPanel report={report} /> : null}
          </div>
        </aside>
      </div>
    </>
  );
}

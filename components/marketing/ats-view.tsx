import type { ReactNode } from "react";

/**
 * Static illustration: the same resume as a person sees it, next to the raw
 * text an applicant tracking system extracts from it. Not connected to any
 * real analysis — names, employers and numbers are invented.
 */

const NOTES = [
  {
    n: "1",
    text: "Two-column layout. The parser read the sidebar first, so your skills land above your own name.",
  },
  {
    n: "2",
    text: "Icons and the contact row are dropped. No email means no callback.",
  },
  {
    n: "3",
    text: "The job post asks for GraphQL four times. Your resume never says it.",
  },
] as const;

/** The resume and its parsed text, stacked as overlapping cards. Sits in the hero. */
export function AtsPreview() {
  return (
    <div
      aria-label="Example: a resume as a person sees it versus what an ATS reads"
      className="relative mx-auto w-full max-w-[580px]"
    >
      <figure className="ml-auto w-[80%]">
        <figcaption className="mb-3 text-[12px] font-medium uppercase tracking-[0.2em] text-ink-muted">
          What you see
        </figcaption>
        <ResumeSheet />
      </figure>

      <figure className="relative -mt-16 w-[90%]">
        <RobotView />
        <figcaption className="mt-3 text-[12px] font-medium uppercase tracking-[0.2em] text-accent-blue">
          What the robot sees
        </figcaption>
        <Stamp />
      </figure>
    </div>
  );
}

/** Preview on the left, the three proofreader notes that explain its marks on the right. */
export function AtsView() {
  return (
    <section id="example" className="border-t border-line">
      <div className="mx-auto grid max-w-[1280px] gap-14 px-6 py-20 md:grid-cols-12 md:items-center md:gap-10 md:px-10 md:py-24">
        <div className="md:col-span-7">
          <AtsPreview />
        </div>

        <div className="md:col-span-4 md:col-start-9">
          <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-accent-blue">
            What the robot got wrong
          </p>
          <h2 className="mt-5 text-[clamp(1.8rem,3vw,2.6rem)] font-bold leading-[1.08] tracking-[-0.035em] text-brand">
            Same resume,{" "}
            <span className="font-display text-[1.1em] font-normal italic tracking-normal text-accent-blue">
              two readers.
            </span>
          </h2>
          <ol className="mt-8 space-y-6">
            {NOTES.map((note) => (
              <li key={note.n} className="flex gap-4">
                <span className="font-display text-[30px] italic leading-none text-warn">
                  {note.n}
                </span>
                <p className="text-[15px] leading-relaxed text-ink-muted">
                  {note.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function ResumeSheet() {
  return (
    <div className="w-full border border-line bg-paper-raised p-6 shadow-[0_24px_48px_-28px_rgba(20,22,27,0.35)] sm:p-7">
      <div className="grid grid-cols-[1fr_2.2fr] gap-5">
        <aside className="border-r border-line pr-4">
          <SheetLabel>Skills</SheetLabel>
          <p className="mt-2 text-[11px] leading-[1.8] text-ink-muted">
            React
            <br />
            TypeScript
            <br />
            Next.js
            <br />
            Tailwind
          </p>
          <SheetLabel className="mt-5">Contact</SheetLabel>
          <div className="mt-2 space-y-1.5 text-[10.5px] text-ink-muted">
            <p className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-line-strong" />
              tushar@example.com
            </p>
            <p className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-line-strong" />
              Bengaluru
            </p>
          </div>
        </aside>

        <div>
          <p className="text-[22px] font-bold leading-none tracking-[-0.03em] text-ink">
            Tushar Singh
          </p>
          <p className="mt-1.5 text-[11.5px] text-ink-muted">
            Frontend Engineer
          </p>

          <SheetLabel className="mt-6">Experience</SheetLabel>
          <p className="mt-2 text-[12px] font-semibold text-ink">
            Fieldnote Labs{" "}
            <span className="font-normal text-ink-faint">2021 — now</span>
          </p>
          <TextBars widths={["94%", "88%", "61%"]} />

          <p className="mt-4 text-[12px] font-semibold text-ink">
            Paperplane{" "}
            <span className="font-normal text-ink-faint">2019 — 21</span>
          </p>
          <TextBars widths={["90%", "72%"]} />
        </div>
      </div>
    </div>
  );
}

function RobotView() {
  return (
    <div className="bg-shell p-6 font-mono text-[12px] leading-[1.9] text-shell-muted shadow-[0_24px_48px_-24px_rgba(16,35,63,0.55)] sm:p-7">
      <div>
      <p>
        <Flag n="1">SKILLS React TypeScript Next.js Tailwind CONTACT</Flag>
      </p>
      <p>
        <Flag n="2">[?] [?]</Flag> Bengaluru
      </p>
      <p className="text-shell-foreground">Tushar Singh</p>
      <p>Frontend Engineer</p>
      <p className="mt-4">EXPERIENCE Fieldnote Labs 2021 — now</p>
      <p>Built and maintained the component library used</p>
      <p>across four product teams; cut page weight by 38%</p>
      <p className="mt-4">Paperplane 2019 — 21 …</p>
      <p className="mt-4">
        <Flag n="3">[ GraphQL — not found ]</Flag>
      </p>
      </div>
    </div>
  );
}

/** Wavy rust underline with a superscript note number, like a proofreader's mark. */
function Flag({ n, children }: { n: string; children: ReactNode }) {
  return (
    <span className="text-shell-foreground underline decoration-warn decoration-wavy decoration-1 underline-offset-[5px]">
      {children}
      <sup className="ml-1 font-sans text-[11px] font-bold text-warn no-underline">
        {n}
      </sup>
    </span>
  );
}

function Stamp() {
  return (
    <div
      className="animate-stamp-in absolute -right-2 bottom-2 -rotate-[6deg] border-2 border-signal bg-paper-raised px-4 py-2 text-brand shadow-[0_8px_20px_-12px_rgba(20,22,27,0.4)] md:-right-8"
      aria-hidden="true"
    >
      <p className="text-[40px] font-bold leading-none tracking-[-0.04em] tabular-nums">62</p>
      <p className="mt-1 font-display text-[15px] italic text-ink-muted">
        maybe pile
      </p>
    </div>
  );
}

function SheetLabel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-[9px] font-bold uppercase tracking-[0.18em] text-ink ${className}`}
    >
      {children}
    </p>
  );
}

function TextBars({ widths }: { widths: readonly string[] }) {
  return (
    <div className="mt-2 space-y-1.5">
      {widths.map((w, i) => (
        <span
          key={i}
          className="block h-[5px] rounded-full bg-line"
          style={{ width: w }}
        />
      ))}
    </div>
  );
}

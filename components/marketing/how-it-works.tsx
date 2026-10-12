const STEPS = [
  { n: "01", line: "Upload your resume.", aside: "PDF, DOCX or plain text" },
  { n: "02", line: "Paste the job you want.", aside: "No formatting needed" },
  { n: "03", line: "Read the verdict.", aside: "Score, robot's view, gaps and edits" },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-line bg-blue-soft">
      <div className="mx-auto max-w-[1280px] px-6 py-20 md:px-10 md:py-24">
        <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-accent-blue">
          How it works
        </p>

        {/* One row per step on a shared grid: number, sentence, note. */}
        <ol className="mt-10 border-b border-line">
          {STEPS.map((step, i) => {
            const last = i === STEPS.length - 1;
            return (
              <li
                key={step.n}
                className="grid gap-2 border-t border-line py-5 md:grid-cols-12 md:items-baseline md:gap-6"
              >
                <span
                  className={`text-[13px] font-bold tabular-nums md:col-span-1 ${last ? "text-success" : "text-accent-blue"}`}
                >
                  {step.n}
                </span>
                <span className="text-[clamp(1.35rem,2.2vw,1.85rem)] font-bold leading-[1.2] tracking-[-0.025em] text-brand md:col-span-8">
                  {last ? (
                    <>
                      Read the{" "}
                      <span className="bg-success-soft px-1.5 font-display text-[1.1em] font-normal italic tracking-normal">
                        verdict.
                      </span>
                    </>
                  ) : (
                    step.line
                  )}
                </span>
                <span className="text-[14px] text-ink-muted md:col-span-3">
                  {step.aside}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

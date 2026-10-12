export function ValueProposition() {
  return (
    <section id="product" className="border-t border-line">
      <div className="mx-auto max-w-[1280px] px-6 py-20 md:px-10 md:py-24">
        <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-accent-blue">
          The problem
        </p>

        <div className="mt-8 grid gap-10 md:grid-cols-12">
          <p className="text-[clamp(1.6rem,2.8vw,2.4rem)] font-bold leading-[1.18] tracking-[-0.03em] text-brand md:col-span-8">
            Most resumes are turned down by{" "}
            <span className="font-display text-[1.1em] font-normal italic tracking-normal text-accent-blue">
              software
            </span>{" "}
            before a person reads a line.{" "}
            <span className="font-medium text-ink-faint">
              Not for lack of skill&nbsp;— for a sidebar, a missing keyword, a
              heading the parser didn&apos;t recognise.
            </span>
          </p>

          <p className="self-start border-l-2 border-accent-blue pl-4 text-[15px] leading-relaxed text-ink-muted md:col-span-3 md:col-start-10 md:mt-2">
            ResumeIQ checks yours against the actual posting, so you can decide:
            send it as-is, spend ten minutes on the gaps, or move on.
          </p>
        </div>
      </div>
    </section>
  );
}

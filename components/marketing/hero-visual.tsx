/**
 * Decorative hero illustration: a resume on a navy stage being scanned, with a
 * section scorecard below. Pure CSS — on hover the small objects drift apart
 * and start floating (see `.hero-stage` / `.float-item` in globals.css).
 * Names and numbers are invented.
 */

export function HeroVisual() {
  return (
    <div className="hero-stage group relative mx-auto aspect-[1/1.08] w-full max-w-[300px]">
      <p className="sr-only">
        Illustration: a resume being scanned, with two lines flagged and a
        missing keyword.
      </p>

      <div aria-hidden="true" className="absolute inset-0">
        {/* Resume card. */}
        <div className="absolute left-[13%] top-[7%] flex h-[84%] w-[74%] overflow-hidden rounded-[8px] border border-line bg-paper-raised shadow-[0_30px_60px_-30px_rgba(16,35,63,0.4)] transition-[translate] duration-500 group-hover:-translate-y-0.75">
          <div className="w-[62%] p-[7%]">
            <p className="whitespace-nowrap text-[clamp(10px,1.05vw,13px)] font-bold leading-none tracking-[-0.01em] text-brand">
              TUSHAR SINGH
            </p>
            <p className="mt-[4%] text-[clamp(7px,0.8vw,9px)] text-ink-muted">Frontend Engineer</p>
            <span className="mt-[6%] block h-px w-full bg-brand/25" />
            <CardLabel>Summary</CardLabel>
            <Bars rows={["100%", "92%", "flag:86%", "flag:60%", "78%"]} />
            <CardLabel>Experience</CardLabel>
            <Bars rows={["70%", "96%", "88%", "flag:94%", "flag:52%", "84%", "62%"]} />
            <CardLabel>Projects</CardLabel>
            <Bars rows={["90%", "74%", "58%"]} />
          </div>
          <div className="w-[38%] bg-blue-soft p-[7%]">
            <Bars rows={["dot:80%", "dot:70%", "dot:88%"]} tone="side" />
            <CardLabel>Skills</CardLabel>
            <Bars rows={["dot:74%", "dot:90%", "dot:66%", "dot:82%", "dot:70%"]} tone="side" />
            <CardLabel>Education</CardLabel>
            <Bars rows={["90%", "72%"]} tone="side" />
          </div>
        </div>

        {/* Scanning lens. */}
        <div
          className="float-item absolute left-0 top-[44%] z-10 w-[30%] transition-[translate] duration-500 group-hover:-translate-x-1 group-hover:-translate-y-1.5"
          style={{ ["--dur" as string]: "4.2s" }}
        >
          <div className="relative aspect-square">
            <span className="absolute bottom-[-14%] right-[-12%] h-[46%] w-[16%] origin-top rotate-[-45deg] rounded-full bg-brand/80" />
            <div className="relative flex h-full w-full items-center justify-center rounded-full border-[clamp(5px,0.9vw,9px)] border-accent-blue bg-white/75 shadow-[0_12px_30px_-12px_rgba(16,35,63,0.45)] backdrop-blur-[2px]">
              <svg viewBox="0 0 24 24" className="h-[40%] w-[40%] text-brand" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
              <span className="absolute left-[18%] top-[14%] h-[22%] w-[10%] rotate-[30deg] rounded-full bg-white" />
            </div>
          </div>
        </div>

        {/* Missing-keyword chip. */}
        <div
          className="float-item absolute right-0 top-[11%] z-10 transition-[translate] duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
          style={{ ["--dur" as string]: "3.6s", ["--delay" as string]: "-1.2s" }}
        >
          <span className="flex items-center gap-1.5 rounded-full border border-warn-soft bg-paper-raised px-3 py-1.5 text-[12px] font-bold text-warn shadow-[0_10px_24px_-12px_rgba(16,35,63,0.45)]">
            <span className="text-[1.2em] leading-none">+</span> GraphQL
          </span>
        </div>

        {/* File-type bubble. */}
        <Bubble
          className="-right-[1%] top-[40%] w-[14%] bg-accent-blue group-hover:translate-x-1.5 group-hover:-translate-y-0.5"
          dur="4.8s"
          delay="-0.6s"
        >
          <svg viewBox="0 0 24 24" className="h-[46%] w-[46%]" fill="none" stroke="white" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
            <path d="M14 3v5h5M9 13h6M9 17h4" />
          </svg>
        </Bubble>

        {/* Warning bubble. */}
        <Bubble
          className="right-[4%] top-[62%] w-[11%] bg-signal group-hover:translate-x-1 group-hover:translate-y-1"
          dur="3.9s"
          delay="-2s"
        >
          <span className="text-[clamp(14px,1.8vw,20px)] font-bold leading-none text-brand">!</span>
        </Bubble>

        {/* Sparkles and rings. */}
        <Sparkle className="left-[3%] top-[1%] w-[9%] text-signal group-hover:-translate-x-1 group-hover:-translate-y-1.5" dur="5s" />
        <Sparkle className="right-[8%] top-0 w-[5%] text-accent-blue group-hover:translate-x-1 group-hover:-translate-y-1" dur="3.4s" delay="-1s" />
        <Sparkle className="bottom-[3%] left-[5%] w-[4.5%] text-accent-blue/60 group-hover:-translate-x-1 group-hover:translate-y-0.5" dur="4.4s" delay="-2.4s" />
        <Ring className="right-[3%] top-[29%] w-[3%] group-hover:translate-x-0.5 group-hover:-translate-y-1" dur="4s" />
        <Ring className="left-[5%] top-[30%] w-[2.5%] group-hover:-translate-x-1" dur="5.2s" delay="-1.6s" />
      </div>
    </div>
  );
}

function CardLabel({ children }: { children: string }) {
  return (
    <p className="mb-[4%] mt-[8%] text-[clamp(6px,0.85vw,9px)] font-bold uppercase tracking-[0.14em] text-accent-blue">
      {children}
    </p>
  );
}

/** Text lines as bars. "flag:" rows get a soft-red highlight, "dot:" rows a bullet. */
function Bars({ rows, tone = "main" }: { rows: string[]; tone?: "main" | "side" }) {
  return (
    <div className="space-y-[5px]">
      {rows.map((row, i) => {
        const flag = row.startsWith("flag:");
        const dot = row.startsWith("dot:");
        const width = row.replace(/^(flag|dot):/, "");
        return (
          <div key={i} className="flex items-center gap-1" style={{ width }}>
            {dot ? <span className="size-[4px] shrink-0 rounded-full bg-accent-blue/60" /> : null}
            <span
              className={`block h-[5px] flex-1 rounded-full ${
                flag ? "bg-warn/45 ring-2 ring-warn-soft" : tone === "side" ? "bg-accent-blue/25" : "bg-line-strong"
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}

function Bubble({
  className,
  dur,
  delay = "0s",
  children,
}: {
  className: string;
  dur: string;
  delay?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`float-item absolute z-10 flex aspect-square items-center justify-center rounded-full shadow-[0_14px_30px_-12px_rgba(0,0,0,0.55)] transition-[translate] duration-500 ${className}`}
      style={{ ["--dur" as string]: dur, ["--delay" as string]: delay }}
    >
      {children}
    </div>
  );
}

function Sparkle({ className, dur, delay = "0s" }: { className: string; dur: string; delay?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`float-item absolute z-10 aspect-square transition-[translate] duration-500 ${className}`}
      style={{ ["--dur" as string]: dur, ["--delay" as string]: delay }}
      fill="currentColor"
    >
      <path d="M12 0c.9 7.6 3.9 10.8 12 12-8.1 1.2-11.1 4.4-12 12-.9-7.6-3.9-10.8-12-12 8.1-1.2 11.1-4.4 12-12z" />
    </svg>
  );
}

function Ring({ className, dur, delay = "0s" }: { className: string; dur: string; delay?: string }) {
  return (
    <span
      className={`float-item absolute aspect-square rounded-full border-2 border-accent-blue/40 transition-[translate] duration-500 ${className}`}
      style={{ ["--dur" as string]: dur, ["--delay" as string]: delay }}
    />
  );
}

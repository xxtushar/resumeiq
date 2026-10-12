import Link from "next/link";

/** Wordmark: plain "Resume" + a Bodoni italic "IQ" — the one flourish in the nav. */
export function Logo({
  tone = "dark",
  className = "",
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={`text-[19px] font-bold tracking-[-0.03em] ${
        tone === "light" ? "text-shell-foreground" : "text-brand"
      } ${className}`}
    >
      Resume
      <span className="font-display text-[23px] font-normal italic text-accent-blue">
        IQ
      </span>
    </Link>
  );
}

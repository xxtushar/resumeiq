import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export function CtaSection({ loggedIn = false }: { loggedIn?: boolean }) {
  return (
    <section className="bg-shell">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-6 py-20 md:grid-cols-12 md:items-end md:px-10 md:py-24">
        <div className="md:col-span-7">
          <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-shell-muted">
            Free to try
          </p>
          <h2 className="mt-6 text-[clamp(2.4rem,4.8vw,4.2rem)] font-bold leading-[1] tracking-[-0.04em] text-shell-foreground">
            Stop{" "}
            <span className="font-display text-[1.1em] font-normal italic tracking-normal text-blue-soft/80">
              guessing.
            </span>
          </h2>
        </div>

        <div className="md:col-span-4 md:col-start-9 md:pb-3">
          <p className="text-[16px] leading-relaxed text-shell-muted">
            Run your resume against the next job you apply for.
          </p>
          <Link
            href={loggedIn ? "/analyze/new" : "/signup"}
            className={`mt-7 ${buttonVariants({ variant: "inverse", size: "lg" })}`}
          >
            Analyze your resume
          </Link>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";

import { HeroVisual } from "@/components/marketing/hero-visual";
import { buttonVariants } from "@/components/ui/button";

export function Hero({ loggedIn = false }: { loggedIn?: boolean }) {
  const href = loggedIn ? "/analyze/new" : "/signup";

  return (
    <section className="mx-auto w-full max-w-[1280px] px-6 pb-20 pt-12 md:px-10 md:pb-24 md:pt-16">
      <div className="grid gap-16 md:grid-cols-12 md:items-center md:gap-10">
        {/* Left: the pitch. */}
        <div className="md:col-span-6">
          <p
            className="animate-rise-in text-[12px] font-medium uppercase tracking-[0.2em] text-accent-blue"
            style={{ animationDelay: "0ms" }}
          >
            Your resume, through their eyes
          </p>

          <h1
            className="animate-rise-in mt-6 text-[clamp(2.4rem,4.6vw,4.4rem)] font-bold leading-[1] tracking-[-0.045em] text-brand"
            style={{ animationDelay: "60ms" }}
          >
            See how{" "}
            <span className="font-display text-[1.1em] font-normal italic tracking-[-0.01em] text-accent-blue">
              recruiters
            </span>{" "}
            see your resume.
          </h1>

          <p
            className="animate-rise-in mt-7 max-w-[44ch] text-[17px] leading-relaxed text-ink"
            style={{ animationDelay: "120ms" }}
          >
            Upload your resume, paste the job you want, and see it the way the
            hiring software and the recruiter do&nbsp;— plus the few edits that
            would change the answer.
          </p>

          <div
            className="animate-rise-in mt-9 flex flex-wrap items-center gap-x-7 gap-y-4"
            style={{ animationDelay: "160ms" }}
          >
            <Link href={href} className={buttonVariants({ size: "lg" })}>
              Analyze your resume
            </Link>
            <a
              href="#how-it-works"
              className="text-[15px] font-medium text-brand underline decoration-line-strong decoration-1 underline-offset-[6px] transition-colors hover:decoration-accent-blue"
            >
              How it works
            </a>
          </div>

          <p
            className="animate-rise-in mt-8 text-[14px] text-ink-muted"
            style={{ animationDelay: "200ms" }}
          >
            <span className="font-display text-[19px] italic text-brand">
              Two minutes,
            </span>{" "}
            upload to verdict. Free to try.
          </p>
        </div>

        {/* Right: illustration — small objects float on hover. */}
        <div
          className="animate-rise-in md:col-span-6"
          style={{ animationDelay: "240ms" }}
        >
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

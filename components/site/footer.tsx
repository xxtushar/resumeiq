import Link from "next/link";

import { Logo } from "@/components/site/logo";

const LINKS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Example", href: "/#example" },
  { label: "Sign in", href: "/login" },
  { label: "Get started", href: "/signup" },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-[1280px] px-6 py-12 md:px-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <Logo />
            <p className="mt-3 max-w-[34ch] text-[14px] leading-relaxed text-ink-muted">
              See your resume the way hiring software and recruiters do&nbsp;—
              then fix what matters.
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[14px] font-medium text-ink-muted transition-colors hover:text-brand"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-[13px] text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p className="flex flex-wrap gap-x-5 gap-y-2">
            <span>© {new Date().getFullYear()} ResumeIQ</span>
            <Link href="/privacy" className="transition-colors hover:text-brand">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-brand">
              Terms
            </Link>
          </p>
          <p>
            Built by <span className="font-medium text-ink-muted">Tushar Singh</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

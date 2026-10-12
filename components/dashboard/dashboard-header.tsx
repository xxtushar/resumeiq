"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Plus } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";

const TITLES: { match: (pathname: string) => boolean; title: string; description?: string }[] = [
  {
    match: (p) => p === "/dashboard",
    title: "Dashboard",
    description: "Your resume and job-match activity.",
  },
  {
    match: (p) => p.startsWith("/dashboard/analyses"),
    title: "Job analyses",
    description: "Your full analysis history and saved jobs.",
  },
  {
    match: (p) => p.startsWith("/dashboard/settings"),
    title: "Settings",
  },
  {
    match: (p) => p.startsWith("/analyze"),
    title: "Resume analysis",
  },
  {
    match: (p) => p.startsWith("/builder"),
    title: "Resume builder",
  },
];

export function DashboardHeader({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();
  const active = TITLES.find((t) => t.match(pathname));

  return (
    <header className="flex h-16 items-center justify-between border-b border-line bg-paper-raised px-5 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="-ml-1.5 flex h-8 w-8 items-center justify-center rounded-[4px] text-ink-muted hover:bg-paper lg:hidden"
        >
          <Menu size={19} />
        </button>
        <div>
          <h1 className="text-[15.5px] font-semibold text-ink">
            {active?.title ?? "ResumeIQ"}
          </h1>
          {active?.description ? (
            <p className="hidden text-[12.5px] text-ink-muted sm:block">
              {active.description}
            </p>
          ) : null}
        </div>
      </div>

      <Link href="/analyze/new" className={buttonVariants({ size: "sm" })}>
        <Plus size={16} strokeWidth={2} />
        New analysis
      </Link>
    </header>
  );
}

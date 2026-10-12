"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FilePenLine, LayoutGrid, Settings, Target } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", match: "/dashboard", exact: true, icon: LayoutGrid, enabled: true },
  { label: "Builder", href: "/builder/new", match: "/builder", icon: FilePenLine, enabled: true },
  { label: "Job analyses", href: "/dashboard/analyses", match: "/dashboard/analyses", icon: Target, enabled: true },
  { label: "Settings", href: "/dashboard/settings", match: "/dashboard/settings", icon: Settings, enabled: true },
];

interface SidebarNavProps {
  email?: string;
  onNavigate?: () => void;
}

/** Shared nav list + account row, rendered inside both the fixed desktop
 * sidebar and the mobile slide-over drawer so the two never drift apart. */
export function SidebarNav({ email, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();
  const initials = email ? email.slice(0, 2).toUpperCase() : "??";

  return (
    <>
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="text-[16px] font-semibold tracking-tight">
          ResumeIQ
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.enabled &&
            ("exact" in item && item.exact
              ? pathname === item.match
              : pathname.startsWith(item.match));
          const Icon = item.icon;

          if (!item.enabled) {
            return (
              <div
                key={item.href}
                className="flex cursor-not-allowed items-center justify-between gap-3 rounded-[4px] px-3 py-2 text-[14px] text-shell-muted/50"
              >
                <span className="flex items-center gap-3">
                  <Icon size={17} strokeWidth={1.75} />
                  {item.label}
                </span>
                <span className="text-[11px]">Soon</span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-[4px] px-3 py-2 text-[14px] transition-colors",
                isActive
                  ? "bg-shell-raised text-shell-foreground"
                  : "text-shell-muted hover:bg-shell-raised hover:text-shell-foreground"
              )}
            >
              <Icon size={17} strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-shell-line px-3 py-4">
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-[4px] px-3 py-2 text-left hover:bg-shell-raised"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-shell-raised text-[13px] font-medium">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-medium">
                {email ?? "Account"}
              </p>
              <p className="truncate text-[12px] text-shell-muted">Log out</p>
            </div>
          </button>
        </form>
      </div>
    </>
  );
}

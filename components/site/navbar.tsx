import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { NAV_LINKS } from "@/lib/constants";
import { Logo } from "@/components/site/logo";

export function Navbar({ loggedIn = false }: { loggedIn?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-6 md:px-10">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[14px] font-medium text-ink-muted transition-colors hover:text-brand"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {loggedIn ? (
            <Link href="/dashboard" className={buttonVariants({ size: "sm" })}>
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-[14px] text-ink-muted transition-colors hover:text-brand sm:block"
              >
                Sign in
              </Link>
              <Link href="/signup" className={buttonVariants({ size: "sm" })}>
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

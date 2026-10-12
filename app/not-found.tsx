import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
      <p className="text-[14px] font-medium text-ink-faint">404</p>
      <h1 className="text-xl font-semibold text-ink">Page not found</h1>
      <p className="max-w-[40ch] text-ink-muted">
        That page doesn&apos;t exist or may have moved.
      </p>
      <Link href="/" className={buttonVariants()}>
        Back to home
      </Link>
    </div>
  );
}

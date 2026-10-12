import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function ErrorPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 text-center">
      <h1 className="text-xl font-semibold text-ink">Something went wrong</h1>
      <p className="text-ink-muted">
        That link may have expired or already been used. If you just
        confirmed your email, it&apos;s confirmed — log in to continue.
      </p>
      <Link href="/login" className={buttonVariants()}>
        Back to login
      </Link>
    </div>
  );
}

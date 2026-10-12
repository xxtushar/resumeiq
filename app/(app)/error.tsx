"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export default function AppError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-20 text-center">
      <h2 className="text-xl font-semibold text-ink">Something went wrong</h2>
      <p className="text-[14px] text-ink-muted">
        This page hit an unexpected error. Your data is safe — try again, or
        head back to the dashboard.
        {error.digest && (
          <span className="mt-2 block font-mono text-[12px] text-ink-faint">
            Reference: {error.digest}
          </span>
        )}
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={() => retry()}>
          Try again
        </Button>
        <Link href="/dashboard" className={buttonVariants()}>
          Dashboard
        </Link>
      </div>
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";

/** The public builder keeps its draft in localStorage, so it renders in the
 * browser only — no server/client mismatch when a saved draft is restored. */
export const PublicBuilderLoader = dynamic(
  () => import("@/components/builder/public-builder").then((m) => m.PublicBuilder),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto max-w-[1320px] px-5 py-16 text-[14px] text-ink-muted lg:px-8">
        Loading the resume builder…
      </div>
    ),
  }
);

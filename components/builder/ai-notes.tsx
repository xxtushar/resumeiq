"use client";

import { createContext, useContext, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fieldClass } from "@/components/builder/fields";
import type { BuilderSectionType } from "@/lib/ai/generate";

/** AI drafting costs an API call per use, so it needs an account. The public
 * builder turns it off for signed-out visitors. */
export const AiDraftingContext = createContext(true);

export type DraftResult = { content: string; bullets?: string[] };

/** Calls the existing section generator; null when it failed (already toasted). */
export async function requestDraft(
  section: BuilderSectionType,
  input: string,
): Promise<DraftResult | null> {
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, input }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(body.error ?? "Couldn't draft that. Try again.");
      return null;
    }
    return body as DraftResult;
  } catch {
    toast.error("Network error. Check your connection and try again.");
    return null;
  }
}

/** Splits a drafted block into clean bullet strings. */
export function toBullets(result: DraftResult): string[] {
  const raw = result.bullets?.length ? result.bullets : result.content.split("\n");
  return raw
    .map((b) => b.replace(/^\s*[-•*]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 12);
}

/**
 * "Write it for me" panel: the user's rough notes in, AI wording out. The
 * generator is told never to invent facts, so the notes are the only source.
 */
export function AiNotes({
  notes,
  onNotesChange,
  onDraft,
  actionLabel,
  placeholder,
  defaultOpen = false,
}: {
  notes: string;
  onNotesChange: (notes: string) => void;
  onDraft: () => Promise<void>;
  actionLabel: string;
  placeholder: string;
  defaultOpen?: boolean;
}) {
  const enabled = useContext(AiDraftingContext);
  const [open, setOpen] = useState(defaultOpen);
  const [pending, setPending] = useState(false);

  async function run() {
    if (!notes.trim()) {
      toast.error("Add a few notes first — what you did, with what, and what changed.");
      return;
    }
    setPending(true);
    try {
      await onDraft();
    } finally {
      setPending(false);
    }
  }

  if (!enabled) {
    return (
      <p className="flex items-center gap-1.5 text-[13px] text-ink-muted">
        <Sparkles size={14} className="text-ink-faint" />
        <Link href="/login" className="font-medium text-accent-blue hover:text-brand">
          Log in
        </Link>
        to have AI write this from your rough notes.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 self-start text-[13px] font-medium text-accent-blue hover:text-brand"
      >
        <Sparkles size={14} /> Write it from my notes
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-[6px] bg-blue-soft p-3.5">
      <label className="flex items-center gap-1.5 text-[12.5px] font-medium text-brand">
        <Sparkles size={14} className="text-accent-blue" />
        Your rough notes
      </label>
      <textarea
        rows={3}
        value={notes}
        maxLength={2000}
        placeholder={placeholder}
        onChange={(e) => onNotesChange(e.target.value)}
        className={cn(fieldClass, "resize-y border-line py-2.5 leading-relaxed [field-sizing:content]")}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" size="sm" variant="accent" disabled={pending} onClick={run}>
          {pending ? "Writing…" : actionLabel}
        </Button>
        <p className="text-[12px] text-ink-muted">
          Uses only what you write here. Numbers you don&apos;t give won&apos;t be made up.
        </p>
      </div>
    </div>
  );
}

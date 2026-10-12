"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { Download, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  deleteResumeAction,
  renameResumeAction,
} from "@/app/(app)/resumes/actions";

type Mode = "view" | "rename" | "confirmDelete";

interface ResumeTitleProps {
  resumeId: string;
  title: string;
  /** Whether an original uploaded file exists to download. */
  hasFile: boolean;
  /** When set, the title links here and stretches over its positioned
   * parent, so a whole card stays clickable around the menu. */
  href?: string;
  /** Set on the resume's own page so deleting returns to the dashboard. */
  redirectOnDelete?: boolean;
  titleClassName?: string;
}

export function ResumeTitle({
  resumeId,
  title,
  hasFile,
  href,
  redirectOnDelete = false,
  titleClassName,
}: ResumeTitleProps) {
  const [mode, setMode] = useState<Mode>("view");
  const [draft, setDraft] = useState(title);
  const [pending, startTransition] = useTransition();

  function startRename() {
    setDraft(title);
    setMode("rename");
  }

  function onRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft.trim() === title) {
      setMode("view");
      return;
    }
    startTransition(async () => {
      const result = await renameResumeAction(resumeId, draft);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Resume renamed.");
      setMode("view");
    });
  }

  function onDelete() {
    startTransition(async () => {
      const result = await deleteResumeAction(resumeId, redirectOnDelete);
      if (result && "error" in result) {
        toast.error(result.error);
        setMode("view");
        return;
      }
      toast.success("Resume deleted.");
    });
  }

  if (mode === "rename") {
    return (
      <form
        onSubmit={onRename}
        className="relative z-10 flex w-full items-center gap-2"
      >
        <Input
          aria-label="Resume title"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && setMode("view")}
          maxLength={120}
          autoFocus
          disabled={pending}
          className="h-8"
        />
        <Button type="submit" size="sm" disabled={pending || !draft.trim()}>
          {pending ? "Saving..." : "Save"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setMode("view")}
          disabled={pending}
        >
          Cancel
        </Button>
      </form>
    );
  }

  if (mode === "confirmDelete") {
    return (
      <div
        role="alertdialog"
        aria-label="Confirm delete"
        className="relative z-10 flex w-full flex-wrap items-center justify-between gap-3 rounded-[4px] border border-warn/30 bg-warn-soft px-3 py-2"
      >
        <p className="text-[13.5px] text-ink">
          Delete <span className="font-medium">{title}</span> and all its
          analyses? This can&apos;t be undone.
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setMode("view")}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onDelete}
            disabled={pending}
            className="bg-warn hover:bg-warn/90"
          >
            {pending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
      {href ? (
        <Link
          href={href}
          className={cn(
            "min-w-0 truncate after:absolute after:inset-0 after:content-['']",
            titleClassName
          )}
        >
          {title}
        </Link>
      ) : (
        <h1 className={cn("min-w-0 truncate", titleClassName)}>{title}</h1>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Actions for ${title}`}
          className="relative z-10 -mr-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[4px] text-ink-muted transition-colors hover:bg-paper hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <MoreHorizontal size={17} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={startRename}>
            <Pencil />
            Rename
          </DropdownMenuItem>
          {hasFile && (
            <DropdownMenuItem
              render={<a href={`/api/resumes/${resumeId}/file`} />}
            >
              <Download />
              Download original
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setMode("confirmDelete")}
          >
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

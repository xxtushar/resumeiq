"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteJobAction } from "@/app/(app)/jobs/actions";

export function DeleteJobButton({ jobId, title }: { jobId: string; title: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={`Delete saved job ${title}`}
        className="flex h-7 w-7 items-center justify-center rounded-[4px] text-ink-faint transition-colors hover:bg-warn-soft hover:text-warn"
      >
        <Trash2 size={15} />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => setConfirming(false)}
        disabled={pending}
      >
        Cancel
      </Button>
      <Button
        type="button"
        size="sm"
        className="bg-warn hover:bg-warn/90"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await deleteJobAction(jobId);
            if ("error" in result) {
              toast.error(result.error);
              setConfirming(false);
              return;
            }
            toast.success("Saved job deleted.");
          })
        }
      >
        {pending ? "Deleting..." : "Delete"}
      </Button>
    </div>
  );
}

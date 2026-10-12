"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createDraft, type CreateDraftState } from "@/app/(app)/builder/actions";

export function NewDraftForm() {
  const [state, formAction, pending] = useActionState<
    CreateDraftState,
    FormData
  >(createDraft, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Draft title</Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g. Senior Product Designer resume"
          required
        />
      </div>
      {state?.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Start building"}
      </Button>
    </form>
  );
}

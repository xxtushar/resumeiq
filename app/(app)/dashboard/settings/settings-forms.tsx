"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteAccountAction,
  updateProfileAction,
  type SettingsActionState,
} from "./actions";

export function ProfileForm({ fullName }: { fullName: string }) {
  const [state, formAction, pending] = useActionState<SettingsActionState, FormData>(
    updateProfileAction,
    null
  );

  useEffect(() => {
    if (state && "message" in state) toast.success(state.message);
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          name="fullName"
          defaultValue={fullName}
          maxLength={100}
          autoComplete="name"
        />
      </div>
      {state && "error" in state && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}

export function DeleteAccountForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState<SettingsActionState, FormData>(
    deleteAccountAction,
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmEmail">
          Type <span className="font-mono text-ink">{email}</span> to confirm
        </Label>
        <Input
          id="confirmEmail"
          name="confirmEmail"
          autoComplete="off"
          required
        />
      </div>
      {state && "error" in state && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      <Button
        type="submit"
        disabled={pending}
        className="self-start bg-warn hover:bg-warn/90"
      >
        {pending ? "Deleting..." : "Delete my account"}
      </Button>
    </form>
  );
}

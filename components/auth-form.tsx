"use client";

import { startTransition, useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resendConfirmation, type AuthActionState } from "@/app/(auth)/actions";

function ResendConfirmation({ email }: { email: string }) {
  const [state, resendAction, pending] = useActionState<
    AuthActionState,
    FormData
  >(resendConfirmation, null);

  if (state && "message" in state) {
    return (
      <p className="text-sm text-ink" role="status">
        {state.message}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {/* Rendered inside the login <form> (forms can't nest), so dispatch
          the action directly with the email from the failed login. */}
      <Button
        type="button"
        variant="secondary"
        disabled={pending}
        onClick={() => {
          const formData = new FormData();
          formData.set("email", email);
          startTransition(() => resendAction(formData));
        }}
      >
        {pending ? "Sending..." : "Resend confirmation email"}
      </Button>
      {state && "error" in state && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
    </div>
  );
}

export function AuthForm({
  mode,
  action,
}: {
  mode: "login" | "signup";
  action: (
    state: AuthActionState,
    formData: FormData
  ) => Promise<AuthActionState>;
}) {
  const [state, formAction, pending] = useActionState<
    AuthActionState,
    FormData
  >(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={
            mode === "login" ? "current-password" : "new-password"
          }
          minLength={8}
          required
        />
        {mode === "login" && (
          <Link
            href="/forgot-password"
            className="self-end text-[12.5px] text-ink-muted underline-offset-2 hover:text-ink hover:underline"
          >
            Forgot password?
          </Link>
        )}
      </div>
      {state && "error" in state && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      {state && "error" in state && state.unconfirmedEmail && (
        <ResendConfirmation email={state.unconfirmedEmail} />
      )}
      <Button type="submit" disabled={pending} className="mt-2">
        {pending
          ? "Please wait..."
          : mode === "login"
            ? "Log in"
            : "Sign up"}
      </Button>
      <p className="text-sm text-muted-foreground text-center">
        {mode === "login" ? (
          <>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

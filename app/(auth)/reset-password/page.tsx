import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PasswordForm } from "@/components/password-form";

// Reached from the reset email via /auth/confirm, which signs the user in
// with the recovery token; proxy.ts sends anyone without a session to /login.
export default function ResetPasswordPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="flex-col gap-1">
          <CardTitle>Choose a new password</CardTitle>
          <CardDescription>At least 8 characters.</CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm redirectTo="/dashboard" submitLabel="Save and continue" />
        </CardContent>
      </Card>
    </div>
  );
}

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthForm } from "@/components/auth-form";
import { signup } from "@/app/(auth)/actions";

export default function SignupPage() {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Start analyzing and building resumes with ResumeIQ.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm mode="signup" action={signup} />
          <p className="mt-4 text-center text-[12.5px] text-ink-muted">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline">
              Privacy Policy
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

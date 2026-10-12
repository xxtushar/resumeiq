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
        </CardContent>
      </Card>
    </div>
  );
}

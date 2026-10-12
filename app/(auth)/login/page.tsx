import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthForm } from "@/components/auth-form";
import { login } from "@/app/(auth)/actions";

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Log in</CardTitle>
          <CardDescription>
            {searchParams.confirmEmail
              ? "Check your email to confirm your account, then log in."
              : "Welcome back to ResumeIQ."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm mode="login" action={login} />
        </CardContent>
      </Card>
    </div>
  );
}

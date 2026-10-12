import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/db/profiles";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PasswordForm } from "@/components/password-form";
import { DeleteAccountForm, ProfileForm } from "./settings-forms";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data!.claims.sub as string;
  const email = typeof data!.claims.email === "string" ? data!.claims.email : "";

  const profile = await getProfile(supabase, userId);

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <Card>
        <CardHeader className="flex-col gap-1">
          <CardTitle>Profile</CardTitle>
          <CardDescription>Signed in as {email}.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm fullName={profile?.full_name ?? ""} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-col gap-1">
          <CardTitle>Password</CardTitle>
          <CardDescription>At least 8 characters.</CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>

      <Card className="border-warn/30">
        <CardHeader className="flex-col gap-1">
          <CardTitle className="text-warn">Delete account</CardTitle>
          <CardDescription>
            Permanently deletes your account, resumes, uploaded files,
            analyses, and saved jobs. This can&apos;t be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DeleteAccountForm email={email} />
        </CardContent>
      </Card>
    </div>
  );
}

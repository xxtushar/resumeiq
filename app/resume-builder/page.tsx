import type { Metadata } from "next";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { PublicBuilderLoader } from "@/components/builder/public-builder-loader";
import { defaultResume } from "@/lib/builder/default-resume";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Resume builder — ResumeIQ",
  description:
    "Build an ATS-friendly resume from a sample that already scores 90+. Live ATS checks, a plain-text robot view, and a clean single-column PDF.",
};

export default async function ResumeBuilderPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const loggedIn = Boolean(data?.claims);

  return (
    <>
      <Navbar loggedIn={loggedIn} />
      <main className="flex-1">
        <PublicBuilderLoader initial={defaultResume()} loggedIn={loggedIn} />
      </main>
      <Footer />
    </>
  );
}

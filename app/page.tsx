import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { AtsView } from "@/components/marketing/ats-view";
import { CtaSection } from "@/components/marketing/cta-section";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { ValueProposition } from "@/components/marketing/value-proposition";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const loggedIn = Boolean(data?.claims);

  return (
    <>
      <Navbar loggedIn={loggedIn} />
      <main>
        <Hero loggedIn={loggedIn} />
        <AtsView />
        <ValueProposition />
        <HowItWorks />
        <CtaSection loggedIn={loggedIn} />
      </main>
      <Footer />
    </>
  );
}

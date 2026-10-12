import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { LEGAL_LAST_UPDATED } from "@/lib/constants";

/** Shared shell for the privacy policy and terms: marketing chrome plus
 * readable long-form typography for the plain HTML children. */
export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-[72ch] px-6 py-16 md:py-20">
        <h1 className="text-[34px] font-bold tracking-[-0.03em] text-brand">
          {title}
        </h1>
        <p className="mt-2 text-[14px] text-ink-faint">
          Last updated {LEGAL_LAST_UPDATED}
        </p>
        <div className="mt-10 flex flex-col gap-4 text-[15px] leading-relaxed text-ink [&_a]:text-accent-blue [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-6 [&_h2]:text-[19px] [&_h2]:font-bold [&_h2]:text-brand [&_li]:mt-1.5 [&_ul]:list-disc [&_ul]:pl-6">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}

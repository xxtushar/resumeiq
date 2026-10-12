import { FEATURES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Features() {
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-[1280px] px-6 py-20 lg:px-10 lg:py-28">
        <div className="max-w-[52ch]">
          <h2 className="font-display text-[2rem] leading-tight text-ink sm:text-[2.4rem]">
            Everything you need to decide, in one report.
          </h2>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-[8px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className={cn(
                "bg-paper-raised p-7",
                feature.size === "lg" && "sm:col-span-2 lg:col-span-2"
              )}
            >
              <h3 className="text-[16px] font-semibold text-ink">
                {feature.title}
              </h3>
              <p className="mt-2.5 max-w-[44ch] text-[14.5px] leading-relaxed text-ink-muted">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

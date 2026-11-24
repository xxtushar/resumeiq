import type { ResumeDoc } from "@/lib/builder/schema";
import { monthIndex, visibleContent, wordCount } from "@/lib/builder/format";

/**
 * Deterministic content checks for a builder resume — the things that get a
 * resume misread or skipped that formatting alone can't fix. Layout-level
 * issues (columns, tables, icons, headers) are already ruled out by the
 * template, so they're listed as guarantees, not scored.
 */

export type CheckStatus = "pass" | "warn" | "fail";

export interface AtsCheck {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
  weight: number;
}

export interface AtsReport {
  score: number;
  checks: AtsCheck[];
}

/** What the template does for every resume, regardless of content. */
export const TEMPLATE_GUARANTEES = [
  "Single column, read top to bottom",
  "Standard section headings",
  "Contact details in the body, not a page header",
  "Real text — no images, icons, tables or text boxes",
  "One date style: Mon YYYY – Present",
] as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HAS_NUMBER = /\d/;
const PRONOUN = /\b(I|me|my|mine|we|our|us)\b/;

/** Openers that describe duties instead of results. */
const WEAK_OPENERS = new Set([
  "responsible", "responsibilities", "worked", "working", "helped", "helping",
  "assisted", "assisting", "was", "were", "did", "handled", "involved",
  "participated", "tasked", "duties", "various", "i", "my", "we", "our",
  "in", "on", "the", "a", "an",
]);

const firstWord = (s: string) => s.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "") ?? "";

const truncate = (s: string, n = 48) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

export function runAtsChecks(doc: ResumeDoc): AtsReport {
  const content = visibleContent(doc);
  const { contact } = doc;
  const checks: AtsCheck[] = [];
  const add = (c: AtsCheck) => checks.push(c);

  add({
    id: "name",
    label: "Full name",
    weight: 2,
    ...(contact.fullName.trim()
      ? { status: "pass", detail: "Your name opens the page." }
      : { status: "fail", detail: "Add your name — it should be the first line parsed." }),
  });

  const email = contact.email.trim();
  add({
    id: "email",
    label: "Email address",
    weight: 3,
    ...(!email
      ? { status: "fail", detail: "No email means no callback. Add one." }
      : EMAIL.test(email)
        ? { status: "pass", detail: "Reachable by email." }
        : { status: "fail", detail: `“${truncate(email)}” doesn't look like an email address.` }),
  });

  add({
    id: "phone",
    label: "Phone number",
    weight: 2,
    ...(contact.phone.trim()
      ? { status: "pass", detail: "Phone is in plain text." }
      : { status: "warn", detail: "Most recruiters screen by phone — add a number." }),
  });

  add({
    id: "location",
    label: "Location",
    weight: 1,
    ...(contact.location.trim()
      ? { status: "pass", detail: "City is listed for location filters." }
      : { status: "warn", detail: "Add a city — many searches filter by location." }),
  });

  add({
    id: "links",
    label: "LinkedIn or portfolio",
    weight: 1,
    ...(contact.linkedin.trim() || contact.website.trim()
      ? { status: "pass", detail: "A profile link is included." }
      : { status: "warn", detail: "Add LinkedIn, GitHub or a portfolio link." }),
  });

  const summaryLen = content.summary.length;
  add({
    id: "summary",
    label: "Summary",
    weight: 1,
    ...(summaryLen === 0
      ? { status: "warn", detail: "A 2–3 sentence summary helps both the parser and the recruiter." }
      : summaryLen < 120
        ? { status: "warn", detail: "Summary is very short — add your focus and one concrete result." }
        : summaryLen > 700
          ? { status: "warn", detail: "Summary is long — keep it to 2–4 sentences." }
          : { status: "pass", detail: "Summary length is right." }),
  });

  const roles = [...content.experience, ...content.projects];
  const allBullets = roles.flatMap((r) => r.bullets);

  add({
    id: "evidence",
    label: "Experience or projects",
    weight: 3,
    ...(allBullets.length > 0
      ? { status: "pass", detail: `${allBullets.length} bullet${allBullets.length === 1 ? "" : "s"} of evidence.` }
      : { status: "fail", detail: "Add at least one role or project with bullet points." }),
  });

  const incomplete = content.experience.filter((e) => !e.title.trim() || !e.company.trim() || !e.start);
  const backwards = content.experience.filter(
    (e) => !e.current && e.start && e.end && monthIndex(e.end) < monthIndex(e.start),
  );
  if (content.experience.length > 0) {
    add({
      id: "roles",
      label: "Role details",
      weight: 2,
      ...(incomplete.length > 0
        ? {
            status: "warn",
            detail: `${incomplete.length} role${incomplete.length === 1 ? " is" : "s are"} missing a title, company or start date.`,
          }
        : backwards.length > 0
          ? { status: "warn", detail: "An end date comes before its start date." }
          : { status: "pass", detail: "Every role has a title, company and dates." }),
    });
  }

  if (allBullets.length > 0) {
    const weak = allBullets.filter((b) => WEAK_OPENERS.has(firstWord(b)));
    add({
      id: "verbs",
      label: "Action-verb openers",
      weight: 2,
      ...(weak.length === 0
        ? { status: "pass", detail: "Every bullet leads with what you did." }
        : {
            status: "warn",
            detail: `${weak.length} bullet${weak.length === 1 ? "" : "s"} open weakly, e.g. “${truncate(weak[0])}”. Lead with a verb: Built, Led, Cut, Shipped.`,
          }),
    });

    const quantified = allBullets.filter((b) => HAS_NUMBER.test(b)).length;
    const ratio = quantified / allBullets.length;
    add({
      id: "metrics",
      label: "Measurable results",
      weight: 2,
      ...(ratio >= 0.4
        ? { status: "pass", detail: `${quantified} of ${allBullets.length} bullets carry a number.` }
        : {
            status: ratio >= 0.2 ? "warn" : "fail",
            detail: `Only ${quantified} of ${allBullets.length} bullets have a number. Add scale, % or time saved where you have it.`,
          }),
    });

    const long = allBullets.filter((b) => b.length > 240);
    const tiny = allBullets.filter((b) => b.length < 25);
    add({
      id: "length",
      label: "Bullet length",
      weight: 1,
      ...(long.length > 0
        ? { status: "warn", detail: `${long.length} bullet${long.length === 1 ? " runs" : "s run"} past two lines — split or tighten.` }
        : tiny.length > 0
          ? { status: "warn", detail: `${tiny.length} bullet${tiny.length === 1 ? " is" : "s are"} too thin to say much — add the outcome.` }
          : { status: "pass", detail: "Bullets are one to two lines each." }),
    });
  }

  const pronounHits = [content.summary, ...allBullets].filter((t) => PRONOUN.test(t));
  add({
    id: "pronouns",
    label: "No first-person pronouns",
    weight: 1,
    ...(pronounHits.length === 0
      ? { status: "pass", detail: "Written in resume voice." }
      : { status: "warn", detail: "Drop “I”, “my” and “we” — start with the verb instead." }),
  });

  const skillCount = content.skills.reduce((n, g) => n + g.list.length, 0);
  add({
    id: "skills",
    label: "Skills keywords",
    weight: 2,
    ...(skillCount >= 6
      ? { status: "pass", detail: `${skillCount} skills listed for keyword matching.` }
      : skillCount > 0
        ? { status: "warn", detail: `Only ${skillCount} skill${skillCount === 1 ? "" : "s"} — ATS keyword search needs more to match on.` }
        : { status: "fail", detail: "Add a skills section — it's where keyword searches land first." }),
  });

  add({
    id: "education",
    label: "Education",
    weight: doc.settings.layout === "early-career" ? 2 : 1,
    ...(content.education.length > 0
      ? { status: "pass", detail: "Education is listed." }
      : {
          status: doc.settings.layout === "early-career" ? "fail" : "warn",
          detail: "Add your degree — many filters require one.",
        }),
  });

  const words = wordCount(doc);
  const maxWords = doc.settings.layout === "early-career" ? 650 : 950;
  if (words > 0) {
    add({
      id: "words",
      label: "Overall length",
      weight: 1,
      ...(words > maxWords
        ? {
            status: "warn",
            detail: `About ${words} words — likely over ${doc.settings.layout === "early-career" ? "one page" : "two pages"}. Cut older or weaker points.`,
          }
        : words < 150
          ? { status: "warn", detail: `About ${words} words — too thin to rank well. Keep adding.` }
          : { status: "pass", detail: `About ${words} words — a healthy length.` }),
    });
  }

  const total = checks.reduce((n, c) => n + c.weight, 0);
  const earned = checks.reduce(
    (n, c) => n + c.weight * (c.status === "pass" ? 1 : c.status === "warn" ? 0.5 : 0),
    0,
  );

  return { score: total ? Math.round((earned / total) * 100) : 0, checks };
}

import type { ResumeDoc, ResumeLayout } from "@/lib/builder/schema";

/**
 * Presentation rules shared by the live preview, the PDF and the plain-text
 * "robot view", so all three always agree on order, headings and dates.
 */

export type SectionKey =
  | "summary"
  | "experience"
  | "projects"
  | "education"
  | "skills"
  | "certifications"
  | "achievements";

/** Standard headings — the exact words ATS parsers look for. */
export const SECTION_HEADINGS: Record<SectionKey, string> = {
  summary: "Summary",
  experience: "Experience",
  projects: "Projects",
  education: "Education",
  skills: "Skills",
  certifications: "Certifications",
  achievements: "Achievements",
};

/** Reverse-chronological for experienced candidates; education and skills
 * first for students and recent graduates, whose strongest evidence is there. */
export const SECTION_ORDER: Record<ResumeLayout, SectionKey[]> = {
  experienced: [
    "summary",
    "experience",
    "projects",
    "skills",
    "education",
    "certifications",
    "achievements",
  ],
  "early-career": [
    "summary",
    "education",
    "skills",
    "projects",
    "experience",
    "certifications",
    "achievements",
  ],
};

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "2024-03" → "Mar 2024", "2024" → "2024". */
export function formatMonth(value: string): string {
  const match = /^(\d{4})(?:-(\d{2}))?$/.exec(value.trim());
  if (!match) return "";
  const [, year, month] = match;
  return month ? `${MONTHS[Number(month) - 1]} ${year}` : year;
}

/** One consistent date style everywhere: "Mar 2024 – Present". */
export function formatRange(start: string, end: string, current = false): string {
  const from = formatMonth(start);
  const to = current ? "Present" : formatMonth(end);
  if (from && to) return from === to ? from : `${from} – ${to}`;
  return from || to;
}

/** Comparable number for a month value; NaN when empty. */
export function monthIndex(value: string): number {
  const match = /^(\d{4})(?:-(\d{2}))?$/.exec(value.trim());
  if (!match) return Number.NaN;
  return Number(match[1]) * 12 + (match[2] ? Number(match[2]) - 1 : 0);
}

/** Shown without the protocol: shorter, and still parsed as a link. */
export function displayUrl(value: string): string {
  return value
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "");
}

/** Contact details on one line and profile links on the next, so neither
 * line wraps mid-separator on the page. */
export function contactLines(contact: ResumeDoc["contact"]): string[][] {
  return [
    [contact.email.trim(), contact.phone.trim(), contact.location.trim()].filter(Boolean),
    [displayUrl(contact.linkedin), displayUrl(contact.website)].filter(Boolean),
  ].filter((line) => line.length > 0);
}

const filled = (s: string) => s.trim().length > 0;
const cleanBullets = (bullets: string[]) => bullets.map((b) => b.trim()).filter(Boolean);

export function splitSkills(items: string): string[] {
  return items
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Only entries with something in them render; blank rows left in the editor
 * never reach the page. */
export function visibleContent(doc: ResumeDoc) {
  return {
    summary: doc.summary.trim(),
    experience: doc.experience
      .map((e) => ({ ...e, bullets: cleanBullets(e.bullets) }))
      .filter((e) => filled(e.title) || filled(e.company) || e.bullets.length > 0),
    projects: doc.projects
      .map((p) => ({ ...p, bullets: cleanBullets(p.bullets) }))
      .filter((p) => filled(p.name) || p.bullets.length > 0),
    education: doc.education.filter((e) => filled(e.degree) || filled(e.school)),
    skills: doc.skills
      .map((g) => ({ ...g, list: splitSkills(g.items) }))
      .filter((g) => g.list.length > 0),
    certifications: doc.certifications.filter((c) => filled(c.name)),
    achievements: cleanBullets(doc.achievements),
  };
}

export type VisibleContent = ReturnType<typeof visibleContent>;

export function orderedSections(doc: ResumeDoc, content = visibleContent(doc)): SectionKey[] {
  return SECTION_ORDER[doc.settings.layout].filter((key) => {
    const value = content[key];
    return Array.isArray(value) ? value.length > 0 : value.length > 0;
  });
}

/** "Fieldnote Labs, Bengaluru" */
export const joinComma = (...parts: string[]) =>
  parts.map((p) => p.trim()).filter(Boolean).join(", ");

/**
 * The resume as plain text, in reading order — roughly what an applicant
 * tracking system extracts from the PDF. Powers the "robot view".
 */
export function toPlainText(doc: ResumeDoc): string {
  const content = visibleContent(doc);
  const out: string[] = [];
  const { contact } = doc;

  if (filled(contact.fullName)) out.push(contact.fullName.trim());
  if (filled(contact.headline)) out.push(contact.headline.trim());
  for (const line of contactLines(contact)) out.push(line.join(" | "));

  for (const key of orderedSections(doc, content)) {
    out.push("", SECTION_HEADINGS[key].toUpperCase());

    switch (key) {
      case "summary":
        out.push(content.summary);
        break;
      case "experience":
        for (const e of content.experience) {
          out.push(
            [e.title.trim(), formatRange(e.start, e.end, e.current)].filter(Boolean).join("  "),
          );
          const org = joinComma(e.company, e.location);
          if (org) out.push(org);
          for (const b of e.bullets) out.push(`• ${b}`);
        }
        break;
      case "projects":
        for (const p of content.projects) {
          out.push(
            [
              [p.name.trim(), displayUrl(p.link)].filter(Boolean).join(" | "),
              formatRange(p.start, p.end),
            ]
              .filter(Boolean)
              .join("  "),
          );
          if (filled(p.tech)) out.push(`Tech: ${p.tech.trim()}`);
          for (const b of p.bullets) out.push(`• ${b}`);
        }
        break;
      case "education":
        for (const e of content.education) {
          out.push([e.degree.trim(), formatRange(e.start, e.end)].filter(Boolean).join("  "));
          const school = joinComma(e.school, e.location);
          const line2 = [school, e.grade.trim()].filter(Boolean).join(" | ");
          if (line2) out.push(line2);
          if (filled(e.details)) out.push(e.details.trim());
        }
        break;
      case "skills":
        for (const g of content.skills) {
          out.push(filled(g.label) ? `${g.label.trim()}: ${g.list.join(", ")}` : g.list.join(", "));
        }
        break;
      case "certifications":
        for (const c of content.certifications) {
          out.push(
            [joinComma(c.name, c.issuer), formatMonth(c.date)].filter(Boolean).join("  "),
          );
        }
        break;
      case "achievements":
        for (const a of content.achievements) out.push(`• ${a}`);
        break;
    }
  }

  return out.join("\n").trim();
}

export function wordCount(doc: ResumeDoc): number {
  const text = toPlainText(doc);
  return text ? text.split(/\s+/).filter((w) => /\w/.test(w)).length : 0;
}

/** Safe file name for the PDF download: "Tushar_Singh_Resume.pdf". */
export function pdfFileName(doc: ResumeDoc, fallbackTitle: string): string {
  const base = doc.contact.fullName.trim()
    ? `${doc.contact.fullName.trim()} Resume`
    : fallbackTitle;
  const safe = base.replace(/[^a-z0-9-_ ]/gi, "").trim().replace(/\s+/g, "_");
  return `${safe || "Resume"}.pdf`;
}

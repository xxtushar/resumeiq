import { z } from "zod";

/**
 * The structured resume the builder edits, saves to `resume_versions.content`
 * and renders to the ATS template (preview + PDF). Everything is plain text:
 * no rich formatting, no images — that's what keeps the output parseable.
 */

export const LAYOUTS = ["experienced", "early-career"] as const;
export type ResumeLayout = (typeof LAYOUTS)[number];

export const PAGE_SIZES = ["A4", "LETTER"] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

export const LIMITS = {
  shortText: 120,
  url: 200,
  summary: 1200,
  bullet: 400,
  notes: 2000,
  bulletsPerEntry: 12,
  entries: 15,
  skillGroups: 12,
  skillItems: 600,
  achievements: 12,
} as const;

/** "YYYY-MM" or "YYYY", or empty when unknown. */
const monthValue = z
  .string()
  .regex(/^$|^\d{4}(-(0[1-9]|1[0-2]))?$/, "Use YYYY or YYYY-MM");

const short = z.string().max(LIMITS.shortText);
const url = z.string().max(LIMITS.url);
const id = z.string().min(1).max(64);
const bullets = z.array(z.string().max(LIMITS.bullet)).max(LIMITS.bulletsPerEntry);
const notes = z.string().max(LIMITS.notes).optional();

export const contactSchema = z.object({
  fullName: short,
  headline: short,
  email: short,
  phone: short,
  location: short,
  linkedin: url,
  website: url,
});

export const experienceSchema = z.object({
  id,
  title: short,
  company: short,
  location: short,
  start: monthValue,
  end: monthValue,
  current: z.boolean(),
  bullets,
  notes,
});

export const projectSchema = z.object({
  id,
  name: short,
  link: url,
  tech: z.string().max(LIMITS.shortText * 2),
  start: monthValue,
  end: monthValue,
  bullets,
  notes,
});

export const educationSchema = z.object({
  id,
  degree: short,
  school: short,
  location: short,
  start: monthValue,
  end: monthValue,
  grade: short,
  details: z.string().max(LIMITS.bullet),
});

export const skillGroupSchema = z.object({
  id,
  label: short,
  items: z.string().max(LIMITS.skillItems),
});

export const certificationSchema = z.object({
  id,
  name: short,
  issuer: short,
  date: monthValue,
});

export const resumeDocSchema = z.object({
  version: z.literal(2),
  settings: z.object({
    layout: z.enum(LAYOUTS),
    pageSize: z.enum(PAGE_SIZES),
  }),
  contact: contactSchema,
  summary: z.string().max(LIMITS.summary),
  summaryNotes: notes,
  experience: z.array(experienceSchema).max(LIMITS.entries),
  projects: z.array(projectSchema).max(LIMITS.entries),
  education: z.array(educationSchema).max(LIMITS.entries),
  skills: z.array(skillGroupSchema).max(LIMITS.skillGroups),
  certifications: z.array(certificationSchema).max(LIMITS.entries),
  achievements: z.array(z.string().max(LIMITS.bullet)).max(LIMITS.achievements),
});

export type ResumeDoc = z.infer<typeof resumeDocSchema>;
export type Contact = ResumeDoc["contact"];
export type ExperienceEntry = ResumeDoc["experience"][number];
export type ProjectEntry = ResumeDoc["projects"][number];
export type EducationEntry = ResumeDoc["education"][number];
export type SkillGroup = ResumeDoc["skills"][number];
export type Certification = ResumeDoc["certifications"][number];

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const blankExperience = (): ExperienceEntry => ({
  id: newId(),
  title: "",
  company: "",
  location: "",
  start: "",
  end: "",
  current: false,
  bullets: [""],
});

export const blankProject = (): ProjectEntry => ({
  id: newId(),
  name: "",
  link: "",
  tech: "",
  start: "",
  end: "",
  bullets: [""],
});

export const blankEducation = (): EducationEntry => ({
  id: newId(),
  degree: "",
  school: "",
  location: "",
  start: "",
  end: "",
  grade: "",
  details: "",
});

export const blankSkillGroup = (label = ""): SkillGroup => ({
  id: newId(),
  label,
  items: "",
});

export const blankCertification = (): Certification => ({
  id: newId(),
  name: "",
  issuer: "",
  date: "",
});

export function emptyResume(layout: ResumeLayout = "experienced"): ResumeDoc {
  return {
    version: 2,
    settings: { layout, pageSize: "A4" },
    contact: {
      fullName: "",
      headline: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      website: "",
    },
    summary: "",
    experience: [blankExperience()],
    projects: layout === "early-career" ? [blankProject()] : [],
    education: [blankEducation()],
    skills: [blankSkillGroup("Languages"), blankSkillGroup("Frameworks & tools")],
    certifications: [],
    achievements: [],
  };
}

/** Shape saved by the first version of the builder: four free-text sections. */
const legacySectionSchema = z.object({ content: z.string() }).passthrough();
const legacyDocSchema = z
  .object({
    summary: legacySectionSchema,
    experience: legacySectionSchema,
    skills: legacySectionSchema,
    education: legacySectionSchema,
  })
  .partial();

function lines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.replace(/^\s*[-•*]\s*/, "").trim())
    .filter(Boolean);
}

/**
 * Turns whatever is stored in `resume_versions.content` into a valid
 * ResumeDoc: the current shape as-is, the old four-textarea shape migrated
 * into structured sections, anything else as an empty resume.
 */
export function normalizeResume(raw: unknown): ResumeDoc {
  const current = resumeDocSchema.safeParse(raw);
  if (current.success) return current.data;

  const legacy = legacyDocSchema.safeParse(raw);
  if (legacy.success && raw && typeof raw === "object" && Object.keys(raw).length > 0) {
    const doc = emptyResume();
    const { summary, experience, skills, education } = legacy.data;

    doc.summary = (summary?.content ?? "").slice(0, LIMITS.summary);

    const expLines = lines(experience?.content ?? "");
    doc.experience = expLines.length
      ? [{ ...blankExperience(), bullets: expLines.slice(0, LIMITS.bulletsPerEntry) }]
      : [blankExperience()];

    const skillLines = lines(skills?.content ?? "");
    doc.skills = skillLines.length
      ? [{ ...blankSkillGroup("Skills"), items: skillLines.join(", ").slice(0, LIMITS.skillItems) }]
      : doc.skills;

    const eduLines = lines(education?.content ?? "");
    doc.education = eduLines.length
      ? eduLines.slice(0, LIMITS.entries).map((line) => ({
          ...blankEducation(),
          degree: line.slice(0, LIMITS.shortText),
        }))
      : doc.education;

    return doc;
  }

  return emptyResume();
}

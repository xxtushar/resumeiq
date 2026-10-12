export const NAV_LINKS = [
  { label: "Example", href: "#example" },
  { label: "Why it matters", href: "#product" },
  { label: "How it works", href: "#how-it-works" },
] as const;

export const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Upload your resume",
    description:
      "Drop in a PDF, DOCX, or plain text file. ResumeIQ reads the document and structures every section — experience, skills, education — into data it can reason about.",
  },
  {
    step: "02",
    title: "Paste the job description",
    description:
      "Add the posting you're applying to. No formatting required — ResumeIQ extracts the requirements, responsibilities, and language that matter.",
  },
  {
    step: "03",
    title: "Run the analysis",
    description:
      "The model compares your resume against the role: what's aligned, what's missing, and where an ATS might filter you out before a human ever looks.",
  },
  {
    step: "04",
    title: "Fix what's holding you back",
    description:
      "Get a specific, prioritized list of edits — not generic advice — so every version of your resume you send out is the strongest one.",
  },
] as const;

export const FEATURES = [
  {
    title: "Overall match score",
    description:
      "A single, defensible number for how well your resume fits the role — weighted across skills, experience level, and language alignment.",
    size: "lg",
  },
  {
    title: "ATS compatibility",
    description:
      "Catch the formatting and structure issues that cause applicant tracking systems to misread or reject an otherwise strong resume.",
    size: "sm",
  },
  {
    title: "Skill match breakdown",
    description:
      "See exactly which required skills your resume already evidences, and how strongly.",
    size: "sm",
  },
  {
    title: "Missing skills",
    description:
      "The requirements from the job description that your resume doesn't currently address — worth adding if you have the experience.",
    size: "sm",
  },
  {
    title: "Keyword gaps",
    description:
      "Language the job posting uses that your resume doesn't. Small wording changes here often matter more than new content.",
    size: "sm",
  },
  {
    title: "Actionable suggestions",
    description:
      "Specific rewrites and additions, ranked by impact — not a generic checklist of resume tips you've already read.",
    size: "lg",
  },
] as const;

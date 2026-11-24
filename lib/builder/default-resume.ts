import { newId, type ResumeDoc, type ResumeLayout } from "@/lib/builder/schema";

/**
 * The pre-filled resume every new builder draft starts from: a complete,
 * fictional example written to pass every content check in
 * lib/builder/ats-checks.ts (score >= 90, enforced by tests). Users replace
 * the text with their own; the structure and habits — action-verb bullets,
 * numbers on most of them, standard headings — carry over.
 *
 * Contact details use example.com and a placeholder phone on purpose.
 */
export const SAMPLE_EMAIL = "aarav.mehta@example.com";

/** True while the draft still carries the sample's contact details. */
export function isSampleResume(doc: ResumeDoc): boolean {
  return doc.contact.email.trim().toLowerCase() === SAMPLE_EMAIL;
}

export function defaultResume(layout: ResumeLayout = "experienced"): ResumeDoc {
  return {
    version: 2,
    settings: { layout, pageSize: "A4" },
    contact: {
      fullName: "Aarav Mehta",
      headline: "Software Engineer",
      email: SAMPLE_EMAIL,
      phone: "+91 98765 43210",
      location: "Bengaluru, India",
      linkedin: "linkedin.com/in/aaravmehta",
      website: "github.com/aaravmehta",
    },
    summary:
      "Software engineer with three years of experience building web applications in TypeScript, React and Node.js. Shipped features used by 200,000 monthly users and cut API response times by 45% through query and caching work. Looking for a backend or full-stack role on a product team.",
    experience: [
      {
        id: newId(),
        title: "Software Engineer",
        company: "Northwind Labs",
        location: "Bengaluru",
        start: "2023-07",
        end: "",
        current: true,
        bullets: [
          "Built a customer billing dashboard in Next.js and TypeScript used by 1,200 business accounts",
          "Cut average API response time by 45% by adding Redis caching and rewriting slow PostgreSQL queries",
          "Designed a background job queue that processes 300,000 invoices a month with automatic retries",
          "Mentored 2 junior engineers through code reviews and pair programming sessions",
        ],
      },
      {
        id: newId(),
        title: "Software Engineer Intern",
        company: "Brightpath Technologies",
        location: "Pune",
        start: "2022-01",
        end: "2022-06",
        current: false,
        bullets: [
          "Developed 6 reusable React components adopted across three internal tools",
          "Wrote integration tests with Jest that raised test coverage from 52% to 78%",
          "Automated weekly report generation in Python, saving the support team 5 hours a week",
        ],
      },
    ],
    projects: [
      {
        id: newId(),
        name: "Job Match Tracker",
        link: "github.com/aaravmehta/job-match",
        tech: "Next.js, TypeScript, Supabase, OpenAI API",
        start: "2024-03",
        end: "2024-05",
        bullets: [
          "Built a web app that compares resumes with job descriptions and highlights missing keywords",
          "Implemented semantic search over 10,000 job posts using pgvector embeddings",
        ],
      },
    ],
    education: [
      {
        id: newId(),
        degree: "B.Tech, Computer Science and Engineering",
        school: "National Institute of Technology",
        location: "Surat",
        start: "2019",
        end: "2023",
        grade: "CGPA 8.4 / 10",
        details: "Relevant coursework: Data Structures, Databases, Operating Systems, Computer Networks",
      },
    ],
    skills: [
      { id: newId(), label: "Languages", items: "TypeScript, JavaScript, Python, SQL" },
      { id: newId(), label: "Frameworks", items: "React, Next.js, Node.js, Express" },
      { id: newId(), label: "Tools", items: "PostgreSQL, Redis, Docker, Git, AWS" },
    ],
    certifications: [
      {
        id: newId(),
        name: "AWS Certified Cloud Practitioner",
        issuer: "Amazon Web Services",
        date: "2024-02",
      },
    ],
    achievements: [],
  };
}

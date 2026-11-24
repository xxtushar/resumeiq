import { describe, expect, it } from "vitest";
import {
  emptyResume,
  normalizeResume,
  resumeDocSchema,
  type ResumeDoc,
} from "@/lib/builder/schema";
import {
  displayUrl,
  formatMonth,
  formatRange,
  orderedSections,
  pdfFileName,
  toPlainText,
} from "@/lib/builder/format";
import { runAtsChecks } from "@/lib/builder/ats-checks";
import { defaultResume } from "@/lib/builder/default-resume";

function sampleResume(overrides: Partial<ResumeDoc> = {}): ResumeDoc {
  const doc = emptyResume("experienced");
  return {
    ...doc,
    contact: {
      fullName: "Asha Rao",
      headline: "Backend Engineer",
      email: "asha@example.com",
      phone: "+91 98765 43210",
      location: "Bengaluru, India",
      linkedin: "https://www.linkedin.com/in/asharao/",
      website: "",
    },
    summary:
      "Backend engineer with four years building payment APIs in Go and Postgres. Cut settlement latency by 40% at a fintech serving two million users.",
    experience: [
      {
        id: "e1",
        title: "Backend Engineer",
        company: "Northwind Pay",
        location: "Bengaluru",
        start: "2022-03",
        end: "",
        current: true,
        bullets: [
          "Rebuilt the settlement service in Go, cutting p95 latency from 900ms to 540ms",
          "Led migration of 14 services to Postgres 16 with zero downtime",
          "Designed idempotent payout APIs handling 2M requests a day",
        ],
      },
    ],
    skills: [
      { id: "s1", label: "Languages", items: "Go, Python, SQL" },
      { id: "s2", label: "Tools", items: "Postgres, Kafka, Docker, AWS" },
    ],
    education: [
      {
        id: "ed1",
        degree: "B.Tech, Computer Science",
        school: "SRM IST",
        location: "Ghaziabad",
        start: "2017",
        end: "2021",
        grade: "CGPA 8.6",
        details: "",
      },
    ],
    ...overrides,
  };
}

describe("resume schema", () => {
  it("accepts a fresh empty resume", () => {
    expect(resumeDocSchema.safeParse(emptyResume()).success).toBe(true);
    expect(resumeDocSchema.safeParse(emptyResume("early-career")).success).toBe(true);
  });

  it("rejects malformed dates and oversized fields", () => {
    const doc = sampleResume();
    doc.experience[0].start = "March 2022";
    expect(resumeDocSchema.safeParse(doc).success).toBe(false);

    const long = sampleResume({ summary: "x".repeat(5000) });
    expect(resumeDocSchema.safeParse(long).success).toBe(false);
  });
});

describe("normalizeResume", () => {
  it("passes a current resume through unchanged", () => {
    const doc = sampleResume();
    expect(normalizeResume(doc)).toEqual(doc);
  });

  it("migrates the old four-textarea builder shape", () => {
    const doc = normalizeResume({
      summary: { input: "notes", content: "Engineer with five years." },
      experience: { input: "", content: "- Built X\n- Shipped Y" },
      skills: { input: "", content: "React\nTypeScript" },
      education: { input: "", content: "B.Tech, SRM IST, 2024" },
    });
    expect(doc.version).toBe(2);
    expect(doc.summary).toBe("Engineer with five years.");
    expect(doc.experience[0].bullets).toEqual(["Built X", "Shipped Y"]);
    expect(doc.skills[0].items).toBe("React, TypeScript");
    expect(doc.education[0].degree).toBe("B.Tech, SRM IST, 2024");
    expect(resumeDocSchema.safeParse(doc).success).toBe(true);
  });

  it("falls back to an empty resume for junk", () => {
    expect(normalizeResume(null)).toMatchObject({ version: 2, summary: "" });
    expect(normalizeResume({})).toMatchObject({ version: 2, summary: "" });
    expect(normalizeResume("nope")).toMatchObject({ version: 2 });
  });
});

describe("formatting", () => {
  it("formats months and ranges in one style", () => {
    expect(formatMonth("2024-03")).toBe("Mar 2024");
    expect(formatMonth("2024")).toBe("2024");
    expect(formatMonth("")).toBe("");
    expect(formatRange("2022-03", "", true)).toBe("Mar 2022 – Present");
    expect(formatRange("2019", "2021")).toBe("2019 – 2021");
    expect(formatRange("2021-06", "")).toBe("Jun 2021");
    expect(formatRange("2021-06", "2021-06")).toBe("Jun 2021");
  });

  it("strips protocol noise from links", () => {
    expect(displayUrl("https://www.linkedin.com/in/asharao/")).toBe("linkedin.com/in/asharao");
  });

  it("orders sections by layout and skips empty ones", () => {
    const doc = sampleResume();
    expect(orderedSections(doc)).toEqual(["summary", "experience", "skills", "education"]);
    const student = sampleResume({ settings: { layout: "early-career", pageSize: "A4" } });
    expect(orderedSections(student)).toEqual(["summary", "education", "skills", "experience"]);
  });

  it("produces reading-order plain text with standard headings", () => {
    const text = toPlainText(sampleResume());
    const lines = text.split("\n");
    expect(lines[0]).toBe("Asha Rao");
    expect(lines[2]).toBe("asha@example.com | +91 98765 43210 | Bengaluru, India");
    expect(lines[3]).toBe("linkedin.com/in/asharao");
    expect(text.indexOf("EXPERIENCE")).toBeLessThan(text.indexOf("SKILLS"));
    expect(text).toContain("Backend Engineer  Mar 2022 – Present");
    expect(text).toContain("• Led migration of 14 services");
    expect(text).toContain("Languages: Go, Python, SQL");
  });

  it("builds a safe PDF file name", () => {
    expect(pdfFileName(sampleResume(), "Draft")).toBe("Asha_Rao_Resume.pdf");
    expect(pdfFileName(emptyResume(), "My / draft!")).toBe("My_draft.pdf");
  });
});

describe("runAtsChecks", () => {
  it("scores a complete, quantified resume highly", () => {
    const report = runAtsChecks(sampleResume());
    expect(report.score).toBeGreaterThanOrEqual(90);
    expect(report.checks.filter((c) => c.status === "fail")).toEqual([]);
  });

  it("fails an empty resume on the essentials", () => {
    const report = runAtsChecks(emptyResume());
    const failed = report.checks.filter((c) => c.status === "fail").map((c) => c.id);
    expect(failed).toEqual(expect.arrayContaining(["name", "email", "evidence", "skills"]));
    expect(report.score).toBeLessThan(40);
  });

  it("flags weak openers, missing numbers and pronouns", () => {
    const doc = sampleResume();
    doc.experience[0].bullets = [
      "Responsible for the payments backend and its upkeep",
      "Worked with the team on reliability improvements",
      "I wrote documentation for internal services",
    ];
    const byId = Object.fromEntries(runAtsChecks(doc).checks.map((c) => [c.id, c.status]));
    expect(byId.verbs).toBe("warn");
    expect(byId.metrics).toBe("fail");
    expect(byId.pronouns).toBe("warn");
  });

  it("catches an invalid email and backwards dates", () => {
    const doc = sampleResume();
    doc.contact.email = "asha at example";
    doc.experience[0] = { ...doc.experience[0], current: false, start: "2023-05", end: "2022-01" };
    const byId = Object.fromEntries(runAtsChecks(doc).checks.map((c) => [c.id, c.status]));
    expect(byId.email).toBe("fail");
    expect(byId.roles).toBe("warn");
  });
});

describe("defaultResume (the pre-filled starting point)", () => {
  for (const layout of ["experienced", "early-career"] as const) {
    it(`is valid and scores at least 90 in the ${layout} layout`, () => {
      const doc = defaultResume(layout);
      expect(resumeDocSchema.safeParse(doc).success).toBe(true);
      const report = runAtsChecks(doc);
      expect(report.score).toBeGreaterThanOrEqual(90);
      expect(report.checks.filter((c) => c.status === "fail")).toEqual([]);
    });
  }

  it("gives every entry a fresh id", () => {
    expect(defaultResume().experience[0].id).not.toBe(defaultResume().experience[0].id);
  });
});

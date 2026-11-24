// @vitest-environment node
import { describe, expect, it } from "vitest";
import { renderResumePdfBuffer } from "@/lib/pdf/resume-document";
import { extractResumeText } from "@/lib/parsing";
import { emptyResume, type ResumeDoc } from "@/lib/builder/schema";
import { defaultResume } from "@/lib/builder/default-resume";

const doc: ResumeDoc = {
  ...emptyResume("experienced"),
  contact: {
    fullName: "Asha Rao",
    headline: "Backend Engineer",
    email: "asha@example.com",
    phone: "+91 98765 43210",
    location: "Bengaluru, India",
    linkedin: "linkedin.com/in/asharao",
    website: "github.com/asharao",
  },
  summary: "Backend engineer with four years building payment APIs in Go and Postgres.",
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
        "Rebuilt the settlement service in Go and TypeScript, cutting p95 latency from 900ms to 540ms across the entire reconciliation pipeline and its downstream consumers",
        "Led migration of 14 services to Postgres 16 with zero downtime",
      ],
    },
  ],
  skills: [{ id: "s1", label: "Languages", items: "Go, Python, SQL, TypeScript" }],
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
};

describe("ATS PDF template", () => {
  it("produces a text PDF that parses back in reading order", async () => {
    const pdf = await renderResumePdfBuffer(doc, "Draft");
    const text = await extractResumeText(pdf, "application/pdf");

    const order = ["Asha Rao", "asha@example.com", "SUMMARY", "EXPERIENCE", "Northwind Pay", "SKILLS", "EDUCATION"];
    const positions = order.map((s) => text.indexOf(s));
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);

    expect(text).toContain("Mar 2022 – Present");
    // Keywords are never hyphenated across a line break.
    expect(text).not.toMatch(/Type-\s*\n?\s*Script/);
    expect(text.match(/TypeScript/g)?.length).toBe(2);
  }, 30_000);

  it("renders Letter size and an empty resume without crashing", async () => {
    const letter = { ...doc, settings: { ...doc.settings, pageSize: "LETTER" as const } };
    await expect(renderResumePdfBuffer(letter, "x")).resolves.toBeInstanceOf(Buffer);
    await expect(renderResumePdfBuffer(emptyResume(), "x")).resolves.toBeInstanceOf(Buffer);
  }, 30_000);

  it("renders the default resume as one page of parseable text", async () => {
    const pdf = await renderResumePdfBuffer(defaultResume(), "Resume");
    const text = await extractResumeText(pdf, "application/pdf");
    expect(text).toContain("Aarav Mehta");
    expect(text).toContain("aarav.mehta@example.com");
    expect(text).toContain("EXPERIENCE");
    expect(text).toContain("CERTIFICATIONS");
    expect(text).toMatch(/-- 1 of 1 --/);
    // Contact details and links sit on their own lines: no wrapped separators.
    expect(text).toContain("aarav.mehta@example.com | +91 98765 43210 | Bengaluru, India\n");
    expect(text).toContain("linkedin.com/in/aaravmehta | github.com/aaravmehta\n");
    expect(text).not.toMatch(/\|-/);
  }, 30_000);
});

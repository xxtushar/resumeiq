import { describe, expect, it } from "vitest";
import { chunkResumeText } from "@/lib/rag/chunk";
import { buildEvidenceContext } from "@/lib/rag/retrieval";

describe("chunkResumeText", () => {
  it("returns nothing for empty text", () => {
    expect(chunkResumeText("  \n\n ")).toEqual([]);
  });

  it("packs short paragraphs together", () => {
    const text = "Jane Doe\n\nEngineer at Acme\n- Built X\n\nSkills: TypeScript";
    expect(chunkResumeText(text, 200)).toEqual([text]);
  });

  it("starts a new chunk instead of exceeding the limit", () => {
    const a = "a".repeat(60);
    const b = "b".repeat(60);
    expect(chunkResumeText(`${a}\n\n${b}`, 100)).toEqual([a, b]);
  });

  it("splits oversized paragraphs by line, then hard-splits long lines", () => {
    const chunks = chunkResumeText(`${"x".repeat(50)}\n${"y".repeat(250)}`, 100);
    expect(chunks.every((c) => c.length <= 100)).toBe(true);
    expect(chunks.join("").replace(/\n/g, "")).toBe("x".repeat(50) + "y".repeat(250));
  });
});

describe("buildEvidenceContext", () => {
  it("numbers requirements and includes excerpts with similarity", () => {
    const context = buildEvidenceContext([
      { requirement: "React", chunks: [{ content: "Built apps\nin React", similarity: 0.83 }] },
      { requirement: "Go", chunks: [] },
    ]);
    expect(context).toContain("1. React\n  [similarity 0.83] Built apps in React");
    expect(context).toContain("2. Go\n  (no related resume text found)");
  });
});

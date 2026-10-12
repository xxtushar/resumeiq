import { describe, expect, it } from "vitest";
import {
  extractResumeText,
  resolveMimeType,
  UnsupportedFileTypeError,
} from "@/lib/parsing";

describe("extractResumeText", () => {
  it("extracts and normalizes plain text", async () => {
    const input = "Line one\r\nLine two\n\n\n\nLine three  \n";
    const text = await extractResumeText(Buffer.from(input), "text/plain");
    expect(text).toBe("Line one\nLine two\n\nLine three");
  });

  it("throws UnsupportedFileTypeError for unknown mime types", async () => {
    await expect(
      extractResumeText(Buffer.from("x"), "application/zip")
    ).rejects.toBeInstanceOf(UnsupportedFileTypeError);
  });
});

describe("resolveMimeType", () => {
  const DOCX =
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  it("keeps a supported reported type", () => {
    expect(resolveMimeType("cv.pdf", "application/pdf")).toBe("application/pdf");
  });

  it("falls back to the extension when the browser sends no type", () => {
    expect(resolveMimeType("My CV.DOCX", "")).toBe(DOCX);
    expect(resolveMimeType("cv.docx", "application/octet-stream")).toBe(DOCX);
  });

  it("leaves unsupported files unsupported", () => {
    expect(resolveMimeType("cv.zip", "application/zip")).toBe("application/zip");
  });
});

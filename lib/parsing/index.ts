export class UnsupportedFileTypeError extends Error {
  constructor(mimeType: string) {
    super(`Unsupported file type: ${mimeType}`);
    this.name = "UnsupportedFileTypeError";
  }
}

const MIME_BY_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain",
};

/** Browsers sometimes send an empty or generic type (common for .docx on
 * Windows), so fall back to the file extension. */
export function resolveMimeType(fileName: string, reportedType: string) {
  if (Object.values(MIME_BY_EXTENSION).includes(reportedType)) {
    return reportedType;
  }
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return MIME_BY_EXTENSION[ext] ?? reportedType;
}

/** Extracts plain text from an uploaded resume file (PDF or DOCX). */
export async function extractResumeText(
  file: Buffer,
  mimeType: string
): Promise<string> {
  if (mimeType === "application/pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: file });
    try {
      const { text } = await parser.getText();
      return normalize(text);
    } finally {
      await parser.destroy();
    }
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({ buffer: file });
    return normalize(value);
  }

  if (mimeType === "text/plain") {
    return normalize(file.toString("utf-8"));
  }

  throw new UnsupportedFileTypeError(mimeType || "unknown");
}

function normalize(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

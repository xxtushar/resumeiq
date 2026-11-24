import { NextResponse } from "next/server";
import { z } from "zod";
import { renderResumePdfBuffer } from "@/lib/pdf/resume-document";
import { resumeDocSchema } from "@/lib/builder/schema";
import { pdfFileName } from "@/lib/builder/format";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Public and CPU-heavy, so cap each IP at 10 PDFs a minute.
const allowRequest = createRateLimiter(10, 60_000);

// Generous for a full resume; the schema's own field limits cap it well below.
const MAX_BODY_BYTES = 200_000;

const bodySchema = z.object({ content: resumeDocSchema });

/**
 * Renders a resume sent in the request body to the ATS PDF template. Public
 * so the /resume-builder page works without an account: no AI call and
 * nothing stored, just validated input in and a PDF out.
 */
export async function POST(request: Request) {
  if (!allowRequest(clientIp(request))) {
    return NextResponse.json(
      { error: "Too many PDF downloads. Wait a minute and try again." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  const raw = await request.text().catch(() => "");
  if (!raw || raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const where = issue?.path.slice(1).join(" › ");
    return NextResponse.json(
      { error: issue ? `Couldn't build the PDF: ${where ? `${where} — ` : ""}${issue.message}` : "Invalid request." },
      { status: 400 }
    );
  }

  const doc = parsed.data.content;
  const buffer = await renderResumePdfBuffer(doc, "Resume");

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${pdfFileName(doc, "Resume")}"`,
      "Cache-Control": "no-store",
    },
  });
}

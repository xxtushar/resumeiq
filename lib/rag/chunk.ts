/** gte-small reads at most 512 tokens; ~1,200 characters stays well under. */
export const MAX_CHUNK_CHARS = 1200;

/**
 * Splits resume text into retrieval chunks along its natural structure:
 * paragraphs (blank-line separated) are packed together up to `maxChars`,
 * so a role and its bullets usually land in the same chunk. Oversized
 * paragraphs fall back to line, then hard character, splits.
 */
export function chunkResumeText(text: string, maxChars = MAX_CHUNK_CHARS): string[] {
  const pieces = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .flatMap((p) => splitOversized(p, maxChars));

  const chunks: string[] = [];
  let current = "";

  for (const piece of pieces) {
    const candidate = current ? `${current}\n\n${piece}` : piece;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) chunks.push(current);
      current = piece;
    }
  }
  if (current) chunks.push(current);

  return chunks;
}

function splitOversized(paragraph: string, maxChars: number): string[] {
  if (paragraph.length <= maxChars) return [paragraph];

  const out: string[] = [];
  let current = "";
  for (const line of paragraph.split("\n")) {
    if (line.length > maxChars) {
      if (current) out.push(current);
      current = "";
      for (let i = 0; i < line.length; i += maxChars) {
        out.push(line.slice(i, i + maxChars));
      }
      continue;
    }
    const candidate = current ? `${current}\n${line}` : line;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      out.push(current);
      current = line;
    }
  }
  if (current) out.push(current);
  return out;
}

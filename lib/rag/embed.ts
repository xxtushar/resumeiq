import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/** Matches MAX_INPUTS in supabase/functions/embed/index.ts. */
const BATCH_SIZE = 16;

export class EmbeddingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmbeddingError";
  }
}

/**
 * Embeds texts via the `embed` Edge Function (gte-small, 384 dims). The
 * function authenticates the user's session JWT, so only the bearer token
 * is sent — no API key, which that endpoint rejects.
 */
export async function embedTexts(
  supabase: SupabaseClient<Database>,
  texts: string[]
): Promise<number[][]> {
  if (texts.length === 0) return [];

  // Only used to forward the caller's own token; authorization decisions
  // elsewhere use getClaims().
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new EmbeddingError("No session to authorize embedding.");

  const batches: string[][] = [];
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    batches.push(texts.slice(i, i + BATCH_SIZE));
  }

  const results = await Promise.all(
    batches.map(async (input) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/embed`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ input }),
        }
      );
      const body = await res.json().catch(() => null);
      if (!res.ok || !Array.isArray(body?.embeddings)) {
        throw new EmbeddingError(
          `embed function failed (${res.status}): ${body?.message ?? body?.error ?? "no body"}`
        );
      }
      return body.embeddings as number[][];
    })
  );

  return results.flat();
}

/** pgvector accepts the JSON array form as its text input. */
export function toVectorLiteral(embedding: number[]): string {
  return JSON.stringify(embedding);
}

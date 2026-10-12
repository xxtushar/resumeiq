// Embeds text with Supabase's built-in gte-small model (384 dims,
// normalized) so the app needs no external embeddings provider.
// Deployed with verify_jwt = false: withSupabase({ auth: "user" }) checks the
// caller's session JWT in code, which works with the new API key system.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "npm:@supabase/server";

const session = new Supabase.ai.Session("gte-small");

const MAX_INPUTS = 16;
const MAX_INPUT_CHARS = 4000;

export default {
  fetch: withSupabase({ auth: "user" }, async (req) => {
    if (req.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    const body = await req.json().catch(() => null);
    const input: unknown = body?.input;

    if (
      !Array.isArray(input) ||
      input.length === 0 ||
      input.length > MAX_INPUTS ||
      !input.every((t) => typeof t === "string" && t.length > 0 && t.length <= MAX_INPUT_CHARS)
    ) {
      return Response.json(
        { error: `input must be 1-${MAX_INPUTS} non-empty strings of at most ${MAX_INPUT_CHARS} characters` },
        { status: 400 }
      );
    }

    const embeddings: number[][] = [];
    for (const text of input as string[]) {
      const output = await session.run(text, { mean_pool: true, normalize: true });
      embeddings.push(Array.from(output as number[]));
    }

    return Response.json({ embeddings });
  }),
};

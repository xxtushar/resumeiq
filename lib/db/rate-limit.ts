import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const DAILY_AI_CALL_LIMIT = Number(process.env.DAILY_AI_CALL_LIMIT ?? 20);

export type AiCallKind = Database["public"]["Tables"]["ai_usage"]["Row"]["kind"];

/**
 * Portfolio-scope cost guardrail: checks today's AI calls for the user, then
 * records this one. Recorded before the model is called, so failed calls
 * still count — the API cost was incurred either way.
 */
export async function consumeDailyAiCall(
  supabase: SupabaseClient<Database>,
  userId: string,
  kind: AiCallKind
) {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from("ai_usage")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", since.toISOString());

  if (error) throw error;
  if ((count ?? 0) >= DAILY_AI_CALL_LIMIT) {
    throw new DailyLimitExceededError(DAILY_AI_CALL_LIMIT);
  }

  const { error: insertError } = await supabase
    .from("ai_usage")
    .insert({ user_id: userId, kind });

  if (insertError) throw insertError;
}

export class DailyLimitExceededError extends Error {
  constructor(limit: number) {
    super(`Daily AI usage limit of ${limit} reached. Try again tomorrow.`);
    this.name = "DailyLimitExceededError";
  }
}

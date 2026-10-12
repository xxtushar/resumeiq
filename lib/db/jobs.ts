import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";
import { parsedJobSchema, type ParsedJob } from "@/lib/ai/schemas";

type Client = SupabaseClient<Database>;

export async function listJobs(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("jobs")
    .select("id, title, company, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getJob(supabase: Client, userId: string, jobId: string) {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("user_id", userId)
    .eq("id", jobId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return { ...data, parsed: parsedJobSchema.parse(data.requirements) };
}

export async function createJob(
  supabase: Client,
  userId: string,
  description: string,
  parsed: ParsedJob
) {
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      user_id: userId,
      title: parsed.title,
      company: parsed.company,
      description,
      requirements: parsed as unknown as Json,
    })
    .select()
    .single();

  if (error) throw error;
  return { ...data, parsed };
}

export async function deleteJob(supabase: Client, userId: string, jobId: string) {
  const { data, error } = await supabase
    .from("jobs")
    .delete()
    .eq("user_id", userId)
    .eq("id", jobId)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  return data;
}

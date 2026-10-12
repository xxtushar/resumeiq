import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/types/database";

type Client = SupabaseClient<Database>;

export async function listResumes(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("resumes")
    .select("id, title, source, storage_path, created_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getResume(
  supabase: Client,
  userId: string,
  resumeId: string
) {
  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", userId)
    .eq("id", resumeId)
    .single();

  if (error) throw error;
  return data;
}

export async function createResume(
  supabase: Client,
  userId: string,
  input: {
    title: string;
    source: "uploaded" | "builder";
    storagePath?: string;
    rawText?: string;
  }
) {
  const { data, error } = await supabase
    .from("resumes")
    .insert({
      user_id: userId,
      title: input.title,
      source: input.source,
      storage_path: input.storagePath ?? null,
      raw_text: input.rawText ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function renameResume(
  supabase: Client,
  userId: string,
  resumeId: string,
  title: string
) {
  const { data, error } = await supabase
    .from("resumes")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("id", resumeId)
    .select("id")
    .maybeSingle();

  if (error) throw error;
  return data;
}

/** Deletes the resume row; its analyses and versions go with it via
 * `on delete cascade`. Returns the stored file path (if any) so the caller
 * can remove the file from Storage. */
export async function deleteResume(
  supabase: Client,
  userId: string,
  resumeId: string
) {
  const { data, error } = await supabase
    .from("resumes")
    .delete()
    .eq("user_id", userId)
    .eq("id", resumeId)
    .select("id, storage_path")
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function saveAnalysis(
  supabase: Client,
  userId: string,
  input: {
    resumeId: string;
    jobDescription?: string;
    jobId?: string;
    score: number;
    result: Json;
  }
) {
  const { data, error } = await supabase
    .from("analyses")
    .insert({
      user_id: userId,
      resume_id: input.resumeId,
      job_description: input.jobDescription ?? null,
      job_id: input.jobId ?? null,
      score: input.score,
      result: input.result,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getLatestVersion(
  supabase: Client,
  userId: string,
  resumeId: string
) {
  const { data, error } = await supabase
    .from("resume_versions")
    .select("*")
    .eq("user_id", userId)
    .eq("resume_id", resumeId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function saveVersion(
  supabase: Client,
  userId: string,
  resumeId: string,
  content: Json
) {
  const { data, error } = await supabase
    .from("resume_versions")
    .insert({ user_id: userId, resume_id: resumeId, content })
    .select()
    .single();

  if (error) throw error;

  await supabase
    .from("resumes")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", resumeId)
    .eq("user_id", userId);

  return data;
}

export async function getLatestAnalysis(
  supabase: Client,
  userId: string,
  resumeId: string
) {
  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("user_id", userId)
    .eq("resume_id", resumeId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function listRecentAnalyses(
  supabase: Client,
  userId: string,
  limit = 5
) {
  const { data, error } = await supabase
    .from("analyses")
    .select("id, resume_id, created_at, score, result")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getAnalysis(
  supabase: Client,
  userId: string,
  resumeId: string,
  analysisId: string
) {
  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("user_id", userId)
    .eq("resume_id", resumeId)
    .eq("id", analysisId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function listResumeAnalyses(
  supabase: Client,
  userId: string,
  resumeId: string
) {
  const { data, error } = await supabase
    .from("analyses")
    .select("id, created_at, score, result")
    .eq("user_id", userId)
    .eq("resume_id", resumeId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/** Full analysis history with each resume's title, newest first. */
export async function listAllAnalyses(
  supabase: Client,
  userId: string,
  limit = 100
) {
  const [analyses, resumes] = await Promise.all([
    listRecentAnalyses(supabase, userId, limit),
    listResumes(supabase, userId),
  ]);
  const titles = new Map(resumes.map((r) => [r.id, r.title]));
  return analyses.map((a) => ({ ...a, resume_title: titles.get(a.resume_id) ?? "Resume" }));
}

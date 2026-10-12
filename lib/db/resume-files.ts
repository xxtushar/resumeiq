import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

const BUCKET = "resumes";

const EXTENSIONS: Record<string, string> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "text/plain": "txt",
};

/** Uploads an original resume file under `<userId>/`, the folder the
 * storage RLS policies scope each user to. Returns the object path. */
export async function uploadResumeFile(
  supabase: Client,
  userId: string,
  file: Buffer,
  mimeType: string
) {
  const ext = EXTENSIONS[mimeType] ?? "bin";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: mimeType, upsert: false });

  if (error) throw error;
  return path;
}

/** Short-lived signed URL that downloads the file as `<title>.<ext>`. */
export async function getResumeFileDownloadUrl(
  supabase: Client,
  path: string,
  title: string
) {
  const ext = path.split(".").pop() ?? "";
  const filename = `${title.replace(/[^a-z0-9-_ ]/gi, "").trim() || "resume"}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60, { download: filename });

  if (error) throw error;
  return data.signedUrl;
}

export async function removeResumeFile(supabase: Client, path: string) {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}

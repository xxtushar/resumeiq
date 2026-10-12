import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { chunkResumeText } from "@/lib/rag/chunk";
import { embedTexts, toVectorLiteral } from "@/lib/rag/embed";

type Client = SupabaseClient<Database>;

export type RetrievedEvidence = {
  requirement: string;
  chunks: { content: string; similarity: number }[];
};

/** Chunks, embeds, and stores a resume's text, replacing earlier chunks. */
export async function indexResume(
  supabase: Client,
  userId: string,
  resumeId: string,
  text: string
) {
  const chunks = chunkResumeText(text);
  if (chunks.length === 0) return;

  const embeddings = await embedTexts(supabase, chunks);

  const { error: deleteError } = await supabase
    .from("resume_chunks")
    .delete()
    .eq("resume_id", resumeId)
    .eq("user_id", userId);
  if (deleteError) throw deleteError;

  const { error } = await supabase.from("resume_chunks").insert(
    chunks.map((content, i) => ({
      resume_id: resumeId,
      user_id: userId,
      chunk_index: i,
      content,
      embedding: toVectorLiteral(embeddings[i]),
    }))
  );
  if (error) throw error;
}

export async function hasResumeIndex(supabase: Client, resumeId: string) {
  const { count, error } = await supabase
    .from("resume_chunks")
    .select("id", { count: "exact", head: true })
    .eq("resume_id", resumeId);
  if (error) throw error;
  return (count ?? 0) > 0;
}

/**
 * For each requirement, retrieves the resume chunks most semantically
 * similar to it — the evidence the analysis prompt is grounded in.
 */
export async function retrieveEvidence(
  supabase: Client,
  resumeId: string,
  requirements: string[],
  perRequirement = 2
): Promise<RetrievedEvidence[]> {
  if (requirements.length === 0) return [];

  const queryEmbeddings = await embedTexts(supabase, requirements);

  return Promise.all(
    requirements.map(async (requirement, i) => {
      const { data, error } = await supabase.rpc("match_resume_chunks", {
        p_resume_id: resumeId,
        query_embedding: toVectorLiteral(queryEmbeddings[i]),
        match_count: perRequirement,
      });
      if (error) throw error;
      return {
        requirement,
        chunks: (data ?? []).map((c) => ({
          content: c.content,
          similarity: c.similarity,
        })),
      };
    })
  );
}

/** Formats retrieved evidence as prompt context for the analysis model. */
export function buildEvidenceContext(evidence: RetrievedEvidence[]): string {
  return evidence
    .map(({ requirement, chunks }, i) => {
      const excerpts = chunks.length
        ? chunks
            .map((c) => `  [similarity ${c.similarity.toFixed(2)}] ${c.content.replace(/\s+/g, " ")}`)
            .join("\n")
        : "  (no related resume text found)";
      return `${i + 1}. ${requirement}\n${excerpts}`;
    })
    .join("\n\n");
}

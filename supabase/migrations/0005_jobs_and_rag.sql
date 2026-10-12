-- Phase 4 (job matching) + Phase 5 (RAG): saved, AI-parsed job postings,
-- embedded resume chunks, and per-resume vector retrieval.

create extension if not exists vector with schema extensions;

-- Saved job postings. `requirements` holds the AI-parsed structure
-- (see lib/ai/job.ts) so a posting is parsed once and reused.
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  company text,
  description text not null,
  requirements jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists jobs_user_id_created_at_idx
  on public.jobs (user_id, created_at desc);

alter table public.jobs enable row level security;

create policy "jobs_select_own" on public.jobs
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "jobs_insert_own" on public.jobs
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "jobs_delete_own" on public.jobs
  for delete to authenticated using ((select auth.uid()) = user_id);

grant select, insert, delete on public.jobs to authenticated;

-- Link analyses to the saved job they were run against. Deleting a job keeps
-- its analyses (they still hold the job description text).
alter table public.analyses
  add column if not exists job_id uuid references public.jobs (id) on delete set null;

create index if not exists analyses_job_id_idx on public.analyses (job_id);

-- Resume text split into chunks with gte-small embeddings (384 dims,
-- normalized). Retrieval is always scoped to one resume (tens of rows), so
-- an exact scan over the resume_id index beats an ANN index here.
create table if not exists public.resume_chunks (
  id bigint generated always as identity primary key,
  resume_id uuid not null references public.resumes (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  embedding extensions.vector(384) not null,
  unique (resume_id, chunk_index)
);

create index if not exists resume_chunks_user_id_idx on public.resume_chunks (user_id);

alter table public.resume_chunks enable row level security;

create policy "resume_chunks_select_own" on public.resume_chunks
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "resume_chunks_insert_own" on public.resume_chunks
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "resume_chunks_delete_own" on public.resume_chunks
  for delete to authenticated using ((select auth.uid()) = user_id);

grant select, insert, delete on public.resume_chunks to authenticated;

-- Top resume chunks for one query embedding. SECURITY INVOKER, so RLS on
-- resume_chunks still limits results to the caller's own rows.
create or replace function public.match_resume_chunks(
  p_resume_id uuid,
  query_embedding extensions.vector(384),
  match_count integer default 2
)
returns table (chunk_index integer, content text, similarity double precision)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    c.chunk_index,
    c.content,
    -- Embeddings are normalized, so negative inner product = cosine similarity.
    -(c.embedding operator(extensions.<#>) query_embedding) as similarity
  from public.resume_chunks c
  where c.resume_id = p_resume_id
  order by c.embedding operator(extensions.<#>) query_embedding
  limit least(greatest(match_count, 1), 10);
$$;

revoke execute on function public.match_resume_chunks(uuid, extensions.vector, integer) from public, anon;
grant execute on function public.match_resume_chunks(uuid, extensions.vector, integer) to authenticated;

-- Job parsing is an AI call too, so it counts toward the daily limit.
alter table public.ai_usage drop constraint if exists ai_usage_kind_check;
alter table public.ai_usage
  add constraint ai_usage_kind_check check (kind in ('analysis', 'generate', 'job_parse'));

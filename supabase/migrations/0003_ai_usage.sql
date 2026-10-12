-- One row per AI call (analysis or builder generation), used for the daily
-- cost guardrail. Previously the limit counted analyses + saved drafts, so
-- /api/generate calls (which save nothing) were never counted.
create table if not exists public.ai_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind text not null check (kind in ('analysis', 'generate')),
  created_at timestamptz not null default now()
);

create index if not exists ai_usage_user_id_created_at_idx
  on public.ai_usage (user_id, created_at);

alter table public.ai_usage enable row level security;

-- Users can record and count their own usage. No update/delete policies, so
-- a user can't erase rows to reset their limit.
create policy "ai_usage_select_own" on public.ai_usage
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "ai_usage_insert_own" on public.ai_usage
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

grant select, insert on public.ai_usage to authenticated;

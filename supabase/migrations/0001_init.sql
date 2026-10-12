-- ResumeIQ initial schema: profiles, resumes, resume_versions, analyses.
-- Apply with the Supabase CLI (`supabase db push`) or paste into the SQL editor.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Untitled resume',
  source text not null check (source in ('uploaded', 'builder')),
  storage_path text,
  raw_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resume_versions (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  content jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  job_description text,
  score integer not null check (score between 0 and 100),
  result jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists resumes_user_id_idx on public.resumes (user_id);
create index if not exists resume_versions_resume_id_idx on public.resume_versions (resume_id);
create index if not exists analyses_resume_id_idx on public.analyses (resume_id);

alter table public.profiles enable row level security;
alter table public.resumes enable row level security;
alter table public.resume_versions enable row level security;
alter table public.analyses enable row level security;

create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "resumes_select_own" on public.resumes
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "resumes_insert_own" on public.resumes
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "resumes_update_own" on public.resumes
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "resumes_delete_own" on public.resumes
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "resume_versions_select_own" on public.resume_versions
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "resume_versions_insert_own" on public.resume_versions
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "analyses_select_own" on public.analyses
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "analyses_insert_own" on public.analyses
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Storage bucket for uploaded resume files (private; access via signed URLs
-- or the service role, gated by the policies below).
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

create policy "resume_files_select_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'resumes' and (select auth.uid())::text = (storage.foldername(name))[1]);

create policy "resume_files_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'resumes' and (select auth.uid())::text = (storage.foldername(name))[1]);

create policy "resume_files_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'resumes' and (select auth.uid())::text = (storage.foldername(name))[1])
  with check (bucket_id = 'resumes' and (select auth.uid())::text = (storage.foldername(name))[1]);

create policy "resume_files_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'resumes' and (select auth.uid())::text = (storage.foldername(name))[1]);

-- Cover the user_id foreign keys; the dashboard lists recent analyses per
-- user ordered by date, and RLS filters every query by user_id.
create index if not exists analyses_user_id_created_at_idx
  on public.analyses (user_id, created_at desc);

create index if not exists resume_versions_user_id_idx
  on public.resume_versions (user_id);

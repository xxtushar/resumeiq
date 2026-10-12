-- Lets a signed-in user delete their own account without the app holding a
-- secret (service) key. Deleting the auth.users row cascades to every table
-- via `on delete cascade`; the app removes Storage files first.
--
-- SECURITY DEFINER is required (users can't delete from auth.users), so the
-- function only ever touches the caller's own row (auth.uid()), pins
-- search_path, and is executable by `authenticated` only.
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  delete from auth.users where id = uid;
end;
$$;

revoke execute on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;

-- Prevent self-service tenant reassignment: profiles.tenant_id must only
-- ever be set via the service role (e.g. the manual onboarding script run
-- as a privileged user in the Supabase SQL editor), never by the owning
-- user through the "own_profile" RLS policy (which is `for all`, no column
-- restriction) or by table-level UPDATE grants to authenticated/anon.
--
-- Note: `revoke update (column) from authenticated, anon` (the approach in
-- 011_lock_is_admin_column.sql) does NOT work here, because table-level
-- UPDATE grants override column-level revokes — that's exactly the bug
-- this migration fixes, so a real BEFORE trigger is used instead.
create or replace function public.prevent_client_tenant_id_change()
returns trigger as $$
begin
  -- auth.role() reflects the PostgREST JWT claim and is only ever 'anon' or
  -- 'authenticated' for client-originated requests. Direct SQL — the
  -- Supabase SQL editor, the dashboard table editor, migrations, and any
  -- service-role API call — runs outside that JWT context, so auth.role()
  -- is NULL there (never 'anon'/'authenticated'). Block only the two
  -- client-facing roles; everything else (including the manual onboarding
  -- script run as a privileged user) passes through untouched.
  if auth.role() is null or auth.role() not in ('anon', 'authenticated') then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.tenant_id is not null then
      raise exception 'tenant_id may only be set by the service role';
    end if;
  elsif tg_op = 'UPDATE' then
    if new.tenant_id is distinct from old.tenant_id then
      raise exception 'tenant_id may only be changed by the service role';
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists lock_profiles_tenant_id on public.profiles;
create trigger lock_profiles_tenant_id
  before insert or update on public.profiles
  for each row execute function public.prevent_client_tenant_id_change();

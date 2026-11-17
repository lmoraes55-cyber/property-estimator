-- Migration 011 tried to lock is_admin via `revoke update (is_admin) ... from
-- authenticated, anon`, but that's a no-op: table-level UPDATE is still
-- granted to those roles (needed for the rest of the row), and Postgres
-- column-level revokes don't override a table-level grant. Any signed-in
-- user could run `update profiles set is_admin = true where id = auth.uid()`
-- and self-escalate. Use a real BEFORE UPDATE trigger instead, which is the
-- only mechanism that actually works here. Discovered during the white-label
-- estimator final review, which found the same class of bug freshly
-- introduced for profiles.tenant_id (see 014_lock_profiles_tenant_id.sql) and
-- flagged that this pre-existing is_admin gap was open the same way.
create or replace function public.prevent_is_admin_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_admin is distinct from old.is_admin and auth.role() <> 'service_role' then
    raise exception 'is_admin can only be changed by the service role';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_is_admin_self_escalation on public.profiles;
create trigger prevent_is_admin_self_escalation
  before update on public.profiles
  for each row
  execute function public.prevent_is_admin_self_escalation();

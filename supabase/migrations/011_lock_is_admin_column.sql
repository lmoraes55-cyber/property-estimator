-- Prevent self-service privilege escalation: is_admin must only ever be set
-- manually via the Supabase SQL editor (service role), never by the owning
-- user through the "own_profile" RLS policy (which is `for all`, no column
-- restriction).
revoke update (is_admin) on public.profiles from authenticated, anon;

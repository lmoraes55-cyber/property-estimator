-- Persistent cache of project_id -> resolved DLD unit project_name_en.
-- dld_2026_handovers itself is deleted and fully re-inserted every weekly
-- refresh (see 008), so a project's resolved name would otherwise be
-- re-queried from DDA every single week forever. dld_units-open-api enforces
-- a hard ~60 request/minute quota (confirmed live 2026-08-15: 194/254
-- concurrent lookups got 429'd in one run), so re-resolving the full ~250-
-- project set weekly is neither necessary (a tower's registered name doesn't
-- change) nor safe against the quota. Successful resolutions are cached here
-- permanently; the refresh cron only queries DDA for project_ids not yet in
-- this table.

create table if not exists public.dld_project_name_cache (
  project_id bigint primary key,
  project_name_en text not null,
  resolved_at timestamptz default now()
);

alter table public.dld_project_name_cache enable row level security;
-- no public read policy -- this is an internal cache, read only by the
-- refresh cron via the service-role key (which bypasses RLS).

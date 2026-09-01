-- Shared cache for /api/ltr-rents live DDA lookups.
--
-- The route previously cached in a module-level Map. That is per-instance, and
-- Vercel serves requests from whatever instance is warm, so the hit rate was
-- close to nothing in practice: measured 2026-09-01, a repeat request for
-- "Marina Gate 1" still took 23.5s because it landed on a cold instance. Only
-- one of three repeated lookups hit the in-process cache at all.
--
-- Every miss costs a multi-query DDA lookup (up to 8 project-name candidates,
-- plus master and area passes). Sharing the cache across instances turns
-- repeat views of the same building into a single Postgres read, and cuts real
-- load on an API that has already shown it degrades under pressure — the
-- dld_units endpoint enforces ~60 req/min (see 009) and the rent-contracts
-- gateway spent part of 2026-09-01 returning 408 on every query.

create table if not exists public.ltr_rent_cache (
  cache_key   text primary key,          -- normalized project | bedrooms | sizeSqft
  stat        jsonb,                     -- LTRStat, or null when nothing was found
  recent      jsonb not null default '[]'::jsonb,
  match_level text,                      -- building-sized | building | master | area
  master_used text,
  window_days integer,
  created_at  timestamptz not null default now()
);

-- Lookups always filter on freshness, so the index carries created_at.
create index if not exists ltr_rent_cache_created_at_idx
  on public.ltr_rent_cache (created_at desc);

alter table public.ltr_rent_cache enable row level security;
-- No public policy: written and read only by the route via the service-role
-- key, which bypasses RLS. Nothing here is user data — it is a materialised
-- copy of public DLD figures — but there is no reason to expose it directly.

-- Negative results are cached too (stat = null), so a building DLD has no
-- contracts for does not re-run the full cascade on every view. They expire on
-- the same TTL as hits; the route decides the TTL.
comment on table public.ltr_rent_cache is
  'Shared TTL cache for live DDA rent lookups. Rows are disposable — safe to truncate at any time; the route repopulates on demand.';

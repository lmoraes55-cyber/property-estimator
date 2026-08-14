-- 2026 Handover Intelligence: locally-cached DLD project data, refreshed weekly.
-- Replaces the earlier hand-curated/Bayut-scraped HANDOVER_PROJECTS list — every
-- row here is a real DLD-registered project (dld_projects-open-api), not a
-- third-party listing-site scrape. The website never queries DDA directly for
-- this page — only this table, via lib/dld-2026-handovers.ts.

create table if not exists public.dld_2026_handovers (
  project_id bigint primary key,

  -- DLD-sourced, real
  master_project_en text,          -- project/community cluster name; DLD does not
                                    -- expose an English per-tower project_name, so
                                    -- this is the most specific English name available
  area_name_en text not null,
  project_status text not null,    -- ACTIVE | PENDING (FINISHED/CANCELLED excluded by the refresh query)
  percent_completed numeric,
  project_end_date date,           -- the reliable target-handover field; completion_date
                                    -- can carry a stale historical value and is not used
  no_of_units integer,
  no_of_buildings integer,

  -- AssetIntel's own directional read — kept visually/structurally distinct from the
  -- DLD-sourced columns above wherever this is displayed, per PRODUCT.md
  str_area_tier text,              -- "prime-str" | "selective-str" | "ltr-preferred" | "needs-verification"

  updated_at timestamptz default now()
);

create index if not exists dld_2026_handovers_area_idx on public.dld_2026_handovers (area_name_en);
create index if not exists dld_2026_handovers_end_date_idx on public.dld_2026_handovers (project_end_date);

alter table public.dld_2026_handovers enable row level security;
create policy "public_read" on public.dld_2026_handovers for select using (true);
-- writes only via service-role key (the refresh cron)

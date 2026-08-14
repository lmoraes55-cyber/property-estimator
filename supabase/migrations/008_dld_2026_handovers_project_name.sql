-- dld_2026_handovers.master_project_en is a community/cluster-level name, not a
-- per-tower one -- confirmed live 2026-08-15: 245 of 254 rows shared their
-- master_project_en with at least one other project (e.g. 39 distinct Burj
-- Khalifa-area 2026 handovers all showed "DownTown Dubai"), making the page
-- unable to distinguish buildings within an area/cluster.
--
-- project_name_en is the real per-tower English name, resolved from
-- dld_units-open-api by project_id during the refresh cron. Nullable: not every
-- project has registered units yet, so a null here falls back to
-- master_project_en/area_name_en in the UI.

alter table public.dld_2026_handovers add column if not exists project_name_en text;

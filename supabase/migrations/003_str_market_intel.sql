-- STR Market Intel: locally-cached market data, refreshed weekly from AirROI + DLD.
-- The website NEVER queries AirROI directly — only this table, via lib/str-market-data.ts.

create table if not exists public.str_market_area_stats (
  id uuid default gen_random_uuid() primary key,
  area text not null,
  reporting_month date not null,               -- first day of the reporting month, e.g. 2026-08-01

  -- DLD-sourced (sales)
  sales_transactions integer,
  median_sale_price numeric,
  median_sale_price_per_sqft numeric,

  -- DLD-sourced (rentals / LTR)
  rental_transactions integer,
  median_annual_rent numeric,
  median_rent_price_per_sqft numeric,
  ltr_yield numeric,                            -- median_annual_rent / median_sale_price

  -- AirROI-sourced (STR)
  adr numeric,
  occupancy numeric,                            -- fraction 0-1
  revpar numeric,
  estimated_str_revenue numeric,
  active_listings integer,
  booking_window_days numeric,
  length_of_stay_days numeric,
  demand_trend text,                            -- "up" | "flat" | "down"
  comparable_listing_count integer,

  -- top buildings within the area for this period (denormalised, avoids a second table for this pass)
  top_buildings jsonb,

  -- provenance
  dld_source text default 'Dubai Land Department',
  airroi_source text default 'AirROI',
  confidence text,                              -- "high" | "medium" | "low" — based on sample size
  updated_at timestamptz default now(),

  unique (area, reporting_month)
);

create index if not exists str_market_area_stats_area_idx on public.str_market_area_stats (area, reporting_month desc);

alter table public.str_market_area_stats enable row level security;

-- Public read — this is aggregate market data, not user data.
drop policy if exists "str_market_area_stats_public_read" on public.str_market_area_stats;
create policy "str_market_area_stats_public_read" on public.str_market_area_stats
  for select using (true);

-- Writes only via the service-role key (used by the cron refresh route), never from the browser.

-- ── Sync log — internal admin visibility into the refresh pipeline ─────────────
create table if not exists public.data_sync_log (
  id uuid default gen_random_uuid() primary key,
  service text not null,                        -- "airroi" | "dld"
  status text not null,                         -- "success" | "partial" | "failed"
  records_updated integer default 0,
  started_at timestamptz not null,
  completed_at timestamptz,
  error text,
  created_at timestamptz default now()
);

create index if not exists data_sync_log_service_idx on public.data_sync_log (service, created_at desc);

alter table public.data_sync_log enable row level security;

-- No public read policy — sync log is admin-only, read via service-role key server-side.

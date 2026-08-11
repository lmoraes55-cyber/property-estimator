-- Adds fields sourced from AirROI's /listings/search/market endpoint —
-- accurate live comparable-listing counts, minimum-stay data, and a small
-- sample of real listings (name, host, rating, TTM performance) per area.

alter table public.str_market_area_stats
  add column if not exists min_nights numeric,
  add column if not exists sample_listings jsonb;

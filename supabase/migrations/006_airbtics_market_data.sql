-- Adds Airbtics as a second STR data source alongside AirROI, to cross-
-- validate/blend ADR, occupancy, RevPAR, revenue, and comparable listings.
-- Raw Airbtics figures are kept in their own airbtics_* columns; the
-- existing primary columns (adr, occupancy, revpar, estimated_str_revenue)
-- become the blended average of AirROI + Airbtics where both are present.

alter table public.str_market_area_stats
  add column if not exists airbtics_adr numeric,
  add column if not exists airbtics_occupancy numeric,
  add column if not exists airbtics_revpar numeric,
  add column if not exists airbtics_estimated_revenue numeric,
  add column if not exists airbtics_active_listings integer,
  add column if not exists airbtics_comparable_listing_count integer,
  add column if not exists airbtics_market_grade text,
  add column if not exists airbtics_regulations text,
  add column if not exists data_sources text;

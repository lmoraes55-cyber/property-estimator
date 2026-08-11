-- Store the exact computed report result at save time, so viewing a saved
-- report later renders the frozen snapshot instead of recalculating against
-- current (possibly since-changed) live DLD data.
alter table public.saved_reports
  add column if not exists result_snapshot jsonb,
  add column if not exists lr_used numeric;

-- Admin backend: people, leads, and generated reports.
-- See docs/superpowers/specs/2026-08-16-admin-people-reports-backend-design.md

-- leads: one row per /api/lead submission (operator-match, furnishing quote,
-- ops-enquiry, snagging, etc). The existing external webhook keeps firing
-- unchanged; this is a queryable copy for the admin panel.
create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  ref text not null,
  user_id uuid references auth.users on delete set null,
  name text not null,
  email text,
  phone text,
  source text,
  target text,
  target_type text,
  property text,
  building text,
  community text,
  recommendation text,
  form_data jsonb not null,
  created_at timestamptz default now()
);

alter table public.leads enable row level security;
-- No public read/write policy — internal admin table, accessed only via the
-- service-role client from trusted server code.

-- report_log: one row per report GENERATED (not just explicitly saved),
-- across all three report types. Contact details are denormalized (a
-- snapshot at generation time) so the record stays meaningful even if the
-- account is later edited or deleted.
create table if not exists public.report_log (
  id uuid default gen_random_uuid() primary key,
  report_type text not null,            -- 'rental_analyzer' | 'str_subleasing' | 'operator_match'
  user_id uuid references auth.users on delete set null,
  name text,
  email text,
  phone text,
  building_name text,
  unit_size text,
  params jsonb,
  result_snapshot jsonb,
  created_at timestamptz default now()
);

alter table public.report_log enable row level security;
-- Same access pattern as leads: service-role only, no public policy.

-- is_admin: set manually per-account via the SQL editor after this
-- migration runs. No self-service admin signup path.
alter table public.profiles add column if not exists is_admin boolean not null default false;

-- Fix handle_new_user: signup already captures full_name and whatsapp into
-- auth.users.raw_user_meta_data, but the trigger only ever copied email and
-- first_name into profiles. last_name and whatsapp are populated now too.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer as $$
declare
  v_full_name text := coalesce(new.raw_user_meta_data->>'full_name', '');
  v_space_pos int := position(' ' in v_full_name);
begin
  insert into public.profiles (id, email, first_name, last_name, whatsapp)
  values (
    new.id,
    new.email,
    case when v_space_pos > 0 then substring(v_full_name from 1 for v_space_pos - 1) else v_full_name end,
    case when v_space_pos > 0 then substring(v_full_name from v_space_pos + 1) else null end,
    new.raw_user_meta_data->>'whatsapp'
  );
  return new;
end;
$$;

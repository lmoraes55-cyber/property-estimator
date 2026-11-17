-- White-label tenants: each row is one client company that resells the
-- AssetIntel estimator under their own brand on {slug}.assetintel.ae.
create table if not exists public.tenants (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  display_name text not null,
  logo_url text not null,
  default_management_fee numeric not null default 0.20,
  default_costs jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz default now()
);

alter table public.profiles
  add column if not exists tenant_id uuid references public.tenants(id);

-- Tenant branding/defaults are readable only by a signed-in user who belongs
-- to that tenant (the estimator/report pages fetch this client-side to
-- prefill the form and swap the logo). Service role bypasses RLS as usual
-- for the manual-onboarding script.
alter table public.tenants enable row level security;

create policy "own_tenant_select" on public.tenants
  for select to authenticated
  using (
    id = (select tenant_id from public.profiles where id = (select auth.uid()))
  );

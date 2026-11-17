-- Onboard a new white-label tenant. Fill in the placeholders marked <...>
-- and run each block in order via the Supabase SQL editor.

-- 1. Create the tenant.
insert into public.tenants (slug, display_name, logo_url, default_management_fee, default_costs)
values (
  '<slug>',                 -- e.g. 'acme' -> acme.assetintel.ae
  '<Display Name>',         -- e.g. 'Acme Holiday Homes'
  '<https://.../logo.png>', -- hosted logo URL (upload to Supabase Storage or any public host first)
  0.20,                     -- their management fee as a fraction, e.g. 0.20 = 20%
  '{}'::jsonb
)
returning id;
-- Copy the returned id for step 3.

-- 2. Create the rep's auth user via Supabase Dashboard > Authentication > Add User
-- (sets their email + a temporary password they'll be asked to change). Copy the
-- new user's id (uuid) shown there for step 3.

-- 3. Link the rep's profile to the tenant.
update public.profiles
set tenant_id = '<tenant id from step 1>'
where id = '<user id from step 2>';

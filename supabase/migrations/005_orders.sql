-- Orders — durable server-side record of every checkout attempt.
--
-- Before this table the only trace of a payment was the `cartid` string handed to
-- Telr at creation: nothing was persisted, so there was no way to reconcile a
-- payment, and /pay/success trusted whatever `ref` appeared in the query string.
-- Rows are written by app/api/checkout (service-role) and read back by
-- app/api/checkout/verify, which asks Telr for the authoritative status.

create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,

  ref text not null unique,                     -- our cart id, e.g. AI-2608-A1B2C3
  telr_ref text,                                -- Telr's own order reference, returned by create

  package text not null,                        -- key from PRICES in app/api/checkout
  amount numeric not null,                      -- resolved server-side, never client-supplied
  currency text not null default 'AED',

  -- created  → checkout session opened, customer not yet returned
  -- paid     → confirmed by Telr order check
  -- declined | cancelled | expired → terminal, per Telr status
  -- failed   → gateway never issued a payment URL
  status text not null default 'created',

  test_mode boolean not null default true,      -- mirrors TELR_TEST_MODE at creation time
  telr_status_code integer,                     -- raw code from Telr, kept for auditing
  telr_status_text text,

  user_id uuid references auth.users on delete set null,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists orders_ref_idx on public.orders (ref);
create index if not exists orders_status_idx on public.orders (status, created_at desc);
create index if not exists orders_user_idx on public.orders (user_id, created_at desc);

alter table public.orders enable row level security;

-- Signed-in customers may read their own orders. Anonymous checkouts (user_id null)
-- match no policy and are therefore unreadable from the browser — they are reached
-- only through the service-role key in the verify route, which looks up by `ref`.
drop policy if exists "own_orders_read" on public.orders;
create policy "own_orders_read" on public.orders
  for select using (auth.uid() = user_id);

-- No insert/update policy: all writes go through the service-role key server-side,
-- so a customer can never create an order or move one to `paid` themselves.

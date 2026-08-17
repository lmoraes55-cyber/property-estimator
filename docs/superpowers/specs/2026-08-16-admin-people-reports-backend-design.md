# Admin backend: people, leads, and generated reports

**Status:** Approved (design), pending spec review
**Date:** 2026-08-16

## Problem

AssetIntel has no way for the site owner to see who is actually using the
site. Two things are true today:

1. **Lead capture is invisible in-app.** `/api/lead` (used by operator-match,
   furnishing quotes, ops-enquiry, snagging, and others) forwards every
   submission to one of two external Google Sheets/Zapier webhooks
   (`LEAD_WEBHOOK_URL`, `LEAD_WEBHOOK_URL_SERVICES`) and writes nothing to
   Supabase. There is no in-app view of leads at all.
2. **Report generation is mostly not recorded.** The Rental Analyzer
   (`/report`) only writes to `saved_reports` when the visitor explicitly
   clicks "Save" — a visitor who generates a report and leaves is never
   recorded. The STR Sub-Leasing Risk report and Operator Match report (both
   email a PDF) write nothing to any database at all; the only record is the
   sent email itself.

There is also no admin-facing page anywhere in the app — `app/dashboard/*`
is a real, working feature, but it's RLS-scoped to the signed-in user's own
data, not a cross-user view.

## Goal

Give the site owner one admin-only place to see every identified person who
has interacted with the site (signed up, submitted a lead form, or generated
a report) and every report generated, with that person's contact details
attached.

## Non-goals

- **Anonymous traffic analytics** (page views, unique visitors, referrers).
  Vercel Analytics is already installed site-wide and covers this natively;
  duplicating it here would mean building session tracking and a pageview
  table from scratch for no real gain. The admin panel links out to Vercel's
  own dashboard instead.
- **Changing `saved_reports` or its "Save" button behavior.** That table and
  UI stay exactly as they are today — a visitor's personal "my reports"
  list. This spec adds a separate, superset log instead of overloading it.
- **Replacing the existing lead webhooks.** `LEAD_WEBHOOK_URL` /
  `LEAD_WEBHOOK_URL_SERVICES` keep firing exactly as they do today. This
  spec adds a Supabase copy alongside them, not instead of them.

## Data model

Two new tables, both written via the service-role client (bypasses RLS on
insert, same pattern already used by the weekly cron jobs), since some
submissions are anonymous and shouldn't require a signed-in session to
record.

### `leads`

One row per `/api/lead` submission — mirrors the `lead` object that route
already builds internally, so the insert is close to a direct pass-through.

```sql
create table if not exists public.leads (
  id uuid default gen_random_uuid() primary key,
  ref text not null,                    -- e.g. "AI-2608-7F3K", same ref already returned to the client
  user_id uuid references auth.users on delete set null,  -- null if not signed in
  name text not null,
  email text,
  phone text,
  source text,                          -- "assetintel.ae"
  target text,                          -- who they want to reach (operator/agent name)
  target_type text,                     -- "operator" | "agent" | "service"
  property text,
  building text,
  community text,
  recommendation text,                  -- "STR" | "LTR"
  form_data jsonb not null,             -- full lead object, for fields not worth their own column
  created_at timestamptz default now()
);

alter table public.leads enable row level security;
-- No public read policy — this is an internal admin table, read only via
-- the service-role client (admin pages) or a service-role-backed API route.
```

### `report_log`

One row per report *generated* (not just saved), across all three report
types. A denormalized contact-details snapshot is stored at generation time
so the record stays meaningful even if the person later edits their profile
or the account is deleted (`user_id` is `on delete set null`, not cascade).

```sql
create table if not exists public.report_log (
  id uuid default gen_random_uuid() primary key,
  report_type text not null,            -- "rental_analyzer" | "str_subleasing" | "operator_match"
  user_id uuid references auth.users on delete set null,
  name text,
  email text,
  phone text,
  building_name text,
  unit_size text,
  params jsonb,                         -- input params (same shape saved_reports.report_params already uses)
  result_snapshot jsonb,                -- key output figures, not the full computed object
  created_at timestamptz default now()
);

alter table public.report_log enable row level security;
-- No public read policy — internal admin table, same access pattern as leads.
```

### `profiles` trigger fix

`handle_new_user()` currently only copies `email` and `first_name` from
`auth.users.raw_user_meta_data` into `profiles`, even though signup already
captures `full_name` and `whatsapp` into that metadata. Fixing this so
`last_name`, `phone`, and `whatsapp` populate too — directly improves how
complete the People view's contact info is, and it's a one-function change
in the same migration.

```sql
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
```

(`phone` stays unset by the trigger — nothing in the current signup form
collects a phone number distinct from WhatsApp; `whatsapp` is the closest
real data available.)

### `is_admin`

```sql
alter table public.profiles add column if not exists is_admin boolean not null default false;
```

Set manually via the Supabase SQL editor for the owner's own account after
migration — no self-service admin signup path.

## Capture points

- **`leads`**: one insert added to `/api/lead`, right after the existing
  webhook call, using the same `lead` object already built in that route.
  Wrapped in try/catch so a Supabase hiccup never blocks the webhook or the
  response the client sees.
- **`report_log` — Rental Analyzer**: a `useEffect` in `app/report/page.tsx`
  that fires once when `calc`/`result` is fully computed with real data
  (guarded so it only fires once per report view, not on every re-render),
  posting to a new small API route that does the service-role insert.
- **`report_log` — STR Sub-Leasing Risk / Operator Match**: one insert added
  server-side in `/api/send-report` and `/api/send-operator-match`
  respectively, right where each route already has the visitor's name,
  email, and report data in hand to build the email. No client-side changes
  needed for these two.

## Admin UI

New `/admin` section (`app/admin/*`), gated by checking the signed-in
user's `profiles.is_admin` server-side on every page in the section;
non-admins get redirected to `/`.

- **`/admin/people`** — one row per unique contact, grouped by email when
  present, falling back to phone when it isn't (`/api/lead` only requires a
  name plus *either* an email or a phone, so a pure grouping-by-email would
  silently drop phone-only leads into ungrouped singletons). The grouping
  key is `lower(trim(email))` if set, else `regexp_replace(phone, '\D', '',
  'g')` (digits only, so formatting differences don't split the same number
  into two groups). Each row shows name, contact info, whether they have an
  account, and counts of leads submitted / reports generated. Click through
  to **`/admin/people/[key]`** (URL-encoded email or digits-only phone) for
  everything tied to that contact: every `leads` row and every `report_log`
  row, newest first.
- **`/admin/reports`** — every `report_log` row across all people,
  filterable by `report_type`, newest first, with a link into the matching
  person's detail page.
- A "View traffic analytics →" link from the admin nav out to Vercel's
  Analytics dashboard for the project.

## Error handling

- All new writes (`leads` insert, `report_log` inserts) are best-effort and
  non-blocking: if the service-role write fails, the user-facing action
  (lead submission succeeding, report rendering, email sending) still
  succeeds, and the error is logged server-side only.
- Admin pages fail closed: if `is_admin` can't be determined (no session,
  query error), the visitor is redirected away rather than shown anything.

## Testing / verification

- Submit a real lead through an existing form (e.g. furnishing quote) and
  confirm it appears in `/admin/people` and the existing webhook still
  fires.
- Generate a real Rental Analyzer report while signed in and confirm a
  `report_log` row appears without clicking "Save," and that "Save" still
  writes to `saved_reports` exactly as before.
- Trigger the STR Sub-Leasing and Operator Match email flows and confirm
  each produces a `report_log` row alongside the email.
- Sign up a new test account and confirm `profiles.last_name` and
  `profiles.whatsapp` are populated from signup metadata.
- Confirm a non-admin signed-in account is redirected away from `/admin`.

# White-Label Estimator & Report Design

## Goal

Turn AssetIntel's STR/LTR estimator and report generator into a standalone, white-labeled product Leon can sell as a flat monthly/annual subscription to other Dubai holiday-homes/STR management companies — for their sales/BD staff to use ad hoc when pitching owner leads.

## Scope

**In scope (v1):**
- The core STR/LTR estimator form and its generated report (what `/estimator` and `/report` do today).
- White-label branding per client: their logo and company name replace AssetIntel's everywhere a client's own clients or prospects would see it (report page, PDF, email). The green/bronze accent color system stays the same across all tenants in v1 — it's baked into ~60 hardcoded string templates across `app/report/page.tsx` and `app/estimator/page.tsx` (e.g. `` `${colors.primary}30` `` for a tinted border), not a clean theme token, so a safe per-tenant color refactor is out of scope for v1. It carries no literal AssetIntel name/mark once the logo and copy are swapped. Full per-tenant color theming is a deferred fast-follow (see Open Questions).
- Per-tenant configurable business assumptions: management fee %, and the other cost inputs `runEstimator()` already accepts.
- Multi-tenant SaaS delivery on the existing AssetIntel Next.js + Supabase stack — one codebase, one deploy, tenants distinguished by subdomain.
- Manual (non-self-serve) tenant onboarding: Leon configures each new client's branding, assumptions, and user accounts himself.

**Explicitly out of scope (v1):**
- STR Market Intel browsing, 2026 Handover Intelligence, sub-leasing risk calculator, furnishing checklist, operator/agent matching — none of this is exposed to white-label tenants.
- The public AssetIntel marketing site, its lead-capture (`/api/lead` → Google Sheets), and the consumer-facing `AccessGate` sign-up wall.
- Admin/ops tooling (data-sync, people/reports admin).
- Self-serve tenant signup, billing/metering, custom domains (CNAME) — all deferred until there's real multi-client demand.

## Architecture

### Tenancy model

A new `tenants` table in the existing Supabase project:

| column | type | notes |
|---|---|---|
| `id` | uuid, PK | |
| `slug` | text, unique | subdomain segment, e.g. `acme` → `acme.assetintel.ae` |
| `name` | text | client company's display name |
| `logo_url` | text | white-label logo asset |
| `display_name` | text | tenant's company name, shown wherever "AssetIntel" currently appears in UI copy |
| `default_management_fee` | numeric | fraction, e.g. `0.20`; pre-fills the estimator form, same as today's hardcoded `20` default |
| `default_costs` | jsonb | the other per-tenant cost assumption defaults `runEstimator()` accepts |
| `active` | boolean, default true | flips a lapsed/suspended client off without deleting their data |
| `created_at` | timestamptz | |

`profiles` (existing table) gets a new nullable `tenant_id` FK to `tenants.id`. A sales rep account with a non-null `tenant_id` is a white-label user; existing AssetIntel consumer accounts keep `tenant_id = null` and are unaffected.

RLS: reports/sessions created by a tenant user are scoped so only same-tenant users can read them (mirrors the existing `profiles`-based RLS pattern already in use elsewhere in the schema).

### Routing & auth

Next.js middleware inspects the request hostname:
- `{slug}.assetintel.ae` → resolve `slug` against `tenants`, attach the tenant row to request context (e.g. a header or a server-side context value read by the page).
- No matching tenant, or `active = false` → render a simple "not a valid client portal" / "this account is inactive" page instead of the product. No crash, no fallthrough to AssetIntel's own pages.
- Matching active tenant → serve the white-label estimator/report pages, pulling branding and default assumptions from the tenant row.

Auth reuses Supabase Auth (same project, same `auth.users`/`profiles` tables). A tenant user logs in at their own subdomain; on login, middleware/server checks `profiles.tenant_id` matches the subdomain's resolved tenant — a valid session for Company A's subdomain is rejected (treated as logged out) if viewed from Company B's subdomain, even though it's technically a valid Supabase session.

No `AccessGate` on white-label pages — that component is a public-signup conversion gate for AssetIntel's own consumer funnel, the wrong model for an already-paid B2B seat. White-label pages are gated by the tenant-scoped login directly.

### Report generation flow

1. Rep logs into `{slug}.assetintel.ae`, lands on the estimator form.
2. Management fee / cost fields pre-fill from `tenants.default_management_fee` / `tenants.default_costs` instead of today's hardcoded `"20"` (`app/estimator/page.tsx`) — still editable per-report, unchanged behavior otherwise.
3. Form submits into the same `runEstimator()` engine (`lib/estimator.ts`) and the same live DLD/STR data-fetching layer (`lib/dda-client.ts`, `lib/str-market-data.ts`, `lib/ltr-rent-cache.ts`) — fully shared and global across tenants; no per-tenant data pipeline, no per-tenant cache partitioning.
4. Report page renders using the tenant's `logo_url` and `display_name` in place of AssetIntel's own logo and name; the forest-green/bronze accent colors are unchanged (see Scope).
5. Existing PDF/email send path (`app/api/send-report`) is reused unchanged except for swapping the branding asset and color tokens — including the PDF's own metadata/filename, which must carry zero AssetIntel branding.

### Error handling

- Unrecognized subdomain → static "not a valid client portal" page.
- Recognized but `active = false` tenant → static "this account is inactive" page (distinct message from the above, so a lapsed client can tell they were deliberately turned off vs. mistyped a URL).
- Cross-tenant session mismatch (valid Supabase session, wrong subdomain) → treated as logged out, redirected to that subdomain's login.

### Testing / validation

Before onboarding the first real client:
1. Create one test tenant end-to-end (insert `tenants` row, create a rep login with matching `tenant_id`, confirm subdomain routing resolves it).
2. Generate a full report through the UI and via the email/PDF path.
3. Grep the rendered report HTML, the PDF, and the email for any AssetIntel name or logo leak (literal text/images, not accent colors — see Scope) — zero tolerance, since the whole value proposition is invisibility of the underlying vendor.
4. Confirm a second test tenant cannot see the first tenant's reports (RLS check) and cannot log into the first tenant's subdomain with its own valid session (cross-tenant auth check).

## Open questions for later (not v1)

- Full per-tenant accent-color theming — requires refactoring the ~60 hardcoded `colors.primary`/`colors.secondary` string-template usages in `app/report/page.tsx` and `app/estimator/page.tsx` into real theme tokens first. Deferred until a client specifically asks for it.
- Billing/subscription enforcement beyond the manual `active` flag (Stripe, dunning, etc.) — deferred until there's a real second or third client.
- Self-serve onboarding — deferred until manual onboarding becomes the bottleneck.
- Custom domains (client's own domain via CNAME instead of `*.assetintel.ae` subdomain) — deferred, flagged as a likely future ask from larger clients.

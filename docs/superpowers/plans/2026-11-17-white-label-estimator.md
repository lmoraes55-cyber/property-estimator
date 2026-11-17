# White-Label Estimator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let Leon sell a white-labeled version of the AssetIntel STR/LTR estimator + report to other Dubai holiday-homes companies, each on their own subdomain with their own logo, company name, and cost assumptions.

**Architecture:** Single Next.js + Supabase codebase (no new deploy). Next.js middleware resolves the request's subdomain to a `tenants` row and makes it available to the estimator/report pages, which swap in the tenant's logo/name/default cost assumptions instead of AssetIntel's. Tenant reps authenticate via the existing Supabase Auth, scoped to their own subdomain by a `profiles.tenant_id` check.

**Tech Stack:** Next.js 16 (App Router), Supabase (Postgres + Auth + RLS), TypeScript. No test runner exists in this project (`npm run build` / `npx tsc --noEmit -p .` are the existing verification commands) — tasks below use those plus manual browser verification instead of an automated test suite, matching the codebase's existing pattern.

## Global Constraints

- V1 ships only the estimator form + report (no STR Market Intel, 2026 Handovers, sub-leasing calculator, furnishing checklist, operator matching, admin tooling, or the public marketing/lead-gen site) for white-label tenants.
- V1 branding = logo + company display name swap only. The green/bronze accent color system (`lib/colors.ts`) is unchanged for every tenant — do not attempt to re-theme it; see the spec's "Open questions for later."
- Tenant onboarding is manual (Leon inserts rows / runs a script himself) — no self-serve signup UI.
- No new billing/metering infrastructure — tenants are turned on/off via a boolean `active` flag only.
- Every new Supabase table/column follows the existing migration pattern in `supabase/migrations/*.sql` (numbered, `create table if not exists`, explicit RLS policies — see `011_lock_is_admin_column.sql` and `001_dashboard.sql` for the house style).
- `npx tsc --noEmit -p .` must stay clean after every task.

---

### Task 1: Tenants table + profiles.tenant_id migration

**Files:**
- Create: `supabase/migrations/012_white_label_tenants.sql`

**Interfaces:**
- Produces: `public.tenants` table with columns `id uuid PK`, `slug text unique`, `display_name text`, `logo_url text`, `default_management_fee numeric`, `default_costs jsonb`, `active boolean default true`, `created_at timestamptz default now()`.
- Produces: `public.profiles.tenant_id uuid references public.tenants(id)`, nullable (existing AssetIntel consumer profiles stay `null`).

- [ ] **Step 1: Write the migration file**

```sql
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
```

- [ ] **Step 2: Apply the migration**

Run (via the Supabase MCP `apply_migration` tool, or the Supabase SQL editor if applying manually): the contents of `supabase/migrations/012_white_label_tenants.sql`, with name `white_label_tenants`.

- [ ] **Step 3: Verify**

Run a query confirming the table and column exist:
```sql
select column_name from information_schema.columns where table_name = 'tenants';
select column_name from information_schema.columns where table_name = 'profiles' and column_name = 'tenant_id';
```
Expected: `tenants` lists all 8 columns above; `profiles` lists `tenant_id`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/012_white_label_tenants.sql
git commit -m "Add tenants table and profiles.tenant_id for white-label product"
```

---

### Task 2: Tenant resolution helper

**Files:**
- Create: `lib/tenant.ts`

**Interfaces:**
- Consumes: `createClient` from `@/lib/supabase/server` (existing, returns a Supabase server client bound to the current request's cookies).
- Produces: `export type Tenant = { id: string; slug: string; displayName: string; logoUrl: string; defaultManagementFee: number; defaultCosts: Record<string, number>; active: boolean }`
- Produces: `export async function getTenantBySlug(slug: string): Promise<Tenant | null>` — looks up a tenant by slug using the service-role client (so it works before the visitor has a session, e.g. to render the login page's branding). Returns `null` if no row matches.
- Produces: `export function extractTenantSlug(hostname: string): string | null` — given a request hostname like `acme.assetintel.ae`, returns `"acme"`; given `assetintel.ae`, `www.assetintel.ae`, or `localhost:3000`, returns `null` (AssetIntel's own site, not a tenant).

- [ ] **Step 1: Write `lib/tenant.ts`**

```typescript
import { createServiceClient } from "@/lib/supabase/service";

export type Tenant = {
  id: string;
  slug: string;
  displayName: string;
  logoUrl: string;
  defaultManagementFee: number;
  defaultCosts: Record<string, number>;
  active: boolean;
};

const ROOT_HOSTS = new Set(["assetintel.ae", "www.assetintel.ae"]);

/** Returns the subdomain slug for a tenant request, or null for AssetIntel's
 *  own site (apex domain, www, localhost, or any Vercel preview host). */
export function extractTenantSlug(hostname: string): string | null {
  const host = hostname.split(":")[0].toLowerCase();
  if (ROOT_HOSTS.has(host) || host === "localhost" || host.endsWith(".vercel.app")) {
    return null;
  }
  if (!host.endsWith(".assetintel.ae")) return null;
  const slug = host.slice(0, -".assetintel.ae".length);
  return slug || null;
}

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("id, slug, display_name, logo_url, default_management_fee, default_costs, active")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    slug: data.slug,
    displayName: data.display_name,
    logoUrl: data.logo_url,
    defaultManagementFee: data.default_management_fee,
    defaultCosts: (data.default_costs ?? {}) as Record<string, number>,
    active: data.active,
  };
}
```

- [ ] **Step 2: Check `lib/supabase/service.ts` exists with this shape**

Run: `grep -n "export function createServiceClient\|export const createServiceClient" lib/supabase/service.ts`
Expected: a match (the `send-report` route already imports `createServiceClient` from this path, confirmed in Task research — this step just verifies the exported name before `lib/tenant.ts` depends on it). If the exported name differs, adjust the import in Step 1 to match.

- [ ] **Step 3: Verify types**

Run: `npx tsc --noEmit -p .`
Expected: no new errors.

- [ ] **Step 4: Commit**

```bash
git add lib/tenant.ts
git commit -m "Add tenant resolution helpers for white-label subdomains"
```

---

### Task 3: Middleware subdomain + cross-tenant auth handling

**Files:**
- Modify: `middleware.ts`

**Interfaces:**
- Consumes: `extractTenantSlug`, `getTenantBySlug`, `Tenant` from `@/lib/tenant` (Task 2).
- Produces: on every request to a tenant subdomain, the response carries a `x-tenant-id` request header (readable by server components/route handlers via `headers()`) when the tenant is valid and active, OR a redirect to `/portal-unavailable` (unknown/inactive tenant) OR `/login` (signed-in user whose `profiles.tenant_id` doesn't match the current subdomain's tenant).

- [ ] **Step 1: Modify `middleware.ts`**

Replace the full file contents with:

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { extractTenantSlug, getTenantBySlug } from "@/lib/tenant";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") ?? "";
  const tenantSlug = extractTenantSlug(hostname);

  // ── White-label tenant subdomain ───────────────────────────────────────
  if (tenantSlug) {
    const tenant = await getTenantBySlug(tenantSlug);

    if (!tenant || !tenant.active) {
      if (pathname !== "/portal-unavailable") {
        const url = new URL("/portal-unavailable", request.url);
        if (!tenant) url.searchParams.set("reason", "unknown");
        else url.searchParams.set("reason", "inactive");
        return NextResponse.redirect(url);
      }
      return supabaseResponse;
    }

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("tenant_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.tenant_id !== tenant.id && pathname !== "/login") {
        // Valid AssetIntel session, wrong tenant — treat as logged out here.
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL("/login?next=" + pathname, request.url));
      }
    }

    if (pathname.startsWith("/estimator") || pathname.startsWith("/report")) {
      if (!user) {
        return NextResponse.redirect(new URL("/login?next=" + pathname, request.url));
      }
    }

    supabaseResponse.headers.set("x-tenant-id", tenant.id);
    return supabaseResponse;
  }

  // ── AssetIntel's own site — unchanged existing behavior ────────────────
  if (pathname.startsWith("/dashboard") && !user) {
    return NextResponse.redirect(
      new URL("/login?next=" + pathname, request.url)
    );
  }

  if ((pathname === "/login" || pathname === "/signup") && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup", "/estimator/:path*", "/report/:path*", "/portal-unavailable"],
};
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit -p .`
Expected: no new errors.

- [ ] **Step 3: Manual verification (local)**

Run `npm run dev`, then in a browser visit `http://localhost:3000/estimator` (no tenant subdomain — should behave exactly as before, unaffected). This confirms the new tenant branch is only reached on an actual tenant subdomain, which can't be tested locally without `/etc/hosts` edits; full subdomain verification happens in Task 8's end-to-end check after a real tenant exists and DNS is configured.

- [ ] **Step 4: Commit**

```bash
git add middleware.ts
git commit -m "Resolve tenant subdomains in middleware, gate estimator/report by tenant auth"
```

---

### Task 4: Portal-unavailable page

**Files:**
- Create: `app/portal-unavailable/page.tsx`

**Interfaces:**
- Consumes: `?reason=unknown|inactive` search param (set by Task 3's middleware).
- Produces: a standalone, unbranded (no AssetIntel OR tenant logo — the tenant may be literally unresolvable) static page.

- [ ] **Step 1: Write the page**

```tsx
function Message({ reason }: { reason: string | undefined }) {
  if (reason === "inactive") {
    return (
      <>
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>This account is inactive</h1>
        <p style={{ color: "#4E5D56" }}>Contact your account administrator to restore access.</p>
      </>
    );
  }
  return (
    <>
      <h1 style={{ fontSize: 22, marginBottom: 8 }}>This isn&apos;t a valid client portal</h1>
      <p style={{ color: "#4E5D56" }}>Check the address and try again.</p>
    </>
  );
}

export default async function PortalUnavailablePage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", padding: 24 }}>
      <div style={{ maxWidth: 420, textAlign: "center" }}>
        <Message reason={reason} />
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit -p .`
Expected: no new errors.

- [ ] **Step 3: Manual verification**

Run `npm run dev`, visit `http://localhost:3000/portal-unavailable?reason=inactive` and `http://localhost:3000/portal-unavailable?reason=unknown`. Expected: each shows its distinct message, no AssetIntel branding visible.

- [ ] **Step 4: Commit**

```bash
git add app/portal-unavailable/page.tsx
git commit -m "Add portal-unavailable page for unknown/inactive tenant subdomains"
```

---

### Task 5: Tenant branding lookup for the estimator page

**Files:**
- Modify: `app/estimator/page.tsx`

**Interfaces:**
- Consumes: `x-tenant-id` request header (set by Task 3's middleware) via `headers()` from `next/headers`.
- Consumes: `Tenant` type from `@/lib/tenant` (Task 2) — reuses the existing `getTenantBySlug`-style lookup by id instead (new small helper added in this task).
- Produces: the estimator form's `managementFee` field defaults to the tenant's `defaultManagementFee` (as a percentage string, e.g. `"25"`) instead of the hardcoded `"20"`, and the page header shows the tenant's name/logo instead of AssetIntel's, when a tenant is present. Unchanged (AssetIntel's own look) when no tenant header is set.

**Note on file structure:** `app/estimator/page.tsx` is currently a client component (`"use client"` at the top, per the codebase's existing pattern) using `useState`/`useSearchParams`. Tenant data must be read server-side (the `x-tenant-id` header isn't available in client components) and passed down — this task adds a thin server wrapper.

- [ ] **Step 1: Add `getTenantById` to `lib/tenant.ts`**

Append to `lib/tenant.ts` (from Task 2):

```typescript
export async function getTenantById(id: string): Promise<Tenant | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("tenants")
    .select("id, slug, display_name, logo_url, default_management_fee, default_costs, active")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    slug: data.slug,
    displayName: data.display_name,
    logoUrl: data.logo_url,
    defaultManagementFee: data.default_management_fee,
    defaultCosts: (data.default_costs ?? {}) as Record<string, number>,
    active: data.active,
  };
}
```

- [ ] **Step 2: Rename the existing default export inside `app/estimator/page.tsx`**

Find the line (confirmed present at `app/estimator/page.tsx:235` in current research): `function EstimatorPage() {` — rename it to `function EstimatorPageInner({ tenant }: { tenant: Tenant | null }) {` (add the `tenant` prop; `Tenant` imported from `@/lib/tenant`). Find the existing default-export wrapper at the bottom of the file (the `export default function` that wraps `EstimatorPage` in a `Suspense` boundary, per the codebase's existing pattern for pages using `useSearchParams`) and update it to pass `tenant` through — do not change the `Suspense` wrapping itself, only thread the new prop.

- [ ] **Step 3: Change the `managementFee` default to use the prop**

Find (confirmed present at `app/estimator/page.tsx:250`): `managementFee: "20",` inside the `useState` initializer. Replace with:

```typescript
managementFee: tenant ? String(Math.round(tenant.defaultManagementFee * 100)) : "20",
```

- [ ] **Step 4: Split the file into a client inner component and a server page**

Rename the current `app/estimator/page.tsx` (with the Step 2/3 edits already applied) to `app/estimator/EstimatorPageInner.tsx`. In that file, remove the existing bottom wrapper:

```tsx
export default function Home() {
  return (
    <Suspense>
      <EstimatorPage />
    </Suspense>
  );
}
```

and replace it with a plain named export of the inner component itself:

```tsx
export default EstimatorPageInner;
```

(`EstimatorPageInner` is the renamed component from Step 2, which already takes the `tenant` prop.)

Then create a new `app/estimator/page.tsx` — a server component that reads the tenant and wraps the client component in `Suspense` (valid directly in a server component, per the same reasoning as Task 6 Step 2):

```tsx
import { Suspense } from "react";
import { headers } from "next/headers";
import { getTenantById } from "@/lib/tenant";
import EstimatorPageInner from "./EstimatorPageInner";

export default async function EstimatorPage() {
  const tenantId = (await headers()).get("x-tenant-id");
  const tenant = tenantId ? await getTenantById(tenantId) : null;
  return (
    <Suspense>
      <EstimatorPageInner tenant={tenant} />
    </Suspense>
  );
}
```

- [ ] **Step 5: Swap the logo in `EstimatorPageInner.tsx`**

Find each `<AssetIntelLogo ... />` usage (confirmed present in the original file) and replace with a conditional:

```tsx
{tenant ? (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={tenant.logoUrl} alt={tenant.displayName} style={{ height: 32, width: "auto" }} />
) : (
  <AssetIntelLogo size={32} />
)}
```
(Adjust the `size`/`height` value per call site to match whatever size the original `<AssetIntelLogo size={N} />` used at that location.)

- [ ] **Step 6: Verify types**

Run: `npx tsc --noEmit -p .`
Expected: no errors. If `Tenant` import is missing in `EstimatorPageInner.tsx`, add `import type { Tenant } from "@/lib/tenant";`.

- [ ] **Step 7: Manual verification**

Run `npm run dev`, visit `http://localhost:3000/estimator`. Expected: identical to before this task (no `x-tenant-id` header set locally without the middleware's subdomain branch firing, so `tenant` is `null` and the page falls back to AssetIntel's own branding/default fee).

- [ ] **Step 8: Commit**

```bash
git add lib/tenant.ts app/estimator/EstimatorPageInner.tsx app/estimator/page.tsx
git commit -m "Thread tenant branding and fee default into the estimator page"
```

---

### Task 6: Tenant branding for the report page (web + PDF + email)

**Files:**
- Modify: `app/report/page.tsx`

**Interfaces:**
- Consumes: same `x-tenant-id` header pattern as Task 5.
- Produces: the report page, its generated PDF, and the email summary sent via `app/api/send-report` show the tenant's logo/name instead of AssetIntel's, when a tenant is present.

**Note on file structure (confirmed from the actual file, not assumed):** `app/report/page.tsx` is one `"use client"` file with several component functions: `ReportContent` (the component that does everything — form state, the live data fetch, rendering, and PDF generation, ~2100 lines) is rendered by `ReportGate` and `SavedReportGate` (two different ways of arriving at a report — fresh vs. reopening a saved one), which are both rendered by `ReportEntry`, which the default-exported `ReportPage` wraps in a `Suspense`. The `tenant` prop needs to reach `ReportContent`, three layers down.

- [ ] **Step 1: Rename the file and thread `tenant` through the component chain**

Rename `app/report/page.tsx` to `app/report/ReportPageInner.tsx`. In that file, make these signature changes (keep every other line as-is):

```tsx
// ReportContent — add the tenant prop:
function ReportContent({ overrideParams, snapshotResult, snapshotId, tenant }: {
  overrideParams?: URLSearchParams;
  snapshotResult?: EstimatorOutput;
  snapshotId?: string;
  tenant: Tenant | null;
}) {
```

```tsx
// SavedReportGate — accept and forward tenant:
function SavedReportGate({ savedId, tenant }: { savedId: string; tenant: Tenant | null }) {
  // ...unchanged body...
  return <ReportContent overrideParams={state.params} snapshotResult={state.result} snapshotId={savedId} tenant={tenant} />;
}
```

```tsx
// ReportGate — accept and forward tenant:
function ReportGate({ tenant }: { tenant: Tenant | null }) {
  // ...unchanged body...
  return <ReportContent overrideParams={fullParams} tenant={tenant} />;
}
```

```tsx
// ReportEntry — accept and forward tenant, and export it (the new page.tsx needs it):
export function ReportEntry({ tenant }: { tenant: Tenant | null }) {
  const params = useSearchParams();
  const savedId = params.get("savedId");
  return savedId ? <SavedReportGate savedId={savedId} tenant={tenant} /> : <ReportGate tenant={tenant} />;
}
```

Delete the old `export default function ReportPage() { ... }` wrapper entirely from this file — it moves to the new `page.tsx` in Step 2. Add `import type { Tenant } from "@/lib/tenant";` to this file's imports.

- [ ] **Step 2: Create the new server-component `page.tsx`**

`Suspense` works directly inside a server component when its child is a client component (the standard Next.js App Router pattern for "server reads request-scoped data, client renders the interactive tree") — no extra wrapper file needed:

```tsx
import { Suspense } from "react";
import { headers } from "next/headers";
import { getTenantById } from "@/lib/tenant";
import { colors } from "@/lib/colors";
import { ReportEntry } from "./ReportPageInner";

export default async function ReportPage() {
  const tenantId = (await headers()).get("x-tenant-id");
  const tenant = tenantId ? await getTenantById(tenantId) : null;
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: colors.bgMain }}>
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-4"
            style={{ borderColor: colors.primary, borderTopColor: "transparent" }} />
          <p className="text-sm" style={{ color: colors.textMuted }}>Calculating your report...</p>
        </div>
      </div>
    }>
      <ReportEntry tenant={tenant} />
    </Suspense>
  );
}
```

This file has no `"use client"` directive — it's a server component. `ReportEntry` is still a client component (imported from `ReportPageInner.tsx`, which keeps its own `"use client"` directive), which is a valid child of a server-rendered `Suspense`.

- [ ] **Step 3: Swap the two web-rendered logo usages**

In `ReportPageInner.tsx`, find both `<AssetIntelLogo ... />` call sites inside `ReportContent` (confirmed present at the original file's lines 1323 and 2454) and apply the same conditional swap as Task 5 Step 6, using the `tenant` prop now in scope.

- [ ] **Step 4: Swap the PDF logo source**

Inside `ReportContent`, find the `loadImg` call for the logo (confirmed present at the original file's line ~530): `loadImg("/brand/assetintel-icon.png", 96)`. Replace with:

```typescript
loadImg(tenant?.logoUrl ?? "/brand/assetintel-icon.png", 96),
```

- [ ] **Step 5: Swap every literal "AssetIntel" occurrence (confirmed exact lines)**

All six are inside `ReportContent`, so `tenant` is already in scope at each:

Line 602 — PDF header text: `txt("AssetIntel", ml + 28, tall ? 38 : 32, { size: 12, bold: true, color: GREEN, serif: true });` → `txt(tenant?.displayName ?? "AssetIntel", ml + 28, tall ? 38 : 32, { size: 12, bold: true, color: GREEN, serif: true });`

Line 654 — fallback-source label, not a brand mark, leave unchanged: `: result.ltrBasis === "dld-area" ? "DLD Ejari · area level" : "AssetIntel market estimate";` → this describes the *data source* (AssetIntel's own internal benchmark), not the vendor identity shown to the client's customer — leave as-is; it only appears in an internal data-confidence tooltip, not the client-facing report body. **If later testing shows this tooltip is visible to the end client**, revisit.

Line 1005 — PDF section heading array entry: `["AssetIntel", "Calculations & interpretation"],` → `[tenant?.displayName ?? "AssetIntel", "Calculations & interpretation"],`

Line 1032 — PDF footer text: `txt("AssetIntel", ml, H - footerH + 10, { size: 8, bold: true, color: GREEN, serif: true });` → `txt(tenant?.displayName ?? "AssetIntel", ml, H - footerH + 10, { size: 8, bold: true, color: GREEN, serif: true });`

Line 1037 — **the PDF filename itself** (the single most visible leak — this is literally the downloaded file's name): `const filename = "AssetIntel-Report-" +` → `const filename = (tenant?.displayName.replace(/\s+/g, "") ?? "AssetIntel") + "-Report-" +`

Line 1852 — internal data-basis description, same reasoning as line 654, leave unchanged: `: "AssetIntel's internal benchmark table";`

- [ ] **Step 6: Verify types**

Run: `npx tsc --noEmit -p .`
Expected: no errors.

- [ ] **Step 7: Manual verification**

Run `npm run dev`, generate a report via the normal estimator → report flow at `http://localhost:3000/report?...`. Expected: identical to before this task (no tenant locally, so every `tenant?.x ?? "AssetIntel"` falls back to the original value). Download the PDF and confirm it still renders correctly with the AssetIntel icon and filename (proves the fallback path works, which is the only path testable before Task 8's real tenant exists).

- [ ] **Step 8: Commit**

```bash
git add app/report/ReportPageInner.tsx app/report/page.tsx app/report/ReportPageClient.tsx
git commit -m "Thread tenant branding into the report page, PDF, and filename"
```

---

### Task 7: Manual tenant onboarding script

**Files:**
- Create: `scripts/onboard-tenant.sql`

**Interfaces:**
- Produces: a parameterized SQL template Leon runs by hand (via the Supabase SQL editor or the `execute_sql` MCP tool) to create one new tenant and its first rep login. Not a CLI tool — per the spec's "manual onboarding" decision, this is a documented template, not built infrastructure.

- [ ] **Step 1: Write the template**

```sql
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
```

- [ ] **Step 2: Commit**

```bash
git add scripts/onboard-tenant.sql
git commit -m "Add manual tenant onboarding SQL template"
```

---

### Task 8: Wildcard subdomain DNS/Vercel config + end-to-end validation

**Files:** none (infrastructure configuration + manual verification only).

**Interfaces:** none — this task has no code; it's the step that makes subdomains actually resolve, and the final spec-mandated validation pass.

- [ ] **Step 1: Configure wildcard domain**

In the Vercel project settings (or via the Vercel MCP tools, with Leon's explicit confirmation before any domain change — this is exactly the kind of "affects shared/production infrastructure" action that needs a stated go-ahead first), add `*.assetintel.ae` as a project domain alongside the existing `assetintel.ae`. Confirm the DNS provider has (or gets) a wildcard `CNAME`/`A` record pointing `*.assetintel.ae` at Vercel, matching however the apex domain is currently configured.

- [ ] **Step 2: Create one real test tenant**

Run the Task 7 template with `slug = 'test'`, a real display name, and a logo URL. Create one rep login for it.

- [ ] **Step 3: End-to-end branding check**

Visit `https://test.assetintel.ae/estimator`, log in as the test rep, submit the form, and reach the report page. Expected:
- The estimator's management-fee field is pre-filled with the test tenant's configured fee, not `20`.
- No `AssetIntel` text or logo appears anywhere on the estimator or report page.
- Download the PDF and the emailed copy (via the existing "email report" action) — confirm the same: tenant logo/name only, no AssetIntel mark, and check the PDF's own filename/metadata (right-click → Get Info, or `pdfinfo` if available) for any lingering "AssetIntel" string.

- [ ] **Step 4: Cross-tenant isolation check**

Create a second test tenant (`slug = 'test2'`) with its own rep login. Confirm:
- Logging into `test2.assetintel.ae` with the `test` tenant's rep credentials fails (the middleware's cross-tenant check from Task 3 signs them out and redirects to login).
- Any previously saved reports (via the existing "Save Report" feature, if exercised) made by the `test` rep are not visible to the `test2` rep — this is already enforced by the existing `saved_reports` RLS policy keyed on `user_id`, so this step is a confirmation, not new code.

- [ ] **Step 5: Unknown/inactive tenant check**

Visit `https://doesnotexist.assetintel.ae/estimator` — expect the `/portal-unavailable?reason=unknown` page. Set `test2`'s `active` flag to `false` via SQL (`update public.tenants set active = false where slug = 'test2';`) and visit `test2.assetintel.ae` again — expect `/portal-unavailable?reason=inactive`.

- [ ] **Step 6: Clean up test tenants**

Once validated, either keep `test`/`test2` as permanent staging tenants or delete them:
```sql
delete from public.tenants where slug in ('test', 'test2');
```
(The `profiles.tenant_id` foreign key has no `on delete cascade`, so also null out or delete the associated test rep profiles/auth users if removing the tenants.)

---

## Spec coverage check

- Tenancy model (`tenants` table, `profiles.tenant_id`, RLS) — Task 1.
- Subdomain routing, unknown/inactive tenant handling, cross-tenant auth rejection — Tasks 2, 3, 4.
- Per-tenant management fee / cost default — Task 5.
- White-label branding (logo + name) on estimator, report, PDF, email — Tasks 5, 6.
- Manual onboarding — Task 7.
- Wildcard domain + full end-to-end + isolation validation — Task 8.
- Shared global market data (DLD/AirROI/Airbtics), unchanged — no task needed; nothing in this plan touches `lib/dda-client.ts`, `lib/str-market-data.ts`, or `lib/ltr-rent-cache.ts`, by design.
- Deferred items (billing, self-serve onboarding, custom domains, full color theming) — intentionally no task; confirmed out of scope.

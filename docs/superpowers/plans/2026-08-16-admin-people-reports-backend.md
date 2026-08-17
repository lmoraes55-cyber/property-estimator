# Admin Backend: People, Leads, and Generated Reports Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the site owner one admin-only place (`/admin/people`, `/admin/reports`) to see every identified person who has used AssetIntel (signed up, submitted a lead form, or generated a report), with their contact details attached — without touching existing lead webhooks, the `saved_reports` table, or the Vercel Analytics already installed for anonymous traffic.

**Architecture:** Two new Supabase tables (`leads`, `report_log`), written via the existing service-role client pattern from server-side routes only (never from the browser). Every existing lead-capture and report-generation flow gets one small, non-blocking insert added alongside what it already does. A new `/admin/*` route section, gated by an `is_admin` flag on `profiles`, reads both tables directly as React Server Components.

**Tech Stack:** Next.js App Router, Supabase (Postgres + `@supabase/ssr` for session-aware server components, service-role client for admin-table reads/writes), TypeScript.

## Global Constraints

- **No test framework exists in this repo** (confirmed: no jest/vitest, no `*.test.ts` files, `package.json` has no test script). This plan does NOT introduce one — that would be a disproportionate, unrequested addition for one feature. Every task's "test" steps use this codebase's actual, established verification pattern instead: `npx tsc --noEmit -p .` for type safety, then live verification via `curl` against a deployed endpoint or a direct SQL check in the Supabase SQL editor. This mirrors how every other feature this session was verified.
- **Service-role writes only from trusted server code** — per the existing `lib/supabase/service.ts` comment: never import `createServiceClient()` into a client component, never expose the service-role key to the browser.
- **Every new insert is best-effort and non-blocking** — a `leads`/`report_log` write failure must never break the user-facing action (lead submission, report rendering, email send) it's attached to. Always wrap in `try/catch`, log the error, swallow it.
- **Don't touch `saved_reports`, its RLS policy, or the "Save" button on `/report`** — that table and its behavior are explicitly out of scope and must be unchanged after this plan.
- **Don't touch `LEAD_WEBHOOK_URL` / `LEAD_WEBHOOK_URL_SERVICES` webhook calls in `/api/lead`** — they must keep firing exactly as they do today.
- **Migrations are applied manually** — this project has no Supabase CLI / automated migration runner available (established constraint from earlier work this session). Every migration task ends with the exact SQL to hand to the user and instructions to run it in the Supabase SQL editor before the next task can be verified.
- **Deploys use the clean-worktree pattern** — this repo's working directory routinely has unrelated uncommitted changes from other sessions; every deploy in this project's history uses `git worktree add --detach <commit>` + `npm install` + `npm run build` (verify clean build FIRST) + `npx vercel --prod --yes`, then removes the worktree. Each task that changes deployed behavior should be committed, then deployed this way before its "verify" step, unless the task is UI-only and the plan says otherwise.

---

## File Structure

| File | Responsibility |
|---|---|
| `supabase/migrations/007_admin_people_reports.sql` *(new)* | `leads` table, `report_log` table, `is_admin` column on `profiles`, `handle_new_user` trigger fix |
| `app/api/lead/route.ts` *(modify)* | Add `leads` insert after the existing webhook call |
| `app/api/report-log/route.ts` *(new)* | Small POST endpoint the Rental Analyzer's client-side code calls to log a generated report (service-role insert) |
| `app/report/page.tsx` *(modify)* | Add a once-per-view effect that posts to `/api/report-log` |
| `app/api/send-report/route.ts` *(modify)* | Add `report_log` insert (STR Sub-Leasing Risk report) |
| `app/api/send-operator-match/route.ts` *(modify)* | Add `report_log` insert (Operator Match) |
| `lib/admin.ts` *(new)* | `requireAdmin()` — server-side helper, checks the current session's `profiles.is_admin`, redirects if false |
| `app/admin/layout.tsx` *(new)* | Wraps every `/admin/*` page, calls `requireAdmin()` |
| `lib/admin-people.ts` *(new)* | `groupContactKey()` + `fetchPeople()` — shared grouping logic used by both admin pages, kept out of the page files so it's independently readable/testable |
| `app/admin/people/page.tsx` *(new)* | People list — one row per unique contact |
| `app/admin/people/[key]/page.tsx` *(new)* | Detail view for one contact — every lead + report_log row |
| `app/admin/reports/page.tsx` *(new)* | Every `report_log` row, filterable by type |
| `app/dashboard/page.tsx` *(modify)* | Add a conditional "Admin" link, shown only when the signed-in user is an admin |

---

## Task 1: Migration — `leads`, `report_log`, `is_admin`, trigger fix

**Files:**
- Create: `supabase/migrations/007_admin_people_reports.sql`

**Interfaces:**
- Produces: `public.leads` table, `public.report_log` table, `public.profiles.is_admin` column — every later task in this plan reads or writes these.

- [ ] **Step 1: Write the migration SQL**

Create `supabase/migrations/007_admin_people_reports.sql`:

```sql
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
```

- [ ] **Step 2: Hand the SQL to the user and wait for confirmation**

Tell the user: "Run this in the Supabase SQL editor, then let me know when it's done." Do not proceed to Task 2 until they confirm.

- [ ] **Step 3: Verify the migration applied correctly**

Ask the user to run this verification query in the Supabase SQL editor and paste the result (or run it yourself if you have a way to query Supabase directly — otherwise ask the user):

```sql
select
  (select count(*) from information_schema.tables where table_schema = 'public' and table_name = 'leads') as leads_table_exists,
  (select count(*) from information_schema.tables where table_schema = 'public' and table_name = 'report_log') as report_log_table_exists,
  (select count(*) from information_schema.columns where table_schema = 'public' and table_name = 'profiles' and column_name = 'is_admin') as is_admin_column_exists;
```

Expected: all three values are `1`.

- [ ] **Step 4: Set the owner's own account as admin**

Ask the user for the email they sign in with, then have them run (replacing the email):

```sql
update public.profiles set is_admin = true where email = 'THEIR_EMAIL_HERE';
```

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/007_admin_people_reports.sql
git commit -m "Add leads, report_log tables and is_admin flag; fix profile trigger

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Task 2: `/api/lead` — record every lead into `leads`

**Files:**
- Modify: `app/api/lead/route.ts`

**Interfaces:**
- Consumes: `public.leads` table from Task 1; `lib/supabase/service.ts::createServiceClient()` (already exists in the codebase).
- Produces: nothing new consumed by later tasks — this is a leaf write.

- [ ] **Step 1: Add the import and the insert**

In `app/api/lead/route.ts`, add the import at the top:

```typescript
import { createServiceClient } from "@/lib/supabase/service";
```

Then, right after the existing webhook `if (webhook) { ... }` block (after line 90, before the `return NextResponse.json({ ok: true, ref });` at the end), add:

```typescript
  // Best-effort copy into Supabase so leads are visible in the admin panel —
  // never blocks the response or the webhook above.
  try {
    const supabase = createServiceClient();
    await supabase.from("leads").insert({
      ref: lead.ref,
      name: lead.name,
      email: lead.email || null,
      phone: lead.phone || null,
      source: lead.source,
      target: lead.target || null,
      target_type: lead.targetType || null,
      property: lead.property || null,
      building: lead.building || null,
      community: lead.community || null,
      recommendation: lead.recommendation || null,
      form_data: lead,
    });
  } catch (e) {
    console.error("[AI-LEAD] Supabase insert failed:", (e as Error).message);
  }
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p .`
Expected: no output (clean).

- [ ] **Step 3: Commit**

```bash
git add app/api/lead/route.ts
git commit -m "Record every lead into Supabase alongside the existing webhook

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

- [ ] **Step 4: Deploy**

Use the clean-worktree pattern (see Global Constraints): commit is already made, so build+deploy from `HEAD`.

- [ ] **Step 5: Verify against the live site**

```bash
curl -s -X POST "https://assetintel.ae/api/lead" -H "Content-Type: application/json" -d '{
  "name": "Plan Verification Test",
  "email": "planverify@example.com",
  "targetType": "service",
  "message": "Task 2 verification"
}'
```

Expected: `{"ok":true,"ref":"AI-..."}`. Then ask the user to run in the Supabase SQL editor:

```sql
select ref, name, email, created_at from public.leads order by created_at desc limit 1;
```

Expected: one row, `name = 'Plan Verification Test'`.

---

## Task 3: `/api/report-log` — new endpoint for client-triggered report logging

**Files:**
- Create: `app/api/report-log/route.ts`

**Interfaces:**
- Consumes: `public.report_log` table from Task 1; `createServiceClient()`.
- Produces: `POST /api/report-log` accepting `{ reportType: string, userId?: string, name?: string, email?: string, phone?: string, buildingName?: string, unitSize?: string, params?: object, resultSnapshot?: object }`, returns `{ ok: boolean }`. Task 4 (Rental Analyzer) calls this.

- [ ] **Step 1: Write the route**

```typescript
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

interface ReportLogBody {
  reportType: string;
  userId?: string;
  name?: string;
  email?: string;
  phone?: string;
  buildingName?: string;
  unitSize?: string;
  params?: Record<string, unknown>;
  resultSnapshot?: Record<string, unknown>;
}

export async function POST(request: Request) {
  let body: ReportLogBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.reportType) {
    return NextResponse.json({ ok: false, error: "reportType is required" }, { status: 400 });
  }

  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from("report_log").insert({
      report_type: body.reportType,
      user_id: body.userId || null,
      name: body.name || null,
      email: body.email || null,
      phone: body.phone || null,
      building_name: body.buildingName || null,
      unit_size: body.unitSize || null,
      params: body.params || null,
      result_snapshot: body.resultSnapshot || null,
    });
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[REPORT-LOG]", (e as Error).message);
    // Non-fatal from the caller's point of view — the report itself already rendered.
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p .`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add app/api/report-log/route.ts
git commit -m "Add /api/report-log endpoint for client-triggered report logging

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

- [ ] **Step 4: Deploy and verify**

Deploy via the clean-worktree pattern, then:

```bash
curl -s -X POST "https://assetintel.ae/api/report-log" -H "Content-Type: application/json" -d '{
  "reportType": "rental_analyzer",
  "name": "Plan Verification Test",
  "email": "planverify@example.com",
  "buildingName": "Test Building",
  "unitSize": "1BR"
}'
```

Expected: `{"ok":true}`. Then ask the user to confirm via SQL editor:

```sql
select report_type, name, building_name, created_at from public.report_log order by created_at desc limit 1;
```

Expected: one row matching the test data.

---

## Task 4: Rental Analyzer — auto-log on report generation

**Files:**
- Modify: `app/report/page.tsx`

**Interfaces:**
- Consumes: `POST /api/report-log` from Task 3.
- Produces: nothing new consumed by later tasks.

- [ ] **Step 1: Add a once-per-view logging effect**

In `app/report/page.tsx`, near the other `useState` declarations around line 317 (`const [savedReportId, ...]`), add a ref guard:

```typescript
  const reportLoggedRef = useRef(false);
```

(Add `useRef` to the existing `react` import at the top of the file if it isn't already imported — check the current import line first; this codebase already uses `useState`/`useEffect` throughout this file, so `react` is already imported, just add `useRef` to that same import statement.)

Then, right after the `handleSave` function (after its closing `}` around line 347), add:

```typescript
  // Log every report generation for the admin panel — independent of whether
  // the visitor clicks "Save". Fires once per page view.
  useEffect(() => {
    if (reportLoggedRef.current) return;
    reportLoggedRef.current = true;
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      try {
        await fetch("/api/report-log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reportType: "rental_analyzer",
            userId: user?.id,
            name: user?.user_metadata?.full_name || null,
            email: user?.email || null,
            phone: user?.user_metadata?.whatsapp || null,
            buildingName: input.buildingName || input.propertyName,
            unitSize: input.unitSize,
            params: Object.fromEntries(params.entries()),
            resultSnapshot: result,
          }),
        });
      } catch {
        // Non-fatal — the report itself already rendered successfully.
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p .`
Expected: no output. If `useRef` or `useEffect` aren't recognized, check the top-of-file `react` import and add them there instead of a separate import line.

- [ ] **Step 3: Commit**

```bash
git add app/report/page.tsx
git commit -m "Auto-log every Rental Analyzer report generation

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

- [ ] **Step 4: Deploy and verify**

Deploy via the clean-worktree pattern. Since `/report` requires a real signed-in session and real estimator input to reach, ask the user to:
1. Sign in and generate a real report on `/report`.
2. Confirm in the Supabase SQL editor: `select report_type, name, email, created_at from public.report_log where report_type = 'rental_analyzer' order by created_at desc limit 1;` — expect one fresh row with their real name/email, timestamped just now.
3. Confirm the existing "Save" button still works exactly as before (writes to `saved_reports`, shows the saved state) — this task must not change that behavior.

---

## Task 5: STR Sub-Leasing Risk report — log on send

**Files:**
- Modify: `app/api/send-report/route.ts`

**Interfaces:**
- Consumes: `createServiceClient()`, `public.report_log` table.
- Produces: nothing new consumed by later tasks.

- [ ] **Step 1: Add the import and the insert**

Add the import near the top of `app/api/send-report/route.ts`:

```typescript
import { createServiceClient } from "@/lib/supabase/service";
```

In the `POST` handler, right after the successful `resend.emails.send(...)` call for the customer email (immediately after that `await`, before the internal-notify `resend.emails.send(...)` call), add:

```typescript
    // Best-effort report log for the admin panel — never blocks the email send.
    try {
      const logSupabase = createServiceClient();
      await logSupabase.from("report_log").insert({
        report_type: "str_subleasing",
        email,
        building_name: building,
        unit_size: unitSize,
        params: summary,
      });
    } catch (e) {
      console.error("[AI-REPORT] report_log insert failed:", (e as Error).message);
    }
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p .`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add app/api/send-report/route.ts
git commit -m "Log STR Sub-Leasing Risk report generation to report_log

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

- [ ] **Step 4: Deploy and verify**

Deploy via the clean-worktree pattern, then trigger a real send (reuse the pattern from earlier this session — build a small PDF payload and POST to `/api/send-report`, or ask the user to trigger it from the actual `/self-manage/str-subleasing/estimator/result` page's "Send Me the Report" button). Confirm via SQL editor:

```sql
select report_type, email, building_name, created_at from public.report_log where report_type = 'str_subleasing' order by created_at desc limit 1;
```

Expected: one fresh row.

---

## Task 6: Operator Match report — log on send

**Files:**
- Modify: `app/api/send-operator-match/route.ts`

**Interfaces:**
- Consumes: `createServiceClient()`, `public.report_log` table.
- Produces: nothing new consumed by later tasks.

- [ ] **Step 1: Add the import and the insert**

Add the import near the top of `app/api/send-operator-match/route.ts`:

```typescript
import { createServiceClient } from "@/lib/supabase/service";
```

In the `POST` handler, right after the successful customer `resend.emails.send(...)` call (same placement pattern as Task 5 — after the customer email send, before the internal-notify send), add:

```typescript
    // Best-effort report log for the admin panel — never blocks the email send.
    try {
      const logSupabase = createServiceClient();
      await logSupabase.from("report_log").insert({
        report_type: "operator_match",
        name: name || null,
        email,
        building_name: buildingName || null,
        params: { priorities: priorities ?? [] },
      });
    } catch (e) {
      console.error("[OPERATOR-MATCH] report_log insert failed:", (e as Error).message);
    }
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p .`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add app/api/send-operator-match/route.ts
git commit -m "Log Operator Match report generation to report_log

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

- [ ] **Step 4: Deploy and verify**

Deploy via the clean-worktree pattern, then:

```bash
curl -s -X POST "https://assetintel.ae/api/send-operator-match" -H "Content-Type: application/json" -d '{
  "email": "planverify@example.com",
  "priorities": ["low_fee"],
  "name": "Plan Verification Test",
  "buildingName": "Task 6 Verification"
}'
```

Expected: `{"ok":true}`. Confirm via SQL editor:

```sql
select report_type, name, email, building_name, created_at from public.report_log where report_type = 'operator_match' order by created_at desc limit 1;
```

Expected: one fresh row matching the test data.

---

## Task 7: `lib/admin.ts` — `requireAdmin()` helper

**Files:**
- Create: `lib/admin.ts`

**Interfaces:**
- Consumes: `lib/supabase/server.ts::createClient()` (session-aware, already exists).
- Produces: `async function requireAdmin(): Promise<{ id: string; email: string }>` — throws a Next.js redirect (via `redirect()`) if the current session isn't signed in or isn't flagged admin. Task 8 uses this.

- [ ] **Step 1: Write the helper**

```typescript
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Server-side only. Call at the top of any /admin/* layout or page.
 * Redirects to "/" if there's no signed-in session, or the signed-in
 * user's profiles.is_admin is not true. Fails closed: any error checking
 * admin status is treated as "not admin".
 */
export async function requireAdmin(): Promise<{ id: string; email: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (error || !profile?.is_admin) redirect("/");

  return { id: user.id, email: user.email ?? "" };
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p .`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add lib/admin.ts
git commit -m "Add requireAdmin() server-side gate helper

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

(No deploy/live-verify step for this task alone — it has no route calling it yet. It gets exercised in Task 8's verification.)

---

## Task 8: `/admin` layout — gate the whole section

**Files:**
- Create: `app/admin/layout.tsx`

**Interfaces:**
- Consumes: `lib/admin.ts::requireAdmin()`.
- Produces: every page under `app/admin/*` (Tasks 9-11) is automatically wrapped by this and gated.

- [ ] **Step 1: Write the layout**

```typescript
import { requireAdmin } from "@/lib/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div style={{ minHeight: "100vh", background: "#F8F4EE" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
        <nav style={{ display: "flex", gap: 16, marginBottom: 24, fontSize: 14 }}>
          <a href="/admin/people" style={{ color: "#1B5E4A", fontWeight: 600, textDecoration: "none" }}>People</a>
          <a href="/admin/reports" style={{ color: "#1B5E4A", fontWeight: 600, textDecoration: "none" }}>Reports</a>
          <a
            href="https://vercel.com/leon-moraes-projects/property-estimator/analytics"
            target="_blank" rel="noopener noreferrer"
            style={{ color: "#6B6B6B", fontWeight: 600, textDecoration: "none", marginLeft: "auto" }}
          >
            View traffic analytics →
          </a>
        </nav>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p .`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add app/admin/layout.tsx
git commit -m "Add /admin layout with is_admin gate

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

(No deploy/live-verify yet — there are no pages under `/admin/*` for this layout to wrap until Task 9. Verification happens in Task 9's step.)

---

## Task 9: `lib/admin-people.ts` + `/admin/people` — people list

**Files:**
- Create: `lib/admin-people.ts`
- Create: `app/admin/people/page.tsx`

**Interfaces:**
- Consumes: `createServiceClient()`; `public.leads`, `public.report_log` tables.
- Produces: `groupContactKey(email: string | null, phone: string | null): string | null` and `async function fetchPeople(): Promise<PersonSummary[]>` where
  ```typescript
  interface PersonSummary {
    key: string;         // the grouping key — url-safe, used as the [key] param in Task 10
    name: string | null;
    email: string | null;
    phone: string | null;
    hasAccount: boolean;
    leadCount: number;
    reportCount: number;
    lastActivityAt: string;
  }
  ```
  Task 10 (`app/admin/people/[key]/page.tsx`) and Task 11 (`app/admin/reports/page.tsx`) both import `fetchPeople`/`groupContactKey` from this file rather than duplicating the grouping logic.

- [ ] **Step 1: Write the grouping + fetch logic**

Create `lib/admin-people.ts`:

```typescript
import { createServiceClient } from "@/lib/supabase/service";

export interface PersonSummary {
  key: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  hasAccount: boolean;
  leadCount: number;
  reportCount: number;
  lastActivityAt: string;
}

/**
 * Grouping key for one contact: email if present (lowercased, trimmed),
 * else phone digits-only (so formatting differences like "+971 50 123"
 * vs "0501234567" collapse to the same key). Returns null if neither is
 * usable — those rows are excluded from grouping rather than merged
 * incorrectly.
 */
export function groupContactKey(email: string | null, phone: string | null): string | null {
  const e = (email ?? "").trim().toLowerCase();
  if (e) return `e:${e}`;
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits) return `p:${digits}`;
  return null;
}

export async function fetchPeople(): Promise<PersonSummary[]> {
  const supabase = createServiceClient();

  const [leadsRes, reportsRes, profilesRes] = await Promise.all([
    supabase.from("leads").select("name, email, phone, created_at"),
    supabase.from("report_log").select("name, email, phone, created_at"),
    supabase.from("profiles").select("email, first_name, last_name, phone, whatsapp"),
  ]);

  const byKey = new Map<string, PersonSummary>();

  function upsert(name: string | null, email: string | null, phone: string | null, createdAt: string, kind: "lead" | "report" | "account") {
    const key = groupContactKey(email, phone);
    if (!key) return;
    const existing = byKey.get(key);
    if (existing) {
      if (!existing.name && name) existing.name = name;
      if (!existing.phone && phone) existing.phone = phone;
      if (kind === "lead") existing.leadCount++;
      if (kind === "report") existing.reportCount++;
      if (kind === "account") existing.hasAccount = true;
      if (createdAt > existing.lastActivityAt) existing.lastActivityAt = createdAt;
    } else {
      byKey.set(key, {
        key, name, email, phone,
        hasAccount: kind === "account",
        leadCount: kind === "lead" ? 1 : 0,
        reportCount: kind === "report" ? 1 : 0,
        lastActivityAt: createdAt,
      });
    }
  }

  for (const row of leadsRes.data ?? []) upsert(row.name, row.email, row.phone, row.created_at, "lead");
  for (const row of reportsRes.data ?? []) upsert(row.name, row.email, row.phone, row.created_at, "report");
  for (const row of profilesRes.data ?? []) {
    const fullName = [row.first_name, row.last_name].filter(Boolean).join(" ") || null;
    upsert(fullName, row.email, row.phone || row.whatsapp, "1970-01-01T00:00:00Z", "account");
  }

  return [...byKey.values()].sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt));
}
```

- [ ] **Step 2: Write the page**

Create `app/admin/people/page.tsx`:

```typescript
import { fetchPeople } from "@/lib/admin-people";

export default async function AdminPeoplePage() {
  const people = await fetchPeople();

  return (
    <div>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, color: "#1B5E4A", marginBottom: 16 }}>
        People ({people.length})
      </h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "#E6E1D8" }}>
        {people.map(p => (
          <a
            key={p.key}
            href={`/admin/people/${encodeURIComponent(p.key)}`}
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px 16px", background: "#fff", textDecoration: "none", color: "#1A1A1A",
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>{p.name || "(no name)"}</div>
              <div style={{ fontSize: 12, color: "#6B6B6B" }}>{p.email || p.phone}</div>
            </div>
            <div style={{ fontSize: 12, color: "#6B6B6B", textAlign: "right" }}>
              {p.hasAccount && <span style={{ marginRight: 8 }}>Account</span>}
              <span style={{ marginRight: 8 }}>{p.leadCount} lead{p.leadCount === 1 ? "" : "s"}</span>
              <span>{p.reportCount} report{p.reportCount === 1 ? "" : "s"}</span>
            </div>
          </a>
        ))}
        {people.length === 0 && (
          <div style={{ padding: 16, background: "#fff", color: "#6B6B6B" }}>No people recorded yet.</div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p .`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add lib/admin-people.ts app/admin/people/page.tsx
git commit -m "Add /admin/people list page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

- [ ] **Step 5: Deploy and verify**

Deploy via the clean-worktree pattern. This page needs a real signed-in admin session to view, so ask the user to:
1. Sign in with the account flagged `is_admin = true` in Task 1.
2. Visit `https://assetintel.ae/admin/people`.
3. Confirm the "Plan Verification Test" contact from Tasks 2, 3, and 6 appears as one merged row (same `planverify@example.com` email across a lead, a rental-analyzer report, and an operator-match report) showing `leadCount: 1` and `reportCount: 2`.
4. Sign out (or open a private/incognito window) and confirm visiting `/admin/people` redirects away instead of showing the page.

---

## Task 10: `/admin/people/[key]` — contact detail view

**Files:**
- Create: `app/admin/people/[key]/page.tsx`

**Interfaces:**
- Consumes: `groupContactKey` from `lib/admin-people.ts` (Task 9); `createServiceClient()`; `public.leads`, `public.report_log`.

- [ ] **Step 1: Write the page**

```typescript
import { createServiceClient } from "@/lib/supabase/service";
import { groupContactKey } from "@/lib/admin-people";

export default async function AdminPersonDetailPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const decodedKey = decodeURIComponent(key);
  const supabase = createServiceClient();

  const [leadsRes, reportsRes] = await Promise.all([
    supabase.from("leads").select("*").order("created_at", { ascending: false }),
    supabase.from("report_log").select("*").order("created_at", { ascending: false }),
  ]);

  const leads = (leadsRes.data ?? []).filter(l => groupContactKey(l.email, l.phone) === decodedKey);
  const reports = (reportsRes.data ?? []).filter(r => groupContactKey(r.email, r.phone) === decodedKey);
  const displayName = leads[0]?.name || reports[0]?.name || "(no name)";
  const displayContact = leads[0]?.email || reports[0]?.email || leads[0]?.phone || reports[0]?.phone || "";

  return (
    <div>
      <a href="/admin/people" style={{ fontSize: 13, color: "#6B6B6B" }}>← Back to People</a>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, color: "#1B5E4A", margin: "8px 0 4px" }}>{displayName}</h1>
      <p style={{ color: "#6B6B6B", marginBottom: 24 }}>{displayContact}</p>

      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Reports ({reports.length})</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {reports.map(r => (
          <div key={r.id} style={{ padding: 12, background: "#fff", border: "1px solid #E6E1D8", borderRadius: 8 }}>
            <div style={{ fontWeight: 700 }}>{r.report_type} — {r.building_name || "—"}</div>
            <div style={{ fontSize: 12, color: "#6B6B6B" }}>{new Date(r.created_at).toLocaleString()}</div>
          </div>
        ))}
        {reports.length === 0 && <p style={{ color: "#6B6B6B" }}>No reports.</p>}
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Leads ({leads.length})</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {leads.map(l => (
          <div key={l.id} style={{ padding: 12, background: "#fff", border: "1px solid #E6E1D8", borderRadius: 8 }}>
            <div style={{ fontWeight: 700 }}>{l.target_type || "lead"} — {l.target || "—"}</div>
            <div style={{ fontSize: 12, color: "#6B6B6B" }}>{new Date(l.created_at).toLocaleString()}</div>
          </div>
        ))}
        {leads.length === 0 && <p style={{ color: "#6B6B6B" }}>No leads.</p>}
      </div>
    </div>
  );
}
```

Note: `groupContactKey` filtering happens in-memory here rather than as a SQL `where` clause, matching the same in-memory grouping approach `fetchPeople` already uses — keeps both files consistent and avoids introducing a different query pattern for what's still a small table.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p .`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add app/admin/people/[key]/page.tsx
git commit -m "Add /admin/people/[key] contact detail page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

- [ ] **Step 4: Deploy and verify**

Deploy via the clean-worktree pattern. Ask the user to sign in as the admin account, visit `/admin/people`, click into the "Plan Verification Test" row, and confirm it shows 2 reports (`rental_analyzer` and `operator_match`) and 1 lead, each with a real timestamp.

---

## Task 11: `/admin/reports` — all reports, filterable by type

**Files:**
- Create: `app/admin/reports/page.tsx`

**Interfaces:**
- Consumes: `createServiceClient()`, `public.report_log`.

- [ ] **Step 1: Write the page**

```typescript
import { createServiceClient } from "@/lib/supabase/service";

const TYPE_LABELS: Record<string, string> = {
  rental_analyzer: "Rental Analyzer",
  str_subleasing: "STR Sub-Leasing Risk",
  operator_match: "Operator Match",
};

export default async function AdminReportsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const supabase = createServiceClient();

  let query = supabase.from("report_log").select("*").order("created_at", { ascending: false }).limit(200);
  if (type) query = query.eq("report_type", type);
  const { data: reports } = await query;

  return (
    <div>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, color: "#1B5E4A", marginBottom: 16 }}>
        Reports ({reports?.length ?? 0})
      </h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <a href="/admin/reports" style={{ fontSize: 13, fontWeight: !type ? 700 : 400, color: "#1B5E4A" }}>All</a>
        {Object.entries(TYPE_LABELS).map(([value, label]) => (
          <a key={value} href={`/admin/reports?type=${value}`} style={{ fontSize: 13, fontWeight: type === value ? 700 : 400, color: "#1B5E4A" }}>
            {label}
          </a>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "#E6E1D8" }}>
        {(reports ?? []).map(r => (
          <div key={r.id} style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", background: "#fff" }}>
            <div>
              <div style={{ fontWeight: 700 }}>{TYPE_LABELS[r.report_type] || r.report_type} — {r.building_name || "—"}</div>
              <div style={{ fontSize: 12, color: "#6B6B6B" }}>{r.name || r.email || "—"}</div>
            </div>
            <div style={{ fontSize: 12, color: "#6B6B6B" }}>{new Date(r.created_at).toLocaleString()}</div>
          </div>
        ))}
        {(reports ?? []).length === 0 && (
          <div style={{ padding: 16, background: "#fff", color: "#6B6B6B" }}>No reports recorded yet.</div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit -p .`
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add app/admin/reports/page.tsx
git commit -m "Add /admin/reports page with type filter

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

- [ ] **Step 4: Deploy and verify**

Deploy via the clean-worktree pattern. Ask the user to visit `/admin/reports`, confirm the verification rows from earlier tasks are visible, and click each type filter link to confirm it narrows the list correctly.

---

## Task 12: Admin link on the dashboard

**Files:**
- Modify: `app/dashboard/page.tsx`

**Interfaces:**
- Consumes: nothing new — reads the already-available signed-in user/profile data this page already fetches.

- [ ] **Step 1: Read the current data-fetching in `app/dashboard/page.tsx`**

Find where this page already fetches the signed-in user's `profiles` row (it must do this already, since the dashboard shows the user's name). Note the exact variable name holding that profile data.

- [ ] **Step 2: Add a conditional admin link**

Wherever this page renders its main navigation/header area, add (adjusting the surrounding JSX to match this file's actual existing style conventions rather than introducing new ones):

```typescript
{profile?.is_admin && (
  <a href="/admin/people" style={{ fontSize: 13, fontWeight: 600, color: "#B88A44" }}>
    Admin
  </a>
)}
```

(Replace `profile` with whatever the actual variable name is from Step 1. Make sure the query that fetches the profile in this file actually selects `is_admin` — add it to the `.select(...)` column list if it isn't already included.)

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit -p .`
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "Show an Admin link on the dashboard for admin accounts

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

- [ ] **Step 5: Deploy and verify**

Deploy via the clean-worktree pattern. Ask the user to sign in as the admin account and visit `/dashboard`, confirming the "Admin" link appears and goes to `/admin/people`. Then ask them to check (or you check, if you have a second non-admin test account) that a non-admin signed-in account does NOT see the link.

---

## Plan Self-Review

**1. Spec coverage:**
- `leads` table, `report_log` table, `is_admin` column, trigger fix → Task 1. ✓
- `/api/lead` insert → Task 2. ✓
- Rental Analyzer auto-log (not just Save button) → Tasks 3-4. ✓
- STR Sub-Leasing report log → Task 5. ✓
- Operator Match report log → Task 6. ✓
- `is_admin` gate → Tasks 7-8. ✓
- `/admin/people` list + detail → Tasks 9-10. ✓
- `/admin/reports` → Task 11. ✓
- "View traffic analytics →" link to Vercel → Task 8 (in the layout). ✓
- `saved_reports` / webhooks left untouched → no task modifies either; Global Constraints call this out explicitly. ✓
- Non-goal (anonymous traffic) → correctly out of scope, not built. ✓

No gaps found.

**2. Placeholder scan:** No "TBD"/"TODO"/"add appropriate handling" found — every step has real code or a concrete SQL/curl command. Task 12 Step 1 asks the implementer to *read* existing code before writing (necessary since the exact variable name isn't known without opening the file), but Step 2 gives the exact JSX to add once that's known — this is a legitimate "look before you leap" step, not a placeholder.

**3. Type consistency:** `PersonSummary` (Task 9) is used identically in Tasks 9, 10 (via `groupContactKey`), and referenced conceptually in Task 11 (though Task 11 queries `report_log` directly rather than going through `fetchPeople`, since it doesn't need per-person grouping). `report_log` column names (`report_type`, `building_name`, `unit_size`, `result_snapshot`) are consistent across Tasks 1, 3, 4, 5, 6, 9, 10, 11. `leads` column names consistent across Tasks 1, 2, 9, 10.

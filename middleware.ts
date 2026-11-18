import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { extractTenantSlug, getTenantBySlug } from "@/lib/tenant";

const TENANT_ALLOWED_PATHS = ["/estimator", "/report", "/dashboard", "/login", "/signup", "/portal-unavailable"];

function isTenantAllowedPath(pathname: string): boolean {
  return TENANT_ALLOWED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") ?? "";
  const tenantSlug = extractTenantSlug(hostname);

  // Strip anything the client sent for this header first — otherwise a
  // forged `x-tenant-id` request header would flow straight through to the
  // page's headers() call and let anyone render any tenant's branding.
  request.headers.delete("x-tenant-id");

  // ── Resolve the tenant BEFORE constructing supabaseResponse, so that if
  // it's valid we can mutate request.headers and have that survive into
  // what the page receives via headers() (NextResponse.next({request})
  // must be created *after* the header is set on the request). ──────────
  if (tenantSlug) {
    let tenant;
    try {
      tenant = await getTenantBySlug(tenantSlug);
    } catch (e) {
      // Transient DB error resolving the tenant — fail safe on BRANDING
      // (serve unbranded rather than guessing/redirecting to an error page
      // over a blip), but NOT on auth: /estimator and /report still require
      // a session even when we can't tell which tenant this is.
      console.error("getTenantBySlug failed", e);
      if (pathname.startsWith("/estimator") || pathname.startsWith("/report") || pathname.startsWith("/dashboard")) {
        const authClient = createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
        );
        const { data: { user } } = await authClient.auth.getUser();
        if (!user) {
          return NextResponse.redirect(new URL("/login?next=" + pathname, request.url));
        }
      }
      return NextResponse.next({ request });
    }

    if (!tenant || !tenant.active) {
      if (pathname !== "/portal-unavailable") {
        const url = new URL("/portal-unavailable", request.url);
        if (!tenant) url.searchParams.set("reason", "unknown");
        else url.searchParams.set("reason", "inactive");
        return NextResponse.redirect(url);
      }
      return NextResponse.next({ request });
    }

    // Tenant subdomains only ever serve the white-label estimator/report —
    // never AssetIntel's own marketing/consumer pages.
    if (!isTenantAllowedPath(pathname)) {
      return NextResponse.redirect(new URL("/estimator", request.url));
    }

    request.headers.set("x-tenant-id", tenant.id);
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

    if (user) {
      let profile: { tenant_id: string | null } | null = null;
      let profileError = false;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("tenant_id")
          .eq("id", user.id)
          .maybeSingle();
        if (error) throw error;
        profile = data;
      } catch (e) {
        // Transient DB error — do NOT sign the user out over a blip.
        console.error("profile lookup failed", e);
        profileError = true;
      }

      if (!profileError && profile?.tenant_id !== tenant.id && pathname !== "/login") {
        // Valid AssetIntel session, wrong tenant — treat as logged out here.
        // scope: "local" so this only ends the session for this subdomain,
        // not every device/tab.
        await supabase.auth.signOut({ scope: "local" });
        const redirectResponse = NextResponse.redirect(
          new URL("/login?next=" + pathname, request.url)
        );
        supabaseResponse.cookies.getAll().forEach((c) =>
          redirectResponse.cookies.set(c.name, c.value, c)
        );
        return redirectResponse;
      }
    }

    if ((pathname.startsWith("/estimator") || pathname.startsWith("/report") || pathname.startsWith("/dashboard")) && !user) {
      return NextResponse.redirect(new URL("/login?next=" + pathname, request.url));
    }

    return supabaseResponse;
  }

  // ── AssetIntel's own site — unchanged existing behavior ────────────────
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/).*)"],
};

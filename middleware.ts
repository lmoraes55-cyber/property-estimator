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

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

  // Deluxe white-label tool: only accounts created via /api/dh/signup
  // (app_metadata.org, not user-editable) get past the login screen.
  if (pathname.startsWith("/dh")) {
    const isDeluxe = user?.app_metadata?.org === "deluxe";
    if (pathname === "/dh/login") {
      return isDeluxe ? NextResponse.redirect(new URL("/dh", request.url)) : supabaseResponse;
    }
    return isDeluxe ? supabaseResponse : NextResponse.redirect(new URL("/dh/login", request.url));
  }

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
  matcher: ["/dashboard/:path*", "/login", "/signup", "/dh", "/dh/:path*"],
};

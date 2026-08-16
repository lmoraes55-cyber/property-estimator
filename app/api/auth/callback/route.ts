import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  const redirectTo = `${origin}${next}`;
  const errorRedirect = (detail?: string) =>
    `${origin}/login?error=auth_failed${detail ? `&detail=${encodeURIComponent(detail)}` : ""}`;

  if (!code) {
    // Log every param actually received so a missing_code report can be diagnosed
    // from real evidence instead of guessing at Supabase/Google config.
    const allParams = Object.fromEntries(searchParams.entries());
    console.error("[auth/callback] missing code — full incoming params:", JSON.stringify(allParams), "full URL:", request.url);
    const upstreamError = searchParams.get("error_description") || searchParams.get("error");
    return NextResponse.redirect(errorRedirect(upstreamError ? `missing_code: ${upstreamError}` : "missing_code"));
  }

  // Build the redirect response first — cookies must be set ON this response
  const response = NextResponse.redirect(redirectTo);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write cookies directly onto the redirect response
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth/callback] exchangeCodeForSession failed:", error.message, error.status, error.code);
    return NextResponse.redirect(errorRedirect(`${error.code ?? error.status ?? ""}: ${error.message}`));
  }

  // Send welcome email for new signups (created within last 2 minutes)
  const user = data?.user;
  if (user?.email && user.created_at) {
    const ageMs = Date.now() - new Date(user.created_at).getTime();
    if (ageMs < 2 * 60 * 1000) {
      const firstName = (user.user_metadata?.full_name || user.user_metadata?.name || "").split(" ")[0] || "";
      fetch(`${origin}/api/auth/welcome`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, firstName }),
      }).catch(() => {});
    }
  }

  return response;
}

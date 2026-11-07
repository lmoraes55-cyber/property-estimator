import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

// BD self-signup for the Deluxe white-label tool. The team access code keeps
// strangers who find the URL out; org lives in app_metadata, which users
// cannot edit themselves, so it's safe for the middleware to trust.
export async function POST(request: Request) {
  const { name, email, password, code } = await request.json().catch(() => ({}));
  const expected = process.env.DH_SIGNUP_CODE;
  if (!expected || code !== expected) {
    return NextResponse.json({ error: "Invalid team access code." }, { status: 403 });
  }
  if (!name || !email || !password || String(password).length < 8) {
    return NextResponse.json({ error: "Name, email and a password of 8+ characters are required." }, { status: 400 });
  }

  const { error } = await createServiceClient().auth.admin.createUser({
    email: String(email).trim().toLowerCase(),
    password: String(password),
    email_confirm: true, // no confirmation email — Supabase's would be AssetIntel-branded
    user_metadata: { full_name: String(name).trim() },
    app_metadata: { org: "deluxe" },
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

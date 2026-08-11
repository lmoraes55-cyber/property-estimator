import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

// Confirms a checkout against Telr and records the outcome.
//
// The success page previously trusted the `ref` in its own query string, so any
// visitor could load a "payment received" screen for any value. Status here comes
// from Telr's order check, never from the caller — the caller only names which
// order to look up.
//
// NOTE FOR INTEGRATION (Telr not yet approved as of 2026-08): the request shape
// below mirrors the working `method: "create"` call in ../route.ts, and the status
// codes are Telr's documented order states. Both should be confirmed against a
// live Telr account before go-live — this has never been exercised against the
// real gateway. If the shape is wrong the route fails closed (status stays
// "created", the page reports pending), so it cannot invent a payment.

const TELR_STATUS = {
  PENDING: 1,
  AUTHORISED: 2,
  PAID: 3,
  EXPIRED: -1,
  CANCELLED: -2,
  DECLINED: -3,
} as const;

function statusFromCode(code: number): string {
  switch (code) {
    case TELR_STATUS.PAID:
    case TELR_STATUS.AUTHORISED:
      return "paid";
    case TELR_STATUS.DECLINED:
      return "declined";
    case TELR_STATUS.CANCELLED:
      return "cancelled";
    case TELR_STATUS.EXPIRED:
      return "expired";
    default:
      return "created";
  }
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const ref = String(body.ref ?? "").trim();
  if (!/^AI-\d{4}-[0-9A-F]{6}$/.test(ref)) {
    return NextResponse.json({ ok: false, error: "Unknown order" }, { status: 404 });
  }

  // Storage unavailable means we cannot confirm anything, so report pending —
  // never let an infrastructure failure read as a successful payment.
  let supabase: ReturnType<typeof createServiceClient>;
  try {
    supabase = createServiceClient();
  } catch (e) {
    console.error("[AI-VERIFY] order storage unavailable:", (e as Error).message);
    return NextResponse.json({ ok: true, ref, status: "pending" });
  }

  const { data: order } = await supabase
    .from("orders")
    .select("ref, telr_ref, package, amount, currency, status")
    .eq("ref", ref)
    .maybeSingle();

  // Unknown refs and known refs are both "Unknown order" — otherwise this route
  // reports which cart ids exist.
  if (!order) {
    return NextResponse.json({ ok: false, error: "Unknown order" }, { status: 404 });
  }

  // Already settled — no need to ask Telr again.
  if (order.status !== "created") {
    return NextResponse.json({
      ok: true,
      ref: order.ref,
      status: order.status,
      package: order.package,
      amount: order.amount,
      currency: order.currency,
    });
  }

  const storeId = process.env.TELR_STORE_ID;
  const authKey = process.env.TELR_AUTH_KEY;
  if (!storeId || !authKey || !order.telr_ref) {
    return NextResponse.json({ ok: true, ref: order.ref, status: "pending" });
  }

  let checked: { order?: { status?: { code?: number; text?: string } } } | null = null;
  try {
    const res = await fetch("https://secure.telr.com/gateway/order.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        method: "check",
        store: Number(storeId),
        authkey: authKey,
        order: { ref: order.telr_ref },
      }),
    });
    checked = await res.json().catch(() => null);
  } catch (e) {
    console.error("[AI-VERIFY] Telr unreachable:", (e as Error).message);
    return NextResponse.json({ ok: true, ref: order.ref, status: "pending" });
  }

  const code = Number(checked?.order?.status?.code);
  if (!Number.isFinite(code)) {
    console.error("[AI-VERIFY] unexpected Telr response:", JSON.stringify(checked));
    return NextResponse.json({ ok: true, ref: order.ref, status: "pending" });
  }

  const status = statusFromCode(code);
  await supabase
    .from("orders")
    .update({
      status,
      telr_status_code: code,
      telr_status_text: checked?.order?.status?.text ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("ref", order.ref);

  console.log("[AI-VERIFY]", JSON.stringify({ ref: order.ref, code, status }));

  return NextResponse.json({
    ok: true,
    ref: order.ref,
    status,
    package: order.package,
    amount: order.amount,
    currency: order.currency,
  });
}

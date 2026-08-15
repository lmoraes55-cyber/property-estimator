import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

// Telr AED amounts (fils = AED × 100, but Telr uses decimal AED directly)
const PRICES: Record<string, number> = {
  "Self-Manage — Setup Session": 1500,
  "Self-Manage — Launch + Coaching": 2900,
  "Operations Help — Essentials Launch": 3500,
  "Operations Help — Premium Launch": 5500,
  "Snagging Inspection — Studio/1BR": 699,
  "Snagging Inspection — 2BR": 899,
  "Snagging Inspection — 3BR+/Villa": 1199,
};

// Return URLs are built from server config only. This used to read `origin` from
// the request body, which let anyone craft a checkout whose post-payment redirect
// pointed at their own "success" page — the customer paid us for real, then landed
// on the attacker's screen. Set SITE_ORIGIN to http://localhost:3000 for local dev.
const SITE_ORIGIN = (process.env.SITE_ORIGIN || "https://assetintel.ae").replace(/\/+$/, "");

// `ref` is the cart id shown to the customer and our reconciliation key, so a
// collision would fail the unique constraint on orders.ref and lose a checkout.
// 6 hex chars from a CSPRNG rather than 4 from Math.random.
function makeRef(): string {
  const d = new Date();
  const yymm = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}`;
  const rand = randomBytes(3).toString("hex").toUpperCase();
  return `AI-${yymm}-${rand}`;
}

const str = (v: unknown) => (v == null ? "" : String(v).trim());

export async function POST(request: Request) {
  let b: Record<string, unknown>;
  try {
    b = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const pkg = str(b.pkg);
  const amount = PRICES[pkg];

  if (!amount) {
    return NextResponse.json({ ok: false, error: "Unknown package" }, { status: 400 });
  }

  const storeId = process.env.TELR_STORE_ID;
  const authKey = process.env.TELR_AUTH_KEY;
  const testMode = process.env.TELR_TEST_MODE === "0" ? 0 : 1; // default to test

  if (!storeId || !authKey) {
    console.error("[AI-CHECKOUT] TELR_STORE_ID or TELR_AUTH_KEY not set");
    return NextResponse.json({ ok: false, error: "Payment not configured" }, { status: 503 });
  }

  const ref = makeRef();
  const origin = SITE_ORIGIN;

  // Record the attempt before handing the customer to Telr. If we crash or the
  // gateway call fails after this point, the row is still here to reconcile
  // against — a payment we have no record of is worse than an unused row.
  //
  // Deliberately fails closed: no order record, no checkout. createServiceClient
  // throws when SUPABASE_SERVICE_ROLE_KEY is unset, so catch it and report 503
  // rather than surfacing an unhandled 500.
  let supabase: ReturnType<typeof createServiceClient>;
  try {
    supabase = createServiceClient();
  } catch (e) {
    console.error("[AI-CHECKOUT] order storage unavailable:", (e as Error).message);
    return NextResponse.json({ ok: false, error: "Payment not configured" }, { status: 503 });
  }

  const { error: insertError } = await supabase.from("orders").insert({
    ref,
    package: pkg,
    amount,
    currency: "AED",
    status: "created",
    test_mode: testMode === 1,
  });

  if (insertError) {
    console.error("[AI-CHECKOUT] could not record order:", insertError.message);
    return NextResponse.json({ ok: false, error: "Could not start checkout" }, { status: 500 });
  }

  const payload = {
    method: "create",
    store: Number(storeId),
    authkey: authKey,
    framed: 0,
    order: {
      cartid: ref,
      test: testMode,
      amount: amount.toFixed(2),
      currency: "AED",
      description: `AssetIntel — ${pkg}`,
    },
    return: {
      authorised: `${origin}/pay/success?ref=${ref}`,
      declined: `${origin}/pay/cancel?ref=${ref}&reason=declined`,
      cancelled: `${origin}/pay/cancel?ref=${ref}&reason=cancelled`,
    },
  };

  console.log("[AI-CHECKOUT]", JSON.stringify({ ref, pkg, amount, testMode }));

  let telrRes: Response;
  try {
    telrRes = await fetch("https://secure.telr.com/gateway/order.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("[AI-CHECKOUT] Telr network error:", (e as Error).message);
    await supabase.from("orders").update({ status: "failed", updated_at: new Date().toISOString() }).eq("ref", ref);
    return NextResponse.json({ ok: false, error: "Payment gateway unreachable" }, { status: 502 });
  }

  const data = await telrRes.json().catch(() => null);

  if (!data?.order?.url) {
    console.error("[AI-CHECKOUT] Telr error response:", JSON.stringify(data));
    await supabase.from("orders").update({ status: "failed", updated_at: new Date().toISOString() }).eq("ref", ref);
    return NextResponse.json({ ok: false, error: "Payment gateway error" }, { status: 502 });
  }

  // Telr's own reference is what the order-check call keys on, so it has to be
  // stored now — without it a completed payment can't be verified later.
  if (data.order.ref) {
    await supabase
      .from("orders")
      .update({ telr_ref: String(data.order.ref), updated_at: new Date().toISOString() })
      .eq("ref", ref);
  }

  return NextResponse.json({ ok: true, ref, url: data.order.url });
}

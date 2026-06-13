import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Telr AED amounts (fils = AED × 100, but Telr uses decimal AED directly)
const PRICES: Record<string, number> = {
  "Self-Manage — Setup Session": 1500,
  "Self-Manage — Launch + Coaching": 2900,
  "Operations Help — Essentials Launch": 3500,
  "Operations Help — Premium Launch": 5500,
};

function makeRef(): string {
  const d = new Date();
  const yymm = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `GW-${yymm}-${rand}`;
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
    console.error("[GW-CHECKOUT] TELR_STORE_ID or TELR_AUTH_KEY not set");
    return NextResponse.json({ ok: false, error: "Payment not configured" }, { status: 503 });
  }

  const ref = makeRef();
  const origin = str(b.origin) || "https://groundworks.ae";

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
      description: `GroundWorks — ${pkg}`,
    },
    return: {
      authorised: `${origin}/pay/success?ref=${ref}`,
      declined: `${origin}/pay/cancel?ref=${ref}&reason=declined`,
      cancelled: `${origin}/pay/cancel?ref=${ref}&reason=cancelled`,
    },
  };

  console.log("[GW-CHECKOUT]", JSON.stringify({ ref, pkg, amount, testMode }));

  let telrRes: Response;
  try {
    telrRes = await fetch("https://secure.telr.com/gateway/order.json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("[GW-CHECKOUT] Telr network error:", (e as Error).message);
    return NextResponse.json({ ok: false, error: "Payment gateway unreachable" }, { status: 502 });
  }

  const data = await telrRes.json().catch(() => null);

  if (!data?.order?.url) {
    console.error("[GW-CHECKOUT] Telr error response:", JSON.stringify(data));
    return NextResponse.json({ ok: false, error: "Payment gateway error" }, { status: 502 });
  }

  return NextResponse.json({ ok: true, ref, url: data.order.url });
}

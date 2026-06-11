import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // never cache lead submissions

// Generate a GroundWorks lead reference, e.g. GW-2406-7F3K
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

  const name = str(b.name);
  const phone = str(b.phone);
  const email = str(b.email);

  // Require a name and at least one contact method
  if (!name || (!phone && !email)) {
    return NextResponse.json({ ok: false, error: "Name and a phone or email are required." }, { status: 400 });
  }

  const ref = makeRef();

  // A "GroundWorks Lead" — a qualified owner with full property + analysis context,
  // delivered to the matched operator/agent under the GroundWorks brand.
  const lead = {
    ref,
    status: "New",
    submittedAt: new Date().toISOString(),
    source: "groundworks.ae",
    // Owner
    name, phone, email,
    // Who they want to reach
    target: str(b.target),
    targetType: str(b.targetType), // operator | agent
    // Property
    property: str(b.property),
    building: str(b.building),
    community: str(b.community),
    unitSize: str(b.unitSize),
    floor: str(b.floor),
    view: str(b.view),
    furnished: str(b.furnished),
    // GroundWorks analysis snapshot (what makes the lead qualified)
    recommendation: str(b.recommendation), // STR | LTR
    strNetPerYear: str(b.strNetPerYear),
    ltrPerYear: str(b.ltrPerYear),
    occupancy: str(b.occupancy),
    adr: str(b.adr),
  };

  const isService = lead.targetType === "service";

  // Always log — leads appear in Vercel runtime logs even before a webhook is wired.
  console.log(isService ? "[GW-SERVICE-LEAD]" : "[GW-LEAD]", JSON.stringify(lead));

  // Route to the right destination sheet:
  //  - Service enquiries (self-manage / operations)  -> LEAD_WEBHOOK_URL_SERVICES
  //  - Operator / agent introductions                -> LEAD_WEBHOOK_URL
  // Service leads fall back to the main webhook only if a dedicated one isn't configured.
  const webhook = isService
    ? (process.env.LEAD_WEBHOOK_URL_SERVICES || process.env.LEAD_WEBHOOK_URL)
    : process.env.LEAD_WEBHOOK_URL;

  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
    } catch (e) {
      console.error("[GW-LEAD] webhook forward failed:", (e as Error).message);
    }
  }

  return NextResponse.json({ ok: true, ref });
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Deluxe white-label leads → their own Google Sheet (DH_LEAD_WEBHOOK_URL),
// kept apart from the AssetIntel lead sheets and the leads table.
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user?.app_metadata?.org !== "deluxe") {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const b = await request.json().catch(() => null);
  const s = (v: unknown) => (v == null ? "" : String(v).trim());
  if (!b || !s(b.ownerName) || (!s(b.ownerPhone) && !s(b.ownerEmail))) {
    return NextResponse.json({ ok: false, error: "Owner name and a phone or email are required." }, { status: 400 });
  }

  const lead = {
    submittedAt: new Date().toISOString(),
    bdName: s(user.user_metadata?.full_name),
    bdEmail: s(user.email),
    ownerName: s(b.ownerName), ownerPhone: s(b.ownerPhone), ownerEmail: s(b.ownerEmail),
    property: s(b.property), building: s(b.building), unitSize: s(b.unitSize),
    floor: s(b.floor), view: s(b.view), furnished: s(b.furnished),
    recommendation: s(b.recommendation), strNetPerYear: s(b.strNetPerYear), ltrPerYear: s(b.ltrPerYear),
    occupancy: s(b.occupancy), adr: s(b.adr),
    notes: s(b.notes), reportUrl: s(b.reportUrl),
  };
  console.log("[DH-LEAD]", JSON.stringify(lead));

  const webhook = process.env.DH_LEAD_WEBHOOK_URL;
  if (!webhook) return NextResponse.json({ ok: false, error: "Lead sheet not configured" }, { status: 500 });
  try {
    const res = await fetch(webhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lead) });
    if (!res.ok) throw new Error(`webhook ${res.status}`);
  } catch (e) {
    console.error("[DH-LEAD] webhook failed:", (e as Error).message);
    return NextResponse.json({ ok: false }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}

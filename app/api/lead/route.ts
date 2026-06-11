import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // never cache lead submissions

interface LeadPayload {
  name?: string;
  phone?: string;
  email?: string;
  target?: string;   // operator/agent the owner wants to reach
  targetType?: string; // "operator" | "agent"
  property?: string; // building / unit context
  notes?: string;
}

export async function POST(request: Request) {
  let body: LeadPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const name = (body.name || "").trim();
  const phone = (body.phone || "").trim();
  const email = (body.email || "").trim();

  // Require a name and at least one contact method
  if (!name || (!phone && !email)) {
    return NextResponse.json({ ok: false, error: "Name and a phone or email are required." }, { status: 400 });
  }

  const lead = {
    name,
    phone,
    email,
    target: (body.target || "").trim(),
    targetType: (body.targetType || "").trim(),
    property: (body.property || "").trim(),
    notes: (body.notes || "").trim(),
    submittedAt: new Date().toISOString(),
    source: "groundworks.ae",
  };

  // Always log — leads show up in Vercel runtime logs even before a webhook is wired.
  console.log("[LEAD]", JSON.stringify(lead));

  // Forward to a destination if configured (Google Apps Script / Zapier / Make / Slack / email service).
  const webhook = process.env.LEAD_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
    } catch (e) {
      // Don't fail the user's submission if the webhook is down — the log still has it.
      console.error("[LEAD] webhook forward failed:", (e as Error).message);
    }
  }

  return NextResponse.json({ ok: true });
}

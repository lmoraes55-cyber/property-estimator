import { NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const FROM = process.env.RESEND_FROM ?? "AssetIntel <hello@assetintel.ae>";
const NOTIFY = process.env.REPORT_NOTIFY_EMAIL ?? "lmoraes55@gmail.com";

const PKG_PRICES: Record<string, { lo: number; hi: number; sub: string; tags: string[] }> = {
  ESSENTIAL: { lo: 12900, hi: 15900, sub: "Clean. Comfortable. Guest-Ready.", tags: ["Modern", "Warm Neutral"] },
  SIGNATURE: { lo: 17900, hi: 22900, sub: "Stylish. Balanced. Standout.", tags: ["Contemporary", "Sage & Taupe"] },
  LUXE: { lo: 27900, hi: 34900, sub: "Premium. Timeless. Unforgettable.", tags: ["Luxury", "Deep Neutrals"] },
};

function getSetupFee(raw: string): number {
  const u = (raw ?? "").toUpperCase().replace(/\s+/g, "");
  if (u === "STU" || u.includes("STUDIO")) return 1500;
  if (u.startsWith("1")) return 2000;
  if (u.startsWith("2")) return 2500;
  if (u.startsWith("3")) return 3000;
  if (u.startsWith("4")) return 4000;
  const n = parseInt(u.replace(/\D/g, ""));
  if (!isNaN(n) && n >= 5) return 5000;
  return 2000;
}

const fmt = (n: number) => `AED ${n.toLocaleString()}`;

export async function POST(request: Request) {
  let body: { email: string; name?: string; phone?: string; property?: string; unitSize: string; pkg: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { email, name, phone, property, unitSize, pkg } = body;
  const pkgInfo = PKG_PRICES[pkg];
  if (!email || !pkgInfo) {
    return NextResponse.json({ ok: false, error: "email and a valid pkg are required" }, { status: 400 });
  }

  const setupFee = getSetupFee(unitSize);
  const totalLo = pkgInfo.lo + setupFee;
  const totalHi = pkgInfo.hi + setupFee;
  const propertyLabel = property || "your property";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
<body style="margin:0;padding:0;background:#F7F9F8;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F9F8;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <tr><td style="background:linear-gradient(135deg,#1B5E4A 0%,#0F3E33 100%);padding:32px 40px;">
          <p style="margin:0;color:#B88A44;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">AssetIntel · Furnishing Quote</p>
          <h1 style="margin:8px 0 0;color:#fff;font-size:24px;font-weight:700;font-family:Georgia,serif;">${pkg.charAt(0) + pkg.slice(1).toLowerCase()} Package</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">${propertyLabel}${unitSize ? ` · ${unitSize}` : ""}</p>
        </td></tr>

        <tr><td style="padding:32px 40px 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F9F8;border-radius:12px;padding:20px;">
            <tr><td style="padding:0 4px 12px;">
              <p style="margin:0 0 3px;font-size:11px;color:#4E5D56;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Furniture Package</p>
              <p style="margin:0;font-size:15px;font-weight:700;color:#0F1D18;">${fmt(pkgInfo.lo)} – ${fmt(pkgInfo.hi)}</p>
            </td></tr>
            <tr><td style="padding:0 4px 12px;border-top:1px solid #E2E8E5;padding-top:12px;">
              <p style="margin:0 0 3px;font-size:11px;color:#4E5D56;text-transform:uppercase;letter-spacing:1px;font-weight:600;">AssetIntel Setup & Coordination Fee</p>
              <p style="margin:0;font-size:15px;font-weight:700;color:#0F1D18;">${fmt(setupFee)} <span style="font-weight:400;color:#4E5D56;font-size:12px;">(based on ${unitSize || "unit"} size)</span></p>
            </td></tr>
            <tr><td style="padding:0 4px;border-top:1px solid #E2E8E5;padding-top:12px;">
              <p style="margin:0 0 4px;font-size:11px;color:#4E5D56;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Estimated Total</p>
              <p style="margin:0;font-size:22px;font-weight:800;color:#1B5E4A;">${fmt(totalLo)} – ${fmt(totalHi)}</p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:24px 40px 0;">
          <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#0F1D18;text-transform:uppercase;letter-spacing:1px;">What AssetIntel Coordinates</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${[
              "Furniture package guidance", "Delivery coordination",
              "Building move-in permit guidance", "Supplier coordination",
              "STR design & styling support", "Setup planning with STR designer",
              "Guest-ready checklist review", "Operator & DET readiness guidance",
            ].map(item => `<tr><td style="padding:2px 0;font-size:13px;color:#555;">✓ ${item}</td></tr>`).join("")}
          </table>
        </td></tr>

        <tr><td style="padding:28px 40px 32px;">
          <p style="margin:0 0 6px;font-size:13px;color:#4E5D56;line-height:1.6;">
            Reply to this email or WhatsApp us to confirm and get started — no forms needed, we already have your details on file.
          </p>
          <p style="margin:16px 0 0;font-size:11px;color:#999;line-height:1.6;">
            This is an estimated quote. Final pricing may vary based on property size, building delivery rules, selected items, supplier availability, and final site requirements. AssetIntel does not guarantee final supplier pricing until the package and scope are confirmed.
          </p>
        </td></tr>

        <tr><td style="padding:0 40px 32px;border-top:1px solid #E2E8E5;">
          <p style="margin:24px 0 0;font-size:12px;color:#4E5D56;line-height:1.6;">
            Generated by <strong>AssetIntel</strong> · <a href="https://assetintel.ae" style="color:#1B5E4A;">assetintel.ae</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    await resend.emails.send({
      from: FROM,
      to: [email],
      replyTo: NOTIFY,
      subject: `Your ${pkg.charAt(0) + pkg.slice(1).toLowerCase()} furnishing quote · ${propertyLabel}`,
      html,
    });
    resend.emails.send({
      from: FROM,
      to: [NOTIFY],
      subject: `[Lead] Furnishing quote auto-sent to ${email} · ${propertyLabel}`,
      html: `<p>Furnishing quote (${pkg}, ${fmt(totalLo)}–${fmt(totalHi)}) auto-emailed to <strong>${email}</strong>${name ? ` (${name})` : ""}${phone ? ` · ${phone}` : ""} for <strong>${propertyLabel}</strong> (${unitSize}). No form was submitted — sent directly from their signed-in profile.</p>`,
    }).catch(() => {});
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[FURNISHING-QUOTE]", (e as Error).message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

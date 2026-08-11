import { NextResponse } from "next/server";
import { Resend } from "resend";
import { OPERATORS, rankOperators } from "@/lib/estimator";
import type { EstimatorOutput } from "@/lib/estimator";

export const dynamic = "force-dynamic";

const FROM = process.env.RESEND_FROM ?? "AssetIntel <hello@assetintel.ae>";
const NOTIFY = process.env.REPORT_NOTIFY_EMAIL ?? "lmoraes55@gmail.com";

export async function POST(request: Request) {
  let body: { email: string; result: EstimatorOutput };
  try { body = await request.json(); } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const { email, result } = body;
  if (!email || !result) return NextResponse.json({ ok: false }, { status: 400 });

  const ranked = rankOperators(result).slice(0, 3);
  const building = result.buildingInfo?.community
    ? `${result.propertyName} · ${result.buildingInfo.community}`
    : result.propertyName ?? "your property";

  const operatorCards = ranked.map((op, i) => `
    <tr><td style="padding:0 0 16px;">
      <div style="background:#F8F4EE;border-radius:12px;padding:20px 24px;border-left:3px solid ${i === 0 ? "#B88A44" : "#1B5E4A"};">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <p style="margin:0 0 2px;font-size:11px;font-weight:700;color:${i === 0 ? "#B88A44" : "#1B5E4A"};letter-spacing:1.5px;text-transform:uppercase;">${i === 0 ? "Top Match" : `Match ${i + 1}`}</p>
              <p style="margin:0 0 4px;font-size:17px;font-weight:700;color:#1A1A1A;">${op.name}</p>
              <p style="margin:0 0 12px;font-size:13px;color:#6B6B6B;">${op.tagline}</p>
            </td>
            <td style="text-align:right;vertical-align:top;white-space:nowrap;">
              <p style="margin:0;font-size:13px;font-weight:700;color:#1A1A1A;">⭐ ${op.googleRating}</p>
              <p style="margin:4px 0 0;font-size:11px;color:#6B6B6B;">${op.googleReviewCount} reviews</p>
            </td>
          </tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
          <tr>
            <td style="width:50%;padding-right:8px;">
              <div style="background:#fff;border-radius:8px;padding:10px 12px;">
                <p style="margin:0 0 2px;font-size:10px;color:#6B6B6B;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Commission</p>
                <p style="margin:0;font-size:14px;font-weight:700;color:#1A1A1A;">${op.commission[0]}–${op.commission[1]}%</p>
              </div>
            </td>
            <td style="width:50%;padding-left:8px;">
              <div style="background:#fff;border-radius:8px;padding:10px 12px;">
                <p style="margin:0 0 2px;font-size:10px;color:#6B6B6B;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Portfolio</p>
                <p style="margin:0;font-size:14px;font-weight:700;color:#1A1A1A;">${op.portfolio}+ units</p>
              </div>
            </td>
          </tr>
        </table>
        ${op.matchReasons.length > 0 ? `
        <div style="margin-bottom:12px;">
          ${op.matchReasons.slice(0, 2).map(r => `<p style="margin:0 0 4px;font-size:12px;color:#1B5E4A;">✓ ${r}</p>`).join("")}
        </div>` : ""}
        <p style="margin:0;font-size:12px;color:#6B6B6B;">
          <a href="https://${op.website}" style="color:#1B5E4A;font-weight:600;">${op.website}</a>
          ${op.email ? ` · <a href="mailto:${op.email}" style="color:#6B6B6B;">${op.email}</a>` : ""}
        </p>
      </div>
    </td></tr>`).join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:0;background:#F8F4EE;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F4EE;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <tr><td style="background:linear-gradient(135deg,#1B5E4A 0%,#0F3E33 100%);padding:32px 40px;">
          <p style="margin:0 0 6px;color:#B88A44;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">AssetIntel · Operator Matching</p>
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;font-family:Georgia,serif;">Your top ${ranked.length} operator matches</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">${building}</p>
        </td></tr>

        <tr><td style="padding:32px 40px 0;">
          <p style="margin:0 0 24px;font-size:14px;color:#6B6B6B;line-height:1.6;">
            Based on your property profile, unit type, and location, here are the operators we recommend reaching out to. Commission rates and terms are negotiable — always get at least 2 quotes.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">
            ${operatorCards}
          </table>
        </td></tr>

        <tr><td style="padding:24px 40px;">
          <div style="background:linear-gradient(135deg,#1B5E4A12 0%,#B88A4412 100%);border:1px solid #1B5E4A30;border-radius:12px;padding:20px 24px;">
            <p style="margin:0 0 6px;font-size:11px;color:#B88A44;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Need help choosing?</p>
            <p style="margin:0;font-size:14px;color:#1A1A1A;line-height:1.6;">
              Reply to this email and our team will help you negotiate the best terms and onboard with the right operator for your property.
            </p>
          </div>
        </td></tr>

        <tr><td style="padding:0 40px 32px;border-top:1px solid #E6E1D8;">
          <p style="margin:24px 0 0;font-size:12px;color:#6B6B6B;line-height:1.6;">
            Operator data is for reference only. Verify commission rates and terms directly with each operator before signing.
            <br/>Generated by <strong>AssetIntel</strong> · <a href="https://assetintel.ae" style="color:#1B5E4A;">assetintel.ae</a>
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
      subject: `Your operator matches · ${result.propertyName ?? "your property"}`,
      html,
    });
    // Internal notification
    resend.emails.send({
      from: FROM,
      to: [NOTIFY],
      subject: `[Lead] Operator match sent to ${email} · ${result.propertyName}`,
      html: `<p>Operator match email sent to <strong>${email}</strong> for <strong>${result.propertyName}</strong> (${result.unitSize}, ${result.buildingInfo?.community ?? ""}).</p>`,
    }).catch(() => {});
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[OPERATOR-MATCH]", (e as Error).message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

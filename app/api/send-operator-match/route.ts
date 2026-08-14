import { NextResponse } from "next/server";
import { Resend } from "resend";
import { rankOperators, Priority, MatchedOperator, PRIORITY_OPTIONS } from "@/lib/operator-match";

export const dynamic = "force-dynamic";

const FROM = process.env.RESEND_FROM ?? "AssetIntel <hello@assetintel.ae>";
const NOTIFY = process.env.REPORT_NOTIFY_EMAIL ?? "lmoraes55@gmail.com";

function feeLabel(op: MatchedOperator): string {
  if (op.managementFeePct == null) return "Not disclosed";
  return Array.isArray(op.managementFeePct)
    ? `${op.managementFeePct[0]}–${op.managementFeePct[1]}%`
    : `${op.managementFeePct}%`;
}

function firstName(name?: string): string {
  return (name ?? "").trim().split(/\s+/)[0] || "";
}

export async function POST(request: Request) {
  let body: { email: string; priorities: Priority[]; name?: string; buildingName?: string };
  try { body = await request.json(); } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const { email, priorities, name, buildingName } = body;
  if (!email) return NextResponse.json({ ok: false }, { status: 400 });

  const ranked = rankOperators(priorities ?? []).slice(0, 4);
  const greetingName = firstName(name);
  const priorityLabels = (priorities ?? [])
    .map(p => PRIORITY_OPTIONS.find(o => o.value === p)?.label)
    .filter(Boolean);

  const operatorCards = ranked.map((op, i) => `
    <tr><td style="padding:0 0 18px;">
      <div style="background:#FCFAF6;border-radius:14px;padding:24px 26px;border:1px solid #E6E1D8;${i === 0 ? "box-shadow:0 4px 18px rgba(184,138,68,0.14);border-color:#D9BC88;" : ""}">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <table cellpadding="0" cellspacing="0"><tr>
                <td style="background:${i === 0 ? "#B88A44" : "#1B5E4A"};border-radius:999px;padding:4px 12px;">
                  <p style="margin:0;font-size:10.5px;font-weight:700;color:#fff;letter-spacing:1.2px;text-transform:uppercase;">${i === 0 ? "★ Top Match" : `Match ${i + 1}`}</p>
                </td>
              </tr></table>
              <p style="margin:12px 0 2px;font-size:19px;font-weight:700;color:#17301F;font-family:Georgia,serif;">${op.name}</p>
              ${op.name === "Deluxe Holiday Homes" ? `<p style="margin:0 0 6px;font-size:11px;color:#B3261E;font-weight:600;">⚠ AssetIntel's affiliated operator — disclosed for transparency</p>` : ""}
              ${op.quant?.avgRating ? `<p style="margin:0 0 14px;font-size:12.5px;color:#7D6338;">⭐ ${op.quant.avgRating} avg rating · ${op.quant.listings} listings tracked (Airbtics)</p>` : `<p style="margin:0 0 14px;"></p>`}
            </td>
          </tr>
        </table>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
          <tr>
            <td style="width:50%;padding-right:8px;">
              <div style="background:#fff;border-radius:10px;padding:12px 14px;border:1px solid #EFEAE0;">
                <p style="margin:0 0 3px;font-size:10px;color:#7D6338;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Management Fee</p>
                <p style="margin:0;font-size:15px;font-weight:700;color:#17301F;">${feeLabel(op)}</p>
              </div>
            </td>
            <td style="width:50%;padding-left:8px;">
              <div style="background:#fff;border-radius:10px;padding:12px 14px;border:1px solid #EFEAE0;">
                <p style="margin:0 0 3px;font-size:10px;color:#7D6338;text-transform:uppercase;letter-spacing:1px;font-weight:700;">Portfolio</p>
                <p style="margin:0;font-size:15px;font-weight:700;color:#17301F;">${op.displayPortfolio}</p>
              </div>
            </td>
          </tr>
        </table>
        ${op.matchReasons.length > 0 ? `
        <div style="margin-bottom:10px;">
          ${op.matchReasons.slice(0, 3).map(r => `<p style="margin:0 0 5px;font-size:12.5px;color:#1B5E4A;">✓ &nbsp;${r}</p>`).join("")}
        </div>` : ""}
        ${op.lockInPeriod || op.earlyTerminationFee ? `<p style="margin:10px 0 0;padding-top:10px;border-top:1px solid #EFEAE0;font-size:11.5px;color:#6B6B6B;">Contract: ${op.lockInPeriod ?? "not disclosed"}${op.earlyTerminationFee ? ` · Early exit: ${op.earlyTerminationFee}` : ""}</p>` : ""}
      </div>
    </td></tr>`).join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width"/></head>
<body style="margin:0;padding:0;background:#F1EDE3;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F1EDE3;padding:48px 0;">
    <tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 30px 70px rgba(23,48,31,0.16);">

        <tr><td style="background:linear-gradient(135deg,#17301F 0%,#0B2118 100%);padding:40px 44px 34px;position:relative;">
          <p style="margin:0 0 10px;color:#D9BC88;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;font-family:system-ui,-apple-system,sans-serif;">AssetIntel · Private Operator Match</p>
          <h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;font-family:Georgia,serif;line-height:1.3;">${greetingName ? `${greetingName}, here` : "Here"} are your matched STR operators</h1>
          ${buildingName ? `<p style="margin:10px 0 0;color:rgba(255,255,255,0.7);font-size:13.5px;font-family:system-ui,-apple-system,sans-serif;">${buildingName}</p>` : ""}
        </td></tr>

        <tr><td style="padding:36px 44px 0;font-family:system-ui,-apple-system,sans-serif;">
          <p style="margin:0 0 6px;font-size:14.5px;color:#1A1A1A;line-height:1.65;">
            ${greetingName ? `Dear ${greetingName},` : "Hello,"}
          </p>
          <p style="margin:0 0 20px;font-size:14.5px;color:#4A4A4A;line-height:1.7;">
            Based on what you told us matters most${priorityLabels.length ? ` — <strong style="color:#17301F;">${priorityLabels.join(", ")}</strong>` : ""} — our team has hand-matched the operators below from AssetIntel's own outreach and, where noted, their signed contracts. This shortlist is private to you.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
            ${operatorCards}
          </table>
        </td></tr>

        <tr><td style="padding:8px 44px 0;font-family:system-ui,-apple-system,sans-serif;">
          <div style="background:linear-gradient(135deg,rgba(23,48,31,0.05) 0%,rgba(184,138,68,0.08) 100%);border:1px solid rgba(217,188,136,0.35);border-radius:14px;padding:22px 26px;">
            <p style="margin:0 0 6px;font-size:11px;color:#B88A44;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Need help choosing?</p>
            <p style="margin:0;font-size:14px;color:#1A1A1A;line-height:1.65;">
              Reply directly to this email${greetingName ? `, ${greetingName}` : ""} — our team will help you negotiate terms and onboard with the right operator for your property, at no cost to you.
            </p>
          </div>
        </td></tr>

        <tr><td style="padding:28px 44px 36px;font-family:system-ui,-apple-system,sans-serif;">
          <div style="height:1px;background:#E6E1D8;margin-bottom:20px;"></div>
          <p style="margin:0;font-size:11.5px;color:#8A8A8A;line-height:1.7;">
            Operator data is sourced from AssetIntel's direct outreach, published Airbtics figures, and (where noted) signed operator contracts — not guaranteed current. Always verify commission rates and terms directly with the operator before signing.
          </p>
          <p style="margin:16px 0 0;font-size:11.5px;color:#8A8A8A;">
            With regards,<br/>
            <strong style="color:#17301F;">The AssetIntel Team</strong><br/>
            <a href="https://assetintel.ae" style="color:#1B5E4A;text-decoration:none;">assetintel.ae</a>
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
      subject: `${greetingName ? `${greetingName}, your` : "Your"} private operator matches${buildingName ? ` · ${buildingName}` : ""}`,
      html,
    });
    resend.emails.send({
      from: FROM,
      to: [NOTIFY],
      subject: `[Lead] Operator match sent to ${name ? `${name} <${email}>` : email}`,
      html: `<p>Operator match email sent to <strong>${name ? `${name} (${email})` : email}</strong>${buildingName ? ` for <strong>${buildingName}</strong>` : ""}. Priorities: ${(priorities ?? []).join(", ") || "none selected"}.</p>`,
    }).catch(() => {});
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[OPERATOR-MATCH]", (e as Error).message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

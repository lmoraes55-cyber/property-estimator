import { NextResponse } from "next/server";
import { Resend } from "resend";
import { jsPDF } from "jspdf";
import { rankOperators, Priority, MatchedOperator, PRIORITY_OPTIONS } from "@/lib/operator-match";
import { createServiceClient } from "@/lib/supabase/service";

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

// Built server-side (jsPDF ships a Node build, no canvas/DOM dependency) rather than
// client-side like the sub-leasing report's PDF -- rankOperators() and the underlying
// contract/fee data it draws on are deliberately kept server-only, never shipped to
// the browser, so the PDF has to be assembled here too.
function buildOperatorMatchPDF(params: {
  ranked: MatchedOperator[]; greetingName: string; buildingName?: string; priorityLabels: (string | undefined)[];
}): string {
  const { ranked, greetingName, buildingName, priorityLabels } = params;
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const margin = 48;
  let y = 0;

  // Header band
  doc.setFillColor(23, 48, 31);
  doc.rect(0, 0, W, 90, "F");
  doc.setTextColor(217, 188, 136);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("ASSETINTEL · PRIVATE OPERATOR MATCH", margin, 30);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text(`${greetingName ? `${greetingName}, here` : "Here"} are your matches`, margin, 56);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${buildingName ? `${buildingName} · ` : ""}Generated ${new Date().toLocaleDateString("en-AE")}`,
    margin, 76
  );
  y = 112;

  if (priorityLabels.length > 0) {
    doc.setFontSize(9);
    doc.setTextColor(107, 107, 107);
    const lines = doc.splitTextToSize(`Matched on what matters most to you: ${priorityLabels.join(", ")}.`, W - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 12 + 14;
  }

  ranked.forEach((op, i) => {
    const cardH = 108;
    if (y + cardH > doc.internal.pageSize.getHeight() - 60) { doc.addPage(); y = 48; }

    doc.setFillColor(252, 250, 246);
    doc.setDrawColor(230, 225, 216);
    doc.roundedRect(margin, y, W - margin * 2, cardH, 8, 8, "FD");

    // Badge
    const badgeText = i === 0 ? "TOP MATCH" : `MATCH ${i + 1}`;
    doc.setFillColor(i === 0 ? 184 : 27, i === 0 ? 138 : 94, i === 0 ? 68 : 74);
    const badgeW = doc.getTextWidth(badgeText) + 16;
    doc.roundedRect(margin + 14, y + 12, badgeW, 16, 8, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text(badgeText, margin + 14 + 8, y + 22.5);

    // Name
    doc.setTextColor(23, 48, 31);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(op.name, margin + 14, y + 46);

    // Fee / portfolio
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(125, 99, 56);
    doc.text("MANAGEMENT FEE", margin + 14, y + 64);
    doc.text("PORTFOLIO", margin + 220, y + 64);
    doc.setFontSize(11);
    doc.setTextColor(23, 48, 31);
    doc.text(feeLabel(op), margin + 14, y + 78);
    doc.text(op.displayPortfolio, margin + 220, y + 78);

    // Match reasons
    if (op.matchReasons.length > 0) {
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(27, 94, 74);
      doc.text(op.matchReasons.slice(0, 2).join("  ·  "), margin + 14, y + 96);
    }

    y += cardH + 14;
  });

  y += 6;
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  const disclaimer = "Operator data is sourced from AssetIntel's direct outreach, published Airbtics figures, and (where noted) signed operator contracts -- not guaranteed current. Always verify commission rates and terms directly with the operator before signing.";
  const lines = doc.splitTextToSize(disclaimer, W - margin * 2);
  doc.text(lines, margin, y);

  // jsPDF's datauristring includes a `;filename=...;` segment before `base64,`
  // (e.g. "data:application/pdf;filename=generated.pdf;base64,...") -- match up to
  // the FIRST `;base64,` occurrence rather than assuming a single segment, or the
  // whole prefix stays stuck onto the file and corrupts it.
  return doc.output("datauristring").replace(/^data:.*?;base64,/, "");
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
              ${op.verifiedListingCount?.rating
                ? `<p style="margin:0 0 14px;font-size:12.5px;color:#7D6338;">⭐ ${op.verifiedListingCount.rating} on Airbnb${op.verifiedListingCount.reviewCount ? ` · ${op.verifiedListingCount.reviewCount.toLocaleString()} reviews` : ""}</p>`
                : op.quant?.avgRating
                ? `<p style="margin:0 0 14px;font-size:12.5px;color:#7D6338;">⭐ ${op.quant.avgRating} avg rating · ${op.quant.listings} listings tracked (Airbtics)</p>`
                : `<p style="margin:0 0 14px;"></p>`}
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
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width"/>
<meta name="color-scheme" content="light"/>
<meta name="supported-color-schemes" content="light"/>
</head>
<body style="margin:0;padding:0;background:#F1EDE3;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F1EDE3;padding:48px 0;">
    <tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 30px 70px rgba(23,48,31,0.16);">

        <!-- Light header, not dark-green-with-white-text: Gmail's mobile-app automatic
             dark mode recolors message text unpredictably and isn't reliably
             controllable with [data-ogsc]/[data-ogsb] CSS hooks on iOS -- a dark
             background with white text risked Gmail flipping the text dark too,
             leaving it unreadable against the (unchanged) dark background. A light
             background with dark brand-color text has nothing for that heuristic to
             break: light-on-light isn't a pairing Gmail "fixes" into dark-on-dark. -->
        <tr><td bgcolor="#FBF7EF" style="background:#FBF7EF;padding:40px 44px 34px;border-bottom:1px solid #E6E1D8;">
          <p style="margin:0 0 10px;color:#8B6F3F;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;font-family:system-ui,-apple-system,sans-serif;">AssetIntel · Private Operator Match</p>
          <h1 style="margin:0;color:#17301F;font-size:26px;font-weight:700;font-family:Georgia,serif;line-height:1.3;">${greetingName ? `${greetingName}, here` : "Here"} are your matched STR operators</h1>
          ${buildingName ? `<p style="margin:10px 0 0;color:#6B6B6B;font-size:13.5px;font-family:system-ui,-apple-system,sans-serif;">${buildingName}</p>` : ""}
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

  let pdfBase64: string | null = null;
  try {
    pdfBase64 = buildOperatorMatchPDF({ ranked, greetingName, buildingName, priorityLabels });
  } catch (e) {
    // A PDF build failure shouldn't block the email itself — send without the attachment.
    console.error("[OPERATOR-MATCH-PDF]", (e as Error).message);
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    await resend.emails.send({
      from: FROM,
      to: [email],
      replyTo: NOTIFY,
      subject: `${greetingName ? `${greetingName}, your` : "Your"} private operator matches${buildingName ? ` · ${buildingName}` : ""}`,
      html,
      attachments: pdfBase64
        ? [{ filename: "AssetIntel-Operator-Match.pdf", content: pdfBase64 }]
        : undefined,
    });

    // Best-effort report log for the admin panel — never blocks the email send.
    try {
      const logSupabase = createServiceClient();
      await logSupabase.from("report_log").insert({
        report_type: "operator_match",
        name: name || null,
        email,
        building_name: buildingName || null,
        params: { priorities: priorities ?? [] },
      });
    } catch (e) {
      console.error("[OPERATOR-MATCH] report_log insert failed:", (e as Error).message);
    }

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

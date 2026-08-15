import { NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const FROM = process.env.RESEND_FROM ?? "AssetIntel <reports@assetintel.ae>";
const NOTIFY = process.env.REPORT_NOTIFY_EMAIL ?? "lmoraes55@gmail.com";

export async function POST(request: Request) {
  let body: { email: string; pdfBase64: string; summary: Record<string, string> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const { email, pdfBase64, summary } = body;
  if (!email || !pdfBase64) {
    return NextResponse.json({ ok: false, error: "email and pdfBase64 required" }, { status: 400 });
  }

  // Strip data-URL prefix if present. jsPDF's datauristring includes a
  // `;filename=...;` segment before `base64,` (e.g.
  // "data:application/pdf;filename=generated.pdf;base64,...") -- a regex that only
  // allows one semicolon segment before `base64,` doesn't match that, leaving the
  // whole prefix stuck onto the file and corrupting it. Match up to the FIRST
  // `;base64,` occurrence instead, however many segments precede it.
  const base64 = pdfBase64.replace(/^data:.*?;base64,/, "");

  const {
    building = "your property",
    unitSize = "",
    recommendation = "",
    strNetPerYear = "",
    adr = "",
    occupancy = "",
    riskLevel = "",
    breakEvenOcc = "",
  } = summary ?? {};

  const recLabel = recommendation === "str_viable" ? "STR Viable" : recommendation === "not_recommended" ? "Not Recommended" : recommendation;

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width" />
<meta name="color-scheme" content="light"/>
<meta name="supported-color-schemes" content="light"/>
<style>
  :root { color-scheme: light; supported-color-schemes: light; }
  /* Same dark-header + white-text pattern as the operator-match email, which
     Gmail's automatic dark mode (web/Android via [data-ogsc], iOS via
     [data-ogsb]) can recolor into unreadable dark-on-dark — force the literal
     authored colors back for both hooks. */
  [data-ogsc] .ai-header-bg, [data-ogsb] .ai-header-bg { background: #1B5E4A !important; }
  [data-ogsc] .ai-header-eyebrow, [data-ogsb] .ai-header-eyebrow { color: #B88A44 !important; }
  [data-ogsc] .ai-header-title, [data-ogsb] .ai-header-title { color: #ffffff !important; }
</style>
</head>
<body style="margin:0;padding:0;background:#F8F4EE;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F4EE;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr><td class="ai-header-bg" bgcolor="#1B5E4A" style="background:linear-gradient(135deg,#1B5E4A 0%,#0F3E33 100%);padding:32px 40px;">
          <p class="ai-header-eyebrow" style="margin:0;color:#B88A44;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">AssetIntel · STR Sub-Leasing Report</p>
          <h1 class="ai-header-title" style="margin:8px 0 0;color:#FEFEFE;font-size:24px;font-weight:700;font-family:Georgia,serif;">${building}${unitSize ? ` · ${unitSize}` : ""}</h1>
        </td></tr>

        <!-- Key metrics -->
        <tr><td style="padding:32px 40px 0;">
          <p style="margin:0 0 20px;font-size:14px;color:#6B6B6B;line-height:1.6;">Your STR sub-leasing risk analysis is attached as a PDF. Here's a quick summary:</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:0 8px 16px 0;width:50%;vertical-align:top;">
                <div style="background:#F8F4EE;border-radius:10px;padding:16px;">
                  <p style="margin:0 0 4px;font-size:11px;color:#6B6B6B;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Verdict</p>
                  <p style="margin:0;font-size:18px;font-weight:700;color:#1B5E4A;">${recLabel || "—"}</p>
                </div>
              </td>
              <td style="padding:0 0 16px 8px;width:50%;vertical-align:top;">
                <div style="background:#F8F4EE;border-radius:10px;padding:16px;">
                  <p style="margin:0 0 4px;font-size:11px;color:#6B6B6B;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Risk Level</p>
                  <p style="margin:0;font-size:18px;font-weight:700;color:#1A1A1A;">${riskLevel || "—"}</p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 8px 16px 0;vertical-align:top;">
                <div style="background:#F8F4EE;border-radius:10px;padding:16px;">
                  <p style="margin:0 0 4px;font-size:11px;color:#6B6B6B;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Annual Net Profit</p>
                  <p style="margin:0;font-size:18px;font-weight:700;color:#1A1A1A;">AED ${strNetPerYear || "—"}</p>
                </div>
              </td>
              <td style="padding:0 0 16px 8px;vertical-align:top;">
                <div style="background:#F8F4EE;border-radius:10px;padding:16px;">
                  <p style="margin:0 0 4px;font-size:11px;color:#6B6B6B;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Market ADR</p>
                  <p style="margin:0;font-size:18px;font-weight:700;color:#1A1A1A;">AED ${adr || "—"}/night</p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 8px 0 0;vertical-align:top;">
                <div style="background:#F8F4EE;border-radius:10px;padding:16px;">
                  <p style="margin:0 0 4px;font-size:11px;color:#6B6B6B;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Avg Occupancy</p>
                  <p style="margin:0;font-size:18px;font-weight:700;color:#1A1A1A;">${occupancy || "—"}</p>
                </div>
              </td>
              <td style="padding:0 0 0 8px;vertical-align:top;">
                <div style="background:#F8F4EE;border-radius:10px;padding:16px;">
                  <p style="margin:0 0 4px;font-size:11px;color:#6B6B6B;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Break-Even Occupancy</p>
                  <p style="margin:0;font-size:18px;font-weight:700;color:#1A1A1A;">${breakEvenOcc || "—"}</p>
                </div>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Operator intro -->
        <tr><td style="padding:32px 40px;">
          <div style="background:linear-gradient(135deg,#1B5E4A12 0%,#B88A4412 100%);border:1px solid #1B5E4A30;border-radius:12px;padding:24px;">
            <p style="margin:0 0 8px;font-size:11px;color:#B88A44;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Operator Matching</p>
            <h2 style="margin:0 0 12px;font-size:18px;font-weight:700;color:#1B5E4A;font-family:Georgia,serif;">We'll find your best operator fit</h2>
            <p style="margin:0;font-size:14px;color:#1A1A1A;line-height:1.7;">
              Based on your property profile and this analysis, our team will match you with vetted STR operators who specialise in ${building ? building.split(" ").slice(-2).join(" ") : "your area"}.
              You'll receive a shortlist of 2–3 operators with their fees, strengths, and coverage — no commitment required.
            </p>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:0 40px 32px;border-top:1px solid #E6E1D8;">
          <p style="margin:24px 0 0;font-size:12px;color:#6B6B6B;line-height:1.6;">
            This report was generated by <strong>AssetIntel</strong> — Dubai's property intelligence platform.<br/>
            Report data is modelled and for indicative purposes only. Actual STR performance depends on management quality, market conditions, and regulatory approval.
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
      subject: `Your STR Sub-Leasing Report · ${building}`,
      html: htmlBody,
      attachments: [
        {
          filename: `AssetIntel-STR-Report-${building.replace(/[^a-z0-9]/gi, "-")}.pdf`,
          content: base64,
        },
      ],
    });

    // Notify internal inbox
    await resend.emails.send({
      from: FROM,
      to: [NOTIFY],
      subject: `[Lead] STR Report sent to ${email} · ${building} ${unitSize}`,
      html: `<p>Report delivered to <strong>${email}</strong> for <strong>${building} ${unitSize}</strong>.</p><p>Recommendation: ${recLabel} · Risk: ${riskLevel} · Net: AED ${strNetPerYear}/yr</p>`,
    }).catch(() => {});

    console.log("[AI-REPORT]", { email, building, unitSize, recommendation });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[AI-REPORT] send failed:", (e as Error).message);
    return NextResponse.json({ ok: false, error: "Send failed" }, { status: 500 });
  }
}

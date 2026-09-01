import { NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const FROM = process.env.RESEND_FROM ?? "AssetIntel <hello@assetintel.ae>";

export async function POST(request: Request) {
  let body: { email: string; firstName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { email, firstName } = body;
  if (!email) return NextResponse.json({ ok: false }, { status: 400 });

  const name = firstName || "there";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /></head>
<body style="margin:0;padding:0;background:#F7F9F8;font-family:system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F7F9F8;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1B5E4A 0%,#0F3E33 100%);padding:36px 40px;">
          <p style="margin:0 0 6px;color:#B88A44;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Welcome to AssetIntel</p>
          <h1 style="margin:0;color:#fff;font-size:26px;font-weight:700;font-family:Georgia,serif;">Property intelligence,<br/>smarter decisions.</h1>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:36px 40px 0;">
          <p style="margin:0 0 20px;font-size:15px;color:#2A2A2A;line-height:1.7;">Hi ${name},</p>
          <p style="margin:0 0 20px;font-size:15px;color:#2A2A2A;line-height:1.7;">
            You now have free access to AssetIntel's Owner Dashboard — Dubai's STR intelligence platform built for property owners and landlords.
          </p>

          <!-- Feature tiles -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td style="padding:0 8px 12px 0;width:50%;vertical-align:top;">
                <div style="background:#F7F9F8;border-radius:10px;padding:16px;">
                  <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#1B5E4A;">📊 STR Rental Analysis</p>
                  <p style="margin:0;font-size:12px;color:#4E5D56;line-height:1.5;">Compare STR vs LTR returns for your exact unit.</p>
                </div>
              </td>
              <td style="padding:0 0 12px 8px;width:50%;vertical-align:top;">
                <div style="background:#F7F9F8;border-radius:10px;padding:16px;">
                  <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#1B5E4A;">🏙️ Market Intelligence</p>
                  <p style="margin:0;font-size:12px;color:#4E5D56;line-height:1.5;">Live Dubai STR market data and investment research.</p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 8px 0 0;vertical-align:top;">
                <div style="background:#F7F9F8;border-radius:10px;padding:16px;">
                  <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#1B5E4A;">📁 Saved Reports</p>
                  <p style="margin:0;font-size:12px;color:#4E5D56;line-height:1.5;">All your property reports in one place, always accessible.</p>
                </div>
              </td>
              <td style="padding:0 0 0 8px;vertical-align:top;">
                <div style="background:#F7F9F8;border-radius:10px;padding:16px;">
                  <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#1B5E4A;">🛎️ Free Services</p>
                  <p style="margin:0;font-size:12px;color:#4E5D56;line-height:1.5;">Furnishing, legal, operator matching, and more.</p>
                </div>
              </td>
            </tr>
          </table>

          <!-- CTA -->
          <div style="text-align:center;margin-bottom:32px;">
            <a href="https://assetintel.ae/dashboard"
               style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#1B5E4A 0%,#2D7A5E 100%);color:#fff;font-size:14px;font-weight:700;text-decoration:none;border-radius:999px;letter-spacing:0.02em;">
              Go to My Dashboard →
            </a>
          </div>

          <!-- Start with analysis -->
          <div style="background:linear-gradient(135deg,#1B5E4A12 0%,#B88A4412 100%);border:1px solid #1B5E4A30;border-radius:12px;padding:20px 24px;margin-bottom:32px;">
            <p style="margin:0 0 6px;font-size:12px;color:#B88A44;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Quick Start</p>
            <p style="margin:0;font-size:14px;color:#0F1D18;line-height:1.6;">
              Run a free <a href="https://assetintel.ae/estimator" style="color:#1B5E4A;font-weight:600;">Rental Strategy Analysis</a> on your property to see whether STR or LTR will earn you more — with month-by-month projections.
            </p>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:0 40px 32px;border-top:1px solid #E2E8E5;">
          <p style="margin:24px 0 0;font-size:12px;color:#4E5D56;line-height:1.6;">
            You're receiving this because you created an account on <strong>assetintel.ae</strong>.<br/>
            Questions? Reply to this email and we'll get back to you.
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
      subject: "Welcome to AssetIntel — your owner dashboard is ready",
      html,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[WELCOME]", (e as Error).message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

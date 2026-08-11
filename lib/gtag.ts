// Google Ads / GA4 tracking — no-ops until the env vars below are set on Vercel.
// GA4:         NEXT_PUBLIC_GA_MEASUREMENT_ID       (format: G-XXXXXXXXXX)
// Google Ads:  NEXT_PUBLIC_GOOGLE_ADS_ID           (format: AW-XXXXXXXXX)
//              NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL   (conversion label for a qualified lead submit)
//              NEXT_PUBLIC_GOOGLE_ADS_ESTIMATE_LABEL (conversion label for "get my estimate" clicks)

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? "";
const ADS_LEAD_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL ?? "";
const ADS_ESTIMATE_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_ESTIMATE_LABEL ?? "";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function fireConversion(label: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.gtag || !GOOGLE_ADS_ID || !label) return;
  window.gtag("event", "conversion", { send_to: `${GOOGLE_ADS_ID}/${label}`, ...params });
}

/** Fires when a visitor completes the landing-page "get my estimate" step (micro-conversion). */
export function trackEstimateRequested(params?: Record<string, unknown>) {
  fireConversion(ADS_ESTIMATE_LABEL, params);
}

/** Fires when a visitor submits full contact details as a qualified lead (macro-conversion). */
export function trackLeadSubmitted(params?: Record<string, unknown>) {
  fireConversion(ADS_LEAD_LABEL, params);
}

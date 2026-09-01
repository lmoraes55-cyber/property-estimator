// AssetIntel Color System
// Premium Dubai property intelligence platform
//
// Direction: the brand stays forest green + bronze; the NEUTRALS moved from
// warm ivory to a cool, faintly green-biased near-white. Warm ivory competed
// with charts and tables for attention — a data product needs a quieter ground
// so the figures carry the page. The greys are biased toward the brand hue
// rather than pure grey, so they read as chosen rather than inherited.
//
// Every text step below is AA (4.5:1) for SMALL text on both --bgMain and
// white. The previous textLight (#66756D) was 2.99:1 and failed at the 10-12px
// sizes it is actually used at, in ~128 places.

export const colors = {
  // Primary Brand (Deep Forest Green) — unchanged
  primary: "#1B5E4A",
  primaryHover: "#0F3E33",
  primaryLight: "#2A7A62",

  // Backgrounds (cool near-white, faint green bias)
  bgMain: "#F7F9F8",          // page ground
  bgSection: "#FFFFFF",       // card / section surface
  bgSage: "#EDF3F0",          // soft sage tint for trust/advisory sections
  bgWhite: "#FFFFFF",
  bgInk: "#0F1D18",           // deep forest-ink panel (insight callouts)

  // Secondary / Accent (Premium Bronze/Gold) — unchanged
  secondary: "#B88A44",
  secondaryLight: "#D4A574",
  secondaryDark: "#8B6F3F",
  secondaryText: "#7D6338",   // 5.35:1 on bgMain — AA for small text
  secondaryOnDark: "#E5C9AB", // AA bronze for text/links on dark-green backgrounds

  // Text — three steps, each AA for small text, each visibly distinct
  textMain: "#0F1D18",        // 16.42:1
  textMuted: "#4E5D56",       //  6.57:1
  textLight: "#66756D",       //  4.59:1

  // UI Elements
  border: "#E2E8E5",
  borderStrong: "#CFD9D4",
  borderSage: "#C6D8CF",
  mutedGreen: "#4A7A68",

  // Functional
  success: "#12876A",
  warning: "#B88A44",
  error: "#C75A5A",           // 3.94:1 — large text / UI only, pair with an icon
  overlay: "rgba(0, 0, 0, 0.5)",

  // Chart series. Fixed order, never cycled. Validated for the OKLCH lightness
  // band, chroma floor, colourblind separation and contrast against BOTH
  // surfaces — do not substitute by eye. `seriesDark` are separately validated
  // steps for dark surfaces, not an automatic lightening of the light set.
  series: ["#12876A", "#D08A12", "#2E6FC4", "#A03D8F"],
  seriesDark: ["#189270", "#BC841A", "#3D78CC", "#AC4794"],

  // Shadows — flattened. Separation now comes from surface tint and border,
  // not elevation; the old lifted cards read as document chrome rather than
  // instrument panel.
  shadowSm: "0 1px 2px rgba(15,29,24,.03)",
  shadowMd: "0 2px 8px rgba(15,29,24,.05)",
  shadowLg: "0 8px 24px rgba(15,29,24,.06)",
};

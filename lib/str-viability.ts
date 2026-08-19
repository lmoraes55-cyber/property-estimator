/**
 * STR VIABILITY GATE
 *
 * Flags properties unlikely to perform well as short-term rentals.
 * Used to show a warning on the report — does NOT block the estimate.
 *
 * Two types of flags:
 *   1. AREA_EXCLUSIONS  — entire communities with low STR demand / tourist draw
 *   2. BUILDING_FLAGS   — specific buildings in otherwise prime areas that
 *                         underperform due to age, layout, or low PSF rental yield
 */

export type STRViabilityResult =
  | { viable: true }
  | { viable: false; reason: string; type: "area" | "building" };

// Communities where STR is generally not viable:
// low tourist footfall, budget traveller mismatch, or oversupply of hotels
const AREA_EXCLUSIONS: Record<string, string> = {
  // Leon's list
  "Karama":             "Older residential area with very low STR demand and tourist footfall.",
  "Deira":              "Budget-hotel dominated market; STR competes poorly on price and amenities.",
  "International City": "Distance from attractions and community profile make STR unfeasible.",
  "Dubai South":        "Primarily worker accommodation; tourist demand is negligible.",
  // Suggested additions
  "Discovery Gardens":  "Older low-cost stock; below minimum rent threshold for viable STR.",
  "Al Quoz":            "Industrial/mixed-use area with no leisure or tourism draw.",
  "Mirdif":             "Suburban family community; not a tourist or short-stay destination.",
  "Al Nahda":           "Budget residential area with insufficient nightly rate potential.",
  "Dubai Investment Park": "Far from attractions; primarily industrial and residential workers.",
  "Uptown Motor City":  "Isolated suburban community; low STR occupancy reported.",
  "Sports City":        "Transient demand only during events; base occupancy is too low.",
  "Al Warsan":          "Budget residential; STR market essentially non-existent.",
  "Muhaisnah":          "No tourism draw; primarily long-term worker accommodation.",
  "Al Quoz Industrial": "Industrial zone; not suitable for STR.",
  "Jumeirah Village Triangle": "Low STR demand; JVC performs better but JVT lacks the same infrastructure.",
};

export function checkSTRViability(
  buildingName: string,
  community: string,
): STRViabilityResult {
  for (const [area, reason] of Object.entries(AREA_EXCLUSIONS)) {
    if (
      community.toLowerCase().includes(area.toLowerCase()) ||
      area.toLowerCase().includes(community.toLowerCase())
    ) {
      return { viable: false, reason, type: "area" };
    }
  }

  return { viable: true };
}

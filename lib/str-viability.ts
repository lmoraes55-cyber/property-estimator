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
  "Motor City":         "Isolated suburban community; low STR occupancy reported.",
  "Sports City":        "Transient demand only during events; base occupancy is too low.",
  "Al Warsan":          "Budget residential; STR market essentially non-existent.",
  "Muhaisnah":          "No tourism draw; primarily long-term worker accommodation.",
  "Al Quoz Industrial": "Industrial zone; not suitable for STR.",
  "Jumeirah Village Triangle": "Low STR demand; JVC performs better but JVT lacks the same infrastructure.",
};

// Specific buildings flagged as poor STR candidates despite being in prime areas.
// Reasons: dated stock, small/awkward layouts, no amenities, very low rent PSF vs area avg.
const BUILDING_FLAGS: Record<string, string> = {
  // Marina — old towers with dated interiors, small units, high maintenance costs
  "Sulafa Tower":        "Older Marina tower; low rental PSF (71 vs 110 area avg) indicates dated stock.",
  "The Zen":             "Below-average Marina PSF; limited amenities reduce STR appeal.",
  "Torch Tower":         "Age and layout of units typically underperform for STR nightly rates.",
  "Elite Residence":     "Very tall tower but older fit-out; STR returns lag newer Marina stock.",
  "Princess Tower":      "One of the tallest but older finish; STR market prefers newer builds.",
  "Marina Suites":       "Small dated units; below Marina average PSF for LTR and STR.",
  "Escan Marina Tower":  "Low PSF (99 vs 110 area avg); older building with limited amenities.",
  "MAG218":              "Below-average Marina PSF; management-intensive for STR.",
  "Royal Oceanic Tower": "Dated interiors; PSF consistently below Marina baseline.",
  // Business Bay — older/lower-spec stock
  "Burj Al Noor":        "Low PSF for Business Bay; older spec building not competitive for STR.",
  "Safeer Tower 1":      "Below Business Bay average; older stock with limited STR demand.",
  // JLT — generally lower STR viability
  "Indigo Tower":        "Very low PSF (50) despite JLT location; STR demand in JLT is limited.",
  "Global Lake View":    "Low PSF and older stock; JLT STR market is challenging overall.",
  "Dubai Star":          "Low PSF; JLT buildings generally underperform for STR vs Marina/Downtown.",
  "Dubai Arch Tower":    "Low PSF for the area; not a sought-after STR address.",
  "Saba Tower 3":        "Older JLT tower; STR demand in JLT is limited to corporate travellers.",
};

export function checkSTRViability(
  buildingName: string,
  community: string,
): STRViabilityResult {
  // Check area first
  for (const [area, reason] of Object.entries(AREA_EXCLUSIONS)) {
    if (
      community.toLowerCase().includes(area.toLowerCase()) ||
      area.toLowerCase().includes(community.toLowerCase())
    ) {
      return { viable: false, reason, type: "area" };
    }
  }

  // Check specific building
  for (const [building, reason] of Object.entries(BUILDING_FLAGS)) {
    if (buildingName.toLowerCase().includes(building.toLowerCase())) {
      return { viable: false, reason, type: "building" };
    }
  }

  return { viable: true };
}

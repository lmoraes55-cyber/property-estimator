/**
 * STR SUB-LEASING — AREA SUITABILITY GATE
 *
 * Classifies Dubai areas/buildings by their suitability for STR sub-leasing.
 * Sub-leasing carries fixed rent exposure, so this gate is more conservative
 * than the standard STR viability check used in the owner estimator.
 *
 * To update area lists: edit SUBLEASE_AREA_SUITABILITY below.
 * To override a specific building: edit SUBLEASE_BUILDING_OVERRIDES below.
 */

export type AreaSuitability = "eligible" | "caution" | "not_recommended" | "avoid";

// ─── Area lists ───────────────────────────────────────────────────────────────
// Matching is case-insensitive substring against: buildingName + community + dldArea

export const SUBLEASE_AREA_SUITABILITY = {
  /**
   * PRIME STR AREAS — generally suitable for sub-leasing.
   * Strong tourist demand, high occupancy, proven ADR ceiling.
   */
  prime: [
    "Dubai Marina",
    "Jumeirah Beach Residence",
    "JBR",
    "Downtown Dubai",
    "Palm Jumeirah",
    "Bluewaters",
    "Bluewater Island",
    "Emaar Beachfront",
    "Dubai Harbour",
    "Business Bay",
    "DIFC",
    "Dubai Creek Harbour",
    "Creek Harbour",
    "City Walk",
  ],

  /**
   * SELECTIVE STR AREAS — can work, but only with the right unit, rent, and setup.
   * Demand is present but narrower; fundamentals must be strong.
   *
   * NOTE: a bare "Jumeirah" entry used to live here. Matching is substring-based and
   * categories are checked selective-before-prime, so it silently caught "Jumeirah Beach
   * Residence" (JBR) — downgrading any non-overridden JBR building from eligible to
   * caution. Removed; genuinely unlisted "Jumeirah X" communities still land on "caution"
   * via the unknown-area fallback below, so this loses no real coverage.
   */
  selective: [
    "JVC",
    "Jumeirah Village Circle",
    "JLT",
    "Jumeirah Lake Towers",
    "Dubai Hills",
    "Dubai Hills Estate",
    "Meydan",
    "Al Barsha",
    "Dubai Sports City",
    "Sports City",
    "Arjan",
    "Al Furjan",
    "Furjan",
    "Sobha Hartland",
    "Mohammed Bin Rashid City",
    "MBR City",
  ],

  /**
   * WEAK / LOW-DEMAND AREAS — generally not recommended for sub-leasing.
   * Inconsistent STR demand; fixed rent creates high downside exposure.
   */
  weak: [
    "International City",
    "Discovery Gardens",
    "Dubai Silicon Oasis",
    "Silicon Oasis",
    "Dubai Production City",
    "Production City",
    "Dubai Investment Park",
    "Liwan",
    "Queue Point",
    "Al Warsan",
    "Warsan",
    "Town Square",
    "Remraam",
    "DAMAC Hills 2",
    "Dubailand",
    "Al Quoz",
    "Mirdif",
    "Al Nahda",
    "Motor City",
    "Muhaisnah",
    "Al Quoz Industrial",
    "Jumeirah Village Triangle",
    "JVT",
  ],

  /**
   * BLOCKED / AVOID — not suitable for STR sub-leasing under any normal scenario.
   * Budget hotel markets, labour accommodation, areas with no STR guest demand.
   */
  blocked: [
    "Karama",
    "Deira",
    "Dubai South",
    "Bur Dubai",
    "Naif",
    "Al Ras",
    "Al Muteena",
    "Satwa",
    "Labour accommodation",
    "Industrial area",
  ],
} as const;

// ─── Building-level overrides ─────────────────────────────────────────────────
// These take full priority over the area lists above.
// Key: exact building name as it appears in the autocomplete.

export const SUBLEASE_BUILDING_OVERRIDES: Record<
  string,
  { areaSuitability: AreaSuitability; reason: string }
> = {
  // ── Dubai Marina ──
  "Marina Gate 1":                    { areaSuitability: "eligible", reason: "Prime Marina building with strong STR guest demand." },
  "Marina Gate 2":                    { areaSuitability: "eligible", reason: "Prime Marina building with strong STR guest demand." },
  "Jumeirah Living Marina Gate":      { areaSuitability: "eligible", reason: "Premium branded building with strong ADR potential." },
  "Vida Residences Dubai Marina":     { areaSuitability: "eligible", reason: "Branded hotel-style appeal with strong guest confidence." },
  "Address Dubai Marina":             { areaSuitability: "eligible", reason: "Strong brand and mall access; validate rent pressure." },
  "Silverene Tower A":                { areaSuitability: "eligible", reason: "Walkable Marina location with good short-stay demand." },
  "Silverene Tower B":                { areaSuitability: "eligible", reason: "Walkable Marina location with good short-stay demand." },
  "Sparkle Tower 1":                  { areaSuitability: "eligible", reason: "Modern Marina product close to JBR demand drivers." },
  "Sparkle Tower 2":                  { areaSuitability: "eligible", reason: "Modern Marina product close to JBR demand drivers." },
  "Studio One Tower":                 { areaSuitability: "eligible", reason: "Smaller units and lower rent exposure — strong sub-leasing candidate." },

  // ── JBR ──
  "Address Beach Residences":         { areaSuitability: "eligible", reason: "Premium beachfront demand; high ADR potential." },
  "Rimal 1":  { areaSuitability: "eligible", reason: "Beach access and established JBR tourist demand." },
  "Rimal 2":  { areaSuitability: "eligible", reason: "Beach access and established JBR tourist demand." },
  "Rimal 3":  { areaSuitability: "eligible", reason: "Beach access and established JBR tourist demand." },
  "Rimal 4":  { areaSuitability: "eligible", reason: "Beach access and established JBR tourist demand." },
  "Rimal 5":  { areaSuitability: "eligible", reason: "Beach access and established JBR tourist demand." },
  "Rimal 6":  { areaSuitability: "eligible", reason: "Beach access and established JBR tourist demand." },
  "Sadaf 1":  { areaSuitability: "eligible", reason: "Strong JBR location and guest appeal." },
  "Sadaf 2":  { areaSuitability: "eligible", reason: "Strong JBR location and guest appeal." },
  "Sadaf 3":  { areaSuitability: "eligible", reason: "Strong JBR location and guest appeal." },
  "Sadaf 4":  { areaSuitability: "eligible", reason: "Strong JBR location and guest appeal." },
  "Sadaf 5":  { areaSuitability: "eligible", reason: "Strong JBR location and guest appeal." },
  "Sadaf 6":  { areaSuitability: "eligible", reason: "Strong JBR location and guest appeal." },
  "Sadaf 7":  { areaSuitability: "eligible", reason: "Strong JBR location and guest appeal." },
  "Bahar 1":  { areaSuitability: "eligible", reason: "Beachfront community with established STR demand." },
  "Bahar 2":  { areaSuitability: "eligible", reason: "Beachfront community with established STR demand." },
  "Bahar 3":  { areaSuitability: "eligible", reason: "Beachfront community with established STR demand." },
  "Bahar 4":  { areaSuitability: "eligible", reason: "Beachfront community with established STR demand." },
  "Bahar 5":  { areaSuitability: "eligible", reason: "Beachfront community with established STR demand." },
  "Bahar 6":  { areaSuitability: "eligible", reason: "Beachfront community with established STR demand." },
  "Murjan 1": { areaSuitability: "eligible", reason: "Good tourist location; smaller units preferred." },
  "Murjan 2": { areaSuitability: "eligible", reason: "Good tourist location; smaller units preferred." },
  "Murjan 3": { areaSuitability: "eligible", reason: "Good tourist location; smaller units preferred." },
  "Murjan 4": { areaSuitability: "eligible", reason: "Good tourist location; smaller units preferred." },
  "Murjan 5": { areaSuitability: "eligible", reason: "Good tourist location; smaller units preferred." },
  "Murjan 6": { areaSuitability: "eligible", reason: "Good tourist location; smaller units preferred." },
  "Murjan 7": { areaSuitability: "eligible", reason: "Good tourist location; smaller units preferred." },
  "Shams 1":  { areaSuitability: "caution",  reason: "Works when rent is controlled and unit quality is strong." },
  "Shams 2":  { areaSuitability: "caution",  reason: "Works when rent is controlled and unit quality is strong." },
  "Shams 3":  { areaSuitability: "caution",  reason: "Works when rent is controlled and unit quality is strong." },
  "Shams 4":  { areaSuitability: "caution",  reason: "Works when rent is controlled and unit quality is strong." },

  // ── Bluewaters ──
  "Bluewaters Residences":            { areaSuitability: "eligible", reason: "Premium island destination with strong ADR potential." },

  // ── Downtown Dubai ──
  "Burj Vista 1":                     { areaSuitability: "eligible", reason: "Downtown/Burj appeal with strong tourist demand." },
  "Burj Vista 2":                     { areaSuitability: "eligible", reason: "Downtown/Burj appeal with strong tourist demand." },
  "Forte 1":                          { areaSuitability: "eligible", reason: "Opera District positioning with good guest appeal." },
  "Forte 2":                          { areaSuitability: "eligible", reason: "Opera District positioning with good guest appeal." },
  "Downtown Views II":                { areaSuitability: "eligible", reason: "Dubai Mall access and strong short-stay appeal." },
  "Boulevard Heights":                { areaSuitability: "eligible", reason: "Good balance of building quality and Downtown demand." },
  "Burj Royale":                      { areaSuitability: "eligible", reason: "Newer Downtown tower with tourist positioning." },
  "Address Residences Dubai Opera":   { areaSuitability: "eligible", reason: "Branded premium stock with strong ADR; validate rent." },
  "Address Fountain Views":           { areaSuitability: "eligible", reason: "Strong brand and fountain proximity; validate rent carefully." },

  // ── Palm Jumeirah ──
  "Shoreline Apartments":             { areaSuitability: "eligible", reason: "Beach/community appeal with stable tourist demand." },
  "Tiara Residences":                 { areaSuitability: "eligible", reason: "Premium beachfront product with strong ADR potential." },
  "Oceana Residences":                { areaSuitability: "eligible", reason: "Resort-style guest appeal." },
  "Seven Palm":                       { areaSuitability: "eligible", reason: "Strong STR profile, smaller units, high guest appeal." },
  "The Palm Tower":                   { areaSuitability: "eligible", reason: "Branded tourist appeal and high ADR; validate rent carefully." },
  "Golden Mile":                      { areaSuitability: "caution",  reason: "Works better when rent is sensible; less beachfront than Tiara/Oceana." },

  // ── Business Bay ──
  "DAMAC Towers by Paramount":        { areaSuitability: "eligible", reason: "Branded hospitality feel with good tourist/business mix." },
  "DAMAC Maison Prive":               { areaSuitability: "eligible", reason: "STR-friendly positioning with canal/business demand." },
  "The Bay":                          { areaSuitability: "caution",  reason: "Central area; rent must be controlled." },
  "Executive Towers":                 { areaSuitability: "caution",  reason: "Established community; good only with right rent." },
  "Aykon City":                       { areaSuitability: "caution",  reason: "Newer stock with central access; check competition." },

  // ── DIFC ──
  "Index Tower":                      { areaSuitability: "eligible", reason: "Corporate demand and premium address." },
  "Central Park Towers":              { areaSuitability: "eligible", reason: "Business traveller appeal and DIFC positioning." },
  "Sky Gardens":                      { areaSuitability: "caution",  reason: "Smaller units with business demand if rent is reasonable." },

  // ── Dubai Creek Harbour ──
  "Address Harbour Point":            { areaSuitability: "eligible", reason: "Branded waterfront building with strong guest appeal." },
  "Palace Residences":                { areaSuitability: "eligible", reason: "Premium waterfront community." },
  "Creek Edge":                       { areaSuitability: "caution",  reason: "Good new-community appeal; demand still maturing." },
  "Harbour Views":                    { areaSuitability: "caution",  reason: "Works for smaller units with controlled rent." },

  // ── City Walk ──
  "City Walk Residences":             { areaSuitability: "eligible", reason: "Lifestyle/tourist/business appeal; validate rent." },
  "Central Park at City Walk":        { areaSuitability: "caution",  reason: "Premium location; validate handover and building rules." },

  // ── JVC ──
  "Binghatti House":                  { areaSuitability: "caution",  reason: "Only if rent is low and break-even occupancy is safe." },
  "Binghatti Heights":                { areaSuitability: "caution",  reason: "Avoid high rent; smaller units only." },
  "Belgravia":                        { areaSuitability: "caution",  reason: "Better quality product; still area-sensitive." },
  "Bloom Towers":                     { areaSuitability: "caution",  reason: "Works only with controlled rent." },

  // ── JLT ──
  "Bonnington":                       { areaSuitability: "caution",  reason: "Business/leisure mix; tower-level validation needed." },
  "Lake Terrace":                     { areaSuitability: "caution",  reason: "Works when near metro and rent is sensible." },
  "Lake City":                        { areaSuitability: "caution",  reason: "Works when near metro and rent is sensible." },

  // ── Dubai Hills ──
  "Park Ridge":                       { areaSuitability: "caution",  reason: "Family/lifestyle demand; not always tourist-heavy." },
  "Executive Residences":             { areaSuitability: "caution",  reason: "Better for longer stays/corporate guests." },

  // ── Meydan ──
  "Azizi Riviera":                    { areaSuitability: "caution",  reason: "Large supply; only strong if rent is low." },

  // ── Arjan ──
  "Vincitore":                        { areaSuitability: "caution",  reason: "Must check demand and break-even carefully." },
  "Oxford":                           { areaSuitability: "caution",  reason: "Must check demand and break-even carefully." },
  "Samana":                           { areaSuitability: "caution",  reason: "Must check demand and break-even carefully." },
};

// ─── Gate function ────────────────────────────────────────────────────────────

export interface AreaSuitabilityResult {
  suitability: AreaSuitability;
  matchedArea: string;
  isOverride: boolean;
}

export function getSubleaseAreaSuitability(
  buildingName: string,
  community: string,
  dldArea?: string,
): AreaSuitabilityResult {
  // 1. Building-level override wins
  if (SUBLEASE_BUILDING_OVERRIDES[buildingName]) {
    const ov = SUBLEASE_BUILDING_OVERRIDES[buildingName];
    return { suitability: ov.areaSuitability, matchedArea: buildingName, isOverride: true };
  }

  const haystack = [buildingName, community, dldArea ?? ""].join(" ").toLowerCase();
  const match = (list: readonly string[]) =>
    list.find(a => haystack.includes(a.toLowerCase()));

  // Check from most restrictive → least restrictive so we never under-warn
  const blocked = match(SUBLEASE_AREA_SUITABILITY.blocked);
  if (blocked) return { suitability: "avoid", matchedArea: blocked, isOverride: false };

  const weak = match(SUBLEASE_AREA_SUITABILITY.weak);
  if (weak) return { suitability: "not_recommended", matchedArea: weak, isOverride: false };

  const selective = match(SUBLEASE_AREA_SUITABILITY.selective);
  if (selective) return { suitability: "caution", matchedArea: selective, isOverride: false };

  const prime = match(SUBLEASE_AREA_SUITABILITY.prime);
  if (prime) return { suitability: "eligible", matchedArea: prime, isOverride: false };

  // Unknown area — treat as selective (caution) rather than assuming prime
  return { suitability: "caution", matchedArea: community || buildingName, isOverride: false };
}

// ─── Risk bump helper ─────────────────────────────────────────────────────────

export type RiskLabel = "Low" | "Medium" | "High" | "Very High";

export function bumpRisk(level: RiskLabel): RiskLabel {
  if (level === "Low") return "Medium";
  if (level === "Medium") return "High";
  return "Very High";
}

// ─── Recommendation ───────────────────────────────────────────────────────────

export type Recommendation = "Proceed" | "Negotiate" | "Avoid";

export function getRecommendation(
  riskLevel: RiskLabel,
  suitability: AreaSuitability,
  isHardAvoid: boolean,
  cap?: Recommendation,
): Recommendation {
  let rec: Recommendation;
  if (isHardAvoid || suitability === "avoid" || riskLevel === "Very High") {
    rec = "Avoid";
  } else if (riskLevel === "High") {
    rec = "Negotiate";
  } else if (suitability === "not_recommended" || riskLevel === "Medium") {
    rec = "Negotiate";
  } else {
    rec = "Proceed";
  }
  // Apply cap: Proceed > Negotiate > Avoid; cap prevents result from being "too good"
  if (cap) {
    const order: Record<Recommendation, number> = { Proceed: 2, Negotiate: 1, Avoid: 0 };
    if (order[rec] > order[cap]) rec = cap;
  }
  return rec;
}

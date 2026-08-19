import {
  BUILDINGS_DATABASE,
  isOutskirtArea,
  getBuildingByName,
  type BuildingRecord
} from "./buildings-data";
import { lookupDLDBuilding, lookupDLDArea, lookupDLDByKey } from "./building-rents";
import { DLD_AREA_TO_COMMUNITY } from "./dld-area-map";

export const MONTHS = ["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May"] as const;
export type Month = typeof MONTHS[number];

export type UnitSize =
  | "STU" | "1BR" | "2BR" | "3BR"
  | "4BR APT" | "5BR APT" | "6BR APT"
  | "4BR VILLA" | "5BR VILLA" | "6BR VILLA"
  | "7BR VILLA" | "8BR VILLA" | "9BR VILLA";

export type UnitType = "Apartment" | "Villa";
export type OCCStrategy = "LOCCHP" | "HOCCLP";

export type ViewType =
  | "Burj / Downtown Skyline" | "Marina / Waterfront" | "Sea View"
  | "Golf / Park View" | "Community View" | "Standard View";

export const VIEW_PREMIUMS: Record<ViewType, number> = {
  "Burj / Downtown Skyline": 0.09,
  "Sea View":                0.075,
  "Marina / Waterfront":     0.055,
  "Community View":          0.025,
  "Golf / Park View":        0.01,
  "Standard View":           0.00,
};

// Floor premium: realistic Dubai STR uplift by floor band
export function floorPremium(floor: number): number {
  if (floor > 40) return 0.015;
  if (floor >= 31) return 0.010;
  if (floor >= 21) return 0.0075;
  if (floor >= 11) return 0.005;
  if (floor >= 5)  return 0.0025;
  return 0;
}

/**
 * Calculate tier-based premium for building quality/amenities
 * - Ultra-luxury/Luxury/High tier: 1-2% premium
 * - Mid tier: 0.5-1% premium
 * - Low tier: 0% premium
 */
export function getTierPremium(buildingName: string): number {
  const building = getBuildingByName(buildingName);
  if (!building) return 0;

  const { premiumPercentage } = building;
  return premiumPercentage / 100; // Convert to decimal
}

/**
 * STR DEMAND PREMIUM (location-based)
 * Prime tourist communities sustain stronger short-term rental demand than the
 * city average — higher occupancy and a wider STR-vs-LTR uplift. This is kept
 * SEPARATE from the building-tier premium (which reflects building quality) to
 * avoid double-counting. Effects are small and capped.
 */
export interface STRDemand {
  tier: "prime" | "strong" | "value-monthly" | "standard";
  revenuePremium: number;      // added to the STR revenue premium
  occUplift: number;           // added to every month's occupancy (points), capped at 0.90
  lowSeasonOccUplift: number;  // extra occupancy added to low-season months (Jun–Sep)
  sepOccUplift?: number;       // extra occupancy added to September specifically (building-specific overrides only)
}

// Per-building demand overrides — for buildings with observed performance that
// differs meaningfully from their generic area tier (checked before area matching).
const BUILDING_STR_OVERRIDES: Record<string, STRDemand> = {
  // Sunrise Bay (Dubai Marina waterfront) — strong occupancy performer.
  // sepOccUplift is now negative: base September occupancy (OCC_BASE_SHAPE_APT) was smoothed
  // sharply upward platform-wide, so the flat +0.06 occUplift alone would overshoot September
  // well past target — this trims it back down to the ~71% previously verified for this building.
  "Sunrise Bay": { tier: "prime", revenuePremium: 0.04, occUplift: 0.06, lowSeasonOccUplift: 0, sepOccUplift: -0.075 },
};

const STR_DEMAND_TIERS: { tier: "prime" | "strong"; revenuePremium: number; occUplift: number; match: string[] }[] = [
  {
    tier: "prime", revenuePremium: 0.016, occUplift: 0.03,
    match: ["palm jumeirah", "bluewaters", "jbr", "jumeirah beach residence", "dubai marina", "marina", "downtown dubai", "downtown"],
  },
  {
    tier: "strong", revenuePremium: 0.006, occUplift: 0.015,
    match: ["business bay", "dubai creek harbour", "creek harbour", "emaar beachfront", "dubai harbour", "city walk", "difc", "jumeirah village circle", "jvc"],
  },
];

export function getSTRDemand(buildingName: string, unitSize?: UnitSize): STRDemand {
  const override = BUILDING_STR_OVERRIDES[buildingName];
  if (override) return override;

  const haystack = locationHaystack(buildingName);

  // Prime tourist core (applies to all unit types)
  for (const t of STR_DEMAND_TIERS) {
    if (t.tier === "prime" && t.match.some(m => haystack.includes(m))) {
      return { tier: t.tier, revenuePremium: t.revenuePremium, occUplift: t.occUplift, lowSeasonOccUplift: 0 };
    }
  }

  // Monthly-stay studios/1BR in value communities: strong, low-season-supported occupancy,
  // modest revenue uplift (monthly rates sit only slightly above LTR).
  if (isMonthlyStayStudio(buildingName, unitSize)) {
    return { tier: "value-monthly", revenuePremium: 0.02, occUplift: 0.04, lowSeasonOccUplift: 0.10 };
  }

  // Strong secondary areas
  for (const t of STR_DEMAND_TIERS) {
    if (t.tier === "strong" && t.match.some(m => haystack.includes(m))) {
      return { tier: t.tier, revenuePremium: t.revenuePremium, occUplift: t.occUplift, lowSeasonOccUplift: 0 };
    }
  }

  return { tier: "standard", revenuePremium: 0, occUplift: 0, lowSeasonOccUplift: 0 };
}

/**
 * Check if property qualifies for long-term rental suggestion
 * Criteria:
 * - Monthly LT rent < 40,000 AED
 * - Property is in outskirt area (Dubai South, JVT, DAMAC Hills 2)
 */
export function isEligibleForLongTermSuggestion(
  monthlyLongTermRent: number,
  area: string
): boolean {
  return monthlyLongTermRent < 40000 && isOutskirtArea(area);
}

/**
 * Get building info from comprehensive database
 */
export function getBuildingInfo(buildingName: string): BuildingRecord | undefined {
  return getBuildingByName(buildingName);
}

// Areas where STR does not meaningfully outperform LTR
export interface LTRAreaWarning {
  reason: string;           // why STR underperforms here
  avgOccupancyLoss: number; // how much lower OCC is vs prime areas (fraction)
  stillPossible: boolean;   // can owner still do STR if they want flexibility?
}

// Occupancy-loss values are compressed into an 8-10% band — enough to make LTR
// the sounder recommendation without an implausibly large STR shortfall — while
// preserving each area's relative ranking from the original wider assessment.
export const LTR_RECOMMENDED_AREAS: Record<string, LTRAreaWarning> = {
  "Dubai South":   { reason: "Low tourist footfall and limited short-term demand in this corridor.", avgOccupancyLoss: 0.094, stillPossible: true },
  "Furjan":        { reason: "Predominantly residential community with low STR guest demand.", avgOccupancyLoss: 0.091, stillPossible: true },
  "Arjan":         { reason: "Emerging area with oversupply and low nightly rates for short-term.", avgOccupancyLoss: 0.089, stillPossible: true },
  "DAMAC Hills 2": { reason: "Remote location from tourist hubs limits STR occupancy significantly.", avgOccupancyLoss: 0.099, stillPossible: true },
  "Dubailand":     { reason: "Far from key attractions — guests prefer more central locations.", avgOccupancyLoss: 0.097, stillPossible: true },
  "International City": { reason: "Low ADR ceiling and limited STR demand in this community.", avgOccupancyLoss: 0.100, stillPossible: true },
  "Discovery Gardens": { reason: "Mostly long-term resident community with limited tourist traffic.", avgOccupancyLoss: 0.090, stillPossible: true },
  "Remraam":       { reason: "Gated community far from attractions — STR demand is very limited.", avgOccupancyLoss: 0.096, stillPossible: true },
  "DAMAC Hills":   { reason: "Villa community with distance from tourist areas — STR yields are moderate.", avgOccupancyLoss: 0.080, stillPossible: true },
  "Town Square":   { reason: "New developing area with limited short-term rental guest demand currently.", avgOccupancyLoss: 0.091, stillPossible: true },
  "Warsan":        { reason: "Industrial-adjacent, family-residential community with minimal tourist STR demand.", avgOccupancyLoss: 0.100, stillPossible: true },
  "Liwan":         { reason: "Budget family-residential community away from tourist hubs — LTR is the dominant use.", avgOccupancyLoss: 0.097, stillPossible: true },
  "Dubai Land Residence Complex": { reason: "Budget family-residential community away from tourist hubs — LTR is the dominant use.", avgOccupancyLoss: 0.097, stillPossible: true },
  "Arabian Ranches": { reason: "Established villa community geared toward long-term family residents, not tourist stays.", avgOccupancyLoss: 0.087, stillPossible: true },
  "Arabian Ranches 3": { reason: "Established villa community geared toward long-term family residents, not tourist stays.", avgOccupancyLoss: 0.087, stillPossible: true },
  "JVT":           { reason: "Family-oriented townhouse/villa community with limited short-term guest demand.", avgOccupancyLoss: 0.089, stillPossible: true },
  "Majan":         { reason: "Emerging Dubailand-adjacent community, far from tourist hubs — low short-term demand.", avgOccupancyLoss: 0.096, stillPossible: true },
  "Uptown Motor City": { reason: "Isolated suburban community with low reported STR guest demand.", avgOccupancyLoss: 0.093, stillPossible: true },
};

// Value communities where operators run STR profitably on MONTHLY stays —
// studios/1BR keep strong, low-season-supported occupancy despite being
// outside the prime tourist core.
const MONTHLY_STAY_AREAS = [
  "jumeirah village circle", "jvc",
  "arjan", "al furjan", "furjan",
  "dubai sports city", "sports city",
  "damac hills 2", "damac hills",
  "town square",
];

function locationHaystack(buildingName: string): string {
  const dir = BUILDING_DIRECTORY[buildingName];
  const rec = getBuildingByName(buildingName);
  return [dir?.community, dir?.area, rec?.area, buildingName].filter(Boolean).join(" ").toLowerCase();
}

// Studios / 1BR in monthly-stay value areas are a viable STR product (not LTR-only)
export function isMonthlyStayStudio(buildingName: string, unitSize?: UnitSize): boolean {
  if (unitSize !== "STU" && unitSize !== "1BR") return false;
  const hay = locationHaystack(buildingName);
  return MONTHLY_STAY_AREAS.some(a => hay.includes(a));
}

// Check if a building or manually typed area is in an LTR-recommended zone
export function getLTRWarning(buildingName: string, unitSize?: UnitSize, dldArea?: string): LTRAreaWarning | null {
  // Studios/1BR in monthly-stay value areas perform well via monthly stays —
  // don't steer them to LTR.
  if (isMonthlyStayStudio(buildingName, unitSize)) return null;
  // Check building directory first
  const info = BUILDING_DIRECTORY[buildingName];
  if (info) {
    const warning = LTR_RECOMMENDED_AREAS[info.community];
    if (warning) return warning;
  }
  // Most real properties are selected via DLD autocomplete, not the curated
  // BUILDING_DIRECTORY — resolve the real DLD administrative area to its
  // community the same way getLTRMarketRent does, so LTR-dominant areas are
  // recognized regardless of whether the building has a directory entry.
  if (dldArea) {
    const community = DLD_AREA_TO_COMMUNITY[dldArea] ?? dldArea;
    const warning = LTR_RECOMMENDED_AREAS[community];
    if (warning) return warning;
  }
  // Fuzzy match on the typed name itself against area keys
  const lower = buildingName.toLowerCase();
  for (const [area, warning] of Object.entries(LTR_RECOMMENDED_AREAS)) {
    if (lower.includes(area.toLowerCase())) return warning;
  }
  return null;
}

// ── LTR Market Data ────────────────────────────────────────────────────────
// Annual long-term rent benchmarks by community + unit size
// Source: Property Finder / Bayut / DXB Interact market data (updated periodically)
// These replace the manual owner input — AssetIntel sets this value internally.

export const LTR_MARKET_RENTS: Record<string, Partial<Record<UnitSize, number>>> = {
  "Downtown Dubai": {
    "STU": 75000, "1BR": 130000, "2BR": 195000, "3BR": 280000,
    "4BR APT": 380000, "5BR APT": 500000, "6BR APT": 650000,
  },
  "Dubai Marina": {
    "STU": 65000, "1BR": 110000, "2BR": 160000, "3BR": 230000,
    "4BR APT": 320000, "5BR APT": 430000, "6BR APT": 550000,
  },
  "JBR": {
    "STU": 70000, "1BR": 120000, "2BR": 175000, "3BR": 250000,
    "4BR APT": 340000, "5BR APT": 460000,
  },
  "Palm Jumeirah": {
    "STU": 90000, "1BR": 160000, "2BR": 240000, "3BR": 350000,
    "4BR APT": 480000, "5BR APT": 650000,
    "4BR VILLA": 750000, "5BR VILLA": 950000, "6BR VILLA": 1200000,
  },
  "Business Bay": {
    "STU": 55000, "1BR": 90000, "2BR": 135000, "3BR": 195000,
    "4BR APT": 270000, "5BR APT": 360000,
  },
  "DIFC": {
    "STU": 88000, "1BR": 130000, "2BR": 168000, "3BR": 245000, "4BR APT": 380000,
  },
  "Dubai Creek Harbour": {
    "STU": 60000, "1BR": 100000, "2BR": 150000, "3BR": 210000,
  },
  "Emaar Beachfront": {
    "1BR": 145000, "2BR": 220000, "3BR": 310000, "4BR APT": 430000,
  },
  "JVC": {
    "STU": 38000, "1BR": 65000, "2BR": 95000, "3BR": 140000,
  },
  "Emirates Hills": {
    "4BR VILLA": 700000, "5BR VILLA": 900000, "6BR VILLA": 1100000,
    "7BR VILLA": 1400000, "8BR VILLA": 1700000,
  },
  "Jumeirah": {
    "4BR VILLA": 450000, "5BR VILLA": 580000, "6BR VILLA": 720000,
  },
  "Arabian Ranches": {
    "3BR": 200000, "4BR VILLA": 320000, "5BR VILLA": 420000, "6BR VILLA": 520000,
  },
  "DAMAC Hills": {
    "3BR": 150000, "4BR VILLA": 260000, "5BR VILLA": 340000, "6BR VILLA": 420000,
  },
  "Furjan": {
    "1BR": 60000, "2BR": 85000, "3BR": 120000, "4BR VILLA": 200000,
  },
  "Dubai South": {
    "STU": 30000, "1BR": 50000, "2BR": 72000, "3BR": 100000,
  },
  "Arjan": {
    "STU": 35000, "1BR": 58000, "2BR": 82000, "3BR": 115000,
  },
  "DAMAC Hills 2": {
    "3BR": 110000, "4BR VILLA": 185000, "5BR VILLA": 240000,
  },
  "Town Square": {
    "1BR": 55000, "2BR": 80000, "3BR": 115000, "4BR VILLA": 180000,
  },
  "Discovery Gardens": {
    "STU": 32000, "1BR": 52000, "2BR": 75000,
  },
  "International City": {
    "STU": 25000, "1BR": 40000, "2BR": 58000,
  },
};

// Fallback LTR rents when community is unknown — Dubai average by unit size
const LTR_FALLBACK: Partial<Record<UnitSize, number>> = {
  "STU": 50000, "1BR": 85000, "2BR": 130000, "3BR": 185000,
  "4BR APT": 260000, "5BR APT": 350000, "6BR APT": 450000,
  "4BR VILLA": 350000, "5BR VILLA": 450000, "6BR VILLA": 570000,
  "7BR VILLA": 700000, "8BR VILLA": 850000, "9BR VILLA": 1100000,
};

export interface LTRMarketRent {
  rent: number;
  source: string;
  /** Confidence metadata when sourced from DLD actual contracts */
  sampleSize?: number;     // number of registered contracts
  rangeLow?: number;       // p25
  rangeHigh?: number;      // p75
  asOf?: string;           // latest contract month used (YYYY-MM)
  basis?: "dld-building" | "dld-area" | "table"; // data tier used
}

// Refine a median rent by the unit's size using rent-per-sqft, guarded so a
// typo or atypical unit can't produce a wild number (clamped near the median).
function sizeAdjust(median: number, aedPerSqft?: number, sizeSqft?: number): { rent: number; adjusted: boolean } {
  if (!aedPerSqft || !sizeSqft || sizeSqft < 150 || sizeSqft > 20000) return { rent: median, adjusted: false };
  const raw = aedPerSqft * sizeSqft;
  const clamped = Math.max(median * 0.7, Math.min(median * 1.4, raw));
  return { rent: Math.round(clamped), adjusted: true };
}

// Maps our curated building database's `area` string (lib/buildings-data.ts) to the
// DLD's actual area_name_en, so buildings picked from the dropdown (not resolved via
// DLD autocomplete, so no dldArea/dldKey) still get a real area-level DLD rent fallback
// instead of falling straight through to the generic "Dubai market average".
// Verified live: DLD tags every JBR tower's rent contracts with area_name_en "Marsa Dubai"
// (confirmed via direct Ejari query — JBR buildings have no distinct building/project tag
// in Ejari, but DO roll up into this area).
const CURATED_AREA_TO_DLD_AREA: Record<string, string> = {
  "Jumeirah Beach Residence (JBR)": "Marsa Dubai",
};

export function getLTRMarketRent(
  buildingName: string,
  unitSize: UnitSize,
  sizeSqft?: number,
  dldKey?: string,        // exact DLD dataset key — bypasses fuzzy matching when set
  dldArea?: string,       // DLD administrative area from the dataset
): LTRMarketRent {
  const info = BUILDING_DIRECTORY[buildingName];
  // Resolve community: prefer BUILDING_DIRECTORY, then map via DLD area, then DLD area itself
  const community = info?.community
    ?? (dldArea ? (DLD_AREA_TO_COMMUNITY[dldArea] ?? dldArea) : undefined);
  // Fallback DLD area when the caller didn't supply one (building came from the curated
  // dropdown, not DLD autocomplete) — lets JBR (and future-mapped areas) reach tier 2
  // instead of skipping straight to the curated table / Dubai-average fallback.
  const curatedDldArea = !dldArea
    ? CURATED_AREA_TO_DLD_AREA[getBuildingByName(buildingName)?.area ?? ""]
    : undefined;

  // 1a. Exact DLD key lookup (when building was selected from DLD autocomplete)
  if (dldKey) {
    const exact = lookupDLDByKey(dldKey, unitSize);
    if (exact) {
      const adj = sizeAdjust(exact.median, exact.aedPerSqft, sizeSqft);
      const displayName = buildingName || dldKey;
      return {
        rent: adj.rent,
        source: adj.adjusted
          ? `${exact.n.toLocaleString()} DLD contracts · ${displayName} · size-adjusted`
          : `${exact.n.toLocaleString()} registered DLD contracts · ${displayName}`,
        sampleSize: exact.n,
        rangeLow: exact.p25,
        rangeHigh: exact.p75,
        asOf: exact.asOf,
        basis: "dld-building",
      };
    }
  }

  // 1b. Fuzzy building-level lookup (free-typed building name)
  const dldBuilding = lookupDLDBuilding(buildingName, unitSize);
  if (dldBuilding) {
    const adj = sizeAdjust(dldBuilding.median, dldBuilding.aedPerSqft, sizeSqft);
    return {
      rent: adj.rent,
      source: adj.adjusted
        ? `${dldBuilding.n.toLocaleString()} DLD contracts · ${buildingName} · size-adjusted`
        : `${dldBuilding.n.toLocaleString()} registered DLD contracts · ${buildingName}`,
      sampleSize: dldBuilding.n,
      rangeLow: dldBuilding.p25,
      rangeHigh: dldBuilding.p75,
      asOf: dldBuilding.asOf,
      basis: "dld-building",
    };
  }

  // 2. Area-level actual rents from DLD
  //    Try the mapped community name, then the raw DLD area name, then the
  //    curated-database area's DLD equivalent (e.g. JBR → "Marsa Dubai").
  const areaLookupTargets = [community, dldArea, curatedDldArea].filter(Boolean) as string[];
  for (const target of areaLookupTargets) {
    const dldAreaStat = lookupDLDArea(target, unitSize);
    if (dldAreaStat) {
      return {
        rent: dldAreaStat.median,
        source: `${dldAreaStat.n.toLocaleString()} registered DLD contracts · ${community ?? target}`,
        sampleSize: dldAreaStat.n,
        rangeLow: dldAreaStat.p25,
        rangeHigh: dldAreaStat.p75,
        asOf: dldAreaStat.asOf,
        basis: "dld-area",
      };
    }
  }

  // 3. Per-building curated override (manually sourced from DXB Interact / Bayut)
  //    Used for buildings absent from DLD Ejari but with known market rents.
  const buildingOverride = BUILDING_LTR_OVERRIDES[buildingName]?.[unitSize];
  if (buildingOverride) {
    return {
      rent: buildingOverride,
      source: `${buildingName} market data`,
      basis: "table",
    };
  }

  // 4. Fallback to internal community-average benchmark table
  const communityRents = community ? LTR_MARKET_RENTS[community] : null;
  const rent = communityRents?.[unitSize] ?? LTR_FALLBACK[unitSize] ?? 100000;
  const source = communityRents?.[unitSize]
    ? `${community} market average`
    : "Dubai market average";
  return { rent, source, basis: "table" };
}

// Per-building LTR overrides for buildings absent from DLD Ejari.
// Source: DXB Interact rental transactions (manually verified).
// Last updated: June 2026.
const BUILDING_LTR_OVERRIDES: Record<string, Partial<Record<UnitSize, number>>> = {
  "South Ridge 1": { "STU": 75000, "1BR": 110000, "2BR": 160000, "3BR": 220000 },
  "South Ridge 2": { "STU": 75000, "1BR": 110000, "2BR": 160000, "3BR": 220000 },
  "South Ridge 3": { "STU": 75000, "1BR": 110000, "2BR": 160000, "3BR": 220000 },
  "South Ridge 4": { "STU": 75000, "1BR": 110000, "2BR": 160000, "3BR": 220000 },
  "South Ridge 5": { "STU": 75000, "1BR": 110000, "2BR": 160000, "3BR": 220000 },
  // Ejari has no building-level tag for these (project_name_en null / building not
  // registered as a distinct project) — sourced from Bayut/Property Finder listing
  // medians instead. 3BR/2BR omitted where sample data was too thin to trust.
  "Al Bateen Residences": { "1BR": 145000, "2BR": 190000 },
  "G-24": { "STU": 50000, "1BR": 68000 },
};

// Dubai buildings mapped to community + area type
export interface BuildingInfo {
  community: string;
  area: string;
  tier: "ultra-luxury" | "luxury" | "mid";
  completionYear?: number;
  serviceChargePsf?: number;
  maxFloors?: number;
}

export const BUILDING_DIRECTORY: Record<string, BuildingInfo> = {
  // Downtown / Burj Khalifa area — South Ridge
  "South Ridge 1":         { community: "Downtown Dubai", area: "Downtown Dubai", tier: "mid",          completionYear: 2009, serviceChargePsf: 17, maxFloors: 23 },
  "South Ridge 2":         { community: "Downtown Dubai", area: "Downtown Dubai", tier: "mid",          completionYear: 2009, serviceChargePsf: 17, maxFloors: 23 },
  "South Ridge 3":         { community: "Downtown Dubai", area: "Downtown Dubai", tier: "mid",          completionYear: 2009, serviceChargePsf: 17, maxFloors: 23 },
  "South Ridge 4":         { community: "Downtown Dubai", area: "Downtown Dubai", tier: "mid",          completionYear: 2009, serviceChargePsf: 17, maxFloors: 23 },
  "South Ridge 5":         { community: "Downtown Dubai", area: "Downtown Dubai", tier: "mid",          completionYear: 2009, serviceChargePsf: 17, maxFloors: 23 },
  "Burj Khalifa":          { community: "Downtown Dubai", area: "Downtown Dubai", tier: "ultra-luxury", completionYear: 2010, serviceChargePsf: 28, maxFloors: 163 },
  "Address Boulevard":     { community: "Downtown Dubai", area: "Downtown Dubai", tier: "ultra-luxury", completionYear: 2018, serviceChargePsf: 27, maxFloors: 72 },
  "The Address Residences": { community: "Downtown Dubai", area: "Downtown Dubai", tier: "ultra-luxury",completionYear: 2018, serviceChargePsf: 27, maxFloors: 64 },
  "Vida Residences":       { community: "Downtown Dubai", area: "Downtown Dubai", tier: "luxury",       completionYear: 2018, serviceChargePsf: 28, maxFloors: 56 },
  "Act One Act Two":       { community: "Downtown Dubai", area: "Downtown Dubai", tier: "luxury",       completionYear: 2017, serviceChargePsf: 24, maxFloors: 66 },
  "29 Boulevard":          { community: "Downtown Dubai", area: "Downtown Dubai", tier: "luxury",       completionYear: 2013, serviceChargePsf: 19, maxFloors: 45 },
  "Burj Vista":            { community: "Downtown Dubai", area: "Downtown Dubai", tier: "luxury",       completionYear: 2017, serviceChargePsf: 16, maxFloors: 65 },
  "Forte":                 { community: "Downtown Dubai", area: "Downtown Dubai", tier: "luxury",       completionYear: 2022, serviceChargePsf: 24, maxFloors: 64 },
  "IL Primo":              { community: "Downtown Dubai", area: "Downtown Dubai", tier: "ultra-luxury", completionYear: 2022, serviceChargePsf: 30, maxFloors: 77 },
  "St Regis Residences":   { community: "Downtown Dubai", area: "Downtown Dubai", tier: "ultra-luxury", completionYear: 2022, serviceChargePsf: 30, maxFloors: 66 },
  // Marina
  "Marina Gate":           { community: "Dubai Marina", area: "Dubai Marina", tier: "luxury",  completionYear: 2020, serviceChargePsf: 19, maxFloors: 65 },
  "Marina Pinnacle":       { community: "Dubai Marina", area: "Dubai Marina", tier: "mid",     completionYear: 2011, serviceChargePsf: 16, maxFloors: 48 },
  "Cayan Tower":           { community: "Dubai Marina", area: "Dubai Marina", tier: "luxury",  completionYear: 2013, serviceChargePsf: 22, maxFloors: 75 },
  "Princess Tower":        { community: "Dubai Marina", area: "Dubai Marina", tier: "luxury",  completionYear: 2012, serviceChargePsf: 16, maxFloors: 101 },
  "Torch Tower":           { community: "Dubai Marina", area: "Dubai Marina", tier: "mid",     completionYear: 2011, serviceChargePsf: 21, maxFloors: 79 },
  "Sulafa Tower":          { community: "Dubai Marina", area: "Dubai Marina", tier: "mid",     completionYear: 2010, serviceChargePsf: 18, maxFloors: 75 },
  "Silverene":             { community: "Dubai Marina", area: "Dubai Marina", tier: "luxury",  completionYear: 2011, serviceChargePsf: 24, maxFloors: 38 },
  "Studio One":            { community: "Dubai Marina", area: "Dubai Marina", tier: "mid",     completionYear: 2019, serviceChargePsf: 14, maxFloors: 30 },
  "Sunrise Bay":           { community: "Dubai Marina", area: "Dubai Marina", tier: "luxury",  completionYear: 2023, serviceChargePsf: 20, maxFloors: 40 },
  // JBR
  "Sadaf":                 { community: "JBR", area: "JBR", tier: "mid",     completionYear: 2009, serviceChargePsf: 17, maxFloors: 38 },
  "Rimal":                 { community: "JBR", area: "JBR", tier: "mid",     completionYear: 2009, serviceChargePsf: 17, maxFloors: 39 },
  "Bahar":                 { community: "JBR", area: "JBR", tier: "mid",     completionYear: 2010, serviceChargePsf: 15, maxFloors: 40 },
  "Murjan":                { community: "JBR", area: "JBR", tier: "mid",     completionYear: 2009, serviceChargePsf: 17, maxFloors: 36 },
  "The Walk":              { community: "JBR", area: "JBR", tier: "luxury",  completionYear: 2015, serviceChargePsf: 20, maxFloors: 32 },
  "Five JBR":              { community: "JBR", area: "JBR", tier: "luxury",  completionYear: 2016, serviceChargePsf: 22, maxFloors: 24 },
  // Palm Jumeirah
  "Atlantis The Royal Residences": { community: "Palm Jumeirah", area: "Palm Jumeirah", tier: "ultra-luxury", completionYear: 2022, serviceChargePsf: 42, maxFloors: 44 },
  "One Palm":              { community: "Palm Jumeirah", area: "Palm Jumeirah", tier: "ultra-luxury", completionYear: 2021, serviceChargePsf: 52, maxFloors: 24 },
  "Palm Beach Towers":     { community: "Palm Jumeirah", area: "Palm Jumeirah", tier: "luxury",       completionYear: 2022, serviceChargePsf: 25, maxFloors: 52 },
  "Tiara Residences":      { community: "Palm Jumeirah", area: "Palm Jumeirah", tier: "luxury",       completionYear: 2011, serviceChargePsf: 20, maxFloors: 38 },
  "Seven Palm":            { community: "Palm Jumeirah", area: "Palm Jumeirah", tier: "luxury",       completionYear: 2019, serviceChargePsf: 26, maxFloors: 24 },
  "Shoreline Apartments":  { community: "Palm Jumeirah", area: "Palm Jumeirah", tier: "mid",          completionYear: 2008, serviceChargePsf: 18, maxFloors: 13 },
  "Garden Homes":          { community: "Palm Jumeirah", area: "Palm Jumeirah", tier: "luxury",       completionYear: 2008, serviceChargePsf: 18, maxFloors: 2 },
  // Business Bay
  "Damac Towers":          { community: "Business Bay", area: "Business Bay", tier: "luxury",  completionYear: 2018, serviceChargePsf: 30, maxFloors: 63 },
  "Executive Bay":         { community: "Business Bay", area: "Business Bay", tier: "mid",     completionYear: 2014, serviceChargePsf: 26, maxFloors: 62 },
  "Aykon City":            { community: "Business Bay", area: "Business Bay", tier: "luxury",  completionYear: 2021, serviceChargePsf: 20, maxFloors: 79 },
  "DAMAC Maison":          { community: "Business Bay", area: "Business Bay", tier: "luxury",  completionYear: 2017, serviceChargePsf: 22, maxFloors: 52 },
  "Paramount Tower":       { community: "Business Bay", area: "Business Bay", tier: "luxury",  completionYear: 2018, serviceChargePsf: 28, maxFloors: 64 },
  // Real DLD project (id 602078513), G+4P+22F+R, 214 units, ACTIVE per DLD as of
  // 2026-08-16 — completionYear/serviceChargePsf not yet published, left unset
  // rather than guessed. Tier set from real 2026 Ejari rents (Studio 50-55k, 1BR
  // 75-85k, 2BR 108-120k AED/yr), which read solidly mid-market for Business Bay.
  "Century":               { community: "Business Bay", area: "Business Bay", tier: "mid",     completionYear: 2026, maxFloors: 22 },
  // DIFC
  "Index Tower":              { community: "DIFC", area: "DIFC", tier: "luxury", completionYear: 2011, serviceChargePsf: 25, maxFloors: 80 },
  "Liberty House":            { community: "DIFC", area: "DIFC", tier: "luxury", completionYear: 2009, serviceChargePsf: 22, maxFloors: 38 },
  "Sky Gardens":              { community: "DIFC", area: "DIFC", tier: "mid",    completionYear: 2009, serviceChargePsf: 20, maxFloors: 45 },
  "Burj Daman":               { community: "DIFC", area: "DIFC", tier: "luxury", completionYear: 2013, serviceChargePsf: 24, maxFloors: 42 },
  "Limestone House":          { community: "DIFC", area: "DIFC", tier: "luxury", completionYear: 2011, serviceChargePsf: 23, maxFloors: 34 },
  "Central Park Residences":  { community: "DIFC", area: "DIFC", tier: "luxury", completionYear: 2013, serviceChargePsf: 22, maxFloors: 34 },
  "Park Towers A":            { community: "DIFC", area: "DIFC", tier: "mid",    completionYear: 2006, serviceChargePsf: 18, maxFloors: 39 },
  "Park Towers B":            { community: "DIFC", area: "DIFC", tier: "mid",    completionYear: 2006, serviceChargePsf: 18, maxFloors: 39 },
  // LTR-recommended zones
  "Aurum Villas":          { community: "Furjan", area: "Furjan", tier: "mid",           completionYear: 2016, serviceChargePsf: 15, maxFloors: 4 },
  "Masakin Al Furjan":     { community: "Furjan", area: "Furjan", tier: "mid",           completionYear: 2015, serviceChargePsf: 15, maxFloors: 6 },
  "Quortaj":               { community: "Furjan", area: "Furjan", tier: "mid",           completionYear: 2015, serviceChargePsf: 14, maxFloors: 4 },
  "Celestia":              { community: "Dubai South", area: "Dubai South", tier: "mid", completionYear: 2019, serviceChargePsf: 13, maxFloors: 21 },
  "The Pulse":             { community: "Dubai South", area: "Dubai South", tier: "mid", completionYear: 2019, serviceChargePsf: 13, maxFloors: 18 },
  "Miraclz":               { community: "Arjan", area: "Arjan", tier: "mid",             completionYear: 2018, serviceChargePsf: 11, maxFloors: 22 },
  "Binghatti Stars":       { community: "Arjan", area: "Arjan", tier: "mid",             completionYear: 2019, serviceChargePsf: 11, maxFloors: 20 },
  "Artesia":               { community: "DAMAC Hills", area: "DAMAC Hills", tier: "mid", completionYear: 2019, serviceChargePsf: 14, maxFloors: 12 },
  "Akoya":                 { community: "DAMAC Hills 2", area: "DAMAC Hills 2", tier: "mid" },
  "Luma 22":               { community: "JVC", area: "Jumeirah Village Circle", tier: "mid", completionYear: 2023, serviceChargePsf: 13, maxFloors: 19 },
  "Creek Gate":            { community: "Dubai Creek Harbour", area: "Dubai Creek Harbour", tier: "luxury",       completionYear: 2021, serviceChargePsf: 20, maxFloors: 45 },
  "The Grand":             { community: "Dubai Creek Harbour", area: "Dubai Creek Harbour", tier: "luxury",       completionYear: 2020, serviceChargePsf: 20, maxFloors: 69 },
  "Emaar Beachfront":      { community: "Emaar Beachfront", area: "Dubai Harbour", tier: "luxury",       completionYear: 2021, serviceChargePsf: 22, maxFloors: 26 },
  "Beach Vista":           { community: "Emaar Beachfront", area: "Dubai Harbour", tier: "luxury",       completionYear: 2021, serviceChargePsf: 22, maxFloors: 26 },
  "Palace Beach Residence":{ community: "Emaar Beachfront", area: "Dubai Harbour", tier: "ultra-luxury", completionYear: 2022, serviceChargePsf: 28, maxFloors: 25 },

  // 2026-handover-tracked projects confirmed to already have real, recent (last 180
  // days) new Ejari residential leases as of 2026-08-16, despite DLD's own
  // percent_completed/status still showing them as under-construction — same stale-
  // completion pattern found for Century. completionYear=2026 since that's the tracked
  // target end date; serviceChargePsf/maxFloors not yet published, left unset rather
  // than guessed. Tier set from area convention (no per-project rent data pulled for
  // this batch, only lease *counts*), not from confirmed pricing.
  "NAS3":                              { community: "Arjan", area: "Arjan", tier: "mid", completionYear: 2026 },
  "Royal Regency":                     { community: "Business Bay", area: "Business Bay", tier: "luxury", completionYear: 2026 },
  "Creek Beach - Savanna-Cedar-Mangrove": { community: "Dubai Creek Harbour", area: "Dubai Creek Harbour", tier: "luxury", completionYear: 2026 },
  "Hills Park":                        { community: "Dubai Hills Estate", area: "Dubai Hills Estate", tier: "luxury", completionYear: 2026 },
  "Condor Golf Links 18":              { community: "Sports City", area: "Sports City", tier: "mid", completionYear: 2026 },
  "Park Horizon":                      { community: "Dubai Hills Estate", area: "Dubai Hills Estate", tier: "luxury", completionYear: 2026 },
  "Luma Park Views":                   { community: "JVC", area: "Jumeirah Village Circle", tier: "mid", completionYear: 2026 },
  "Sobha Hartland - Crest Grande":     { community: "MBR City", area: "MBR City", tier: "luxury", completionYear: 2026 },
  "Park Lane 2 by Heilbronn":          { community: "JVC", area: "Jumeirah Village Circle", tier: "mid", completionYear: 2026 },
  "Creek Beach - Canopy - Moor":       { community: "Dubai Creek Harbour", area: "Dubai Creek Harbour", tier: "luxury", completionYear: 2026 },
  "Milestone Residences":              { community: "JVC", area: "Jumeirah Village Circle", tier: "mid", completionYear: 2026 },
  "Pearl House III by Imtiaz":         { community: "JVC", area: "Jumeirah Village Circle", tier: "mid", completionYear: 2026 },
  "Azizi Riviera 69":                  { community: "MBR City", area: "MBR City", tier: "luxury", completionYear: 2026 },
  "ZaZEN Ivy":                         { community: "Al Furjan", area: "Al Furjan", tier: "mid", completionYear: 2026 },
  "Living Legends Phase 6":            { community: "Living Legends", area: "Living Legends", tier: "mid", completionYear: 2026 },
  "FH Residency":                      { community: "JVC", area: "Jumeirah Village Circle", tier: "mid", completionYear: 2026 },
  "Erin":                              { community: "Citywalk", area: "Citywalk", tier: "luxury", completionYear: 2026 },
  "Golf Residences by Fortimo":        { community: "Dubai Hills Estate", area: "Dubai Hills Estate", tier: "luxury", completionYear: 2026 },
  "Peninsula Four":                    { community: "Business Bay", area: "Business Bay", tier: "luxury", completionYear: 2026 },
  "Beach Walk Residences 1":           { community: "Palm Deira", area: "Palm Deira", tier: "mid", completionYear: 2026 },
  "Golf Heights":                      { community: "JLT", area: "JLT", tier: "mid", completionYear: 2026 },
  "Tulip Oasis 10":                    { community: "Living Legends", area: "Living Legends", tier: "mid", completionYear: 2026 },
  "Celine By Vision":                  { community: "Liwan", area: "Liwan", tier: "mid", completionYear: 2026 },
  "Binghatti Apex":                    { community: "JVC", area: "Jumeirah Village Circle", tier: "mid", completionYear: 2026 },
  "Volna By Kasco":                    { community: "Al Jadaf", area: "Al Jadaf", tier: "mid", completionYear: 2026 },
  "The Cove ll":                       { community: "Dubai Creek Harbour", area: "Dubai Creek Harbour", tier: "luxury", completionYear: 2026 },
};

// Monthly AC (district cooling / chiller) costs by unit size
// Months: Jun, Jul, Aug, Sep, Oct, Nov, Dec, Jan, Feb, Mar, Apr, May
// HIGHEST in summer (Jun–Aug: 45°C+), tapering through Oct, lowest Nov–Mar, rising Apr–May.
const AC: Record<UnitSize, number[]> = {
  //                 Jun   Jul   Aug   Sep   Oct   Nov   Dec   Jan   Feb   Mar   Apr   May
  "STU":      [      270,  270,  270,  220,  170,  120,  120,  120,  150,  170,  200,  220],
  "1BR":      [      432,  432,  432,  352,  272,  192,  192,  192,  240,  272,  320,  352],
  "2BR":      [    691.2,691.2,691.2,563.2,435.2,307.2,307.2,307.2,  384,435.2,  512,563.2],
  "3BR":      [   1036.8,1036.8,1036.8,844.8,652.8,460.8,460.8,460.8,576,652.8,768,844.8],
  "4BR APT":  [ 1451.52,1451.52,1451.52,1182.72,913.92,645.12,645.12,645.12,806.4,913.92,1075.2,1182.72],
  "5BR APT":  [1886.976,1886.976,1886.976,1537.536,1188.096,838.656,838.656,838.656,1048.32,1188.096,1397.76,1537.536],
  "6BR APT":  [2264.3712,2264.3712,2264.3712,1845.0432,1425.7152,1006.3872,1006.3872,1006.3872,1257.984,1425.7152,1677.312,1845.0432],
  "4BR VILLA":[4075.86816,4075.86816,4075.86816,3321.07776,2566.28736,1811.49696,1811.49696,1811.49696,2264.3712,2566.28736,3019.1616,3321.07776],
  "5BR VILLA":[5298.628608,5298.628608,5298.628608,4317.401088,3336.173568,2354.946048,2354.946048,2354.946048,2943.68256,3336.173568,3924.91008,4317.401088],
  "6BR VILLA":[6093.422899,6093.422899,6093.422899,4965.011251,3836.599603,2708.187955,2708.187955,2708.187955,3385.234944,3836.599603,4513.646592,4965.011251],
  "7BR VILLA":[7007.436334,7007.436334,7007.436334,5709.762939,4412.089544,3114.416148,3114.416148,3114.416148,3893.020186,4412.089544,5190.693581,5709.762939],
  "8BR VILLA":[8058.551784,8058.551784,8058.551784,6566.22738,5073.902975,3581.578571,3581.578571,3581.578571,4476.973213,5073.902975,5969.297618,6566.22738],
  "9BR VILLA":[13901.00183,13901.00183,13901.00183,11326.74223,8752.482632,6178.223035,6178.223035,6178.223035,7722.778793,8752.482632,10297.03839,11326.74223],
};

// Monthly DEWA (utilities) costs by unit size
// Months: Jun, Jul, Aug, Sep, Oct, Nov, Dec, Jan, Feb, Mar, Apr, May
// AC-driven: highest in peak summer (Jun–Aug), lowest in winter (Nov–Mar).
// Same annual total as before — only the monthly distribution is corrected.
const DEWA: Record<UnitSize, number[]> = {
  "STU":      [220,220,220,200,200,170,170,170,170,170,200,200],
  "1BR":      [352,352,352,320,320,272,272,272,272,272,320,320],
  "2BR":      [563.2,563.2,563.2,512,512,435.2,435.2,435.2,435.2,435.2,512,512],
  "3BR":      [844.8,844.8,844.8,768,768,652.8,652.8,652.8,652.8,652.8,768,768],
  "4BR APT":  [1182.72,1182.72,1182.72,1075.2,1075.2,913.92,913.92,913.92,913.92,913.92,1075.2,1075.2],
  "5BR APT":  [1537.536,1537.536,1537.536,1397.76,1397.76,1188.096,1188.096,1188.096,1188.096,1188.096,1397.76,1397.76],
  "6BR APT":  [1845.0432,1845.0432,1845.0432,1677.312,1677.312,1425.7152,1425.7152,1425.7152,1425.7152,1425.7152,1677.312,1677.312],
  "4BR VILLA":[3321.07776,3321.07776,3321.07776,3019.1616,3019.1616,2566.28736,2566.28736,2566.28736,2566.28736,2566.28736,3019.1616,3019.1616],
  "5BR VILLA":[4317.401088,4317.401088,4317.401088,3924.91008,3924.91008,3336.173568,3336.173568,3336.173568,3336.173568,3336.173568,3924.91008,3924.91008],
  "6BR VILLA":[4965.011251,4965.011251,4965.011251,4513.646592,4513.646592,3836.599603,3836.599603,3836.599603,3836.599603,3836.599603,4513.646592,4513.646592],
  "7BR VILLA":[5709.762939,5709.762939,5709.762939,5190.693581,5190.693581,4412.089544,4412.089544,4412.089544,4412.089544,4412.089544,5190.693581,5190.693581],
  "8BR VILLA":[6566.22738,6566.22738,6566.22738,5969.297618,5969.297618,5073.902975,5073.902975,5073.902975,5073.902975,5073.902975,5969.297618,5969.297618],
  "9BR VILLA":[11326.74223,11326.74223,11326.74223,10297.03839,10297.03839,8752.482632,8752.482632,8752.482632,8752.482632,8752.482632,10297.03839,10297.03839],
};

// Monthly DU (internet) costs by unit size — flat
const DU: Record<UnitSize, number> = {
  "STU": 400, "1BR": 400, "2BR": 400, "3BR": 400,
  "4BR APT": 600, "5BR APT": 600, "6BR APT": 600,
  "4BR VILLA": 800, "5BR VILLA": 800, "6BR VILLA": 800,
  "7BR VILLA": 1000, "8BR VILLA": 1000, "9BR VILLA": 1000,
};

// Monthly maintenance by unit size — flat
const MAINTENANCE: Record<UnitSize, number> = {
  "STU": 250, "1BR": 400, "2BR": 550, "3BR": 700,
  "4BR APT": 850, "5BR APT": 1000, "6BR APT": 1150,
  "4BR VILLA": 2000, "5BR VILLA": 2500, "6BR VILLA": 2500,
  "7BR VILLA": 3000, "8BR VILLA": 3000, "9BR VILLA": 6000,
};

// Annual furniture cost for STR units (AED/year) — two tiers:
//
// FURNITURE_AMORT_FULL: property needs furnishing before STR.
//   = fit-out cost ÷ 5-year life + annual refresh budget.
//   STU: AED 30k/5y + 2k refresh = 8k | 1BR: 45k/5y + 3k = 12k | 2BR: 65k/5y + 4k = 17k
//
// FURNITURE_AMORT_REFRESH: property is already fully furnished (fit-out is sunk).
//   = ongoing refresh/replacement only (linens, worn items, periodic updates).
//   Roughly 30% of the full figure — the refresh portion only.
const FURNITURE_AMORT_FULL: Record<UnitSize, number> = {
  "STU":       8000,
  "1BR":      12000,
  "2BR":      17000,
  "3BR":      23000,
  "4BR APT":  30000,
  "5BR APT":  37000,
  "6BR APT":  44000,
  "4BR VILLA": 50000,
  "5BR VILLA": 62000,
  "6BR VILLA": 75000,
  "7BR VILLA": 90000,
  "8BR VILLA": 105000,
  "9BR VILLA": 120000,
};

const FURNITURE_AMORT_REFRESH: Record<UnitSize, number> = {
  "STU":       3500,
  "1BR":       5000,
  "2BR":       7000,
  "3BR":       9000,
  "4BR APT":  11000,
  "5BR APT":  13000,
  "6BR APT":  15000,
  "4BR VILLA": 10000,
  "5BR VILLA": 12000,
  "6BR VILLA": 14000,
  "7BR VILLA": 16000,
  "8BR VILLA": 18000,
  "9BR VILLA": 20000,
};

// Two separate seasonal shapes — apartments and villas behave differently in Dubai.
// Months order: Jun, Jul, Aug, Sep, Oct, Nov, Dec, Jan, Feb, Mar, Apr, May

// APARTMENTS (STU → 6BR APT):
// Summer (Jun–Aug): monthly stays by families/workers fill calendars → higher occ, very low ADR per night.
// Dec is undisputed peak (DSF + NYE fireworks +30–50% premium). Oct–Feb = high season.
// Sep and May nudged up ~4% (occupancy) — small seasonal recalibration per owner feedback.
// Aug→Dec is now a straight linear ramp (Sep/Oct/Nov interpolated between the Aug and Dec
// anchors) instead of cliffing down at Sep and jumping back up at Oct — occupancy rises
// gradually into the winter high season rather than lurching.
const OCC_BASE_SHAPE_APT  = [1.22,1.17,1.17,1.19,1.21,1.22,1.24,1.18,1.13,1.07,0.96,1.12];

// VILLAS (4BR → 9BR VILLA):
// Fewer summer monthly stays (harder to fill, less accessible for workers).
// Much stronger Dec/Jan peak — luxury family groups, staycations, holiday rentals.
// Summer ADR is still lower (monthly rate) but occupancy dips more than apartments.
// Aug→Dec is a straight linear ramp (same rationale as apartments above).
const OCC_BASE_SHAPE_VILLA = [0.90,0.88,0.90,1.02,1.13,1.25,1.36,1.26,1.16,1.08,0.96,0.88];

// Annual occupancy targets per bedroom type (effective annual average).
// Apartments: STU/1BR benefit most from summer monthly stays.
// Villas: lower annual avg but stronger peak months offset by lower summer.
const OCC_TARGETS: Record<UnitSize, number> = {
  "STU":      0.63,   // High monthly-stay demand, easiest to fill year-round
  "1BR":      0.63,   // Same — most popular for monthly stays
  "2BR":      0.61,   // Good family demand + some monthly stays
  "3BR":      0.57,   // Popular for family tourism, fewer pure monthly stays
  "4BR APT":  0.52,   // Less monthly stays; good peak season family demand
  "5BR APT":  0.48,
  "6BR APT":  0.46,
  "4BR VILLA":0.54,   // High Dec/Jan demand from families; lower summer
  "5BR VILLA":0.52,
  "6BR VILLA":0.49,
  "7BR VILLA":0.46,
  "8BR VILLA":0.45,
  "9BR VILLA":0.43,
};

const VILLA_UNIT_SIZES: UnitSize[] = ["4BR VILLA","5BR VILLA","6BR VILLA","7BR VILLA","8BR VILLA","9BR VILLA"];

function getOccRates(unitSize: UnitSize, targetAdj = 0): number[] {
  const base = OCC_TARGETS[unitSize] ?? 0.65;
  const target = base + targetAdj;
  const shape = VILLA_UNIT_SIZES.includes(unitSize) ? OCC_BASE_SHAPE_VILLA : OCC_BASE_SHAPE_APT;
  return shape.map(v => Math.min(v * target, 0.90));
}

// Revenue distribution by property type
// Months order: Jun, Jul, Aug, Sep, Oct, Nov, Dec, Jan, Feb, Mar, Apr, May
// Revenue distribution — share of annual revenue earned each month.
// APARTMENTS: Summer monthly-stay rates cheap per night → low revenue share despite high occ.
//   Dec = clear peak (DSF + NYE). Oct–Feb = high season. Jun–Aug = low ADR monthly stays.
// Sep and May ADR share nudged down ~4% (revenue shifted to shoulder Aug/Oct/Apr/Jun)
// to match the occupancy bump above — same total annual revenue share.
// ADR share (revenue ÷ occupancy) now rises in even steps from Aug through the Dec peak —
// previously it spiked the month right after August. The small residual (Sep+Oct+Nov moved
// to a smoother curve) is absorbed by Dec/Jan, which were already the two next-highest months.
const DIST_APARTMENT = [0.0515,0.054,0.0565,0.072,0.087,0.104,0.127,0.110,0.096,0.092,0.0805,0.0695];
// VILLAS: Even stronger Dec peak (luxury family groups + NYE premium).
//   Summer dips more than apartments (fewer monthly stays). Jan/Feb still good but well below Dec.
// Same even-step ADR ramp Aug→Dec as apartments above.
const DIST_VILLA     = [0.054,0.052,0.054,0.0699,0.0871,0.1070,0.131,0.104,0.094,0.091,0.078,0.078];

export type FurnishedStatus = "Furnished" | "Unfurnished";

export type PropertyCondition = "Standard" | "Semi Upgraded" | "Fully Upgraded";

export const CONDITION_PREMIUMS: Record<PropertyCondition, { str: number; ltr: number }> = {
  "Standard":       { str: 0.00, ltr: 0.00 },
  "Semi Upgraded":  { str: 0.04, ltr: 0.02 },
  "Fully Upgraded": { str: 0.08, ltr: 0.06 },
};

export interface EstimatorInput {
  propertyName: string;
  buildingName: string;
  unitSize: UnitSize;
  unitType: UnitType;
  floor: number;
  view: ViewType;
  furnished: FurnishedStatus;
  managementFee: number;      // fraction e.g. 0.20
  occStrategy: OCCStrategy;
  propertyValue?: number;     // optional for yield calc
  sizeSqft?: number;          // optional unit size for rent-per-sqft refinement
  dldKey?: string;            // exact DLD building key (set when selected from DLD autocomplete)
  dldArea?: string;           // DLD administrative area name (from DLD dataset)
  premium?: number;           // fraction, default 0.15
  // longTermRent is now derived from market data — not a user input
  longTermRentOverride?: number;
  // SUBLEASE_RISK: skip forced minimum STR premium so the deal can naturally fail
  mode?: "SUBLEASE_RISK";
  // Building-level occupancy adjustment from sublease-str-demand.ts (fraction, e.g. 0.03)
  buildingOccAdj?: number;
  // Furnishing quality revenue multiplier: Basic=0.82, Standard=0.93, Premium=1.0, Luxury=1.10
  furnishingRevenueMult?: number;
  // Interior upgrade condition (owner estimator only)
  propertyCondition?: PropertyCondition;
}

export interface MonthlyRow {
  month: string;
  revenue: number;
  occupancy: number;
  adr: number;
  managementFee: number;
  utilities: number;
  maintenance: number;
  furnitureAmort: number;
  netToLandlord: number;
}

export interface EstimatorOutput {
  propertyName: string;
  buildingName: string;
  buildingInfo?: BuildingInfo;
  unitSize: UnitSize;
  unitType: UnitType;
  floor: number;
  view: ViewType;
  viewPremium: number;
  floorPremiumPct: number;
  tierPremiumPct: number;        // building tier-based premium
  longTermRent: number;
  ltrSource: string;
  ltrSampleSize?: number;   // DLD registered-contract count (confidence)
  ltrRangeLow?: number;     // DLD p25
  ltrRangeHigh?: number;    // DLD p75
  ltrAsOf?: string;         // latest DLD contract month used (YYYY-MM)
  ltrBasis?: "dld-building" | "dld-area" | "table";
  furnished: FurnishedStatus;
  annualRevenue: number;
  annualNetToLandlord: number;
  annualManagementFee: number;
  annualUtilities: number;
  annualMaintenance: number;
  annualFurnitureAmort: number;
  avgOccupancy: number;
  avgADR: number;
  strVsLtrDelta: number;         // net STR - LTR
  grossYield?: number;
  netYield?: number;
  suggestLongTerm: boolean;      // true if LT rent < 40k and in outskirt area
  months: MonthlyRow[];
  propertyCondition: PropertyCondition;
  conditionStrPremium: number;
  conditionLtrPremium: number;
}

export function runEstimator(input: EstimatorInput): EstimatorOutput {
  const {
    unitSize, unitType,
    managementFee, propertyValue,
    premium = 0.03, floor, view, buildingName,
    longTermRentOverride, furnished,
  } = input;

  const dist = unitType === "Villa" ? DIST_VILLA : DIST_APARTMENT;

  const vPremium = VIEW_PREMIUMS[view] ?? 0;
  const fPremium = floorPremium(floor);
  const tPremium = getTierPremium(buildingName); // Add tier-based premium

  // Dynamic occupancy baseline: the per-bedroom target is the floor (allow ≤3% dip),
  // and rises with property quality (tier + view + floor).
  // Smaller units (studio/1BR) fill easily so they capture the full upside; larger
  // units (2BR/3BR+) target a narrower guest pool and are harder to fill, so their
  // upside is dampened. The downside floor (-3%) is the same for all unit sizes.
  // Upside is uncapped here — only the 90% realism ceiling applies inside getOccRates.
  const rawOccAdj = (tPremium + vPremium + fPremium - 0.04) * 0.4;
  const occUpsideFactor =
    unitSize === "STU" || unitSize === "1BR" ? 1.0 :
    unitSize === "2BR" ? 0.6 :
    unitSize === "3BR" ? 0.45 :
    0.35; // 4BR+ apartments and villas — hardest to fill
  const buildingOccAdj = input.buildingOccAdj ?? 0;
  const occQualityAdj = (rawOccAdj >= 0 ? rawOccAdj * occUpsideFactor : Math.max(-0.03, rawOccAdj)) + buildingOccAdj;
  const occRates = getOccRates(unitSize, occQualityAdj);

  // For LTR-recommended areas, eliminate the base premium and reduce occupancy
  // so STR net revenue matches LTR rent (making the recommendation logical).
  // Studios/1BR in monthly-stay value areas are exempt (handled below).
  const ltrWarning = getLTRWarning(buildingName, unitSize, input.dldArea);
  const basePremium = ltrWarning ? 0 : premium;

  // STR demand profile by location + unit (prime, strong, value-monthly). Skipped in LTR areas.
  const strDemand = ltrWarning
    ? { tier: "standard" as const, revenuePremium: 0, occUplift: 0, lowSeasonOccUplift: 0 }
    : getSTRDemand(buildingName, unitSize);

  // Property condition premiums (owner estimator only; ignored in SUBLEASE_RISK mode)
  const condition = input.propertyCondition ?? "Standard";
  const condPremiums = CONDITION_PREMIUMS[condition];
  const conditionStrPremium = input.mode === "SUBLEASE_RISK" ? 0 : Math.min(condPremiums.str, 0.08);
  const conditionLtrPremium = input.mode === "SUBLEASE_RISK" ? 0 : Math.min(condPremiums.ltr, 0.06);

  // Cap the combined stacked premium — location/view/floor/tier/condition can all
  // apply to the same unit simultaneously, so cap the total to keep STR revenue realistic.
  const MAX_TOTAL_PREMIUM = 0.25;
  const totalPremium = Math.min(
    MAX_TOTAL_PREMIUM,
    basePremium + vPremium + fPremium + tPremium + strDemand.revenuePremium + conditionStrPremium
  );

  // Low season = Jun, Jul, Aug, Sep (indices 0–3 in MONTHS)
  const isLowSeason = (i: number) => i <= 3;

  // Apply occupancy loss for LTR-recommended areas; otherwise add demand uplift
  // (with extra low-season support for monthly-stay studios), capped at 90%.
  const occRatesAdjusted = ltrWarning
    ? occRates.map(rate => rate * (1 - ltrWarning.avgOccupancyLoss))
    : occRates.map((rate, i) =>
        Math.min(0.90, rate + strDemand.occUplift + (isLowSeason(i) ? strDemand.lowSeasonOccUplift : 0) + (i === 3 ? (strDemand.sepOccUplift ?? 0) : 0)));

  const buildingInfo = BUILDING_DIRECTORY[buildingName];

  // Derive LTR from market data unless overridden internally
  const ltrMarket = getLTRMarketRent(buildingName, unitSize, input.sizeSqft, input.dldKey, input.dldArea);
  const { rent: marketRent, source: ltrSource } = ltrMarket;
  // baseLTR (no condition bump) is what STR revenue is derived from — conditionStrPremium
  // already captures the STR-side uplift for an upgraded interior, so deriving revenue from
  // the condition-bumped longTermRent as well would double-count the same upgrade twice
  // (once via conditionLtrPremium, again via conditionStrPremium stacked on top of it).
  // longTermRent (bumped) is kept only for display/comparison — the LTR benchmark shown
  // to the user, and the STR-vs-LTR delta, both correctly reflect the upgraded rent.
  const baseLTR = longTermRentOverride ?? marketRent;
  const longTermRent = baseLTR * (1 + conditionLtrPremium);

  // Annual owner-paid running costs (in STR the OWNER pays these; in LTR the tenant does).
  const annualUtilEst = MONTHS.reduce((s, _m, i) => s + DEWA[unitSize][i] + AC[unitSize][i] + DU[unitSize], 0);
  const annualMaintEst = MAINTENANCE[unitSize] * 12;
  const furnitureAmortAnnual = furnished === "Furnished"
    ? FURNITURE_AMORT_REFRESH[unitSize]
    : FURNITURE_AMORT_FULL[unitSize];
  const furnitureAmortMonthly = furnitureAmortAnnual / 12;

  // STR must clear a MEANINGFUL margin over LTR for an owner to bother (extra management,
  // furnishing, vacancy risk). Because the owner absorbs utilities under STR, a flat premium
  // can leave net BELOW LTR. So we floor the premium so STR net is always at least
  // MIN_STR_NET_ADVANTAGE above LTR — net = LTR × (1 + premium) − utilities − maintenance.
  //   required premium = minAdvantage + (utilities + maintenance) / LTR
  // Premium properties whose natural premium already exceeds this keep their higher value.
  // LTR-recommended areas are exempt (there STR is intentionally not advantaged).
  // SUBLEASE_RISK mode: do not force a minimum premium — let the deal fail naturally.
  // Owner estimator mode: floor the premium so STR net is always ≥ 18% above LTR.
  // Studios get a higher net-advantage floor than other unit sizes: fixed running costs
  // (utilities/maintenance/furniture) eat a much larger share of a studio's small LTR
  // baseline, so the standard 14% floor left studio STR net too close to LTR net.
  const MIN_STR_NET_ADVANTAGE = unitSize === "STU" ? 0.26 : 0.09;
  // Costs are subtracted directly from net (net = LTR × (1 + premium) − costs), so any
  // premium value needs this same costs/LTR offset added to translate into an actual net
  // advantage over LTR — applied uniformly here so the natural (view/floor/tier/location)
  // stack and the minimum-advantage floor both produce their stated net advantage cleanly,
  // instead of only the floor path compensating for costs.
  const costsRatio = (annualUtilEst + annualMaintEst + furnitureAmortAnnual) / baseLTR;
  // LTR-recommended areas: STR net should land at a realistic, proportional disadvantage
  // (the area's avgOccupancyLoss, e.g. Dubai South's 22%) below LTR — not a raw fixed-AED
  // cost subtraction. Fixed running costs (DEWA/maintenance/furniture) don't scale down
  // with a cheaper area's LTR baseline, so subtracting them unadjusted from an unpremiumed
  // revenue exaggerates the gap far beyond the stated occupancy loss (a real Dubai South
  // case showed -38% net vs a documented -22% occupancy loss). Solving
  // baseLTR*(1+premium) - costs = baseLTR*(1-avgOccupancyLoss) for premium:
  const effectivePremium = input.mode === "SUBLEASE_RISK"
    ? totalPremium
    : ltrWarning
    ? costsRatio - ltrWarning.avgOccupancyLoss
    : Math.max(totalPremium, MIN_STR_NET_ADVANTAGE) + costsRatio;

  // Target annual STR revenue. In SUBLEASE_RISK mode a furnishing multiplier scales this
  // down so Basic/Standard furnishing naturally reduces ADR and increases break-even occupancy.
  const furnishingMult = input.furnishingRevenueMult ?? 1;
  const targetRevenue = ((baseLTR * (1 + effectivePremium)) / (1 - managementFee)) * furnishingMult;

  const months: MonthlyRow[] = MONTHS.map((month, i) => {
    const revenue = targetRevenue * dist[i];
    const daysInMonth = [30,31,31,30,31,30,31,31,28,31,30,31][i];
    const occ = occRatesAdjusted[i];
    const bookedNights = daysInMonth * occ;
    const adr = bookedNights > 0 ? revenue / bookedNights : 0;
    const mgmtFee = revenue * managementFee;
    const utilities = DEWA[unitSize][i] + AC[unitSize][i] + DU[unitSize];
    const maint = MAINTENANCE[unitSize];
    const furnitureAmort = furnitureAmortMonthly;
    const net = revenue - mgmtFee - utilities - maint - furnitureAmort;

    return {
      month,
      revenue,
      occupancy: occ,
      adr,
      managementFee: mgmtFee,
      utilities,
      maintenance: maint,
      furnitureAmort,
      netToLandlord: net,
    };
  });

  const annualRevenue = months.reduce((s, m) => s + m.revenue, 0);
  const annualNetToLandlord = months.reduce((s, m) => s + m.netToLandlord, 0);
  const annualManagementFee = months.reduce((s, m) => s + m.managementFee, 0);
  const annualUtilities = months.reduce((s, m) => s + m.utilities, 0);
  const annualMaintenance = months.reduce((s, m) => s + m.maintenance, 0);
  const annualFurnitureAmort = months.reduce((s, m) => s + m.furnitureAmort, 0);
  const avgOccupancy = months.reduce((s, m) => s + m.occupancy, 0) / 12;
  const avgADR = months.reduce((s, m) => s + m.adr, 0) / 12;

  // Get building area from either new database or old directory
  const buildingArea = getBuildingInfo(buildingName)?.area || buildingInfo?.area || "";
  const suggestLongTerm = isEligibleForLongTermSuggestion(longTermRent, buildingArea);

  return {
    propertyName: input.propertyName,
    buildingName,
    buildingInfo,
    unitSize,
    unitType,
    floor,
    view,
    viewPremium: vPremium,
    floorPremiumPct: fPremium,
    tierPremiumPct: tPremium,
    longTermRent,
    ltrSource,
    ltrSampleSize: ltrMarket.sampleSize,
    ltrRangeLow: ltrMarket.rangeLow,
    ltrRangeHigh: ltrMarket.rangeHigh,
    ltrAsOf: ltrMarket.asOf,
    ltrBasis: ltrMarket.basis,
    furnished,
    annualRevenue,
    annualNetToLandlord,
    annualManagementFee,
    annualUtilities,
    annualMaintenance,
    annualFurnitureAmort,
    avgOccupancy,
    avgADR,
    strVsLtrDelta: annualNetToLandlord - longTermRent,
    grossYield: propertyValue ? (annualRevenue / propertyValue) * 100 : undefined,
    netYield: propertyValue ? (annualNetToLandlord / propertyValue) * 100 : undefined,
    suggestLongTerm,
    months,
    propertyCondition: condition,
    conditionStrPremium,
    conditionLtrPremium,
  };
}

// Dubai community benchmark data (mocked — replace with real data source)
export interface CommunityBenchmark {
  community: string;
  avgOccupancy: number;
  avgADR: number;
  avgAnnualNet: number;
}

export const DUBAI_BENCHMARKS: Record<UnitSize, CommunityBenchmark[]> = {
  "1BR": [
    { community: "Downtown Dubai", avgOccupancy: 0.72, avgADR: 1450, avgAnnualNet: 210000 },
    { community: "Dubai Marina", avgOccupancy: 0.68, avgADR: 1200, avgAnnualNet: 185000 },
    { community: "Palm Jumeirah", avgOccupancy: 0.74, avgADR: 1800, avgAnnualNet: 260000 },
    { community: "JBR", avgOccupancy: 0.70, avgADR: 1350, avgAnnualNet: 195000 },
    { community: "Business Bay", avgOccupancy: 0.65, avgADR: 1100, avgAnnualNet: 165000 },
  ],
  "2BR": [
    { community: "Downtown Dubai", avgOccupancy: 0.70, avgADR: 2100, avgAnnualNet: 295000 },
    { community: "Dubai Marina", avgOccupancy: 0.66, avgADR: 1750, avgAnnualNet: 255000 },
    { community: "Palm Jumeirah", avgOccupancy: 0.72, avgADR: 2600, avgAnnualNet: 370000 },
    { community: "JBR", avgOccupancy: 0.68, avgADR: 1950, avgAnnualNet: 275000 },
    { community: "Business Bay", avgOccupancy: 0.63, avgADR: 1600, avgAnnualNet: 225000 },
  ],
  "STU": [
    { community: "Downtown Dubai", avgOccupancy: 0.74, avgADR: 850, avgAnnualNet: 130000 },
    { community: "Dubai Marina", avgOccupancy: 0.70, avgADR: 720, avgAnnualNet: 110000 },
    { community: "Palm Jumeirah", avgOccupancy: 0.76, avgADR: 1100, avgAnnualNet: 160000 },
    { community: "JBR", avgOccupancy: 0.72, avgADR: 800, avgAnnualNet: 120000 },
    { community: "Business Bay", avgOccupancy: 0.67, avgADR: 650, avgAnnualNet: 95000 },
  ],
  "3BR": [
    { community: "Downtown Dubai", avgOccupancy: 0.68, avgADR: 2800, avgAnnualNet: 380000 },
    { community: "Dubai Marina", avgOccupancy: 0.64, avgADR: 2400, avgAnnualNet: 330000 },
    { community: "Palm Jumeirah", avgOccupancy: 0.70, avgADR: 3500, avgAnnualNet: 480000 },
    { community: "JBR", avgOccupancy: 0.66, avgADR: 2600, avgAnnualNet: 355000 },
    { community: "Business Bay", avgOccupancy: 0.61, avgADR: 2100, avgAnnualNet: 285000 },
  ],
  "4BR APT": [{ community: "Downtown Dubai", avgOccupancy: 0.65, avgADR: 3500, avgAnnualNet: 450000 }, { community: "Palm Jumeirah", avgOccupancy: 0.67, avgADR: 4200, avgAnnualNet: 540000 }, { community: "Dubai Marina", avgOccupancy: 0.62, avgADR: 3100, avgAnnualNet: 400000 }, { community: "JBR", avgOccupancy: 0.63, avgADR: 3300, avgAnnualNet: 420000 }, { community: "Business Bay", avgOccupancy: 0.58, avgADR: 2800, avgAnnualNet: 360000 }],
  "5BR APT": [{ community: "Downtown Dubai", avgOccupancy: 0.63, avgADR: 4200, avgAnnualNet: 530000 }, { community: "Palm Jumeirah", avgOccupancy: 0.65, avgADR: 5000, avgAnnualNet: 640000 }, { community: "Dubai Marina", avgOccupancy: 0.60, avgADR: 3800, avgAnnualNet: 480000 }, { community: "JBR", avgOccupancy: 0.61, avgADR: 4000, avgAnnualNet: 505000 }, { community: "Business Bay", avgOccupancy: 0.56, avgADR: 3400, avgAnnualNet: 430000 }],
  "6BR APT": [{ community: "Palm Jumeirah", avgOccupancy: 0.63, avgADR: 6000, avgAnnualNet: 760000 }, { community: "Downtown Dubai", avgOccupancy: 0.61, avgADR: 5200, avgAnnualNet: 650000 }, { community: "Dubai Marina", avgOccupancy: 0.58, avgADR: 4600, avgAnnualNet: 575000 }, { community: "JBR", avgOccupancy: 0.59, avgADR: 4800, avgAnnualNet: 600000 }, { community: "Business Bay", avgOccupancy: 0.54, avgADR: 4100, avgAnnualNet: 515000 }],
  "4BR VILLA": [{ community: "Palm Jumeirah", avgOccupancy: 0.70, avgADR: 5500, avgAnnualNet: 750000 }, { community: "Emirates Hills", avgOccupancy: 0.65, avgADR: 6000, avgAnnualNet: 810000 }, { community: "Jumeirah", avgOccupancy: 0.68, avgADR: 4800, avgAnnualNet: 660000 }, { community: "Arabian Ranches", avgOccupancy: 0.60, avgADR: 4000, avgAnnualNet: 545000 }, { community: "The Springs", avgOccupancy: 0.62, avgADR: 3800, avgAnnualNet: 520000 }],
  "5BR VILLA": [{ community: "Palm Jumeirah", avgOccupancy: 0.68, avgADR: 7500, avgAnnualNet: 1000000 }, { community: "Emirates Hills", avgOccupancy: 0.63, avgADR: 8000, avgAnnualNet: 1050000 }, { community: "Jumeirah", avgOccupancy: 0.66, avgADR: 6500, avgAnnualNet: 875000 }, { community: "Arabian Ranches", avgOccupancy: 0.58, avgADR: 5500, avgAnnualNet: 725000 }, { community: "The Springs", avgOccupancy: 0.60, avgADR: 5200, avgAnnualNet: 680000 }],
  "6BR VILLA": [{ community: "Palm Jumeirah", avgOccupancy: 0.66, avgADR: 9500, avgAnnualNet: 1250000 }, { community: "Emirates Hills", avgOccupancy: 0.61, avgADR: 10500, avgAnnualNet: 1350000 }, { community: "Jumeirah", avgOccupancy: 0.64, avgADR: 8200, avgAnnualNet: 1075000 }, { community: "Arabian Ranches", avgOccupancy: 0.56, avgADR: 7000, avgAnnualNet: 920000 }, { community: "The Springs", avgOccupancy: 0.58, avgADR: 6500, avgAnnualNet: 845000 }],
  "7BR VILLA": [{ community: "Palm Jumeirah", avgOccupancy: 0.64, avgADR: 12000, avgAnnualNet: 1550000 }, { community: "Emirates Hills", avgOccupancy: 0.59, avgADR: 13500, avgAnnualNet: 1680000 }, { community: "Jumeirah", avgOccupancy: 0.62, avgADR: 10500, avgAnnualNet: 1340000 }, { community: "Arabian Ranches", avgOccupancy: 0.54, avgADR: 9000, avgAnnualNet: 1150000 }, { community: "The Springs", avgOccupancy: 0.56, avgADR: 8500, avgAnnualNet: 1060000 }],
  "8BR VILLA": [{ community: "Palm Jumeirah", avgOccupancy: 0.62, avgADR: 15000, avgAnnualNet: 1900000 }, { community: "Emirates Hills", avgOccupancy: 0.57, avgADR: 17000, avgAnnualNet: 2050000 }, { community: "Jumeirah", avgOccupancy: 0.60, avgADR: 13000, avgAnnualNet: 1650000 }, { community: "Arabian Ranches", avgOccupancy: 0.52, avgADR: 11000, avgAnnualNet: 1400000 }, { community: "The Springs", avgOccupancy: 0.54, avgADR: 10500, avgAnnualNet: 1320000 }],
  "9BR VILLA": [{ community: "Palm Jumeirah", avgOccupancy: 0.60, avgADR: 20000, avgAnnualNet: 2500000 }, { community: "Emirates Hills", avgOccupancy: 0.55, avgADR: 22000, avgAnnualNet: 2700000 }, { community: "Jumeirah", avgOccupancy: 0.58, avgADR: 17000, avgAnnualNet: 2150000 }, { community: "Arabian Ranches", avgOccupancy: 0.50, avgADR: 14000, avgAnnualNet: 1800000 }, { community: "The Springs", avgOccupancy: 0.52, avgADR: 13000, avgAnnualNet: 1650000 }],
};

export function fmt(n: number): string {
  return new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(n);
}

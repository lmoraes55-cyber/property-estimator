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
  | "Sea View" | "Burj Khalifa View" | "Full Marina View"
  | "Pool View" | "City View" | "Garden / Park View" | "Standard View";

export const VIEW_PREMIUMS: Record<ViewType, number> = {
  "Burj Khalifa View":  0.10,
  "Sea View":           0.08,
  "Full Marina View":   0.06,
  "Pool View":          0.03,
  "City View":          0.02,
  "Garden / Park View": 0.01,
  "Standard View":      0.00,
};

// Floor premium: realistic Dubai STR uplift by floor band
export function floorPremium(floor: number): number {
  if (floor >= 40) return 0.08;
  if (floor >= 30) return 0.06;
  if (floor >= 20) return 0.04;
  if (floor >= 10) return 0.02;
  if (floor >= 5)  return 0.01;
  return 0;
}

// Areas where STR does not meaningfully outperform LTR
export interface LTRAreaWarning {
  reason: string;           // why STR underperforms here
  avgOccupancyLoss: number; // how much lower OCC is vs prime areas (fraction)
  stillPossible: boolean;   // can owner still do STR if they want flexibility?
}

export const LTR_RECOMMENDED_AREAS: Record<string, LTRAreaWarning> = {
  "Dubai South":   { reason: "Low tourist footfall and limited short-term demand in this corridor.", avgOccupancyLoss: 0.22, stillPossible: true },
  "Furjan":        { reason: "Predominantly residential community with low STR guest demand.", avgOccupancyLoss: 0.20, stillPossible: true },
  "Arjan":         { reason: "Emerging area with oversupply and low nightly rates for short-term.", avgOccupancyLoss: 0.18, stillPossible: true },
  "DAMAC Hills 2": { reason: "Remote location from tourist hubs limits STR occupancy significantly.", avgOccupancyLoss: 0.25, stillPossible: true },
  "Dubailand":     { reason: "Far from key attractions — guests prefer more central locations.", avgOccupancyLoss: 0.24, stillPossible: true },
  "International City": { reason: "Low ADR ceiling and limited STR demand in this community.", avgOccupancyLoss: 0.26, stillPossible: true },
  "Discovery Gardens": { reason: "Mostly long-term resident community with limited tourist traffic.", avgOccupancyLoss: 0.19, stillPossible: true },
  "Remraam":       { reason: "Gated community far from attractions — STR demand is very limited.", avgOccupancyLoss: 0.23, stillPossible: true },
  "DAMAC Hills":   { reason: "Villa community with distance from tourist areas — STR yields are moderate.", avgOccupancyLoss: 0.12, stillPossible: true },
  "Town Square":   { reason: "New developing area with limited short-term rental guest demand currently.", avgOccupancyLoss: 0.20, stillPossible: true },
};

// Check if a building or manually typed area is in an LTR-recommended zone
export function getLTRWarning(buildingName: string): LTRAreaWarning | null {
  // Check building directory first
  const info = BUILDING_DIRECTORY[buildingName];
  if (info) {
    return LTR_RECOMMENDED_AREAS[info.community] ?? null;
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
// These replace the manual owner input — GroundWorks sets this value internally.

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
    "1BR": 140000, "2BR": 210000, "3BR": 300000, "4BR APT": 420000,
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

export function getLTRMarketRent(buildingName: string, unitSize: UnitSize): { rent: number; source: string } {
  const info = BUILDING_DIRECTORY[buildingName];
  const community = info?.community;
  const communityRents = community ? LTR_MARKET_RENTS[community] : null;
  const rent = communityRents?.[unitSize] ?? LTR_FALLBACK[unitSize] ?? 100000;
  const source = communityRents?.[unitSize]
    ? `${community} market average`
    : "Dubai market average";
  return { rent, source };
}

// Dubai buildings mapped to community + area type
export interface BuildingInfo {
  community: string;
  area: string;
  tier: "ultra-luxury" | "luxury" | "mid";
}

export const BUILDING_DIRECTORY: Record<string, BuildingInfo> = {
  // Downtown / Burj Khalifa area
  "Burj Khalifa":          { community: "Downtown Dubai", area: "Downtown Dubai", tier: "ultra-luxury" },
  "Address Boulevard":     { community: "Downtown Dubai", area: "Downtown Dubai", tier: "ultra-luxury" },
  "The Address Residences": { community: "Downtown Dubai", area: "Downtown Dubai", tier: "ultra-luxury" },
  "Vida Residences":       { community: "Downtown Dubai", area: "Downtown Dubai", tier: "luxury" },
  "Act One Act Two":       { community: "Downtown Dubai", area: "Downtown Dubai", tier: "luxury" },
  "29 Boulevard":          { community: "Downtown Dubai", area: "Downtown Dubai", tier: "luxury" },
  "Burj Vista":            { community: "Downtown Dubai", area: "Downtown Dubai", tier: "luxury" },
  "Forte":                 { community: "Downtown Dubai", area: "Downtown Dubai", tier: "luxury" },
  "IL Primo":              { community: "Downtown Dubai", area: "Downtown Dubai", tier: "ultra-luxury" },
  "St Regis Residences":   { community: "Downtown Dubai", area: "Downtown Dubai", tier: "ultra-luxury" },
  // Marina
  "Marina Gate":           { community: "Dubai Marina", area: "Dubai Marina", tier: "luxury" },
  "Marina Pinnacle":       { community: "Dubai Marina", area: "Dubai Marina", tier: "mid" },
  "Cayan Tower":           { community: "Dubai Marina", area: "Dubai Marina", tier: "luxury" },
  "Princess Tower":        { community: "Dubai Marina", area: "Dubai Marina", tier: "luxury" },
  "Torch Tower":           { community: "Dubai Marina", area: "Dubai Marina", tier: "mid" },
  "Sulafa Tower":          { community: "Dubai Marina", area: "Dubai Marina", tier: "mid" },
  "Silverene":             { community: "Dubai Marina", area: "Dubai Marina", tier: "luxury" },
  "Studio One":            { community: "Dubai Marina", area: "Dubai Marina", tier: "mid" },
  // JBR
  "Sadaf":                 { community: "JBR", area: "JBR", tier: "mid" },
  "Rimal":                 { community: "JBR", area: "JBR", tier: "mid" },
  "Bahar":                 { community: "JBR", area: "JBR", tier: "mid" },
  "Murjan":                { community: "JBR", area: "JBR", tier: "mid" },
  "The Walk":              { community: "JBR", area: "JBR", tier: "luxury" },
  "Five JBR":              { community: "JBR", area: "JBR", tier: "luxury" },
  // Palm Jumeirah
  "Atlantis The Royal Residences": { community: "Palm Jumeirah", area: "Palm Jumeirah", tier: "ultra-luxury" },
  "One Palm":              { community: "Palm Jumeirah", area: "Palm Jumeirah", tier: "ultra-luxury" },
  "Palm Beach Towers":     { community: "Palm Jumeirah", area: "Palm Jumeirah", tier: "luxury" },
  "Tiara Residences":      { community: "Palm Jumeirah", area: "Palm Jumeirah", tier: "luxury" },
  "Shoreline Apartments":  { community: "Palm Jumeirah", area: "Palm Jumeirah", tier: "mid" },
  "Garden Homes":          { community: "Palm Jumeirah", area: "Palm Jumeirah", tier: "luxury" },
  // Business Bay
  "Damac Towers":          { community: "Business Bay", area: "Business Bay", tier: "luxury" },
  "Executive Bay":         { community: "Business Bay", area: "Business Bay", tier: "mid" },
  "Aykon City":            { community: "Business Bay", area: "Business Bay", tier: "luxury" },
  "DAMAC Maison":          { community: "Business Bay", area: "Business Bay", tier: "luxury" },
  "Paramount Tower":       { community: "Business Bay", area: "Business Bay", tier: "luxury" },
  // DIFC
  "Index Tower":           { community: "DIFC", area: "DIFC", tier: "luxury" },
  "Liberty House":         { community: "DIFC", area: "DIFC", tier: "luxury" },
  // Other
  // LTR-recommended zones
  "Aurum Villas":          { community: "Furjan", area: "Furjan", tier: "mid" },
  "Masakin Al Furjan":     { community: "Furjan", area: "Furjan", tier: "mid" },
  "Quortaj":               { community: "Furjan", area: "Furjan", tier: "mid" },
  "Celestia":              { community: "Dubai South", area: "Dubai South", tier: "mid" },
  "The Pulse":             { community: "Dubai South", area: "Dubai South", tier: "mid" },
  "Miraclz":               { community: "Arjan", area: "Arjan", tier: "mid" },
  "Binghatti Stars":       { community: "Arjan", area: "Arjan", tier: "mid" },
  "Artesia":               { community: "DAMAC Hills", area: "DAMAC Hills", tier: "mid" },
  "Akoya":                 { community: "DAMAC Hills 2", area: "DAMAC Hills 2", tier: "mid" },
  "Luma 22":               { community: "JVC", area: "Jumeirah Village Circle", tier: "mid" },
  "Creek Gate":            { community: "Dubai Creek Harbour", area: "Dubai Creek Harbour", tier: "luxury" },
  "The Grand":             { community: "Dubai Creek Harbour", area: "Dubai Creek Harbour", tier: "luxury" },
  "Emaar Beachfront":      { community: "Emaar Beachfront", area: "Dubai Harbour", tier: "luxury" },
  "Beach Vista":           { community: "Emaar Beachfront", area: "Dubai Harbour", tier: "luxury" },
  "Palace Beach Residence":{ community: "Emaar Beachfront", area: "Dubai Harbour", tier: "ultra-luxury" },
};

// Monthly AC costs by unit size
const AC: Record<UnitSize, number[]> = {
  "STU":      [120,120,150,170,220,270,270,270,220,170,150,120],
  "1BR":      [192,192,240,272,352,432,432,432,352,272,240,192],
  "2BR":      [307.2,307.2,384,435.2,563.2,691.2,691.2,691.2,563.2,435.2,384,307.2],
  "3BR":      [460.8,460.8,576,652.8,844.8,1036.8,1036.8,1036.8,844.8,652.8,576,460.8],
  "4BR APT":  [645.12,645.12,806.4,913.92,1182.72,1451.52,1451.52,1451.52,1182.72,913.92,806.4,645.12],
  "5BR APT":  [838.656,838.656,1048.32,1188.096,1537.536,1886.976,1886.976,1886.976,1537.536,1188.096,1048.32,838.656],
  "6BR APT":  [1006.3872,1006.3872,1257.984,1425.7152,1845.0432,2264.3712,2264.3712,2264.3712,1845.0432,1425.7152,1257.984,1006.3872],
  "4BR VILLA":[1811.49696,1811.49696,2264.3712,2566.28736,3321.07776,4075.86816,4075.86816,4075.86816,3321.07776,2566.28736,2264.3712,1811.49696],
  "5BR VILLA":[2354.946048,2354.946048,2943.68256,3336.173568,4317.401088,5298.628608,5298.628608,5298.628608,4317.401088,3336.173568,2943.68256,2354.946048],
  "6BR VILLA":[2708.187955,2708.187955,3385.234944,3836.599603,4965.011251,6093.422899,6093.422899,6093.422899,4965.011251,3836.599603,3385.234944,2708.187955],
  "7BR VILLA":[3114.416148,3114.416148,3893.020186,4412.089544,5709.762939,7007.436334,7007.436334,7007.436334,5709.762939,4412.089544,3893.020186,3114.416148],
  "8BR VILLA":[3581.578571,3581.578571,4476.973213,5073.902975,6566.22738,8058.551784,8058.551784,8058.551784,6566.22738,5073.902975,4476.973213,3581.578571],
  "9BR VILLA":[6178.223035,6178.223035,7722.778793,8752.482632,11326.74223,13901.00183,13901.00183,13901.00183,11326.74223,8752.482632,7722.778793,6178.223035],
};

// Monthly DEWA costs by unit size
const DEWA: Record<UnitSize, number[]> = {
  "STU":      [170,170,170,200,200,220,220,220,200,200,170,170],
  "1BR":      [272,272,272,320,320,352,352,352,320,320,272,272],
  "2BR":      [435.2,435.2,435.2,512,512,563.2,563.2,563.2,512,512,435.2,435.2],
  "3BR":      [652.8,652.8,652.8,768,768,844.8,844.8,844.8,768,768,652.8,652.8],
  "4BR APT":  [913.92,913.92,913.92,1075.2,1075.2,1182.72,1182.72,1182.72,1075.2,1075.2,913.92,913.92],
  "5BR APT":  [1188.096,1188.096,1188.096,1397.76,1397.76,1537.536,1537.536,1537.536,1397.76,1397.76,1188.096,1188.096],
  "6BR APT":  [1425.7152,1425.7152,1425.7152,1677.312,1677.312,1845.0432,1845.0432,1845.0432,1677.312,1677.312,1425.7152,1425.7152],
  "4BR VILLA":[2566.28736,2566.28736,2566.28736,3019.1616,3019.1616,3321.07776,3321.07776,3321.07776,3019.1616,3019.1616,2566.28736,2566.28736],
  "5BR VILLA":[3336.173568,3336.173568,3336.173568,3924.91008,3924.91008,4317.401088,4317.401088,4317.401088,3924.91008,3924.91008,3336.173568,3336.173568],
  "6BR VILLA":[3836.599603,3836.599603,3836.599603,4513.646592,4513.646592,4965.011251,4965.011251,4965.011251,4513.646592,4513.646592,3836.599603,3836.599603],
  "7BR VILLA":[4412.089544,4412.089544,4412.089544,5190.693581,5190.693581,5709.762939,5709.762939,5709.762939,5190.693581,5190.693581,4412.089544,4412.089544],
  "8BR VILLA":[5073.902975,5073.902975,5073.902975,5969.297618,5969.297618,6566.22738,6566.22738,6566.22738,5969.297618,5969.297618,5073.902975,5073.902975],
  "9BR VILLA":[8752.482632,8752.482632,8752.482632,10297.03839,10297.03839,11326.74223,11326.74223,11326.74223,10297.03839,10297.03839,8752.482632,8752.482632],
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
  "STU": 100, "1BR": 150, "2BR": 200, "3BR": 250,
  "4BR APT": 300, "5BR APT": 350, "6BR APT": 400,
  "4BR VILLA": 2000, "5BR VILLA": 2500, "6BR VILLA": 2500,
  "7BR VILLA": 3000, "8BR VILLA": 3000, "9BR VILLA": 6000,
};

// Occupancy base curves — seasonal shape only (avg ≈ 1.0 when normalised)
// Scaled per unit size to hit target annual occupancy averages:
//   STU / 1BR → 75%  |  2BR → 70%  |  3BR → 65%  |  Villas → 60%
const OCC_BASE_SHAPE = [1.077,1.064,1.054,1.044,1.034,0.895,0.886,0.877,0.891,1.034,1.050,1.063];

const OCC_TARGETS: Record<UnitSize, number> = {
  "STU": 0.75, "1BR": 0.75, "2BR": 0.70, "3BR": 0.65,
  "4BR APT": 0.62, "5BR APT": 0.60, "6BR APT": 0.58,
  "4BR VILLA": 0.60, "5BR VILLA": 0.58, "6BR VILLA": 0.56,
  "7BR VILLA": 0.55, "8BR VILLA": 0.54, "9BR VILLA": 0.52,
};

function getOccRates(unitSize: UnitSize): number[] {
  const target = OCC_TARGETS[unitSize] ?? 0.65;
  return OCC_BASE_SHAPE.map(v => Math.min(v * target, 0.97));
}

// Revenue distribution by property type
const DIST_APARTMENT = [0.103,0.088,0.103,0.090,0.082,0.053,0.053,0.053,0.070,0.092,0.105,0.108];
const DIST_VILLA     = [0.102,0.080,0.092,0.075,0.075,0.069,0.070,0.072,0.075,0.088,0.091,0.111];

export type FurnishedStatus = "Furnished" | "Unfurnished";

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
  premium?: number;           // fraction, default 0.15
  // longTermRent is now derived from market data — not a user input
  longTermRentOverride?: number;
}

export interface MonthlyRow {
  month: string;
  revenue: number;
  occupancy: number;
  adr: number;
  managementFee: number;
  utilities: number;
  maintenance: number;
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
  longTermRent: number;
  ltrSource: string;
  furnished: FurnishedStatus;
  annualRevenue: number;
  annualNetToLandlord: number;
  annualManagementFee: number;
  annualUtilities: number;
  annualMaintenance: number;
  avgOccupancy: number;
  avgADR: number;
  strVsLtrDelta: number;         // net STR - LTR
  grossYield?: number;
  netYield?: number;
  months: MonthlyRow[];
}

export function runEstimator(input: EstimatorInput): EstimatorOutput {
  const {
    unitSize, unitType,
    managementFee, propertyValue,
    premium = 0.15, floor, view, buildingName,
    longTermRentOverride, furnished,
  } = input;

  const occRates = getOccRates(unitSize);
  const dist = unitType === "Villa" ? DIST_VILLA : DIST_APARTMENT;

  const vPremium = VIEW_PREMIUMS[view] ?? 0;
  const fPremium = floorPremium(floor);

  // For LTR-recommended areas, eliminate the base premium and reduce occupancy
  // so STR net revenue matches LTR rent (making the recommendation logical)
  const ltrWarning = getLTRWarning(buildingName);
  const basePremium = ltrWarning ? 0 : premium;
  const totalPremium = basePremium + vPremium + fPremium;

  // Apply occupancy loss for LTR-recommended areas
  const occRatesAdjusted = ltrWarning
    ? occRates.map(rate => rate * (1 - ltrWarning.avgOccupancyLoss))
    : occRates;

  const buildingInfo = BUILDING_DIRECTORY[buildingName];

  // Derive LTR from market data unless overridden internally
  const { rent: marketRent, source: ltrSource } = getLTRMarketRent(buildingName, unitSize);
  const longTermRent = longTermRentOverride ?? marketRent;

  // Target annual STR revenue: LTR + blended premium (base + view + floor), scaled by management fee
  const targetRevenue = (longTermRent * (1 + totalPremium)) / (1 - managementFee);

  const months: MonthlyRow[] = MONTHS.map((month, i) => {
    const revenue = targetRevenue * dist[i];
    const daysInMonth = [30,31,31,30,31,30,31,31,28,31,30,31][i];
    const occ = occRatesAdjusted[i];
    const bookedNights = daysInMonth * occ;
    const adr = bookedNights > 0 ? revenue / bookedNights : 0;
    const mgmtFee = revenue * managementFee;
    const utilities = DEWA[unitSize][i] + AC[unitSize][i] + DU[unitSize];
    const maint = MAINTENANCE[unitSize];
    const net = revenue - mgmtFee - utilities - maint;

    return {
      month,
      revenue,
      occupancy: occ,
      adr,
      managementFee: mgmtFee,
      utilities,
      maintenance: maint,
      netToLandlord: net,
    };
  });

  const annualRevenue = months.reduce((s, m) => s + m.revenue, 0);
  const annualNetToLandlord = months.reduce((s, m) => s + m.netToLandlord, 0);
  const annualManagementFee = months.reduce((s, m) => s + m.managementFee, 0);
  const annualUtilities = months.reduce((s, m) => s + m.utilities, 0);
  const annualMaintenance = months.reduce((s, m) => s + m.maintenance, 0);
  const avgOccupancy = months.reduce((s, m) => s + m.occupancy, 0) / 12;
  const avgADR = months.reduce((s, m) => s + m.adr, 0) / 12;

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
    longTermRent,
    ltrSource,
    furnished,
    annualRevenue,
    annualNetToLandlord,
    annualManagementFee,
    annualUtilities,
    annualMaintenance,
    avgOccupancy,
    avgADR,
    strVsLtrDelta: annualNetToLandlord - longTermRent,
    grossYield: propertyValue ? (annualRevenue / propertyValue) * 100 : undefined,
    netYield: propertyValue ? (annualNetToLandlord / propertyValue) * 100 : undefined,
    months,
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

// ── Operator Directory ──────────────────────────────────────────────────────

export interface OTAPresence {
  platform: string;
  listed: boolean;
  rating?: number;   // out of 5
}

export interface Review {
  source: "Google" | "Airbnb" | "Booking.com" | "Trustpilot" | "Vrbo";
  author: string;
  date: string;
  rating: number;
  text: string;
}

export interface Operator {
  id: string;
  name: string;
  tagline: string;
  founded: number;
  commission: [number, number];
  minStandard: string;
  onboardingWeeks: number;
  portfolio: number;            // approx units managed
  googleRating: number;
  googleReviewCount: number;
  ota: OTAPresence[];
  bestFor: string[];
  communities: string[];        // areas they operate in
  unitTypes: UnitType[];
  minTier: "mid" | "luxury" | "ultra-luxury";
  pros: string[];
  cons: string[];
  recentReviews: Review[];
  // Premium profile fields
  logo?: string;                // Company logo URL
  website?: string;             // Company website URL
  phone?: string;               // Company phone number
  email?: string;               // Company email
  // Enhanced operator intelligence fields
  tier?: string;                // Tier classification from CSV
  portfolioValue?: string;      // Estimated portfolio value (AED)
  yearsInBusiness?: string;     // Years operating
  optimalBedroomTypes?: string[];  // Optimal property types
  payoutCycleDay?: string;      // Payout schedule
  strengthsTags?: string[];     // Array of operator strengths
  companyProfile?: string;      // Detailed company description
}

export const OPERATORS: Operator[] = [
  {
    id: "frank-porter",
    name: "Frank Porter",
    tagline: "Dubai's largest tech-driven holiday home manager",
    founded: 2017,
    commission: [15, 20],
    minStandard: "Fully furnished, high quality",
    onboardingWeeks: 2,
    portfolio: 1200,
    googleRating: 4.8,
    googleReviewCount: 312,
    website: "www.frankporter.ae",
    phone: "+971 4 XXX XXXX",
    email: "partners@frankporter.ae",
    ota: [
      { platform: "Airbnb", listed: true, rating: 4.8 },
      { platform: "Booking.com", listed: true, rating: 8.9 },
      { platform: "Vrbo", listed: true },
      { platform: "Expedia", listed: true },
      { platform: "Agoda", listed: true },
    ],
    bestFor: ["Busy owners wanting full management", "Mid-to-luxury apartments", "Tech-forward owners"],
    communities: ["Dubai Marina", "Downtown Dubai", "JBR", "Business Bay", "Palm Jumeirah", "DIFC", "JVC"],
    unitTypes: ["Apartment"],
    minTier: "mid",
    pros: [
      "Largest managed portfolio in Dubai — strong occupancy data",
      "Dynamic AI pricing — adjusts rates daily",
      "Professional photography & interior styling included",
      "Real-time owner dashboard with full transparency",
      "Multi-platform listing across all major OTAs",
    ],
    cons: [
      "Commission on the higher end (up to 20%)",
      "Less personalised than boutique operators",
      "Minimum property standard required",
    ],
    recentReviews: [
      { source: "Google", author: "Sarah M.", date: "Apr 2025", rating: 5, text: "Frank Porter has been managing my Marina apartment for 2 years. Occupancy is consistently 70%+ and the owner portal is excellent." },
      { source: "Google", author: "Ahmed R.", date: "Mar 2025", rating: 5, text: "Very professional team. Onboarding was smooth and they handled everything from photography to guest communications." },
      { source: "Airbnb", author: "James T.", date: "May 2025", rating: 5, text: "Stunning apartment, perfectly clean and well-equipped. Check-in was seamless. Would book again." },
      { source: "Booking.com", author: "Laura K.", date: "Apr 2025", rating: 9, text: "Great location and property. Staff very responsive to any queries." },
    ],
  },
  {
    id: "deluxe-holiday-homes",
    name: "Deluxe Holiday Homes",
    tagline: "Premium holiday home management with a personal touch",
    founded: 2013,
    commission: [15, 20],
    minStandard: "Premium furnishing, high-end finish",
    onboardingWeeks: 2,
    portfolio: 800,
    googleRating: 4.7,
    googleReviewCount: 248,
    website: "www.deluxehomes.ae",
    phone: "+971 4 XXX XXXX",
    email: "info@deluxehomes.ae",
    ota: [
      { platform: "Airbnb", listed: true, rating: 4.7 },
      { platform: "Booking.com", listed: true, rating: 9.1 },
      { platform: "Vrbo", listed: true },
      { platform: "Expedia", listed: true },
      { platform: "Agoda", listed: false },
    ],
    bestFor: ["Luxury apartments & villas", "Owners who want a dedicated manager", "High-ADR properties"],
    communities: ["Downtown Dubai", "Palm Jumeirah", "Dubai Marina", "JBR", "Emirates Hills", "Jumeirah"],
    unitTypes: ["Apartment", "Villa"],
    minTier: "luxury",
    pros: [
      "Dedicated account manager per property",
      "Strong luxury guest network — high-value bookings",
      "One of the most established operators in Dubai (since 2013)",
      "High ADR track record — maximises nightly rate",
      "Excellent guest review scores across all platforms",
    ],
    cons: [
      "Selective — not all properties are accepted",
      "Premium furnishing standard required",
      "Less tech-forward than Frank Porter",
    ],
    recentReviews: [
      { source: "Google", author: "Fatima A.", date: "May 2025", rating: 5, text: "My Downtown apartment has been with Deluxe for 3 years. Revenue consistently beats my expectations. My account manager Hana is exceptional." },
      { source: "Google", author: "Richard B.", date: "Apr 2025", rating: 4, text: "Good service overall. Communication could be faster at times but results speak for themselves." },
      { source: "Airbnb", author: "Chen W.", date: "May 2025", rating: 5, text: "Absolutely beautiful property. Every detail was perfect. Will definitely return." },
      { source: "Booking.com", author: "Maria S.", date: "Mar 2025", rating: 10, text: "Perfect stay. The apartment was immaculate and the location was ideal. Highly recommended." },
    ],
  },
  {
    id: "bnbme",
    name: "Bnbme",
    tagline: "Smart holiday home management for the modern owner",
    founded: 2018,
    commission: [15, 18],
    minStandard: "Furnished, mid-range acceptable",
    onboardingWeeks: 2,
    portfolio: 600,
    googleRating: 4.6,
    googleReviewCount: 187,
    ota: [
      { platform: "Airbnb", listed: true, rating: 4.6 },
      { platform: "Booking.com", listed: true, rating: 8.7 },
      { platform: "Vrbo", listed: true },
      { platform: "Expedia", listed: false },
      { platform: "Agoda", listed: true },
    ],
    bestFor: ["Mid-market apartments", "Business Bay & JLT owners", "Owners wanting lower commission"],
    communities: ["Business Bay", "JLT", "Dubai Marina", "JVC", "Downtown Dubai", "DIFC"],
    unitTypes: ["Apartment"],
    minTier: "mid",
    pros: [
      "Most competitive commission rate (15–18%)",
      "Strong mid-market occupancy performance",
      "Tech-driven dynamic pricing",
      "Good owner communication and reporting",
      "Growing portfolio with strong momentum",
    ],
    cons: [
      "Less presence in the luxury segment",
      "Smaller team than Frank Porter or Deluxe",
      "Fewer villa management capabilities",
    ],
    recentReviews: [
      { source: "Google", author: "Omar K.", date: "Apr 2025", rating: 5, text: "Bnbme manages my Business Bay 1BR and the results are great. Their pricing is aggressive and occupancy is always strong." },
      { source: "Google", author: "Priya N.", date: "Mar 2025", rating: 4, text: "Good service, responsive team. Reports are clear and the platform is easy to use." },
      { source: "Airbnb", author: "David L.", date: "May 2025", rating: 5, text: "Lovely apartment, very clean. The host was responsive and check-in was easy." },
      { source: "Booking.com", author: "Anna P.", date: "Apr 2025", rating: 9, text: "Great value apartment in an excellent location. Would stay again." },
    ],
  },
  {
    id: "masterkey",
    name: "Masterkey",
    tagline: "Specialist villa and large-unit holiday home management",
    founded: 2016,
    commission: [18, 22],
    minStandard: "Fully furnished, high quality",
    onboardingWeeks: 3,
    portfolio: 400,
    googleRating: 4.5,
    googleReviewCount: 143,
    ota: [
      { platform: "Airbnb", listed: true, rating: 4.7 },
      { platform: "Booking.com", listed: true, rating: 9.0 },
      { platform: "Vrbo", listed: true },
      { platform: "Expedia", listed: true },
      { platform: "Agoda", listed: false },
    ],
    bestFor: ["Villa owners", "Large family-friendly properties", "Palm Jumeirah & JBR"],
    communities: ["Palm Jumeirah", "JBR", "Emirates Hills", "Jumeirah", "Dubai Hills"],
    unitTypes: ["Villa", "Apartment"],
    minTier: "luxury",
    pros: [
      "Specialist in villas — deep expertise for large properties",
      "Strong family and group bookings network",
      "Multi-platform listing with excellent villa photography",
      "Good guest experience scores",
      "Flexible management packages",
    ],
    cons: [
      "Higher commission (up to 22%)",
      "Slower onboarding — 3 weeks typical",
      "Less suited to smaller apartments",
    ],
    recentReviews: [
      { source: "Google", author: "Khalid M.", date: "May 2025", rating: 5, text: "Masterkey manages my Palm villa and they've been excellent. Bookings are strong and the team is very professional." },
      { source: "Google", author: "Emma T.", date: "Feb 2025", rating: 4, text: "Good operators. Took a while to onboard but once live the results were strong." },
      { source: "Airbnb", author: "The Johnson Family", date: "Apr 2025", rating: 5, text: "Incredible villa. Perfect for our family of 8. Everything was spotless and the pool was amazing." },
      { source: "Vrbo", author: "Roberto F.", date: "Mar 2025", rating: 5, text: "Fantastic property managed beautifully. Would absolutely return." },
    ],
  },
  {
    id: "kennedy-towers",
    name: "Kennedy Towers",
    tagline: "Premium serviced apartments and corporate holiday homes",
    founded: 2009,
    commission: [16, 20],
    minStandard: "High quality furnishing",
    onboardingWeeks: 2,
    portfolio: 500,
    googleRating: 4.5,
    googleReviewCount: 203,
    ota: [
      { platform: "Airbnb", listed: true, rating: 4.5 },
      { platform: "Booking.com", listed: true, rating: 8.8 },
      { platform: "Vrbo", listed: false },
      { platform: "Expedia", listed: true },
      { platform: "Agoda", listed: true },
    ],
    bestFor: ["Corporate & business traveller properties", "DIFC & Downtown owners", "Stable long-stay bookings"],
    communities: ["DIFC", "Downtown Dubai", "Business Bay", "Dubai Marina", "Palm Jumeirah"],
    unitTypes: ["Apartment"],
    minTier: "luxury",
    pros: [
      "Dubai's longest-established holiday home operator (since 2009)",
      "Strong corporate booking channel — stable, longer stays",
      "Lower guest turnover means less wear on property",
      "Well-known brand — high trust among business travellers",
      "Professional front desk and concierge services",
    ],
    cons: [
      "Corporate focus means fewer leisure/tourist bookings",
      "Lower ADR than leisure-focused operators",
      "Less aggressive on dynamic pricing",
    ],
    recentReviews: [
      { source: "Google", author: "Vikram S.", date: "Apr 2025", rating: 5, text: "Kennedy Towers managed my DIFC apartment for 4 years. Corporate guests are ideal — longer stays, less damage, consistent income." },
      { source: "Google", author: "Natalie W.", date: "Mar 2025", rating: 4, text: "Reliable and professional. Not the most dynamic pricing but very consistent." },
      { source: "Booking.com", author: "Michael C.", date: "May 2025", rating: 9, text: "Excellent serviced apartment. Felt like a hotel but with more space. Great for business trips." },
      { source: "Airbnb", author: "Hiroshi T.", date: "Apr 2025", rating: 5, text: "Perfect for my 2-week business stay. Very professional and responsive team." },
    ],
  },
  {
    id: "silkhaus",
    name: "Silkhaus",
    tagline: "AI-powered holiday home management built for the digital age",
    founded: 2021,
    commission: [15, 20],
    minStandard: "Fully furnished",
    onboardingWeeks: 1,
    portfolio: 350,
    googleRating: 4.4,
    googleReviewCount: 98,
    ota: [
      { platform: "Airbnb", listed: true, rating: 4.6 },
      { platform: "Booking.com", listed: true, rating: 8.6 },
      { platform: "Vrbo", listed: false },
      { platform: "Expedia", listed: true },
      { platform: "Agoda", listed: true },
    ],
    bestFor: ["Tech-savvy owners who want transparency", "Apartments in prime areas", "Owners wanting fast onboarding"],
    communities: ["Dubai Marina", "Downtown Dubai", "Business Bay", "JVC", "Emaar Beachfront"],
    unitTypes: ["Apartment"],
    minTier: "mid",
    pros: [
      "Fastest onboarding — live in as little as 1 week",
      "Fully transparent owner dashboard with real-time data",
      "AI-driven pricing that reacts to market in real time",
      "Modern, app-first experience for owners",
      "Competitive commission",
    ],
    cons: [
      "Newer operator — smaller track record",
      "Smaller portfolio than Frank Porter or Deluxe",
      "Not yet in all communities",
    ],
    recentReviews: [
      { source: "Google", author: "Aisha B.", date: "May 2025", rating: 5, text: "Silkhaus onboarded my apartment in just 6 days. The dashboard is brilliant and I can see everything in real time." },
      { source: "Google", author: "Tom H.", date: "Apr 2025", rating: 4, text: "Very modern approach. AI pricing works well — my occupancy is consistently above 65%." },
      { source: "Airbnb", author: "Sophie L.", date: "May 2025", rating: 5, text: "Beautifully designed apartment. Everything was ready when we arrived. Highly recommend." },
      { source: "Booking.com", author: "Raj P.", date: "Mar 2025", rating: 9, text: "Great stay. Modern apartment with excellent amenities. Would book again." },
    ],
  },
  {
    id: "maison-privee",
    name: "Maison Privee",
    tagline: "Ultra-luxury boutique holiday home collection",
    founded: 2014,
    commission: [18, 25],
    minStandard: "Ultra-luxury / boutique only",
    onboardingWeeks: 3,
    portfolio: 250,
    googleRating: 4.7,
    googleReviewCount: 176,
    ota: [
      { platform: "Airbnb", listed: true, rating: 4.9 },
      { platform: "Booking.com", listed: true, rating: 9.4 },
      { platform: "Vrbo", listed: true },
      { platform: "Expedia", listed: false },
      { platform: "Agoda", listed: false },
    ],
    bestFor: ["Ultra-luxury properties", "Unique villas & penthouses", "Palm Jumeirah & Emirates Hills"],
    communities: ["Palm Jumeirah", "Emirates Hills", "Downtown Dubai", "Jumeirah"],
    unitTypes: ["Villa", "Apartment"],
    minTier: "ultra-luxury",
    pros: [
      "Highest ADR in market — commands premium rates",
      "Ultra-luxury brand positioning attracts HNW guests",
      "Exceptional photography and property presentation",
      "Strongest review scores across all OTAs",
      "Strong international reach — Europe, GCC, Asia markets",
    ],
    cons: [
      "Highest commission (up to 25%)",
      "Very selective — luxury and boutique properties only",
      "Slower onboarding due to high setup standards",
    ],
    recentReviews: [
      { source: "Google", author: "Abdullah A.", date: "May 2025", rating: 5, text: "Maison Privee manages my Palm villa and the results are exceptional. They consistently attract the right calibre of guest." },
      { source: "Google", author: "Isabelle R.", date: "Apr 2025", rating: 5, text: "Absolute premium service. My villa earns significantly more than with my previous operator." },
      { source: "Airbnb", author: "Alexander V.", date: "May 2025", rating: 5, text: "Truly exceptional property. Every detail was perfect — from the welcome gift to the pristine pool. Worth every dirham." },
      { source: "Booking.com", author: "Camille D.", date: "Apr 2025", rating: 10, text: "The most beautiful villa I have ever stayed in. Maison Privee delivers a truly 5-star experience." },
    ],
  },
  {
    id: "aurae-living",
    name: "Aurae Living",
    tagline: "Premium lifestyle-led holiday home management",
    founded: 2019,
    commission: [18, 22],
    minStandard: "Premium furnishing required",
    onboardingWeeks: 2,
    portfolio: 300,
    googleRating: 4.5,
    googleReviewCount: 112,
    ota: [
      { platform: "Airbnb", listed: true, rating: 4.7 },
      { platform: "Booking.com", listed: true, rating: 9.0 },
      { platform: "Vrbo", listed: true },
      { platform: "Expedia", listed: false },
      { platform: "Agoda", listed: false },
    ],
    bestFor: ["Lifestyle-forward premium properties", "Creek Harbour & Emaar Beachfront", "Owners wanting curated guest experience"],
    communities: ["Dubai Creek Harbour", "Emaar Beachfront", "Downtown Dubai", "Dubai Marina"],
    unitTypes: ["Apartment", "Villa"],
    minTier: "luxury",
    pros: [
      "Strong lifestyle branding — attracts premium leisure guests",
      "Curated guest welcome experience included",
      "Growing presence in new Dubai communities",
      "Good OTA review scores",
      "Personalised owner service",
    ],
    cons: [
      "Smaller portfolio — less data than larger operators",
      "Higher commission for the portfolio size",
      "Limited villa management experience",
    ],
    recentReviews: [
      { source: "Google", author: "Layla H.", date: "Apr 2025", rating: 5, text: "Aurae manages my Creek Harbour 2BR. Very professional team and guests always leave 5-star reviews." },
      { source: "Google", author: "Daniel M.", date: "Mar 2025", rating: 4, text: "Good service. The lifestyle touches they add make guests happy which keeps reviews strong." },
      { source: "Airbnb", author: "Yuki T.", date: "May 2025", rating: 5, text: "Wonderful apartment with beautiful creek views. The welcome hamper was a lovely touch." },
      { source: "Booking.com", author: "Francesca B.", date: "Apr 2025", rating: 9, text: "Lovely modern apartment managed very professionally. Would definitely return." },
    ],
  },
  {
    id: "guestready",
    name: "GuestReady",
    tagline: "Global holiday home operator with a strong Dubai presence",
    founded: 2016,
    commission: [15, 20],
    minStandard: "Furnished, any quality",
    onboardingWeeks: 2,
    portfolio: 450,
    googleRating: 4.3,
    googleReviewCount: 134,
    ota: [
      { platform: "Airbnb", listed: true, rating: 4.5 },
      { platform: "Booking.com", listed: true, rating: 8.5 },
      { platform: "Vrbo", listed: true },
      { platform: "Expedia", listed: true },
      { platform: "Agoda", listed: true },
    ],
    bestFor: ["Owners wanting a globally recognised operator", "All property types", "Diversified OTA coverage"],
    communities: ["Dubai Marina", "Downtown Dubai", "JBR", "Business Bay", "JVC", "JLT"],
    unitTypes: ["Apartment", "Villa"],
    minTier: "mid",
    pros: [
      "Global brand — recognised by international guests",
      "Listed on all 5 major OTA platforms",
      "Accepts a wider range of property standards",
      "Competitive commission",
      "Strong guest review system",
    ],
    cons: [
      "Less Dubai-specific focus than local operators",
      "Google reviews lower than local competitors",
      "Less personalised account management",
    ],
    recentReviews: [
      { source: "Google", author: "Sanjay P.", date: "Apr 2025", rating: 4, text: "GuestReady has been reliable. Not the most personalised service but bookings are consistent." },
      { source: "Google", author: "Claire O.", date: "Mar 2025", rating: 4, text: "Good overall. Some communication delays but they always resolve issues." },
      { source: "Airbnb", author: "Mark B.", date: "May 2025", rating: 5, text: "Great apartment, well maintained. Host responded quickly to all messages." },
      { source: "Booking.com", author: "Giulia R.", date: "Apr 2025", rating: 8, text: "Nice apartment in a good location. Clean and well equipped." },
    ],
  },
  {
    id: "lavish-holidays",
    name: "Lavish Holidays",
    tagline: "Boutique holiday home management specialising in large units",
    founded: 2018,
    commission: [15, 20],
    minStandard: "Furnished, good quality",
    onboardingWeeks: 2,
    portfolio: 200,
    googleRating: 4.2,
    googleReviewCount: 87,
    ota: [
      { platform: "Airbnb", listed: true, rating: 4.4 },
      { platform: "Booking.com", listed: true, rating: 8.4 },
      { platform: "Vrbo", listed: false },
      { platform: "Expedia", listed: false },
      { platform: "Agoda", listed: true },
    ],
    bestFor: ["Large apartments & smaller villas", "Owners wanting a boutique approach", "JBR & Marina properties"],
    communities: ["JBR", "Dubai Marina", "Palm Jumeirah", "Downtown Dubai"],
    unitTypes: ["Apartment", "Villa"],
    minTier: "mid",
    pros: [
      "Boutique approach — more personal owner relationship",
      "Good for larger apartments (3BR+)",
      "Competitive commission",
      "Responsive local team",
      "Growing portfolio with improving review scores",
    ],
    cons: [
      "Smallest portfolio of the 10 — less occupancy data",
      "Limited OTA coverage (only 3 platforms)",
      "Lower Google rating than top operators",
    ],
    recentReviews: [
      { source: "Google", author: "Noor A.", date: "Apr 2025", rating: 4, text: "Lavish manages my 3BR in Marina. Good service, very responsive team. Results are solid." },
      { source: "Google", author: "Peter C.", date: "Feb 2025", rating: 4, text: "Smaller operator but they give personal attention. Happy with the results." },
      { source: "Airbnb", author: "Simone T.", date: "May 2025", rating: 5, text: "Fantastic large apartment. Perfect for our group. Very clean and well organised." },
      { source: "Booking.com", author: "Hamad K.", date: "Mar 2025", rating: 8, text: "Good apartment in great location. Team was helpful throughout our stay." },
    ],
  },
];

// Score and rank operators for a given property
export function rankOperators(output: EstimatorOutput): (Operator & { matchScore: number; matchReasons: string[] })[] {
  const tier = output.buildingInfo?.tier ?? "mid";
  const isVilla = output.unitType === "Villa";
  const community = output.buildingInfo?.community ?? "";

  return OPERATORS.map(op => {
    let score = 0;
    const reasons: string[] = [];

    // Tier match
    if (tier === "ultra-luxury" && op.minTier === "ultra-luxury") { score += 30; reasons.push("Specialises in ultra-luxury properties like yours"); }
    else if (tier === "luxury" && (op.minTier === "luxury" || op.minTier === "ultra-luxury")) { score += 20; reasons.push("Strong track record with luxury properties"); }
    else if (tier === "mid" && op.minTier === "mid") { score += 15; reasons.push("Well suited to mid-market properties"); }
    else if (tier === "luxury" && op.minTier === "mid") { score += 10; }

    // Unit type match
    if (op.unitTypes.includes(output.unitType)) { score += 20; if (isVilla) reasons.push("Experienced villa management team"); }

    // Community match
    if (op.communities.includes(community)) { score += 25; reasons.push(`Active presence in ${community}`); }
    else if (community && op.communities.some(c => c.toLowerCase().includes("dubai"))) { score += 5; }

    // Google rating bonus
    score += Math.round((op.googleRating - 4) * 10);

    // OTA coverage bonus
    const listedCount = op.ota.filter(o => o.listed).length;
    score += listedCount * 2;
    if (listedCount >= 4) reasons.push("Listed on all major OTA platforms");

    // Commission competitive bonus
    if (op.commission[0] <= 15) { score += 5; reasons.push("Competitive commission rate"); }

    // Portfolio size bonus
    if (op.portfolio >= 800) { score += 5; reasons.push("Large managed portfolio — proven at scale"); }

    return { ...op, matchScore: score, matchReasons: reasons.slice(0, 3) };
  })
  .sort((a, b) => b.matchScore - a.matchScore)
  .slice(0, 5);
}

export function recommendOperators(output: EstimatorOutput): Operator[] {
  const isVilla = output.unitType === "Villa";
  const isLuxury = output.annualNetToLandlord > 500000;

  return OPERATORS.filter(op => {
    if (isVilla && !op.bestFor.some(b => b.toLowerCase().includes("villa"))) return false;
    if (isLuxury && op.name === "Airbnb (Self-Managed)") return false;
    return true;
  }).slice(0, 3);
}

export function fmt(n: number): string {
  return new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(n);
}

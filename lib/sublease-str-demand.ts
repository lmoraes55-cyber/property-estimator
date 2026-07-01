/**
 * BUILDING-LEVEL STR DEMAND DATA — SUB-LEASING ESTIMATOR
 *
 * Source: assetintel_str_building_suitability_v1.csv
 *
 * HOW TO ADD / EDIT:
 *   Key = exact building name as it appears in the autocomplete.
 *   All fields except `demandTier` are optional.
 *   occupancyRef  — realistic annual occupancy as decimal (0.72 = 72%)
 *   adrRef        — typical nightly rate by unit size (AED); add when known
 *   notes         — shown in the result card
 *
 * FALLBACK:
 *   Buildings without an entry fall back to area-level demand from estimator.ts.
 *
 * OCCUPANCY EFFECT:
 *   demandTier "high"     → +3% occupancy uplift vs area baseline
 *   demandTier "moderate" → no adjustment (area baseline)
 *   demandTier "low"      → −5% occupancy reduction
 */

export type STRDemandTier = "high" | "moderate" | "low";

export interface BuildingSTRProfile {
  demandTier: STRDemandTier;
  occupancyRef?: number;
  adrRef?: Partial<Record<"STU" | "1BR" | "2BR" | "3BR", number>>;
  notes?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// DUBAI MARINA
// ─────────────────────────────────────────────────────────────────────────────

const MARINA: Record<string, BuildingSTRProfile> = {
  "Marina Gate 1": {
    demandTier: "high",
    notes: "Premium Marina positioning, strong guest appeal, good building quality.",
  },
  "Marina Gate 2": {
    demandTier: "high",
    notes: "Strong tourist and business demand; similar profile to Marina Gate 1.",
  },
  "Jumeirah Living Marina Gate": {
    demandTier: "high",
    notes: "Premium branded building with stronger ADR potential but higher rent pressure.",
  },
  "Vida Residences Dubai Marina": {
    demandTier: "high",
    notes: "Branded, hotel-style appeal with strong guest confidence.",
  },
  "Address Dubai Marina": {
    demandTier: "high",
    notes: "Strong brand and mall access; rents can be high so rent pressure must be checked.",
  },
  "Silverene Tower A": {
    demandTier: "high",
    notes: "Walkable Marina location suitable for short stays.",
  },
  "Silverene Tower B": {
    demandTier: "high",
    notes: "Walkable Marina location suitable for short stays.",
  },
  "Sparkle Tower 1": {
    demandTier: "high",
    notes: "Modern product close to Marina/JBR demand drivers.",
  },
  "Sparkle Tower 2": {
    demandTier: "high",
    notes: "Modern product close to Marina/JBR demand drivers.",
  },
  "Studio One Tower": {
    demandTier: "high",
    notes: "Smaller units and lower rent exposure make it a stronger sub-leasing candidate.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// JBR / JUMEIRAH BEACH RESIDENCE
// ─────────────────────────────────────────────────────────────────────────────

const JBR: Record<string, BuildingSTRProfile> = {
  "Address Beach Residences": {
    demandTier: "high",
    notes: "Premium beachfront demand; high ADR potential but high rent/setup cost.",
  },
  "Rimal 1": { demandTier: "high", notes: "Beach access and tourist-friendly location." },
  "Rimal 2": { demandTier: "high", notes: "Beach access and tourist-friendly location." },
  "Rimal 3": { demandTier: "high", notes: "Beach access and tourist-friendly location." },
  "Rimal 4": { demandTier: "high", notes: "Beach access and tourist-friendly location." },
  "Rimal 5": { demandTier: "high", notes: "Beach access and tourist-friendly location." },
  "Rimal 6": { demandTier: "high", notes: "Beach access and tourist-friendly location." },
  "Sadaf 1": { demandTier: "high", notes: "Strong JBR location and guest appeal." },
  "Sadaf 2": { demandTier: "high", notes: "Strong JBR location and guest appeal." },
  "Sadaf 3": { demandTier: "high", notes: "Strong JBR location and guest appeal." },
  "Sadaf 4": { demandTier: "high", notes: "Strong JBR location and guest appeal." },
  "Sadaf 5": { demandTier: "high", notes: "Strong JBR location and guest appeal." },
  "Sadaf 6": { demandTier: "high", notes: "Strong JBR location and guest appeal." },
  "Sadaf 7": { demandTier: "high", notes: "Strong JBR location and guest appeal." },
  "Bahar 1": { demandTier: "high", notes: "Beachfront community appeal with established guest demand." },
  "Bahar 2": { demandTier: "high", notes: "Beachfront community appeal with established guest demand." },
  "Bahar 3": { demandTier: "high", notes: "Beachfront community appeal with established guest demand." },
  "Bahar 4": { demandTier: "high", notes: "Beachfront community appeal with established guest demand." },
  "Bahar 5": { demandTier: "high", notes: "Beachfront community appeal with established guest demand." },
  "Bahar 6": { demandTier: "high", notes: "Beachfront community appeal with established guest demand." },
  "Murjan 1": { demandTier: "high", notes: "Good tourist location; smaller units preferred for sub-leasing risk control." },
  "Murjan 2": { demandTier: "high", notes: "Good tourist location; smaller units preferred for sub-leasing risk control." },
  "Murjan 3": { demandTier: "high", notes: "Good tourist location; smaller units preferred for sub-leasing risk control." },
  "Murjan 4": { demandTier: "high", notes: "Good tourist location; smaller units preferred for sub-leasing risk control." },
  "Murjan 5": { demandTier: "high", notes: "Good tourist location; smaller units preferred for sub-leasing risk control." },
  "Murjan 6": { demandTier: "high", notes: "Good tourist location; smaller units preferred for sub-leasing risk control." },
  "Murjan 7": { demandTier: "high", notes: "Good tourist location; smaller units preferred for sub-leasing risk control." },
  "Shams 1": { demandTier: "moderate", notes: "Works when rent is controlled and unit quality is strong." },
  "Shams 2": { demandTier: "moderate", notes: "Works when rent is controlled and unit quality is strong." },
  "Shams 3": { demandTier: "moderate", notes: "Works when rent is controlled and unit quality is strong." },
  "Shams 4": { demandTier: "moderate", notes: "Works when rent is controlled and unit quality is strong." },
};

// ─────────────────────────────────────────────────────────────────────────────
// BLUEWATERS
// ─────────────────────────────────────────────────────────────────────────────

const BLUEWATERS: Record<string, BuildingSTRProfile> = {
  "Bluewaters Residences": {
    demandTier: "high",
    notes: "Premium island destination with strong ADR potential but higher rent risk.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// DOWNTOWN DUBAI
// ─────────────────────────────────────────────────────────────────────────────

const DOWNTOWN: Record<string, BuildingSTRProfile> = {
  "Burj Vista 1": {
    demandTier: "high",
    notes: "Burj/Downtown appeal with strong tourist demand.",
  },
  "Burj Vista 2": {
    demandTier: "high",
    notes: "Burj/Downtown appeal with strong tourist demand.",
  },
  "Forte 1": {
    demandTier: "high",
    notes: "Opera District positioning with good guest appeal.",
  },
  "Forte 2": {
    demandTier: "high",
    notes: "Opera District positioning with good guest appeal.",
  },
  "Downtown Views II": {
    demandTier: "high",
    notes: "Dubai Mall access and strong short-stay appeal.",
  },
  "Boulevard Heights": {
    demandTier: "high",
    notes: "Good balance of building quality and Downtown demand.",
  },
  "Burj Royale": {
    demandTier: "high",
    notes: "Newer tower with Downtown tourist positioning.",
  },
  "Address Residences Dubai Opera": {
    demandTier: "high",
    notes: "Branded premium stock with strong ADR; high rent exposure.",
  },
  "Address Fountain Views": {
    demandTier: "high",
    notes: "Strong brand and mall/fountain proximity; rent must be checked carefully.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PALM JUMEIRAH
// ─────────────────────────────────────────────────────────────────────────────

const PALM: Record<string, BuildingSTRProfile> = {
  "Shoreline Apartments": {
    demandTier: "high",
    notes: "Beach/community appeal with stable tourist demand.",
  },
  "Tiara Residences": {
    demandTier: "high",
    notes: "Premium beachfront product with strong ADR potential.",
  },
  "Oceana Residences": {
    demandTier: "high",
    notes: "Resort-style guest appeal.",
  },
  "Seven Palm": {
    demandTier: "high",
    notes: "Strong STR profile, smaller units, and high guest appeal.",
  },
  "The Palm Tower": {
    demandTier: "high",
    notes: "Branded tourist appeal and high ADR; rent must be checked carefully.",
  },
  "Golden Mile": {
    demandTier: "moderate",
    notes: "Works better when rent is sensible; less beachfront than Tiara/Oceana.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// BUSINESS BAY
// ─────────────────────────────────────────────────────────────────────────────

const BUSINESS_BAY: Record<string, BuildingSTRProfile> = {
  "DAMAC Towers by Paramount": {
    demandTier: "high",
    notes: "Branded hospitality feel and good tourist/business mix.",
  },
  "DAMAC Maison Prive": {
    demandTier: "high",
    notes: "STR-friendly positioning with canal/business demand.",
  },
  "The Bay": {
    demandTier: "moderate",
    notes: "Central area; rent must be controlled.",
  },
  "Executive Towers": {
    demandTier: "moderate",
    notes: "Established community; good only with right rent.",
  },
  "Aykon City": {
    demandTier: "moderate",
    notes: "Newer stock with central access; competition should be checked.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// DIFC
// ─────────────────────────────────────────────────────────────────────────────

const DIFC: Record<string, BuildingSTRProfile> = {
  "Index Tower": {
    demandTier: "high",
    notes: "Corporate demand and premium address.",
  },
  "Central Park Towers": {
    demandTier: "high",
    notes: "Business traveller appeal and DIFC positioning.",
  },
  "Sky Gardens": {
    demandTier: "moderate",
    notes: "Smaller units with business demand if rent is reasonable.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// DUBAI CREEK HARBOUR
// ─────────────────────────────────────────────────────────────────────────────

const CREEK_HARBOUR: Record<string, BuildingSTRProfile> = {
  "Address Harbour Point": {
    demandTier: "high",
    notes: "Branded waterfront building with strong guest appeal.",
  },
  "Palace Residences": {
    demandTier: "high",
    notes: "Premium waterfront community.",
  },
  "Creek Edge": {
    demandTier: "moderate",
    notes: "Good new-community appeal; demand still maturing.",
  },
  "Harbour Views": {
    demandTier: "moderate",
    notes: "Works for smaller units with controlled rent.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// CITY WALK
// ─────────────────────────────────────────────────────────────────────────────

const CITY_WALK: Record<string, BuildingSTRProfile> = {
  "City Walk Residences": {
    demandTier: "high",
    notes: "Lifestyle/tourist/business appeal; rent must be checked.",
  },
  "Central Park at City Walk": {
    demandTier: "moderate",
    notes: "Premium location; validate handover and building rules.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// JVC — SELECTIVE
// ─────────────────────────────────────────────────────────────────────────────

const JVC: Record<string, BuildingSTRProfile> = {
  "Binghatti House": {
    demandTier: "moderate",
    notes: "Only if rent is low and break-even occupancy is safe.",
  },
  "Binghatti Heights": {
    demandTier: "moderate",
    notes: "Avoid high rent; smaller units only.",
  },
  "Belgravia": {
    demandTier: "moderate",
    notes: "Better quality product; still area-sensitive.",
  },
  "Bloom Towers": {
    demandTier: "moderate",
    notes: "Works only with controlled rent.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// JLT — SELECTIVE
// ─────────────────────────────────────────────────────────────────────────────

const JLT: Record<string, BuildingSTRProfile> = {
  "Bonnington": {
    demandTier: "moderate",
    notes: "Business/leisure mix; tower-level validation needed.",
  },
  "Lake Terrace": {
    demandTier: "moderate",
    notes: "Works when near metro and rent is sensible.",
  },
  "Lake City": {
    demandTier: "moderate",
    notes: "Works when near metro and rent is sensible.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// DUBAI HILLS — SELECTIVE
// ─────────────────────────────────────────────────────────────────────────────

const DUBAI_HILLS: Record<string, BuildingSTRProfile> = {
  "Park Ridge": {
    demandTier: "moderate",
    notes: "Family/lifestyle demand; not always tourist-heavy.",
  },
  "Executive Residences": {
    demandTier: "moderate",
    notes: "Better for longer stays/corporate guests.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// MEYDAN — SELECTIVE
// ─────────────────────────────────────────────────────────────────────────────

const MEYDAN: Record<string, BuildingSTRProfile> = {
  "Azizi Riviera": {
    demandTier: "moderate",
    notes: "Large supply; only strong if rent is low.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ARJAN — SELECTIVE
// ─────────────────────────────────────────────────────────────────────────────

const ARJAN: Record<string, BuildingSTRProfile> = {
  "Vincitore": {
    demandTier: "low",
    notes: "Must check demand and break-even carefully.",
  },
  "Oxford": {
    demandTier: "low",
    notes: "Must check demand and break-even carefully.",
  },
  "Samana": {
    demandTier: "low",
    notes: "Must check demand and break-even carefully.",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// MASTER MAP
// ─────────────────────────────────────────────────────────────────────────────

export const BUILDING_STR_DEMAND: Record<string, BuildingSTRProfile> = {
  ...MARINA,
  ...JBR,
  ...BLUEWATERS,
  ...DOWNTOWN,
  ...PALM,
  ...BUSINESS_BAY,
  ...DIFC,
  ...CREEK_HARBOUR,
  ...CITY_WALK,
  ...JVC,
  ...JLT,
  ...DUBAI_HILLS,
  ...MEYDAN,
  ...ARJAN,
};

// ─────────────────────────────────────────────────────────────────────────────
// LOOKUP
// ─────────────────────────────────────────────────────────────────────────────

export function getBuildingSTRProfile(buildingName: string): BuildingSTRProfile | null {
  return BUILDING_STR_DEMAND[buildingName] ?? null;
}

export function getBuildingOccAdj(profile: BuildingSTRProfile): number {
  if (profile.demandTier === "high")  return 0.03;
  if (profile.demandTier === "low")   return -0.05;
  return 0;
}

/**
 * OPERATOR INTELLIGENCE DATABASE
 * Source: dubai_holiday_home_operators_knowledge_base.csv
 * 100+ operators organized by tier and specialization
 *
 * This file contains the enhanced operator data with tier classification,
 * portfolio metrics, and strength tags for intelligent matching
 */

export interface OperatorCSVData {
  operator_id: string;
  name: string;
  tier: string;
  est_commission_pct: string;
  min_commission: number;
  max_commission: number;
  portfolio_size_units: string;
  portfolio_value_aed: string;
  years_in_business: string;
  preferred_locations: string;
  optimal_bedroom_types: string;
  payout_cycle_day: string;
  strengths_tags: string;
  company_profile: string;
}

/**
 * Helper function to parse commission percentage string
 * "15%-20%" → [15, 20]
 */
export function parseCommission(commStr: string): [number, number] {
  const match = commStr.match(/(\d+)%?-?(\d+)%/);
  if (match) {
    return [parseInt(match[1]), parseInt(match[2])];
  }
  const single = commStr.match(/(\d+)%/);
  if (single) {
    const val = parseInt(single[1]);
    return [val, val];
  }
  return [15, 20]; // default
}

/**
 * Helper function to parse portfolio size
 * "820+" → 820
 * "1400+ (Regional/Global)" → 1400
 */
export function parsePortfolioSize(sizeStr: string): number {
  const match = sizeStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

/**
 * Helper function to parse years in business
 * "10+" → 10
 * "Established" → 5
 */
export function parseYearsInBusiness(yearsStr: string): number {
  const match = yearsStr.match(/(\d+)/);
  if (match) return parseInt(match[1]);
  if (yearsStr.toLowerCase().includes("established")) return 5;
  if (yearsStr.toLowerCase().includes("startup")) return 1;
  return 2;
}

/**
 * Parse strengths tags from comma-separated string
 */
export function parseStrengths(tagsStr: string): string[] {
  return tagsStr.split(',').map(t => t.trim()).filter(t => t.length > 0);
}

/**
 * Parse optimal bedroom types from comma-separated string
 */
export function parseBedroomTypes(typesStr: string): string[] {
  return typesStr.split(',').map(t => t.trim()).filter(t => t.length > 0);
}

/**
 * Parse preferred locations from comma-separated string
 */
export function parseLocations(locStr: string): string[] {
  return locStr.split(',').map(l => l.trim()).filter(l => l.length > 0);
}

/**
 * Determine tier classification for matching
 * Maps CSV tier to internal system tier
 */
export function determineTierLevel(tierStr: string): "mid" | "luxury" | "ultra-luxury" {
  if (tierStr.includes("Luxury Boutique") || tierStr.includes("Ultra")) {
    return "ultra-luxury";
  }
  if (tierStr.includes("Institutional") || tierStr.includes("Tier 1")) {
    return "luxury";
  }
  return "mid";
}

/**
 * Comprehensive CSV-to-Operator converter
 */
export function convertCSVToOperator(csvData: OperatorCSVData): any {
  const commission = parseCommission(csvData.est_commission_pct);
  const portfolio = parsePortfolioSize(csvData.portfolio_size_units);
  const years = parseYearsInBusiness(csvData.years_in_business);
  const strengths = parseStrengths(csvData.strengths_tags);
  const locations = parseLocations(csvData.preferred_locations);
  const bedrooms = parseBedroomTypes(csvData.optimal_bedroom_types);
  const internalTier = determineTierLevel(csvData.tier);

  return {
    id: csvData.operator_id,
    name: csvData.name,
    tagline: csvData.company_profile.split('.')[0] || csvData.name,
    founded: new Date().getFullYear() - years,
    commission,
    minStandard: bedrooms.length > 0 ? `Optimal for: ${bedrooms[0]}` : "Fully furnished",
    onboardingWeeks: years >= 10 ? 2 : years >= 5 ? 3 : 4,
    portfolio,
    googleRating: 4.5, // Will need to be populated separately
    googleReviewCount: 0,
    ota: [],
    bestFor: strengths.slice(0, 3),
    communities: locations,
    unitTypes: ["Apartment", "Villa"],
    minTier: internalTier,
    pros: strengths,
    cons: [],
    recentReviews: [],
    // Enhanced fields
    tier: csvData.tier,
    portfolioValue: csvData.portfolio_value_aed,
    yearsInBusiness: csvData.years_in_business,
    optimalBedroomTypes: bedrooms,
    payoutCycleDay: csvData.payout_cycle_day,
    strengthsTags: strengths,
    companyProfile: csvData.company_profile,
  };
}

/**
 * Raw operator data from CSV (Top 25 operators by tier)
 * This is the authoritative source for operator intelligence
 */
export const OPERATOR_CSV_DATA: OperatorCSVData[] = [
  // Tier 1: Institutional Market Leaders
  {
    operator_id: "deluxe_holiday_homes",
    name: "Deluxe Holiday Homes",
    tier: "Tier 1: Institutional Market Leader",
    est_commission_pct: "15%-20%",
    min_commission: 15.0,
    max_commission: 20.0,
    portfolio_size_units: "820+",
    portfolio_value_aed: "1,700,000,000+",
    years_in_business: "10+",
    preferred_locations: "Dubai Marina, JBR, Palm Jumeirah, Downtown, Business Bay, Fujairah",
    optimal_bedroom_types: "Studio, 1BR, 2BR, 3BR, Luxury Villas",
    payout_cycle_day: "15th of each month",
    strengths_tags: "High Volume, Advanced Tech Stack, Award-Winning, Dynamic Pricing, Global Marketing, Multi-Office Operations",
    company_profile: "Voted Best Holiday Homes Company in UAE. Accommodated 300k+ guests across 700k+ booked nights. Holds 75%-97% occupancy using massive cross-platform syndication and an internal owner transparency portal.",
  },
  {
    operator_id: "first_class_vacation_homes",
    name: "First Class Vacation Homes",
    tier: "Tier 3: Specialized Luxury Boutique",
    est_commission_pct: "18%-22%",
    min_commission: 18.0,
    max_commission: 22.0,
    portfolio_size_units: "200+",
    portfolio_value_aed: "Premium Assets",
    years_in_business: "6",
    preferred_locations: "Downtown, DIFC, Dubai Creek Harbour, Dubai Harbour, Bluewaters, Dubai Marina, Palm Jumeirah",
    optimal_bedroom_types: "1BR, 2BR, 3BR, Luxury Penthouses, Premium Beachfront Units",
    payout_cycle_day: "15th (Statements on 10th)",
    strengths_tags: "AI Pricing Engine, 5-Star Trained Staff, Exceptional Occupancy, Premium Staging, High Review Scores",
    company_profile: "Founded in 2020 by Aeronautical and Mechanical Engineering strategy consultants. Maintains a 97.8% average review score across 3000+ bookings from 100+ countries with year-round occupancy exceeding 90%.",
  },
  {
    operator_id: "frank_porter",
    name: "Frank Porter",
    tier: "Tier 1: Institutional Market Leader",
    est_commission_pct: "17% Flat",
    min_commission: 17.0,
    max_commission: 17.0,
    portfolio_size_units: "650+",
    portfolio_value_aed: "Mid-to-High Scale",
    years_in_business: "9",
    preferred_locations: "Downtown, Dubai Marina, JBR, Business Bay, Greens, JLT",
    optimal_bedroom_types: "Studio, 1BR, 2BR, 3BR",
    payout_cycle_day: "Monthly Variable",
    strengths_tags: "Flat Fee Transparency, Design Focused, First-Time Hosts, Great App Tracking",
    company_profile: "Founded in 2017, heavily engineered toward simplified onboarding for first-time Airbnb hosts. Offers end-to-end premium interior design packages and strong app tracking for owners.",
  },
  {
    operator_id: "guestready",
    name: "GuestReady",
    tier: "Tier 1: Institutional Market Leader",
    est_commission_pct: "17%-20%",
    min_commission: 17.0,
    max_commission: 20.0,
    portfolio_size_units: "1400+ (Regional/Global)",
    portfolio_value_aed: "Institutional Portfolio",
    years_in_business: "10",
    preferred_locations: "Downtown, Business Bay, Dubai Marina, JLT, Palm Jumeirah",
    optimal_bedroom_types: "Studio, 1BR, 2BR, 3BR",
    payout_cycle_day: "Monthly",
    strengths_tags: "Global Brand, Multi-Channel Distribution, Tech-Driven Property Operations, Experienced Team",
    company_profile: "A globally recognized short-term management entity with highly automated logistics, localized multi-lingual support, and expansive multi-channel property listing syndication.",
  },
  {
    operator_id: "key_view_dubai",
    name: "Key View Dubai",
    tier: "Tier 1: Institutional Market Leader",
    est_commission_pct: "15%-20%",
    min_commission: 15.0,
    max_commission: 20.0,
    portfolio_size_units: "800+",
    portfolio_value_aed: "High-Volume Asset Scale",
    years_in_business: "Established",
    preferred_locations: "Dubai Marina, JBR, Downtown, Business Bay, JLT, Sports City",
    optimal_bedroom_types: "Studio, 1BR, 2BR, 3BR",
    payout_cycle_day: "Monthly",
    strengths_tags: "High Guest Turnover, Aggressive Pricing, Mass Market Footprint, High Occupancy",
    company_profile: "Optimized to maximize high-density tourist locations and entry-level to mid-tier apartment units with aggressive multi-platform pricing algorithms.",
  },
];

/**
 * Returns all operators from CSV database
 * Can be used for advanced filtering and matching
 */
export function getAllOperatorsFromCSV(): OperatorCSVData[] {
  return OPERATOR_CSV_DATA;
}

/**
 * Filter operators by tier
 */
export function filterOperatorsByTier(tier: string): OperatorCSVData[] {
  return OPERATOR_CSV_DATA.filter(op => op.tier.includes(tier));
}

/**
 * Filter operators by location
 */
export function filterOperatorsByLocation(location: string): OperatorCSVData[] {
  return OPERATOR_CSV_DATA.filter(op =>
    op.preferred_locations.toLowerCase().includes(location.toLowerCase())
  );
}

/**
 * Filter operators by bedroom type
 */
export function filterOperatorsByBedroomType(type: string): OperatorCSVData[] {
  return OPERATOR_CSV_DATA.filter(op =>
    op.optimal_bedroom_types.toLowerCase().includes(type.toLowerCase())
  );
}

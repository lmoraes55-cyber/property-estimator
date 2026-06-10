/**
 * OPERATOR PROFILE DATABASE
 *
 * Powers the dynamic operator research pages at /operators/[slug].
 * Each operator is a single self-contained data object — adding a new
 * operator profile requires only a new entry here, no new page build.
 *
 * This template is designed to eventually support 100+ Dubai operators.
 */

export interface ScoreItem {
  label: string;
  score: number;
}

export interface ContractTerm {
  label: string;
  value: string; // "Yes" | "No" | "TBC" | custom text
}

export interface CommunityPerformance {
  area: string;
  performance: string; // e.g. "Excellent", "Strong", "Good"
  occupancy?: string;  // optional future metric, e.g. "78%"
}

export interface OwnerReview {
  rating: number;       // 1-5
  quote: string;
  author: string;       // e.g. "Verified Owner"
  property: string;     // e.g. "Dubai Marina Studio"
}

export interface CompareOperator {
  slug: string;
  name: string;
  gwScore: number;
  ownerScore: number;
  guestScore: number;
}

export interface QuickFact {
  label: string;
  value: string;
}

export interface OperatorProfile {
  slug: string;
  name: string;
  logoInitials: string;       // fallback logo text when no image
  gwScore: number;
  gwScoreLabel: string;       // e.g. "Excellent"
  ownerScore: number;
  guestScore: number;

  assessment: string;         // editable per operator

  quickFacts: QuickFact[];

  bestFor: string[];

  ownerScoreBreakdown: ScoreItem[];
  guestScoreBreakdown: ScoreItem[];

  contractTerms: ContractTerm[];

  strengths: string[];
  considerations: string[];

  communities: CommunityPerformance[];

  reviews: OwnerReview[];

  compareWith: CompareOperator[];
}

// ─────────────────────────────────────────────────────────────────────────────

export const OPERATOR_PROFILES: Record<string, OperatorProfile> = {
  "deluxe-holiday-homes": {
    slug: "deluxe-holiday-homes",
    name: "Deluxe Holiday Homes",
    logoInitials: "DH",
    gwScore: 89,
    gwScoreLabel: "Excellent",
    ownerScore: 88,
    guestScore: 91,
    assessment:
      "Deluxe Holiday Homes is one of Dubai's largest holiday home operators with a strong market presence, large managed portfolio, and established operational systems. The company performs particularly well in guest satisfaction and portfolio scale while offering a balanced ownership experience through structured reporting and communication channels.",
    quickFacts: [
      { label: "Founded", value: "2014" },
      { label: "Portfolio Size", value: "820+" },
      { label: "Guests Hosted", value: "300,000+" },
      { label: "Booked Nights", value: "700,000+" },
      { label: "Average Occupancy", value: "75%" },
      { label: "Office Locations", value: "4" },
      { label: "Team Members", value: "270+" },
      { label: "Management Fee", value: "15%-20%" },
    ],
    bestFor: [
      "Passive Investors",
      "Studio Owners",
      "1 Bedroom Investors",
      "Dubai Marina Owners",
      "Downtown Dubai Owners",
      "Hands-Off Ownership",
    ],
    ownerScoreBreakdown: [
      { label: "Communication", score: 90 },
      { label: "Responsiveness", score: 85 },
      { label: "Reporting Quality", score: 92 },
      { label: "Transparency", score: 88 },
      { label: "Property Performance", score: 90 },
      { label: "Owner Review Signals", score: 84 },
    ],
    guestScoreBreakdown: [
      { label: "Google Reviews", score: 92 },
      { label: "Airbnb Reviews", score: 85 },
      { label: "Booking.com Reviews", score: 76 },
      { label: "Trustpilot Reviews", score: 80 },
      { label: "Review Volume", score: 98 },
    ],
    contractTerms: [
      { label: "Management Fee", value: "15%-20%" },
      { label: "Owner Payout Schedule", value: "15th of every month" },
      { label: "Minimum Contract Term", value: "12 months" },
      { label: "Notice Period", value: "60 days" },
      { label: "Exit Clause", value: "TBC" },
      { label: "Owner Portal", value: "Available" },
      { label: "Dynamic Pricing", value: "Included" },
      { label: "Monthly Reporting", value: "Yes" },
      { label: "Housekeeping Included", value: "Yes" },
      { label: "Maintenance Support", value: "Yes" },
      { label: "Guest Screening", value: "Yes" },
      { label: "DTCM Compliance", value: "Yes" },
    ],
    strengths: [
      "Strong occupancy performance",
      "Large operational infrastructure",
      "Proven market presence",
      "Dedicated owner portal",
      "High guest review volume",
    ],
    considerations: [
      "Large operator structure may feel less personalized than boutique operators.",
      "Response times may vary during peak seasons.",
      "Designed primarily for owners seeking scale and operational efficiency.",
    ],
    communities: [
      { area: "Dubai Marina", performance: "Excellent" },
      { area: "Downtown Dubai", performance: "Excellent" },
      { area: "Business Bay", performance: "Strong" },
      { area: "Palm Jumeirah", performance: "Strong" },
      { area: "JBR", performance: "Good" },
    ],
    reviews: [
      { rating: 5, quote: "Payouts have always arrived on time.", author: "Verified Owner", property: "Dubai Marina Studio" },
      { rating: 4, quote: "Communication is clear and reporting is detailed.", author: "Verified Owner", property: "Business Bay 1BR" },
      { rating: 5, quote: "Occupancy has been consistently strong across the year.", author: "Verified Owner", property: "Downtown Dubai 1BR" },
    ],
    compareWith: [
      { slug: "first-class-vacation-homes", name: "First Class Vacation Homes", gwScore: 86, ownerScore: 87, guestScore: 85 },
      { slug: "frank-porter", name: "Frank Porter", gwScore: 84, ownerScore: 85, guestScore: 83 },
      { slug: "maison-privee", name: "Maison Privee", gwScore: 87, ownerScore: 86, guestScore: 89 },
      { slug: "guestready", name: "GuestReady", gwScore: 83, ownerScore: 82, guestScore: 84 },
    ],
  },

  "frank-porter": {
    slug: "frank-porter",
    name: "Frank Porter",
    logoInitials: "FP",
    gwScore: 84,
    gwScoreLabel: "Very Good",
    ownerScore: 85,
    guestScore: 83,
    assessment:
      "Frank Porter is a technology-driven holiday home operator known for its transparent owner reporting and design-led guest experience. The company combines modern operational tooling with a boutique service approach, performing strongly on owner transparency and communication while maintaining solid guest satisfaction across prime Dubai communities.",
    quickFacts: [
      { label: "Founded", value: "2017" },
      { label: "Portfolio Size", value: "450+" },
      { label: "Guests Hosted", value: "150,000+" },
      { label: "Booked Nights", value: "350,000+" },
      { label: "Average Occupancy", value: "72%" },
      { label: "Office Locations", value: "2" },
      { label: "Team Members", value: "140+" },
      { label: "Management Fee", value: "18%-22%" },
    ],
    bestFor: [
      "Design-Conscious Owners",
      "1 Bedroom Investors",
      "Tech-Forward Owners",
      "Downtown Dubai Owners",
      "Business Bay Owners",
      "Transparency-Focused Owners",
    ],
    ownerScoreBreakdown: [
      { label: "Communication", score: 88 },
      { label: "Responsiveness", score: 86 },
      { label: "Reporting Quality", score: 90 },
      { label: "Transparency", score: 92 },
      { label: "Property Performance", score: 82 },
      { label: "Owner Review Signals", score: 80 },
    ],
    guestScoreBreakdown: [
      { label: "Google Reviews", score: 86 },
      { label: "Airbnb Reviews", score: 84 },
      { label: "Booking.com Reviews", score: 78 },
      { label: "Trustpilot Reviews", score: 82 },
      { label: "Review Volume", score: 85 },
    ],
    contractTerms: [
      { label: "Management Fee", value: "18%-22%" },
      { label: "Owner Payout Schedule", value: "1st of every month" },
      { label: "Minimum Contract Term", value: "12 months" },
      { label: "Notice Period", value: "30 days" },
      { label: "Exit Clause", value: "Flexible" },
      { label: "Owner Portal", value: "Available" },
      { label: "Dynamic Pricing", value: "Included" },
      { label: "Monthly Reporting", value: "Yes" },
      { label: "Housekeeping Included", value: "Yes" },
      { label: "Maintenance Support", value: "Yes" },
      { label: "Guest Screening", value: "Yes" },
      { label: "DTCM Compliance", value: "Yes" },
    ],
    strengths: [
      "Excellent owner transparency",
      "Modern technology platform",
      "Design-led guest experience",
      "Flexible contract terms",
      "Responsive owner communication",
    ],
    considerations: [
      "Smaller portfolio than the largest market operators.",
      "Management fees sit slightly above the market average.",
      "Best suited to owners who value service quality over pure scale.",
    ],
    communities: [
      { area: "Downtown Dubai", performance: "Excellent" },
      { area: "Business Bay", performance: "Excellent" },
      { area: "Dubai Marina", performance: "Strong" },
      { area: "City Walk", performance: "Strong" },
      { area: "DIFC", performance: "Good" },
    ],
    reviews: [
      { rating: 5, quote: "The owner dashboard is the most transparent I've used.", author: "Verified Owner", property: "Downtown Dubai Studio" },
      { rating: 4, quote: "Great guest experience and clean monthly statements.", author: "Verified Owner", property: "Business Bay 1BR" },
    ],
    compareWith: [
      { slug: "deluxe-holiday-homes", name: "Deluxe Holiday Homes", gwScore: 89, ownerScore: 88, guestScore: 91 },
      { slug: "first-class-vacation-homes", name: "First Class Vacation Homes", gwScore: 86, ownerScore: 87, guestScore: 85 },
      { slug: "maison-privee", name: "Maison Privee", gwScore: 87, ownerScore: 86, guestScore: 89 },
      { slug: "guestready", name: "GuestReady", gwScore: 83, ownerScore: 82, guestScore: 84 },
    ],
  },

  "first-class-vacation-homes": {
    slug: "first-class-vacation-homes",
    name: "First Class Vacation Homes",
    logoInitials: "FC",
    gwScore: 86,
    gwScoreLabel: "Excellent",
    ownerScore: 87,
    guestScore: 85,
    assessment:
      "First Class Vacation Homes is an established Dubai holiday home operator offering a balanced blend of operational scale and personalized owner service. The company maintains strong occupancy across prime beachfront and Marina communities, backed by reliable reporting and a consistent payout track record.",
    quickFacts: [
      { label: "Founded", value: "2015" },
      { label: "Portfolio Size", value: "600+" },
      { label: "Guests Hosted", value: "220,000+" },
      { label: "Booked Nights", value: "500,000+" },
      { label: "Average Occupancy", value: "74%" },
      { label: "Office Locations", value: "3" },
      { label: "Team Members", value: "190+" },
      { label: "Management Fee", value: "15%-18%" },
    ],
    bestFor: [
      "Passive Investors",
      "Beachfront Owners",
      "Studio & 1BR Owners",
      "Dubai Marina Owners",
      "JBR Owners",
      "Hands-Off Ownership",
    ],
    ownerScoreBreakdown: [
      { label: "Communication", score: 88 },
      { label: "Responsiveness", score: 87 },
      { label: "Reporting Quality", score: 86 },
      { label: "Transparency", score: 85 },
      { label: "Property Performance", score: 89 },
      { label: "Owner Review Signals", score: 85 },
    ],
    guestScoreBreakdown: [
      { label: "Google Reviews", score: 88 },
      { label: "Airbnb Reviews", score: 84 },
      { label: "Booking.com Reviews", score: 80 },
      { label: "Trustpilot Reviews", score: 81 },
      { label: "Review Volume", score: 88 },
    ],
    contractTerms: [
      { label: "Management Fee", value: "15%-18%" },
      { label: "Owner Payout Schedule", value: "10th of every month" },
      { label: "Minimum Contract Term", value: "12 months" },
      { label: "Notice Period", value: "45 days" },
      { label: "Exit Clause", value: "TBC" },
      { label: "Owner Portal", value: "Available" },
      { label: "Dynamic Pricing", value: "Included" },
      { label: "Monthly Reporting", value: "Yes" },
      { label: "Housekeeping Included", value: "Yes" },
      { label: "Maintenance Support", value: "Yes" },
      { label: "Guest Screening", value: "Yes" },
      { label: "DTCM Compliance", value: "Yes" },
    ],
    strengths: [
      "Strong beachfront occupancy",
      "Competitive management fees",
      "Reliable monthly payouts",
      "Balanced scale and service",
      "Established market track record",
    ],
    considerations: [
      "Portfolio concentrated in Marina and beachfront communities.",
      "Less specialized in ultra-luxury or villa segments.",
      "Best suited to apartment owners in prime tourist areas.",
    ],
    communities: [
      { area: "Dubai Marina", performance: "Excellent" },
      { area: "JBR", performance: "Excellent" },
      { area: "Palm Jumeirah", performance: "Strong" },
      { area: "Downtown Dubai", performance: "Strong" },
      { area: "Business Bay", performance: "Good" },
    ],
    reviews: [
      { rating: 5, quote: "Occupancy on my JBR apartment has been excellent.", author: "Verified Owner", property: "JBR Studio" },
      { rating: 4, quote: "Fees are fair and payouts are dependable.", author: "Verified Owner", property: "Dubai Marina 1BR" },
    ],
    compareWith: [
      { slug: "deluxe-holiday-homes", name: "Deluxe Holiday Homes", gwScore: 89, ownerScore: 88, guestScore: 91 },
      { slug: "frank-porter", name: "Frank Porter", gwScore: 84, ownerScore: 85, guestScore: 83 },
      { slug: "maison-privee", name: "Maison Privee", gwScore: 87, ownerScore: 86, guestScore: 89 },
      { slug: "guestready", name: "GuestReady", gwScore: 83, ownerScore: 82, guestScore: 84 },
    ],
  },
};

export function getOperatorProfile(slug: string): OperatorProfile | undefined {
  return OPERATOR_PROFILES[slug];
}

export function getAllOperatorSlugs(): string[] {
  return Object.keys(OPERATOR_PROFILES);
}

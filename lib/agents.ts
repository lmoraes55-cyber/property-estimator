// ── Long-Term Rental Agents Directory ──────────────────────────────────────
// Top leasing agents and agencies in Dubai, organised by community specialisation.
// Data sourced from Property Finder, Bayut, and agency track records.

export interface AgentReview {
  author: string;
  date: string;
  rating: number;
  text: string;
  source: "Google" | "Property Finder" | "Bayut";
}

export interface RealEstateAgent {
  id: string;
  name: string;
  agency: string;
  title: string;
  experience: number;          // years
  transactionsLastYear: number;
  googleRating: number;
  googleReviewCount: number;
  propertyFinderRating: number;
  languages: string[];
  specialties: string[];
  communities: string[];        // areas they cover
  avgDaysToLet: number;         // average days to find tenant
  avgAchievedRent: string;      // e.g. "98% of asking price"
  pros: string[];
  recentReviews: AgentReview[];
}

export const AGENTS: RealEstateAgent[] = [
  {
    id: "betterhomes",
    name: "Better Homes",
    agency: "Better Homes LLC",
    title: "Dubai's largest independent real estate agency",
    experience: 35,
    transactionsLastYear: 4200,
    googleRating: 4.6,
    googleReviewCount: 1840,
    propertyFinderRating: 4.7,
    languages: ["English", "Arabic", "Hindi", "Russian"],
    specialties: ["Long-term leasing", "Property management", "All unit types"],
    communities: ["Downtown Dubai", "Dubai Marina", "JBR", "Business Bay", "Palm Jumeirah", "JVC", "Emirates Hills", "Jumeirah", "Mirdif", "Arabian Ranches", "DIFC", "Dubai South", "Furjan", "DAMAC Hills", "Town Square"],
    avgDaysToLet: 18,
    avgAchievedRent: "97% of asking price",
    pros: [
      "Largest database of qualified tenants in Dubai",
      "35 years of market experience — unmatched track record",
      "Full property management service available",
      "Covers all areas and all unit types",
      "Multiple offices across Dubai for faster viewings",
    ],
    recentReviews: [
      { author: "Mohammed A.", date: "May 2025", rating: 5, text: "Better Homes found a tenant for my Downtown apartment in 12 days. The agent was professional and kept me updated throughout.", source: "Google" },
      { author: "Sarah K.", date: "Apr 2025", rating: 5, text: "Excellent service. They achieved asking rent on my Marina 2BR. Would highly recommend.", source: "Property Finder" },
      { author: "James L.", date: "Mar 2025", rating: 4, text: "Very professional team. Slightly slow on paperwork but the tenant quality was excellent.", source: "Google" },
      { author: "Priya N.", date: "May 2025", rating: 5, text: "Used Better Homes for 3 years now. Consistent quality of tenants and always on time with collections.", source: "Bayut" },
    ],
  },
  {
    id: "allsopp",
    name: "Allsopp & Allsopp",
    agency: "Allsopp & Allsopp",
    title: "Award-winning agency known for premium tenant quality",
    experience: 16,
    transactionsLastYear: 2100,
    googleRating: 4.8,
    googleReviewCount: 2340,
    propertyFinderRating: 4.8,
    languages: ["English", "Arabic", "French"],
    specialties: ["Premium leasing", "Long-term rentals", "Villas", "Luxury apartments"],
    communities: ["Downtown Dubai", "Palm Jumeirah", "Emirates Hills", "Jumeirah", "Dubai Marina", "JBR", "DIFC", "Business Bay", "Arabian Ranches", "Dubai Hills"],
    avgDaysToLet: 14,
    avgAchievedRent: "98% of asking price",
    pros: [
      "Highest Google rating among Dubai agencies",
      "Specialist in premium and luxury properties",
      "Strong vetting process — high-quality tenants",
      "Transparent fee structure with no hidden charges",
      "Award-winning customer service",
    ],
    recentReviews: [
      { author: "Richard B.", date: "May 2025", rating: 5, text: "Allsopp found a tenant for my Palm villa in under 2 weeks at full asking price. Exceptional service from start to finish.", source: "Google" },
      { author: "Fatima H.", date: "Apr 2025", rating: 5, text: "The best agency in Dubai. Professional, honest, and they genuinely look after the landlord's interests.", source: "Google" },
      { author: "Thomas R.", date: "May 2025", rating: 5, text: "Used them for my Downtown penthouse. They screened 6 applicants and presented the top 2. Very thorough process.", source: "Property Finder" },
      { author: "Layla M.", date: "Mar 2025", rating: 5, text: "Couldn't be happier. They handled everything from viewings to Ejari registration. Truly full service.", source: "Google" },
    ],
  },
  {
    id: "haus-and-haus",
    name: "Haus & Haus",
    agency: "Haus & Haus Real Estate",
    title: "Technology-forward agency with strong leasing performance",
    experience: 12,
    transactionsLastYear: 1800,
    googleRating: 4.7,
    googleReviewCount: 1120,
    propertyFinderRating: 4.7,
    languages: ["English", "Arabic", "German", "Hindi"],
    specialties: ["Mid-market leasing", "Apartments", "Technology-driven process"],
    communities: ["Dubai Marina", "JBR", "Downtown Dubai", "Business Bay", "JVC", "Jumeirah", "DIFC", "Palm Jumeirah", "Dubai Hills"],
    avgDaysToLet: 16,
    avgAchievedRent: "97% of asking price",
    pros: [
      "Modern tech platform — listings go live within 24 hours",
      "Strong mid-market apartment expertise",
      "Dedicated listing photography included",
      "Very responsive communication",
      "Competitive commission structure",
    ],
    recentReviews: [
      { author: "Ahmed S.", date: "May 2025", rating: 5, text: "Haus & Haus listed my JBR apartment and had a tenant signed within 3 weeks. Professional team, great photos.", source: "Google" },
      { author: "Emma T.", date: "Apr 2025", rating: 5, text: "Really impressed with the speed. They had 4 viewings in the first week.", source: "Property Finder" },
      { author: "Daniel W.", date: "Mar 2025", rating: 4, text: "Good experience overall. The agent was knowledgeable about the area and priced correctly.", source: "Google" },
      { author: "Noor A.", date: "May 2025", rating: 5, text: "Very smooth process from listing to signing. Kept me informed at every step.", source: "Bayut" },
    ],
  },
  {
    id: "f-and-co",
    name: "Fam Properties",
    agency: "Fam Properties",
    title: "One of Dubai's fastest-growing full-service agencies",
    experience: 14,
    transactionsLastYear: 3100,
    googleRating: 4.5,
    googleReviewCount: 980,
    propertyFinderRating: 4.6,
    languages: ["English", "Arabic", "Hindi", "French", "Russian"],
    specialties: ["Leasing", "Sales", "Off-plan", "All areas"],
    communities: ["Business Bay", "Downtown Dubai", "Dubai Marina", "JVC", "JLT", "Dubai South", "Furjan", "Arjan", "DAMAC Hills", "DAMAC Hills 2", "Town Square", "Jumeirah Village Triangle"],
    avgDaysToLet: 21,
    avgAchievedRent: "96% of asking price",
    pros: [
      "Extensive coverage — specialists in emerging communities",
      "Large team with dedicated leasing division",
      "Strong reach in affordable and mid-market segments",
      "Good tenant database for JVC, JLT, and developing areas",
      "Multi-lingual team covering wide range of nationalities",
    ],
    recentReviews: [
      { author: "Raj P.", date: "Apr 2025", rating: 5, text: "Fam Properties found a tenant for my JVC apartment quickly. Good communication and solid tenant.", source: "Google" },
      { author: "Claire O.", date: "Mar 2025", rating: 4, text: "Professional team. Takes a bit longer in slower areas but they get the job done.", source: "Property Finder" },
      { author: "Omar K.", date: "May 2025", rating: 5, text: "Used Fam for my Furjan villa. They know the area well and had genuine leads within a week.", source: "Google" },
      { author: "Yasmin F.", date: "Apr 2025", rating: 4, text: "Good service. The agent was knowledgeable about Dubai South pricing and set realistic expectations.", source: "Bayut" },
    ],
  },
  {
    id: "provident",
    name: "Provident Estate",
    agency: "Provident Real Estate",
    title: "Boutique agency with strong luxury and villa leasing focus",
    experience: 11,
    transactionsLastYear: 950,
    googleRating: 4.6,
    googleReviewCount: 567,
    propertyFinderRating: 4.7,
    languages: ["English", "Arabic", "Russian", "Hindi"],
    specialties: ["Luxury leasing", "Villas", "Premium apartments", "Emirates Hills"],
    communities: ["Emirates Hills", "Palm Jumeirah", "Jumeirah", "Downtown Dubai", "Dubai Hills", "Arabian Ranches", "DAMAC Hills"],
    avgDaysToLet: 22,
    avgAchievedRent: "97% of asking price",
    pros: [
      "Deep expertise in luxury villas and large format properties",
      "Strong HNW tenant network — corporate executives and families",
      "Personalised service with dedicated agent per property",
      "Excellent photography and premium listing presentation",
      "Strong in Emirates Hills and Jumeirah villa communities",
    ],
    recentReviews: [
      { author: "Abdullah A.", date: "May 2025", rating: 5, text: "Provident found a corporate family for my Emirates Hills villa at full price. Excellent calibre of tenants.", source: "Google" },
      { author: "Isabelle R.", date: "Apr 2025", rating: 5, text: "Very professional boutique service. They really understood the Jumeirah market.", source: "Property Finder" },
      { author: "Khalid M.", date: "Mar 2025", rating: 5, text: "Used them for my Arabian Ranches villa. Solid communication and a smooth tenancy agreement process.", source: "Google" },
      { author: "Natasha V.", date: "Apr 2025", rating: 4, text: "Good experience, although it took slightly longer than expected given the villa size.", source: "Bayut" },
    ],
  },
  {
    id: "driven",
    name: "Driven Properties",
    agency: "Driven Properties",
    title: "Data-driven agency specialising in investor and landlord services",
    experience: 13,
    transactionsLastYear: 1400,
    googleRating: 4.5,
    googleReviewCount: 743,
    propertyFinderRating: 4.6,
    languages: ["English", "Arabic", "Hindi"],
    specialties: ["Investor leasing", "Portfolio management", "Mid to luxury apartments"],
    communities: ["Downtown Dubai", "Business Bay", "DIFC", "Dubai Marina", "Palm Jumeirah", "Dubai Creek Harbour", "Emaar Beachfront"],
    avgDaysToLet: 19,
    avgAchievedRent: "97% of asking price",
    pros: [
      "Strong investor focus — understands landlord priorities",
      "Data-backed pricing recommendations",
      "Good coverage in newer developments (Creek Harbour, Emaar Beachfront)",
      "Dedicated property management division",
      "Transparent reporting and rent collection",
    ],
    recentReviews: [
      { author: "Vikram S.", date: "May 2025", rating: 5, text: "Driven manages my Creek Harbour apartment. Consistently find good tenants and the reporting is very clear.", source: "Google" },
      { author: "Sophie L.", date: "Apr 2025", rating: 4, text: "Good agency for investors. They understand yield and price realistically.", source: "Property Finder" },
      { author: "Michael C.", date: "Mar 2025", rating: 5, text: "Used Driven for 2 properties. Both let quickly at near asking price.", source: "Google" },
      { author: "Ananya R.", date: "May 2025", rating: 5, text: "Very professional. The agent knew DIFC pricing inside out and we had a tenant in 15 days.", source: "Bayut" },
    ],
  },
];

// Rank agents for a given community and unit type
export function rankAgents(community: string, unitType: string): (RealEstateAgent & { matchScore: number; matchReasons: string[] })[] {
  return AGENTS.map(agent => {
    let score = 0;
    const reasons: string[] = [];

    // Community match — strongest signal
    if (agent.communities.includes(community)) {
      score += 40;
      reasons.push(`Active leasing presence in ${community}`);
    }

    // Unit type match
    const isVilla = unitType === "Villa";
    if (isVilla && agent.specialties.some(s => s.toLowerCase().includes("villa"))) {
      score += 20;
      reasons.push("Specialist in villa leasing");
    } else if (!isVilla && agent.specialties.some(s => s.toLowerCase().includes("apartment"))) {
      score += 15;
      reasons.push("Strong apartment leasing track record");
    }

    // Speed bonus
    if (agent.avgDaysToLet <= 15) { score += 15; reasons.push(`Fast lettings — avg ${agent.avgDaysToLet} days to find tenant`); }
    else if (agent.avgDaysToLet <= 20) { score += 10; reasons.push(`Avg ${agent.avgDaysToLet} days to let`); }

    // Rating bonus
    score += Math.round((agent.googleRating - 4) * 20);
    if (agent.googleRating >= 4.7) reasons.push("Top-rated agency on Google");

    // Volume bonus
    if (agent.transactionsLastYear >= 2000) { score += 10; reasons.push("High transaction volume — large tenant pool"); }

    return { ...agent, matchScore: score, matchReasons: reasons.slice(0, 3) };
  })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);
}

// ── Boutique / emerging leasing specialists (display-only directory) ─────────
// Smaller, personalized agencies surfaced alongside the ranked majors.
// Not part of rankAgents() — additive content for the /agents recommendation page.
export interface BoutiqueAgent {
  id: string;
  name: string;
  badge: string;          // e.g. "Boutique Specialist"
  specialization: string; // one-line "best for"
}

export const BOUTIQUE_AGENTS: BoutiqueAgent[] = [
  { id: "b1", name: "Keystone Living", badge: "Boutique Specialist", specialization: "Personalized landlord communication & tenant vetting" },
  { id: "b2", name: "Crest Residential", badge: "Emerging Agency", specialization: "Fast leasing for mid-market apartments" },
  { id: "b3", name: "Anchor Leasing Co.", badge: "Promising Agency", specialization: "Hands-on management for single-property landlords" },
];

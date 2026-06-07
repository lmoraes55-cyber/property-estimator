// ── Furnishing & Interior Design Data ──────────────────────────────────────
// Operators, furnishing companies, and DET compliance guidance

export interface UpcomingOperator {
  id: string;
  name: string;
  founded: number;
  portfolio: number;
  specialization: string;
  communities: string[];
  googleRating: number;
  googleReviewCount: number;
  pros: string[];
  description: string;
}

export interface FurnishingCompany {
  id: string;
  name: string;
  founded: number;
  projectsCompleted: number;
  googleRating: number;
  googleReviewCount: number;
  specialties: string[];
  avgProjectDays: number;
  communities: string[];
  detCompliant: boolean;
  pros: string[];
  website?: string;
}

export interface DETInventoryItem {
  category: string;
  items: string[];
}

// Upcoming small operators with growth potential
export const UPCOMING_OPERATORS: UpcomingOperator[] = [
  {
    id: "emaar-short-stay",
    name: "Emaar Short Stay",
    founded: 2022,
    portfolio: 45,
    specialization: "Luxury waterfront properties",
    communities: ["Dubai Marina", "Palm Jumeirah", "Downtown Dubai", "Emaar Beachfront"],
    googleRating: 4.7,
    googleReviewCount: 89,
    pros: [
      "100% Emaar building focus — deep relationship with management",
      "Boutique service with personalized guest experiences",
      "Tech-enabled booking and guest communication",
      "Strong positioning for Emaar's mega-projects",
    ],
    description: "New operator specializing exclusively in Emaar properties. Strong growth trajectory with focus on ultra-premium guest experience.",
  },
  {
    id: "villa-masters",
    name: "Villa Masters",
    founded: 2021,
    portfolio: 38,
    specialization: "Villa management only",
    communities: ["Emirates Hills", "Arabian Ranches", "Jumeirah", "Dubai Hills"],
    googleRating: 4.6,
    googleReviewCount: 72,
    pros: [
      "Villa specialists — understand villa operations better than apartments",
      "Exclusive vetting for high-value family groups",
      "Concierge services for villa amenities",
      "Fast-growing in villa-heavy communities",
    ],
    description: "Emerging villa-focused operator gaining traction in premium communities. Ideal if you own a villa.",
  },
  {
    id: "emerging-homes",
    name: "Emerging Homes",
    founded: 2023,
    portfolio: 28,
    specialization: "Up-and-coming communities",
    communities: ["Dubai South", "Furjan", "Town Square", "Dubai Creek Harbour", "Jumeirah Village Triangle"],
    googleRating: 4.5,
    googleReviewCount: 54,
    pros: [
      "First-mover advantage in emerging suburbs",
      "Strong focus on value-conscious guests",
      "Lower commission structure — competitive pricing",
      "Building portfolio quickly with aggressive growth",
    ],
    description: "New startup targeting affordable and emerging communities. Great option if you want competitive commission rates.",
  },
];

// Top furnishing & interior design companies
export const FURNISHING_COMPANIES: FurnishingCompany[] = [
  {
    id: "designlab-dubai",
    name: "DesignLab Dubai",
    founded: 2015,
    projectsCompleted: 850,
    googleRating: 4.8,
    googleReviewCount: 340,
    specialties: ["Modern minimalist", "Contemporary luxury", "DET compliance", "Short-term rental optimization"],
    avgProjectDays: 18,
    communities: ["Downtown Dubai", "Dubai Marina", "Business Bay", "JBR", "DIFC", "Palm Jumeirah"],
    detCompliant: true,
    pros: [
      "850+ holiday home projects completed",
      "Highest Google rating among furnishing firms",
      "DET compliance specialist — all projects fully compliant",
      "Fast turnaround — avg 18 days to fully furnished",
      "AED 25,000–45,000 per 2BR package",
    ],
    website: "designlabdubai.ae",
  },
  {
    id: "homestyle-interiors",
    name: "HomeStyle Interiors",
    founded: 2012,
    projectsCompleted: 620,
    googleRating: 4.7,
    googleReviewCount: 280,
    specialties: ["Warm modern", "Scandinavian", "DET compliance", "Budget-friendly options"],
    avgProjectDays: 21,
    communities: ["Dubai Marina", "Downtown Dubai", "JVC", "Jumeirah", "Arabian Ranches"],
    detCompliant: true,
    pros: [
      "620+ completed holiday home furnishing projects",
      "Excellent value for money — competitive pricing",
      "Flexible packages from basic to luxury",
      "Quick consultation and quotation turnaround",
      "AED 18,000–38,000 per 2BR package",
    ],
  },
  {
    id: "luxury-furnish-co",
    name: "Luxury Furnish Co",
    founded: 2014,
    projectsCompleted: 450,
    googleRating: 4.9,
    googleReviewCount: 210,
    specialties: ["Ultra-luxury", "Bespoke design", "High-end furnishing", "DET compliance"],
    avgProjectDays: 24,
    communities: ["Palm Jumeirah", "Emirates Hills", "Downtown Dubai", "Dubai Hills"],
    detCompliant: true,
    pros: [
      "Premium furnishing for ultra-luxury properties",
      "Highest rated firm — 4.9 Google stars",
      "Bespoke design service included",
      "White-glove project management",
      "AED 45,000–80,000+ per 2BR package",
    ],
  },
  {
    id: "quick-furnish",
    name: "Quick Furnish",
    founded: 2019,
    projectsCompleted: 380,
    googleRating: 4.6,
    googleReviewCount: 195,
    specialties: ["Fast turnover", "Modular furnishing", "DET compliance", "Rental optimization"],
    avgProjectDays: 12,
    communities: ["JVC", "Business Bay", "Dubai Creek Harbour", "JLT", "DIFC"],
    detCompliant: true,
    pros: [
      "Fastest turnaround in Dubai — 12 days average",
      "Pre-assembled modules reduce on-site time",
      "DET compliant modular systems",
      "Ideal for properties needing quick listing",
      "AED 20,000–35,000 per 2BR package",
    ],
  },
  {
    id: "modern-spaces",
    name: "Modern Spaces Design",
    founded: 2016,
    projectsCompleted: 520,
    googleRating: 4.7,
    googleReviewCount: 235,
    specialties: ["Contemporary design", "Space optimization", "DET compliance", "Eco-friendly options"],
    avgProjectDays: 19,
    communities: ["Downtown Dubai", "Dubai Marina", "Town Square", "Dubai South", "JVC"],
    detCompliant: true,
    pros: [
      "520+ holiday home projects delivered",
      "Space optimization specialists — maximizes rental appeal",
      "Eco-friendly and sustainable furnishing options",
      "Excellent customer support throughout project",
      "AED 22,000–42,000 per 2BR package",
    ],
  },
];

// DET Compliance Inventory Checklist
export const DET_INVENTORY_CHECKLIST: DETInventoryItem[] = [
  {
    category: "Living Room",
    items: [
      "Seating — minimum 2 couches or 1 couch + 2 chairs",
      "Coffee table",
      "TV stand or wall mount",
      "Smart TV (minimum 40 inch)",
      "Adequate lighting — ceiling + floor lamps",
      "Curtains/blinds (blackout recommended)",
      "Rug (if hard flooring)",
    ],
  },
  {
    category: "Bedroom(s)",
    items: [
      "Bed frame and mattress (DET-approved quality)",
      "Pillow(s) and bed linen (Egyptian cotton recommended, 200+ thread count)",
      "Wardrobe or closet space with hangers",
      "Bedside table(s)",
      "Adequate lighting (overhead + bedside lamp)",
      "Curtains/blinds (blackout recommended)",
      "Mirror (minimum 50x70cm)",
    ],
  },
  {
    category: "Kitchen & Dining",
    items: [
      "Dining table and chairs (minimum 4 seats for 2BR+)",
      "Full kitchen appliances (stove, oven, microwave, refrigerator)",
      "Dishwasher or space for manual washing",
      "Kitchen utensils — cutlery, plates, bowls, glasses, mugs",
      "Cooking utensils — pots, pans, utensils",
      "Kettle, toaster, coffee maker",
      "Food storage containers",
      "Kitchen towels and apron",
    ],
  },
  {
    category: "Bathrooms",
    items: [
      "Towel rails or hooks (minimum 2 per bathroom)",
      "Bath towels (minimum 2 per guest capacity)",
      "Hand towels (minimum 2 per guest)",
      "Shower curtain or glass enclosure (if not fixed)",
      "Bath mat (non-slip)",
      "Bathroom mirror",
      "Bathroom lighting",
      "Toilet brush and plunger",
      "Trash bin",
      "Soap dispenser",
    ],
  },
  {
    category: "Laundry & Cleaning",
    items: [
      "Washing machine (DET requirement — must be provided)",
      "Dryer or drying space",
      "Iron and ironing board",
      "Vacuum cleaner or broom",
      "Mop and bucket",
      "Cleaning supplies (detergents, disinfectant)",
      "Laundry basket or hamper",
    ],
  },
  {
    category: "Safety & Comfort",
    items: [
      "Fire extinguisher (accessible location)",
      "First aid kit",
      "Smoke detectors (if applicable to building)",
      "Carbon monoxide detector (if applicable)",
      "Emergency contact card",
      "WiFi router (strong signal required)",
      "Air conditioning (essential in Dubai)",
      "Heating (if applicable)",
    ],
  },
  {
    category: "Additional Essentials",
    items: [
      "Welcome package (tea, coffee, basic toiletries)",
      "Guest information booklet",
      "Thermostat controls guide",
      "TV & entertainment system guide",
      "WiFi details and password",
      "Emergency numbers and local contacts",
      "House rules documentation",
    ],
  },
];

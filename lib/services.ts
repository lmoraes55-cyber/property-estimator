export interface ServiceDef {
  id: string;
  title: string;
  description: string;
  statusLabel: string;
  futurePrice: number;
  deliveryTime: string;
  included: string[];
  requiredInputs: string[];
  isPaidEnabled: false;
}

export const SERVICES: ServiceDef[] = [
  {
    id: "operator-match",
    title: "Private Operator Match",
    description:
      "We identify and shortlist the best-fit STR operators for your property based on building, size, and target returns — so you compare real options, not sales pitches.",
    statusLabel: "Free during testing",
    futurePrice: 500,
    deliveryTime: "3 business days",
    included: [
      "Operator shortlist (2-3 vetted options)",
      "Revenue split comparison",
      "Operator reputation notes",
    ],
    requiredInputs: ["property", "notes"],
    isPaidEnabled: false,
  },
  {
    id: "photo-review",
    title: "STR Readiness Photo Review",
    description:
      "Submit your property photos and we'll provide a written review of what's working, what's missing, and what to fix before listing — to maximize bookings.",
    statusLabel: "Free during testing",
    futurePrice: 299,
    deliveryTime: "5 business days",
    included: [
      "Written photo review",
      "Specific staging recommendations",
      "Priority fix list",
    ],
    requiredInputs: ["property", "photoLinks", "notes"],
    isPaidEnabled: false,
  },
  {
    id: "furnishing-quote",
    title: "Furnishing Quote",
    description:
      "Get a realistic furnishing cost estimate tailored to your unit size and target STR tier — with itemized packages from budget to premium.",
    statusLabel: "Free during testing",
    futurePrice: 0,
    deliveryTime: "2 business days",
    included: [
      "Itemized furnishing cost estimate",
      "Budget and premium tiers",
      "Key vendor recommendations",
    ],
    requiredInputs: ["property", "targetTier", "notes"],
    isPaidEnabled: false,
  },
  {
    id: "3d-walkthrough",
    title: "3D Walkthrough Preview",
    description:
      "We produce a virtual staging concept showing how your unfurnished or dated unit could look — useful for off-plan or pre-launch STR planning.",
    statusLabel: "Free during testing",
    futurePrice: 899,
    deliveryTime: "7 business days",
    included: [
      "Virtual staging concept renders",
      "2-3 room perspectives",
      "STR-optimized layout notes",
    ],
    requiredInputs: ["property", "photoLinks", "notes"],
    isPaidEnabled: false,
  },
  {
    id: "investment-research",
    title: "STR Investment Research",
    description:
      "Thinking of buying for STR? We research specific buildings, areas, or unit types and give you a frank assessment of STR viability, competition, and realistic yields.",
    statusLabel: "Free during testing",
    futurePrice: 799,
    deliveryTime: "5 business days",
    included: [
      "Building or area STR assessment",
      "Competitor analysis",
      "Realistic yield range",
      "Key risks and upsides",
    ],
    requiredInputs: ["researchFocus", "budget", "notes"],
    isPaidEnabled: false,
  },
  {
    id: "subleasing-review",
    title: "Sub-Leasing Risk Review",
    description:
      "We review your tenancy agreement and building rules to flag STR sub-leasing risks, DTCM permit requirements, and how to approach your landlord or operator.",
    statusLabel: "Free during testing",
    futurePrice: 399,
    deliveryTime: "3 business days",
    included: [
      "Tenancy agreement review",
      "Risk flag summary",
      "DTCM permit checklist",
      "Recommended next steps",
    ],
    requiredInputs: ["property", "agreementDetails", "notes"],
    isPaidEnabled: false,
  },
  {
    id: "self-manage-setup",
    title: "Self-Manage Setup Support",
    description:
      "Want to run your own STR without an operator? We help you set up channel manager, pricing tools, listing copy, and house rules — step by step.",
    statusLabel: "Free during testing",
    futurePrice: 299,
    deliveryTime: "5 business days",
    included: [
      "Channel manager recommendation",
      "Dynamic pricing setup guide",
      "Listing copy template",
      "House rules and guest comms template",
    ],
    requiredInputs: ["property", "currentSetup", "notes"],
    isPaidEnabled: false,
  },
  {
    id: "post_sale_operator_match",
    title: "Post-Sale Operator Match",
    description:
      "For agents: after a purchase closes, submit the property so AssetIntel can privately match it with suitable STR operators based on building, unit type, furnishing, and owner priorities.",
    statusLabel: "Free during testing",
    futurePrice: 0,
    deliveryTime: "3 business days",
    included: [
      "Property review against operator service models",
      "Private operator shortlist (not shown publicly)",
      "STR onboarding guidance for the owner",
    ],
    requiredInputs: ["property", "notes"],
    isPaidEnabled: false,
  },
];

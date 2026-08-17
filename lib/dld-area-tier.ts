// Area-level STR/LTR tier for the 2026 Handover Intelligence page. AssetIntel's own
// directional classification — kept visually distinct from DLD-sourced facts
// wherever this is displayed, per PRODUCT.md's "never overstate certainty"
// principle. Keyed on the DLD cadastral area name (area_name_en from
// dld_projects-open-api), which is often an administrative name rather than the
// marketing community name (e.g. "Marsa Dubai" = JBR/Dubai Marina).
//
// Built from the 40 real area names returned by a 2026-08-14 query for ACTIVE
// projects with a 2026 project_end_date (309 projects). Any area not covered
// here (a new area appearing in a future refresh) falls back to "needs-verification"
// rather than a guessed tier.

export type STRTierCategory = "prime-str" | "selective-str" | "ltr-preferred" | "needs-verification";

export const DLD_AREA_TIER: Record<string, STRTierCategory> = {
  // Prime tourist/business STR demand
  "Marsa Dubai": "prime-str",              // JBR / Dubai Marina cadastral name
  "Business Bay": "prime-str",
  "Burj Khalifa": "prime-str",
  "Palm Jumeirah": "prime-str",
  "Al Jadaf": "prime-str",                 // Dubai Creek Harbour / Culture Village area
  "Al Wasl": "prime-str",

  // Selective — can work with the right unit/view, urban/growth areas
  "Al Barshaa South Third": "selective-str",  // Arjan
  "Al Barshaa South Second": "selective-str",
  "Al Barsha South Fifth": "selective-str",
  "Al Barsha First": "selective-str",
  "Al Thanyah Fifth": "selective-str",        // JLT
  "Al Thanyah Third": "selective-str",
  "Al Hebiah Second": "selective-str",        // JVC
  "Al Hebiah Fourth": "selective-str",        // Dubai Sports City
  "Al Hebiah Sixth": "selective-str",
  "Al Hebiah First": "selective-str",
  "Al Satwa": "selective-str",
  "Al Khairan First": "selective-str",        // Business Bay-adjacent
  "Jumeirah Second": "selective-str",
  "Um Suqaim Third": "selective-str",
  "Al Safouh First": "selective-str",
  "Hadaeq Sheikh Mohammed Bin Rashid": "selective-str", // MBR City / District One
  "Me'Aisem First": "selective-str",          // Jumeirah Golf Estates area
  "Nad Al Shiba First": "selective-str",
  "Madinat Al Mataar": "selective-str",       // Dubai South / near Al Maktoum Airport

  // LTR preferred — outlying, industrial, or family-residential areas with weaker
  // tourist STR demand
  "Al Warsan First": "ltr-preferred",
  "Warsan Fourth": "ltr-preferred",
  "Jabal Ali First": "ltr-preferred",
  "Dubai Investment Park First": "ltr-preferred",
  "Saih Shuaib 2": "ltr-preferred",
  "Al Yufrah 1": "ltr-preferred",             // Dubailand outskirts
  "Wadi Al Safa 2": "ltr-preferred",
  "Wadi Al Safa 3": "ltr-preferred",
  "Wadi Al Safa 4": "ltr-preferred",
  "Wadi Al Safa 5": "ltr-preferred",
  "Al Merkadh": "ltr-preferred",
  "Nadd Hessa": "ltr-preferred",
  "Madinat Dubai Almelaheyah": "ltr-preferred", // Port/industrial-adjacent
  "Al Barsha South Fourth": "ltr-preferred",  // JVT — family townhouse/villa community
  "Wadi Al Safa 6": "ltr-preferred",          // Arabian Ranches
  "Wadi Al Safa 7": "ltr-preferred",          // Arabian Ranches
  "Al Yelayiss 2": "ltr-preferred",           // Town Square

  // Needs verification — mixed-use/emerging areas without a clear existing STR read
  "Palm Deira": "needs-verification",         // Deira Islands, still emerging as an STR market
};

export function getDLDAreaTier(areaNameEn: string | null): STRTierCategory {
  if (!areaNameEn) return "needs-verification";
  return DLD_AREA_TIER[areaNameEn] ?? "needs-verification";
}

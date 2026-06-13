/**
 * Maps DLD administrative area names (as they appear in Ejari contract data)
 * to the community names used throughout the estimator.
 *
 * DLD uses internal cadastral area names; this table bridges them to the
 * commonly-known community names owners recognise.
 */
export const DLD_AREA_TO_COMMUNITY: Record<string, string> = {
  // Downtown / DIFC / SZR
  "Burj Khalifa":                     "Downtown Dubai",
  "Zaabeel Second":                   "Downtown Dubai",
  "Zaabeel First":                    "Downtown Dubai",
  "Trade Center First":               "DIFC",
  "Al Kifaf":                         "Al Kifaf",

  // Business Bay
  "Business Bay":                     "Business Bay",

  // Dubai Marina / JBR
  "Marsa Dubai":                      "Dubai Marina",

  // Palm Jumeirah & Maritime
  "Palm Jumeirah":                    "Palm Jumeirah",
  "Madinat Dubai Almelaheyah":        "Dubai Maritime City",
  "Island 2":                         "The World Islands",

  // Creek / MBR City
  "Al Khairan First":                 "Dubai Creek Harbour",
  "Al Merkadh":                       "MBR City",
  "Al Jadaf":                         "Al Jadaf",

  // JLT / Tecom / Barsha Heights
  "Al Thanyah Third":                 "JLT",
  "Al Thanyah Fifth":                 "JLT",
  "Al Thanyah First":                 "Barsha Heights",
  "Al Thanayah Fourth":               "Emirates Hills",

  // Al Sufouh / Media City
  "Al Safouh First":                  "Al Sufouh",
  "Al Safouh Second":                 "Al Sufouh",

  // JVC / Arjan / Al Barsha South
  "Al Barsha South Fourth":           "Arjan",
  "Al Barshaa South Third":           "Arjan",
  "Al Barshaa South Second":          "JVC",
  "Al Barsha South Fifth":            "JVC",
  "Al Goze Fourth":                   "Al Quoz",

  // Jumeirah
  "Jumeirah First":                   "La Mer / Port de La Mer",
  "Jumeirah Second":                  "Jumeirah",
  "Um Suqaim Third":                  "Madinat Jumeirah",
  "Al Satwa":                         "Satwa",
  "Al Wasl":                          "Citywalk",

  // Al Furjan / JVT
  "Jabal Ali First":                  "Al Furjan",
  "Jabal Ali Industrial Second":      "Al Furjan",
  "Hessyan First":                    "JVT",

  // Production City / IMPZ
  "Me'Aisem First":                   "IMPZ",

  // Motor City / Studio City / Sports City / DAMAC Hills
  "Al Hebiah First":                  "Motor City",
  "Al Hebiah Second":                 "Studio City",
  "Al Hebiah Third":                  "DAMAC Hills",
  "Al Hebiah Fourth":                 "Sports City",
  "Al Hebiah Fifth":                  "Remraam",
  "Al Hebiah Sixth":                  "Mudon",

  // Mudon / Villanova / Arabian Ranches
  "Wadi Al Safa 6":                   "Arabian Ranches",
  "Wadi Al Safa 7":                   "Arabian Ranches",
  "Wadi Al Safa 5":                   "Arabian Ranches 3",
  "Wadi Al Safa 3":                   "Living Legends",
  "Wadi Al Safa 2":                   "Liwan",
  "Wadi Al Safa 4":                   "Wadi Al Safa",

  // Dubai Hills
  "Hadaeq Sheikh Mohammed Bin Rashid": "Dubai Hills Estate",

  // DAMAC Hills 2 / Town Square / Reem
  "Madinat Hind 4":                   "DAMAC Hills 2",
  "Al Yelayiss 1":                    "Reem",
  "Al Yelayiss 2":                    "Town Square",

  // The Valley / Dubailand
  "Al Yufrah 1":                      "The Valley",
  "Nadd Hessa":                       "Al Nahda",
  "Nad Al Shiba First":               "Meydan",

  // International City / Warsan / Mirdif
  "Al Warsan First":                  "International City",
  "Warsan Fourth":                    "International City",
  "Mirdif":                           "Mirdif",

  // Dubai South / DIP
  "Madinat Al Mataar":                "Dubai South",
  "Saih Shuaib 2":                    "Dubai South",
  "Dubai Investment Park First":      "Dubai Investment Park",
  "Dubai Investment Park Second":     "Dubai Investment Park",
};

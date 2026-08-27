#!/usr/bin/env node
/**
 * Self-check for the building -> master -> area lookup cascade.
 *
 *   node scripts/test-rent-tiers.mjs
 *
 * Mirrors the resolution logic in lib/building-rents.ts against a synthetic
 * dataset. Guards the two things most likely to break silently: that a dataset
 * WITHOUT the masters/aliases blocks (i.e. the committed pre-re-ingest file)
 * still degrades cleanly, and that project_number resolves a building whose
 * normalized name does not match its key.
 */
import assert from "node:assert/strict";

function normalizeName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(tower|towers|residence|residences|building|bldg|apartment|apartments|the)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function makeLookups(data) {
  const byProjectNumber = new Map();
  for (const [k, b] of Object.entries(data.buildings)) {
    if (b.projectNumber) byProjectNumber.set(b.projectNumber, k);
  }
  const lookupBuilding = (name, size) => {
    const norm = normalizeName(name);
    if (!norm) return null;
    const exact = data.buildings[norm]?.beds?.[size];
    if (exact) return { ...exact, match: "building" };
    const pn = data.aliases?.[norm];
    if (pn) {
      const key = byProjectNumber.get(pn);
      const s = key ? data.buildings[key]?.beds?.[size] : undefined;
      if (s) return { ...s, match: "building" };
    }
    return null;
  };
  const masterFor = (name) => {
    const norm = normalizeName(name);
    if (!norm) return null;
    const direct = data.buildings[norm]?.master;
    if (direct) return direct;
    const pn = data.aliases?.[norm];
    const key = pn ? byProjectNumber.get(pn) : undefined;
    return (key && data.buildings[key]?.master) || null;
  };
  const lookupMaster = (m, size) => {
    if (!m || !data.masters) return null;
    const s = data.masters[m]?.beds?.[size];
    return s ? { ...s, match: "master" } : null;
  };
  const lookupArea = (a, size) => {
    const s = data.areas[a]?.beds?.[size];
    return s ? { ...s, match: "area" } : null;
  };
  // The cascade as estimator.ts runs it.
  const cascade = (name, area, size) =>
    lookupBuilding(name, size) ?? lookupMaster(masterFor(name), size) ?? lookupArea(area, size);
  return { cascade, masterFor };
}

const stat = (median, n) => ({ median, p25: median - 1000, p75: median + 1000, n });

// Full dataset: building keyed "gate 1", reachable from "Marina Gate" only via project_number.
const full = {
  buildings: {
    "gate 1": { displayName: "MARINA GATE 1", area: "Marsa Dubai", projectNumber: "742", master: "Dubai Marina", beds: { "1BR": stat(120000, 12) } },
    "sadaf 3": { displayName: "SADAF 3", area: "Marsa Dubai", projectNumber: "88", master: "Jumeriah Beach Residence  - JBR", beds: {} },
  },
  masters: {
    "Dubai Marina": { area: "Marsa Dubai", beds: { "1BR": stat(115000, 400), "2BR": stat(170000, 300) } },
    "Jumeriah Beach Residence  - JBR": { area: "Marsa Dubai", beds: { "2BR": stat(195000, 250) } },
  },
  areas: { "Marsa Dubai": { beds: { "1BR": stat(110000, 3000), "2BR": stat(160000, 2500) } } },
  aliases: { "marina gate 1": "742", "sadaf 3": "88" },
};

const { cascade, masterFor } = makeLookups(full);

// 1. Exact building beats everything.
let r = cascade("Marina Gate 1", "Marsa Dubai", "1BR");
assert.equal(r.match, "building");
assert.equal(r.median, 120000);

// 2. Building has no 2BR -> master tier, NOT the area. This is the whole point:
//    the area median (160000) blends JBR and Harbour into Marina.
r = cascade("Marina Gate 1", "Marsa Dubai", "2BR");
assert.equal(r.match, "master");
assert.equal(r.median, 170000);

// 3. JBR resolves to its own master, not the pooled Marsa Dubai area figure.
assert.equal(masterFor("Sadaf 3"), "Jumeriah Beach Residence  - JBR");
r = cascade("Sadaf 3", "Marsa Dubai", "2BR");
assert.equal(r.match, "master");
assert.equal(r.median, 195000, "JBR must not collapse into the Marsa Dubai area average");

// 4. Unknown building falls through to area.
r = cascade("Some Unlisted Tower", "Marsa Dubai", "1BR");
assert.equal(r.match, "area");

// 5. Nothing anywhere -> null, not a throw.
assert.equal(cascade("Nowhere", "Nonexistent Area", "1BR"), null);

// 6. GRACEFUL DEGRADATION: the committed dataset has no masters/aliases blocks.
//    Cascade must skip the master tier silently rather than throwing.
const legacy = { buildings: { "gate 1": { displayName: "MARINA GATE 1", area: "Marsa Dubai", beds: { "1BR": stat(120000, 12) } } }, areas: full.areas };
const legacyLookups = makeLookups(legacy);
assert.equal(legacyLookups.masterFor("Marina Gate 1"), null);
r = legacyLookups.cascade("Marina Gate 1", "Marsa Dubai", "2BR");
assert.equal(r.match, "area", "without a masters block the cascade must fall to area");

// 7. project_number normalisation: DLD serialises it as "742.00".
assert.equal(String(parseFloat("742.00")), "742");

console.log("✓ all rent-tier cascade checks passed");

// ── Spread suppression + merge ──────────────────────────────────────────
// Mirrors mergeStats() in lib/building-rents.ts. p25/p75 are omitted below
// spreadMinN, so merging must tolerate inputs that carry no spread at all and
// must not invent one.
function mergeStats(stats) {
  const valid = stats.filter(Boolean);
  if (!valid.length) return null;
  if (valid.length === 1) return valid[0];
  let wSum = 0, nSum = 0, p25 = Infinity, p75 = 0, sawSpread = false;
  for (const s of valid) {
    wSum += s.median * s.n;
    nSum += s.n;
    if (s.p25 != null && s.p75 != null) {
      p25 = Math.min(p25, s.p25);
      p75 = Math.max(p75, s.p75);
      sawSpread = true;
    }
  }
  return { median: Math.round(wSum / nSum), n: nSum, ...(sawSpread ? { p25, p75 } : {}) };
}

const wide = { median: 100000, p25: 90000, p75: 110000, n: 20 };
const narrow = { median: 120000, p25: 115000, p75: 125000, n: 30 };
const bare = { median: 200000, n: 6 }; // below spreadMinN — no spread published

// Merging two spreads takes the widest bounds and the summed sample.
let m = mergeStats([wide, narrow]);
assert.equal(m.p25, 90000);
assert.equal(m.p75, 125000);
assert.equal(m.n, 50);
assert.equal(m.median, Math.round((100000 * 20 + 120000 * 30) / 50));

// A spreadless input must not drag the bounds to Infinity/0.
m = mergeStats([wide, bare]);
assert.equal(m.p25, 90000, "spreadless input must not corrupt p25");
assert.equal(m.p75, 110000, "spreadless input must not corrupt p75");
assert.equal(m.n, 26);

// All inputs spreadless -> no spread invented.
m = mergeStats([bare, { median: 210000, n: 7 }]);
assert.equal(m.p25, undefined, "must not invent a spread from spreadless inputs");
assert.equal(m.p75, undefined);
assert.equal(m.n, 13);

// Single stat passes through untouched, spread or not.
assert.deepEqual(mergeStats([bare]), bare);
assert.equal(mergeStats([]), null);


// ── Master-name matching across two vocabularies ────────────────────────
// Mirrors normalizeMaster() + lookupDLDMaster()'s subset matching in
// lib/building-rents.ts. Ours says "Jumeirah Beach Residence (JBR)"; DLD says
// "Jumeriah Beach Residence  - JBR" (their misspelling, their double space).
function normalizeMaster(x) {
  return String(x || "").toLowerCase().replace(/[^a-z0-9]+/g, " ")
    .replace(/\bjumeriah\b/g, "jumeirah").replace(/\s+/g, " ").trim();
}
function makeMasterLookup(masters) {
  const idx = new Map();
  for (const k of Object.keys(masters)) { const nk = normalizeMaster(k); if (nk) idx.set(nk, k); }
  return (name, bed) => {
    if (masters[name]?.beds?.[bed]) return name;
    const t = normalizeMaster(name);
    if (!t) return null;
    const exact = idx.get(t);
    if (exact && masters[exact]?.beds?.[bed]) return exact;
    const tT = t.split(" ").filter(Boolean);
    if (tT.length < 2) return null;
    let best = null;
    for (const [nk, orig] of idx) {
      const kT = nk.split(" ").filter(Boolean);
      const [short, long] = tT.length <= kT.length ? [tT, kT] : [kT, tT];
      if (short.length < 2) continue;
      if (!short.every(z => long.includes(z))) continue;
      if (!masters[orig]?.beds?.[bed]) continue;
      const extra = Math.abs(kT.length - tT.length);
      if (!best || extra < best.extra) best = { orig, extra };
    }
    return best ? best.orig : null;
  };
}

const MASTERS = {
  "Jumeriah Beach Residence  - JBR": { beds: { "2BR": stat(117233, 12) } },
  "Dubai Marina": { beds: { "2BR": stat(145000, 12) } },
  "Dubai Hills Estate": { beds: { "2BR": stat(132500, 12) } },
  "DUBAI HILLS - MAPLE 1": { beds: { "2BR": stat(150000, 12) } },
  "DMCC Master Community": { beds: { "2BR": stat(125000, 12) } },
};
const findMaster = makeMasterLookup(MASTERS);

// Our curated name must reach DLD's differently-spelled one.
assert.equal(findMaster("Jumeirah Beach Residence (JBR)", "2BR"), "Jumeriah Beach Residence  - JBR");
// Exact names still work.
assert.equal(findMaster("Dubai Marina", "2BR"), "Dubai Marina");
// Closest match wins: "Dubai Hills" must not land on the MAPLE sub-community.
assert.equal(findMaster("Dubai Hills", "2BR"), "Dubai Hills Estate");
// A DLD *area* is not a master and must not match one, so the caller falls to the area tier.
assert.equal(findMaster("Marsa Dubai", "2BR"), null);
// Single generic tokens must never match — too collision-prone.
assert.equal(findMaster("Marina", "2BR"), null);
assert.equal(findMaster("Dubai", "2BR"), null);
// Unknown community -> null, not a throw.
assert.equal(findMaster("Nowhere Community", "2BR"), null);

console.log("\u2713 all master-name matching checks passed");

// ── Dataset invariant ───────────────────────────────────────────────────
// Optionally validate a generated file:  node scripts/test-rent-tiers.mjs <path>
const datasetPath = process.argv[2];
if (datasetPath) {
  const fsMod = await import("node:fs");
  const d = JSON.parse(fsMod.readFileSync(datasetPath, "utf8"));
  const floor = Number(d.meta?.spreadMinN ?? 10);
  let checked = 0;
  const bad = { thinSpread: [], straddle: [] };
  const SHOW = 5;
  for (const scope of [d.buildings, d.masters, d.areas]) {
    for (const [name, entry] of Object.entries(scope ?? {})) {
      for (const [bed, st] of Object.entries(entry.beds ?? {})) {
        checked++;
        const hasSpread = st.p25 != null || st.p75 != null;
        if (hasSpread && st.n < floor) bad.thinSpread.push(`${name} ${bed} (n=${st.n})`);
        if (hasSpread && (st.p25 > st.median || st.p75 < st.median)) bad.straddle.push(`${name} ${bed}`);
      }
    }
  }
  const total = bad.thinSpread.length + bad.straddle.length;
  if (total) {
    if (bad.thinSpread.length) {
      console.error(`\n  ${bad.thinSpread.length} stats publish a p25/p75 spread below n=${floor}:`);
      for (const x of bad.thinSpread.slice(0, SHOW)) console.error(`    ${x}`);
      if (bad.thinSpread.length > SHOW) console.error(`    … and ${bad.thinSpread.length - SHOW} more`);
    }
    if (bad.straddle.length) {
      console.error(`\n  ${bad.straddle.length} stats have p25/p75 not straddling the median:`);
      for (const x of bad.straddle.slice(0, SHOW)) console.error(`    ${x}`);
    }
    // A file generated before the spread floor existed fails this by design.
    if (d.meta?.spreadMinN == null) {
      console.error(`\n  NOTE: this file has no meta.spreadMinN, so it predates the`);
      console.error(`  spread floor. Regenerate it with the current ingest.\n`);
    }
  }
  assert.equal(total, 0, `${total} spread violations in ${datasetPath}`);
  console.log(`✓ dataset invariant holds across ${checked} stats (spreadMinN=${floor})`);
}

console.log("✓ all spread/merge checks passed");

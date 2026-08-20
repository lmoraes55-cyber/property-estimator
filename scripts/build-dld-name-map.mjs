#!/usr/bin/env node
/**
 * BUILD DLD NAME MAP — local aggregator
 * =====================================
 * Calls /api/dld-buildings-probe in 8-page chunks until new names stop
 * appearing (convergence), then fuzzy-matches the DLD project names against
 * our 1,426 building keys.
 *
 * Writes lib/data/dld-name-map.json
 *
 * Usage:
 *   node scripts/build-dld-name-map.mjs [--host https://assetintel.ae] [--maxChunks 30]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const args = Object.fromEntries(
  process.argv.slice(2).map((a, i, arr) => a.startsWith("--") ? [a.slice(2), arr[i + 1] ?? true] : [])
);
const HOST           = args.host       ?? "https://assetintel.ae";
const MAX_CHUNKS     = parseInt(args.maxChunks ?? "60", 10);
const PAGES_PER_CHUNK = 8;
const STALL_AFTER    = 4;   // stop if 4 consecutive chunks add 0 new names
const OUT_PATH       = path.join(ROOT, "lib/data/dld-name-map.json");

function normalize(name) {
  return String(name ?? "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\b(tower|towers|residence|residences|building|bldg|apartment|apartments|the)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function canon(s) {
  return s
    .replace(/\bblvd\b/g, "boulevard")
    .replace(/\bbld\b/g, "boulevard")
    .replace(/\b(at|by|jumeirah living|emaar|nshama|the)\b/g, "")
    .replace(/\b(\d+)(st|nd|rd|th)\b/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function wordOverlap(a, b) {
  const ta = new Set(a.split(" ").filter(t => t.length > 2));
  const tb = new Set(b.split(" ").filter(t => t.length > 2));
  if (!ta.size) return 0;
  let hits = 0;
  for (const t of ta) if (tb.has(t)) hits++;
  return hits / ta.size;
}

async function fetchChunk(startPage) {
  const url = `${HOST}/api/dld-buildings-probe?startPage=${startPage}&maxPages=${PAGES_PER_CHUNK}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(25_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function main() {
  console.log(`Host: ${HOST}\nFetching in chunks of ${PAGES_PER_CHUNK} pages (stops after ${STALL_AFTER} empty chunks)\n`);

  const allDLDNames = new Set();
  let nextStart = 1;
  let chunk = 0;
  let emptyChunks = 0;

  while (nextStart !== null && chunk < MAX_CHUNKS) {
    chunk++;
    process.stdout.write(`  Chunk ${chunk} (pages ${nextStart}–${nextStart + PAGES_PER_CHUNK - 1})… `);
    try {
      const data = await fetchChunk(nextStart);
      const before = allDLDNames.size;
      data.names.forEach(n => allDLDNames.add(n));
      const added = allDLDNames.size - before;
      process.stdout.write(`+${added} names (total ${allDLDNames.size})\n`);

      if (added === 0) { emptyChunks++; } else { emptyChunks = 0; }
      if (emptyChunks >= STALL_AFTER) { console.log(`\n  Converged after ${STALL_AFTER} empty chunks. Stopping.`); break; }

      nextStart = data.done ? null : data.nextStart;
    } catch (err) {
      console.error(`\n  Error: ${err.message}`);
      break;
    }
    await new Promise(r => setTimeout(r, 300));
  }

  const dldNames = [...allDLDNames];
  console.log(`\nTotal distinct DLD names: ${dldNames.length}`);

  // Build normalized index
  const normIndex = new Map();
  for (const name of dldNames) {
    const key = canon(normalize(name));
    if (!key) continue;
    const arr = normIndex.get(key) ?? [];
    arr.push(name);
    normIndex.set(key, arr);
  }

  // Load our buildings
  const buildingData = JSON.parse(fs.readFileSync(path.join(ROOT, "lib/data/building-ltr-rents.json"), "utf-8"));
  const ourKeys = Object.keys(buildingData.buildings);
  console.log(`Matching ${ourKeys.length} buildings…`);

  const mapping = {};
  const unmatched = [];
  const methodCounts = {};

  function bestMatch(key, normIndex) {
    if (normIndex.has(key)) {
      return { dld: normIndex.get(key).sort((a, b) => a.length - b.length)[0], method: "exact", score: 1 };
    }
    let bestScore = 0, bestDLD = null, bestMethod = "";
    for (const [normKey, dldArr] of normIndex) {
      let score = 0, method = "";
      if (normKey.startsWith(key + " ") || normKey === key) {
        score = 0.9 + 0.05 * (key.length / Math.max(normKey.length, 1));
        method = "prefix";
      } else if (key.startsWith(normKey + " ") && normKey.length >= 5) {
        score = 0.75 * (normKey.length / Math.max(key.length, 1));
        method = "prefix-rev";
      }
      if (score > bestScore) { bestScore = score; bestDLD = dldArr.sort((a,b)=>a.length-b.length)[0]; bestMethod = method; }
    }
    if (bestDLD && bestScore >= 0.6) return { dld: bestDLD, method: bestMethod, score: bestScore };
    for (const [normKey, dldArr] of normIndex) {
      const score = wordOverlap(key, normKey) * 0.85;
      if (score > bestScore) { bestScore = score; bestDLD = dldArr[0]; bestMethod = "word-overlap"; }
    }
    if (bestDLD && bestScore >= 0.7) return { dld: bestDLD, method: bestMethod, score: bestScore };
    return null;
  }

  for (const ourKey of ourKeys) {
    const c = canon(ourKey);
    const key = c || ourKey;
    const bump = m => { methodCounts[m] = (methodCounts[m] ?? 0) + 1; };

    const hit = bestMatch(key, normIndex);
    if (hit) { mapping[ourKey] = hit.dld; bump(hit.method); continue; }

    unmatched.push(ourKey);
  }

  const matchedCount = Object.keys(mapping).length;
  console.log(`\nMatched (building-ltr-rents.json set): ${matchedCount}/${ourKeys.length} (${((matchedCount / ourKeys.length) * 100).toFixed(1)}%)`);
  console.log("By method:", methodCounts);

  // ── Second pass: match against the UI's actual building list ───────────
  // building-ltr-rents.json is a disconnected historical ingest (1,426 names
  // from a June CSV snapshot) — most buildings the estimator actually lets
  // users pick (lib/buildings-data.ts + lib/estimator.ts's BUILDING_DIRECTORY,
  // ~485 names) were never candidates in the pass above, so they can never
  // resolve live no matter how good the fuzzy matching is. This pass adds
  // them as real candidates, keyed the same way resolveDLDName() in
  // lib/dda-client.ts computes its runtime lookup key (plain normalize(),
  // no canon() — that mismatch is why the pass above stores raw ourKey but
  // searches on canon(ourKey)) — including the progressive trailing-token
  // strip resolveDLDName performs, so a phase-numbered building like
  // "Al Majara 1" can match a DLD project simply called "AL MAJARA".
  function extractUINames() {
    const names = new Set();
    const bd = fs.readFileSync(path.join(ROOT, "lib/buildings-data.ts"), "utf-8");
    for (const m of bd.matchAll(/^\s*"([^"]+)":\s*\{/gm)) names.add(m[1]);
    const est = fs.readFileSync(path.join(ROOT, "lib/estimator.ts"), "utf-8");
    const start = est.indexOf("export const BUILDING_DIRECTORY");
    const end = est.indexOf("\n};", start);
    for (const m of est.slice(start, end).matchAll(/"([^"]+)":\s*\{/g)) names.add(m[1]);
    return [...names];
  }

  const uiNames = extractUINames();
  console.log(`\nMatching ${uiNames.length} UI building names (lib/buildings-data.ts + BUILDING_DIRECTORY)…`);

  let uiMatched = 0, uiAlreadyCovered = 0;
  const uiMethodCounts = {};
  const uiUnmatched = [];

  for (const uiName of uiNames) {
    const full = normalize(uiName);
    if (!full) continue;

    // Already resolvable via the existing map (progressive-strip, same order
    // resolveDLDName uses) — nothing to add.
    let probe = full, covered = false;
    while (probe.length >= 4) {
      if (mapping[probe]) { covered = true; break; }
      const shorter = probe.replace(/\s+\S+$/, "").trim();
      if (shorter === probe) break;
      probe = shorter;
    }
    if (covered) { uiAlreadyCovered++; continue; }

    // Search each progressively-stripped level (same order/levels
    // resolveDLDName will probe at runtime) and store at the FIRST level
    // that finds a confident match — mirrors runtime behavior exactly.
    let level = full, stored = false;
    while (level.length >= 4) {
      const hit = bestMatch(canon(level) || level, normIndex);
      if (hit) {
        mapping[level] = hit.dld;
        uiMatched++;
        uiMethodCounts[hit.method] = (uiMethodCounts[hit.method] ?? 0) + 1;
        stored = true;
        break;
      }
      const shorter = level.replace(/\s+\S+$/, "").trim();
      if (shorter === level) break;
      level = shorter;
    }
    if (!stored) uiUnmatched.push(uiName);
  }

  console.log(`UI names already covered by existing map: ${uiAlreadyCovered}`);
  console.log(`UI names newly matched: ${uiMatched} (${JSON.stringify(uiMethodCounts)})`);
  console.log(`UI names still unmatched: ${uiUnmatched.length}`);
  if (uiUnmatched.length) console.log("First 30:", uiUnmatched.slice(0, 30).join(", "));

  const checks = ["marina gate", "creek horizon", "address boulevard", "burj vista", "downtown views 1", "index", "la mer", "one palm", "the palm tower", "burj khalifa"];
  console.log("\nSpot checks:");
  for (const k of checks) console.log(`  ${k.padEnd(35)} → ${mapping[k] ?? "(unmatched)"}`);

  console.log("\nFirst 20 unmatched:", unmatched.slice(0, 20).join(", "));

  const output = {
    _meta: {
      generated: new Date().toISOString(),
      dldDistinctNames: dldNames.length,
      ourBuildings: ourKeys.length,
      matched: matchedCount,
      unmatched: unmatched.length,
      matchRate: `${((matchedCount / ourKeys.length) * 100).toFixed(1)}%`,
      uiBuildings: uiNames.length,
      uiAlreadyCovered,
      uiMatched,
      uiUnmatched: uiUnmatched.length,
      uiMatchRate: `${(((uiMatched + uiAlreadyCovered) / uiNames.length) * 100).toFixed(1)}%`,
    },
    mapping,
  };
  fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2));
  console.log(`\nWritten: lib/data/dld-name-map.json`);
}

main().catch(err => { console.error(err); process.exit(1); });

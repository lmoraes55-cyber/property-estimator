#!/usr/bin/env node
/**
 * BUILD DLD NAME MAP
 * ==================
 * Samples the DDA Ejari rent-contracts dataset to collect all distinct
 * project_name_en values, then fuzzy-matches them against the 1,426 building
 * keys in building-ltr-rents.json. Writes lib/data/dld-name-map.json.
 *
 * Usage:
 *   node --env-file=.env.local scripts/build-dld-name-map.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const BASE = (process.env.DDA_BASE_URL ?? "").trim();
const APP_ID = (process.env.DDA_APP_IDENTIFIER ?? "").trim();
const CLIENT_ID = (process.env.DDA_CLIENT_ID ?? "").trim();
const CLIENT_SECRET = (process.env.DDA_CLIENT_SECRET ?? "").trim();

if (!BASE || !APP_ID || !CLIENT_ID || !CLIENT_SECRET) {
  console.error("Missing DDA env vars. Run: node --env-file=.env.local scripts/build-dld-name-map.mjs");
  process.exit(1);
}

// ── OAuth token ────────────────────────────────────────────────────────────
let cachedToken = null;
let tokenExpiresAt = 0;

async function getToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;
  const res = await fetch(`${BASE}/secure/ssis/dubaiai/gatewaytoken/1.0.0/getAccessToken`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "x-DDA-SecurityApplicationIdentifier": APP_ID,
    },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: CLIENT_ID, client_secret: CLIENT_SECRET }).toString(),
  });
  if (!res.ok) throw new Error(`Token fetch failed: ${res.status}`);
  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + ((data.expires_in ?? 3600) - 300) * 1000;
  return cachedToken;
}

// ── DDA query ──────────────────────────────────────────────────────────────
async function ddaQuery(dataset, params) {
  const token = await getToken();
  const url = new URL(`${BASE}/open/dld/${dataset}`);
  for (const [k, v] of Object.entries(params)) {
    if (Array.isArray(v)) v.forEach(vi => url.searchParams.append(k, vi));
    else url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`DDA error ${res.status}: ${body.slice(0, 200)}`);
  }
  const json = await res.json();
  return json.results ?? json.data ?? json.records ?? [];
}

// ── Name normaliser (mirrors building-rents.ts + ingest-dld-rents.mjs) ──────
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

// Word-overlap score: fraction of our tokens found in DLD name
function wordOverlap(a, b) {
  const ta = new Set(a.split(" ").filter(t => t.length > 2));
  const tb = new Set(b.split(" ").filter(t => t.length > 2));
  if (!ta.size) return 0;
  let hits = 0;
  for (const t of ta) if (tb.has(t)) hits++;
  return hits / ta.size;
}

// ── Fetch all distinct DLD project names via letter sampling ────────────────
async function fetchAllDLDNames() {
  const seen = new Set();
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Also sample a few numeric/special prefix names
  const prefixes = [...letters, "0", "1", "2", "3", "4", "5"];

  let total = 0;
  for (const prefix of prefixes) {
    try {
      const rows = await ddaQuery("dld_rent_contracts-open-api", {
        column: "project_name_en",
        filter: `project_name_en LIKE '${prefix}%'`,
        pageSize: 1000,
        page: 1,
        order_by: "project_name_en",
        order_dir: "asc",
      });
      for (const row of rows) {
        const name = row.project_name_en;
        if (name && !seen.has(name)) seen.add(name);
      }
      total += rows.length;
      process.stdout.write(`  ${prefix}: ${rows.length} rows, ${seen.size} unique names so far\r`);
      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 120));
    } catch (err) {
      console.warn(`\n  Skipped prefix '${prefix}': ${err.message}`);
    }
  }

  console.log(`\nFetched ${total} total records → ${seen.size} distinct project names`);
  return [...seen];
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log("Loading building list...");
  const buildingData = JSON.parse(
    fs.readFileSync(path.join(ROOT, "lib/data/building-ltr-rents.json"), "utf-8")
  );
  const ourKeys = Object.keys(buildingData.buildings); // normalized keys

  console.log(`Building list: ${ourKeys.length} buildings`);
  console.log("Sampling DLD project names (this takes ~30-40s)...");

  const dldNames = await fetchAllDLDNames();

  // Build lookup: normalized DLD name → original DLD names (may be many variants)
  const normToDLD = new Map();
  for (const dldName of dldNames) {
    const n = normalize(dldName);
    const c = canon(n);
    const key = c || n;
    if (!key) continue;
    const arr = normToDLD.get(key) ?? [];
    if (!arr.includes(dldName)) arr.push(dldName);
    normToDLD.set(key, arr);
  }

  console.log(`Built DLD name index with ${normToDLD.size} distinct normalized forms`);

  // Match each of our building keys to a DLD name
  const mapping = {};     // ourKey → best DLD name (for LIKE prefix)
  const unmatched = [];

  for (const ourKey of ourKeys) {
    const c = canon(ourKey);
    const key = c || ourKey;

    // 1. Exact canonical match
    if (normToDLD.has(key)) {
      const dldMatches = normToDLD.get(key);
      // Use the shortest match as the prefix (covers most variants)
      mapping[ourKey] = dldMatches.sort((a, b) => a.length - b.length)[0];
      continue;
    }

    // 2. Containment: DLD name starts with our key (e.g. "marina gate" → "MARINA GATE 1")
    let bestScore = 0;
    let bestDLD = null;
    for (const [normKey, dldArr] of normToDLD) {
      // DLD name contains our key as prefix
      if (normKey.startsWith(key + " ") || normKey === key) {
        const score = 0.9 + 0.1 * (key.length / normKey.length); // prefer tighter match
        if (score > bestScore) { bestScore = score; bestDLD = dldArr[0]; }
      }
      // Our key contains DLD key (DLD is shorter, more general)
      else if (key.startsWith(normKey + " ") && normKey.length >= 5) {
        const score = 0.7 * (normKey.length / key.length);
        if (score > bestScore) { bestScore = score; bestDLD = dldArr[0]; }
      }
    }
    if (bestDLD && bestScore >= 0.6) { mapping[ourKey] = bestDLD; continue; }

    // 3. Word-overlap fuzzy match (last resort)
    for (const [normKey, dldArr] of normToDLD) {
      const score = wordOverlap(key, normKey);
      if (score > bestScore) { bestScore = score; bestDLD = dldArr[0]; }
    }
    if (bestDLD && bestScore >= 0.75) { mapping[ourKey] = bestDLD; continue; }

    unmatched.push(ourKey);
  }

  const matchRate = (((ourKeys.length - unmatched.length) / ourKeys.length) * 100).toFixed(1);
  console.log(`\nMatched: ${ourKeys.length - unmatched.length}/${ourKeys.length} buildings (${matchRate}%)`);
  console.log(`Unmatched: ${unmatched.length} buildings`);
  if (unmatched.length <= 30) {
    console.log("Unmatched list:", unmatched.slice(0, 30).join(", "));
  }

  // Save the mapping
  const outPath = path.join(ROOT, "lib/data/dld-name-map.json");
  fs.writeFileSync(outPath, JSON.stringify({
    _meta: {
      generated: new Date().toISOString(),
      totalBuildings: ourKeys.length,
      matched: ourKeys.length - unmatched.length,
      unmatched: unmatched.length,
      dldDistinctNames: dldNames.length,
    },
    mapping,  // ourNormalizedKey → canonical DLD project_name_en prefix
  }, null, 2));

  console.log(`\nWritten: lib/data/dld-name-map.json`);
}

main().catch(err => { console.error(err); process.exit(1); });

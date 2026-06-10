#!/usr/bin/env node
/**
 * DLD RENT CONTRACTS — API FETCHER
 * ================================
 * Pulls the official Dubai Land Department "Rent Contracts" (Ejari) dataset
 * from the Dubai Pulse / data.dubai API and writes it to a local CSV
 * (data/raw/rent_contracts.csv) that scripts/ingest-dld-rents.mjs then
 * turns into building-level rent benchmarks.
 *
 * PREREQUISITES (Option A)
 *   1. Complete the dataset access request on data.dubai (Dubai Data Exchange Hub).
 *   2. You will be emailed an API Key and API Secret (often in two emails).
 *   3. Put them in .env.local (DO NOT COMMIT):
 *        DLD_API_KEY=xxxxxxxx
 *        DLD_API_SECRET=xxxxxxxx
 *      The access-grant email also tells you the exact API base + resource id.
 *      Set these if they differ from the defaults below:
 *        DLD_TOKEN_URL=https://api.dubaipulse.gov.ae/oauth/client_credential/accesstoken
 *        DLD_API_BASE=https://api.dubaipulse.gov.ae/data/dld-registration
 *        DLD_RESOURCE_PATH=dld_rent_contracts-open-api
 *
 * USAGE
 *   node --env-file=.env.local scripts/fetch-dld-rents.mjs
 *   # optional: limit rows for a quick test
 *   DLD_MAX_ROWS=5000 node --env-file=.env.local scripts/fetch-dld-rents.mjs
 *
 * Then:
 *   node scripts/ingest-dld-rents.mjs data/raw/rent_contracts.csv
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ── Config (override via env) ──────────────────────────────────────────────
const API_KEY = process.env.DLD_API_KEY;
const API_SECRET = process.env.DLD_API_SECRET;
const TOKEN_URL = process.env.DLD_TOKEN_URL || "https://api.dubaipulse.gov.ae/oauth/client_credential/accesstoken?grant_type=client_credentials";
const API_BASE = process.env.DLD_API_BASE || "https://api.dubaipulse.gov.ae/data/dld-registration";
const RESOURCE_PATH = process.env.DLD_RESOURCE_PATH || "dld_rent_contracts-open-api";
const PAGE_SIZE = Number(process.env.DLD_PAGE_SIZE || 10000);
const MAX_ROWS = Number(process.env.DLD_MAX_ROWS || Infinity);
const OUT = path.join(ROOT, "data", "raw", "rent_contracts.csv");

if (!API_KEY || !API_SECRET) {
  console.error("Missing DLD_API_KEY / DLD_API_SECRET.");
  console.error("Add them to .env.local and run with:  node --env-file=.env.local scripts/fetch-dld-rents.mjs");
  process.exit(1);
}

// ── OAuth token ────────────────────────────────────────────────────────────
async function getToken() {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `client_id=${encodeURIComponent(API_KEY)}&client_secret=${encodeURIComponent(API_SECRET)}`,
  });
  if (!res.ok) throw new Error(`Token request failed: ${res.status} ${await res.text()}`);
  const j = await res.json();
  const token = j.access_token || j.accessToken || j.token;
  if (!token) throw new Error(`No access_token in response: ${JSON.stringify(j)}`);
  return token;
}

// ── CSV helpers ────────────────────────────────────────────────────────────
function toCSVRow(values) {
  return values.map(v => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(",");
}

// ── Fetch loop (offset/limit pagination) ───────────────────────────────────
async function main() {
  console.log("Authenticating with Dubai Pulse / data.dubai …");
  const token = await getToken();
  const auth = { Authorization: `Bearer ${token}` };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  const stream = fs.createWriteStream(OUT);
  let headers = null;
  let total = 0;
  let offset = 0;

  while (total < MAX_ROWS) {
    const limit = Math.min(PAGE_SIZE, MAX_ROWS - total);
    const url = `${API_BASE}/${RESOURCE_PATH}?Limit=${limit}&Offset=${offset}`;
    const res = await fetch(url, { headers: auth });
    if (!res.ok) throw new Error(`Fetch failed (${res.status}) at offset ${offset}: ${await res.text()}`);
    const body = await res.json();

    // Portals vary: rows may be in body, body.result.records, body.records, body.data …
    const rows = Array.isArray(body) ? body
      : body.result?.records ?? body.records ?? body.data ?? body.value ?? [];
    if (!rows.length) break;

    if (!headers) {
      headers = Object.keys(rows[0]);
      stream.write(toCSVRow(headers) + "\n");
      console.log(`Columns: ${headers.join(", ")}`);
    }
    for (const r of rows) stream.write(toCSVRow(headers.map(h => r[h])) + "\n");

    total += rows.length;
    offset += rows.length;
    console.log(`  fetched ${total.toLocaleString()} rows …`);
    if (rows.length < limit) break; // last page
  }

  stream.end();
  console.log(`\n✓ Wrote ${total.toLocaleString()} rows to ${OUT}`);
  console.log(`Next: node scripts/ingest-dld-rents.mjs ${path.relative(ROOT, OUT)}`);
}

main().catch(e => { console.error("\nERROR:", e.message); process.exit(1); });

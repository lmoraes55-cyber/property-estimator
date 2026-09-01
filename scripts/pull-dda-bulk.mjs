#!/usr/bin/env node
/**
 * DLD RENT CONTRACTS — BULK PULL VIA THE CREDENTIALED DDA API
 * ==========================================================
 * Pages dld_rent_contracts-open-api to NDJSON for scripts/ingest-dld-rents.mjs.
 *
 * WHY THE CREDENTIALED API AND NOT THE PUBLIC PORTAL
 *   The unauthenticated data.dubai portal endpoint
 *   (/o/dda/data-services/dataset-metadata) cannot serve a complete extract and
 *   was removed after being tried: a full run returned 714,000 rows of which
 *   only 523,736 were distinct, it re-serves earlier pages from around page 19,
 *   and what it does return skews to 2010-2013. This API reaches the whole
 *   ~10M-row corpus (verified: page 9,000 returns data, page 12,000 is empty)
 *   and is current to today.
 *
 *   NOTE: access is restricted to within the UAE, so this cannot run on CI
 *   runners outside the country. Run it locally, or from a Vercel function
 *   pinned to dxb1.
 *
 * STABLE PAGINATION
 *   Offset paging without a sort is NOT reproducible here — the same page
 *   fetched twice returned different rows (74 vs 85 distinct project names on
 *   page 700). Every request therefore sends order_by/order_dir. Unlike the
 *   portal, this API honours them. The puller still de-dups on
 *   contract_id|line_number as it goes and reports the duplicate rate, so if
 *   ordering turns out not to be honoured you find out in the first minute
 *   rather than after a multi-hour run.
 *
 * CREDENTIALS
 *   Needs DDA_BASE_URL, DDA_APP_IDENTIFIER, DDA_CLIENT_ID, DDA_CLIENT_SECRET.
 *   These are marked Secret in Vercel and cannot be pulled back out
 *   (`vercel env pull` writes "[SENSITIVE]"), so supply them locally:
 *
 *     node --env-file=.env.dda scripts/pull-dda-bulk.mjs
 *
 * SERVER-SIDE FILTERING — use it, the whole corpus is not worth pulling
 *   The API caps every response at 1,000 rows no matter what pageSize asks for
 *   (2000/5000/10000 all return 1000; 20000 is a 422), so a full ~10M-row pull
 *   is ~10,000 requests, about 17 hours. But it DOES filter server-side,
 *   including date comparisons, and the ingest only keeps a 24-month window
 *   anyway. `--since` cuts the job by roughly 10x.
 *
 *   Verified working: `col >= 'value'`, `col LIKE 'pattern%'`, `col='value'`.
 *   Avoid exact equality on a date — `contract_start_date='2026-08-01'`
 *   returned HTTP 408 (gateway timeout) while `>=` on the same column is fine.
 *
 * USAGE
 *   node --env-file=.env.dda scripts/pull-dda-bulk.mjs --since 2024-09-01 --residential
 *   node --env-file=.env.dda scripts/pull-dda-bulk.mjs --max-pages 5    # smoke test
 *   node --env-file=.env.dda scripts/pull-dda-bulk.mjs --check          # stability check only
 *   node --env-file=.env.dda scripts/pull-dda-bulk.mjs --restart
 *   node --env-file=.env.dda scripts/pull-dda-bulk.mjs --since-months 24 --residential \\
 *     --after CRT2132084406        # keyset resume — use when deep offsets start timing out
 *   node --env-file=.env.dda scripts/pull-dda-bulk.mjs --filter "area_name_en='Marsa Dubai'"
 *
 * Then:
 *   node scripts/ingest-dld-rents.mjs data/raw/dda_rent_contracts.ndjson
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const ENTITY = process.env.DDA_ENTITY || "dld";
const DATASET = process.env.DDA_DATASET || "dld_rent_contracts-open-api";
const PAGE_SIZE = Number(process.env.PAGE_SIZE || 1000);
const ORDER_BY = process.env.ORDER_BY || "contract_id";
const ORDER_DIR = process.env.ORDER_DIR || "asc";
const TIMEOUT_MS = Number(process.env.TIMEOUT_MS || 120_000);
const MAX_RETRIES = Number(process.env.MAX_RETRIES || 5);

const argv = process.argv.slice(2);
const argVal = (f, d) => { const i = argv.indexOf(f); return i !== -1 && argv[i + 1] ? Number(argv[i + 1]) : d; };
const MAX_PAGES = argVal("--max-pages", Infinity);
const RESTART = argv.includes("--restart");
// Keyset resume. Offset paging degrades badly with depth here: throughput fell
// from ~19 pages/min at the start to 3/min around page 1,490, then page 1,499
// timed out five times and the run died. Restarting at page 1 with
// `contract_id > <last seen>` keeps every offset shallow, so the query stays
// fast no matter how far through the dataset we are. Safe because results come
// back ordered by contract_id ascending, so everything at or below that id has
// already been written.
const AFTER = (() => { const i = argv.indexOf("--after"); return i !== -1 ? argv[i + 1] : null; })();
const CHECK_ONLY = argv.includes("--check");

// Server-side filters, ANDed by the API (repeated `filter` query params).
const FILTERS = [];
{
  const strVal = f => { const i = argv.indexOf(f); return i !== -1 && argv[i + 1] ? argv[i + 1] : null; };
  // Relative window, so a saved command does not rot the way a hardcoded date
  // does. --since still wins if both are given.
  const sinceMonths = Number(strVal("--since-months") ?? NaN);
  const after = strVal("--after");
  if (after) FILTERS.push(`contract_id > '${after}'`);
  const since = strVal("--since");
  if (since) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(since)) { console.error(`--since must be YYYY-MM-DD, got "${since}"`); process.exit(1); }
    FILTERS.push(`contract_start_date >= '${since}'`);
  } else if (Number.isFinite(sinceMonths) && sinceMonths > 0) {
    const c = new Date();
    c.setMonth(c.getMonth() - sinceMonths);
    FILTERS.push(`contract_start_date >= '${c.toISOString().slice(0, 10)}'`);
  }
  if (argv.includes("--residential")) FILTERS.push("property_usage_en LIKE 'Residential%'");
  for (let i = 0; i < argv.length; i++) if (argv[i] === "--filter" && argv[i + 1]) FILTERS.push(argv[i + 1]);
}

const OUT = path.join(ROOT, "data", "raw", "dda_rent_contracts.ndjson");
const CKPT = path.join(ROOT, "data", "raw", "dda_rent_contracts.progress.json");
const SEEN = path.join(ROOT, "data", "raw", "dda_rent_contracts.seen.txt");

const sleep = ms => new Promise(r => setTimeout(r, ms));

/** Config problems are fatal, not transient — never retried. */
class ConfigError extends Error {}

// ── Auth (mirrors lib/dda-client.ts getToken) ────────────────────────────
let cachedToken = null;
let tokenExpiresAt = 0;

async function getToken() {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

  const base   = (process.env.DDA_BASE_URL       ?? "").trim();
  const appId  = (process.env.DDA_APP_IDENTIFIER ?? "").trim();
  const cid    = (process.env.DDA_CLIENT_ID      ?? "").trim();
  const secret = (process.env.DDA_CLIENT_SECRET  ?? "").trim();

  const missing = [["DDA_BASE_URL", base], ["DDA_APP_IDENTIFIER", appId],
                   ["DDA_CLIENT_ID", cid], ["DDA_CLIENT_SECRET", secret]]
    .filter(([, v]) => !v || /^\[.*\]$/.test(v)).map(([k]) => k);
  if (missing.length) {
    throw new ConfigError(
      `Missing or placeholder credentials: ${missing.join(", ")}.\n` +
      `  These are Secret in Vercel and cannot be pulled back out. Put the real\n` +
      `  values in a local file and run:  node --env-file=.env.dda scripts/pull-dda-bulk.mjs`
    );
  }

  const res = await fetch(`${base}/secure/ssis/dubaiai/gatewaytoken/1.0.0/getAccessToken`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "x-DDA-SecurityApplicationIdentifier": appId,
    },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: cid, client_secret: secret }).toString(),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`DDA token fetch failed: ${res.status}`);
  const data = await res.json();
  if (!data.access_token) throw new Error("DDA token response missing access_token");

  cachedToken = data.access_token;
  // Refresh 5 min early. A full pull runs for hours, well past one token's life.
  tokenExpiresAt = Date.now() + ((data.expires_in ?? 3600) - 300) * 1000;
  return cachedToken;
}

async function fetchPage(page) {
  const base = (process.env.DDA_BASE_URL ?? "").trim();
  let lastErr;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const token = await getToken();
      const url = new URL(`${base}/open/${ENTITY}/${DATASET}`);
      url.searchParams.set("page", String(page));
      url.searchParams.set("pageSize", String(PAGE_SIZE));
      // Without a deterministic sort, offset paging is not reproducible here.
      url.searchParams.set("order_by", ORDER_BY);
      url.searchParams.set("order_dir", ORDER_DIR);
      // MUST be one `filter` param joined with AND. Repeating the param does
      // NOT AND the conditions — the API silently applies only the LAST one and
      // drops the rest, with a 200 and plausible-looking rows. Measured: date
      // THEN usage returned 0 rows matching the date; usage THEN date returned
      // 0 matching the usage. `a AND b` in one param applies both.
      if (FILTERS.length) url.searchParams.set("filter", FILTERS.join(" AND "));

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (res.status === 401 || res.status === 403) { cachedToken = null; throw new Error(`auth ${res.status}`); }
      if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text().catch(() => "")).slice(0, 120)}`);
      const json = await res.json();
      const rows = json.results ?? json.data ?? json.records ?? [];
      if (!Array.isArray(rows)) throw new Error("response payload is not an array");
      return rows;
    } catch (err) {
      // A missing or placeholder credential will never succeed on retry —
      // surface it immediately instead of backing off five times.
      if (err instanceof ConfigError) throw err;
      lastErr = err;
      const wait = Math.min(30_000, 1000 * 2 ** (attempt - 1));
      console.warn(`  page ${page} attempt ${attempt}/${MAX_RETRIES}: ${err.message} — retrying in ${wait / 1000}s`);
      if (attempt < MAX_RETRIES) await sleep(wait);
    }
  }
  throw new Error(`page ${page} failed after ${MAX_RETRIES} attempts: ${lastErr.message}`);
}

const rowKey = r => `${r.contract_id ?? ""}|${r.line_number ?? ""}`;

// ── Stability check ──────────────────────────────────────────────────────
// Fetch the same page twice and an adjacent page. With order_by honoured the
// repeat must be identical and the neighbour must not overlap.
async function stabilityCheck() {
  const P = 700;
  console.log(`Stability check with order_by=${ORDER_BY} ${ORDER_DIR}, pageSize=${PAGE_SIZE}`);
  if (FILTERS.length) console.log(`Filter: ${FILTERS.join(" AND ")}`);
  console.log();
  const a = await fetchPage(P);
  const b = await fetchPage(P);
  const c = await fetchPage(P + 1);

  const ka = a.map(rowKey), kb = b.map(rowKey), kc = new Set(c.map(rowKey));

  // Compare as SETS, not sequences. Rows sharing a contract_id tie-break
  // nondeterministically among themselves, so the order within a page can
  // shuffle while the page's membership is perfectly stable — and membership
  // is all a complete extract needs.
  const setA = new Set(ka), setB = new Set(kb);
  let shared = 0;
  for (const k of setA) if (setB.has(k)) shared++;
  const sameSet = setA.size === setB.size && shared === setA.size;
  const overlap = ka.filter(k => kc.has(k)).length;

  console.log(`  page ${P} fetch 1 : ${a.length} rows`);
  console.log(`  page ${P} fetch 2 : ${b.length} rows`);
  console.log(`  same membership  : ${sameSet ? "YES — pagination is stable" : `NO — ${setA.size - shared} rows differ; ordering is NOT honoured`}`);
  console.log(`  overlap with ${P + 1}: ${overlap} rows ${overlap ? "— pages are not disjoint" : "— disjoint, good"}`);
  if (a[0]) console.log(`  first key        : ${rowKey(a[0])}`);
  return sameSet && overlap === 0;
}

async function main() {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });

  if (CHECK_ONLY) {
    const ok = await stabilityCheck();
    console.log(`\n${ok ? "✓ Safe to run the full pull." : "✗ Do NOT run the full pull — it would produce duplicates and gaps."}`);
    process.exit(ok ? 0 : 1);
  }

  let page = 1, rowsWritten = 0, dupRows = 0;
  const seen = new Set();

  if (AFTER) {
    // Keep everything already downloaded; restart paging from 1 behind the
    // contract_id cursor rather than resuming a deep offset.
    if (fs.existsSync(CKPT)) {
      const ck = JSON.parse(fs.readFileSync(CKPT, "utf8"));
      rowsWritten = ck.rowsWritten; dupRows = ck.dupRows ?? 0;
    }
    if (fs.existsSync(SEEN)) for (const k of fs.readFileSync(SEEN, "utf8").split("\n")) if (k) seen.add(k);
    page = 1;
    console.log(`Keyset resume after contract_id ${AFTER} — page 1 (${rowsWritten.toLocaleString()} rows kept, ${seen.size.toLocaleString()} keys)`);
  } else if (!RESTART && fs.existsSync(CKPT)) {
    const ck = JSON.parse(fs.readFileSync(CKPT, "utf8"));
    page = ck.nextPage; rowsWritten = ck.rowsWritten; dupRows = ck.dupRows ?? 0;
    if (fs.existsSync(SEEN)) for (const k of fs.readFileSync(SEEN, "utf8").split("\n")) if (k) seen.add(k);
    console.log(`Resuming at page ${page} (${rowsWritten.toLocaleString()} rows, ${seen.size.toLocaleString()} keys)`);
  } else {
    for (const f of [OUT, CKPT, SEEN]) if (fs.existsSync(f)) fs.unlinkSync(f);
    console.log(`Starting fresh. dataset=${DATASET} pageSize=${PAGE_SIZE} order_by=${ORDER_BY} ${ORDER_DIR}`);
    console.log(FILTERS.length ? `Filter: ${FILTERS.join(" AND ")}` : "Filter: none — pulling the ENTIRE corpus (~10,000 pages, ~17h). Consider --since.");
  }

  const out = fs.createWriteStream(OUT, { flags: "a" });
  const seenOut = fs.createWriteStream(SEEN, { flags: "a" });
  const t0 = Date.now();
  let pulled = 0;

  while (pulled < MAX_PAGES) {
    const rows = await fetchPage(page);
    if (!rows.length) { console.log(`\nPage ${page} returned 0 rows — end of dataset.`); break; }

    const fresh = [];
    for (const r of rows) {
      const k = rowKey(r);
      if (seen.has(k)) { dupRows++; continue; }
      seen.add(k); fresh.push(r);
    }

    if (fresh.length) {
      const chunk = fresh.map(r => JSON.stringify(r)).join("\n") + "\n";
      if (!out.write(chunk)) await new Promise(r => out.once("drain", r));
      seenOut.write(fresh.map(rowKey).join("\n") + "\n");
      rowsWritten += fresh.length;
    }

    pulled++; page++;
    fs.writeFileSync(CKPT, JSON.stringify({ nextPage: page, rowsWritten, dupRows }, null, 2));

    const mins = (Date.now() - t0) / 60000;
    const dupPct = ((dupRows / Math.max(rowsWritten + dupRows, 1)) * 100).toFixed(1);
    if (pulled % 10 === 0 || pulled <= 3) {
      console.log(
        `page ${String(page - 1).padStart(6)} | +${String(fresh.length).padStart(5)} new | ` +
        `total ${rowsWritten.toLocaleString().padStart(12)} | dup ${dupPct}% | ` +
        `${(pulled / Math.max(mins, 1e-4)).toFixed(1)} pages/min`
      );
    }

    // Bail early rather than burn hours producing a corrupt file.
    if (pulled === 20 && dupRows / Math.max(rowsWritten + dupRows, 1) > 0.05) {
      console.error(`\n✗ ABORTING — ${dupPct}% duplicates after 20 pages. Ordering is not being`);
      console.error(`  honoured, so offset paging cannot produce a complete extract.`);
      process.exit(1);
    }
    if (rows.length < PAGE_SIZE) { console.log(`\nShort page (${rows.length} < ${PAGE_SIZE}) — end of dataset.`); break; }
  }

  await new Promise(r => out.end(r));
  await new Promise(r => seenOut.end(r));
  const mins = ((Date.now() - t0) / 60000).toFixed(1);
  console.log(`\n✓ ${rowsWritten.toLocaleString()} distinct rows in ${mins} min (${dupRows.toLocaleString()} duplicates skipped)`);
  console.log(`  ${OUT}`);
  console.log(`  Next: node scripts/ingest-dld-rents.mjs ${path.relative(ROOT, OUT)}`);
}

main().catch(e => { console.error(`\n✗ ${e.message}`); process.exit(1); });

#!/usr/bin/env node
/**
 * DLD RENT CONTRACTS — data.dubai PULLER
 * =====================================
 * Streams the official DLD "Rent Contracts" (Ejari) dataset to NDJSON, which
 * scripts/ingest-dld-rents.mjs then turns into building-level benchmarks.
 *
 * WHY THIS EXISTS
 *   The documented Dubai Pulse source in scripts/README-dld-rents.md is dead:
 *   dubaipulse.gov.ae/data/dld-registration/dld_rent_contracts-open now 200s
 *   with HTML and redirects to data.dubai. This endpoint is the live
 *   replacement and needs no credentials — verified with a plain unauthenticated
 *   fetch, no CSRF token, no session.
 *
 * USAGE
 *   node scripts/pull-datadubai.mjs                 # full pull (resumes if interrupted)
 *   node scripts/pull-datadubai.mjs --max-pages 3   # smoke test
 *   node scripts/pull-datadubai.mjs --restart       # ignore checkpoint, start over
 *   node scripts/pull-datadubai.mjs --stdout | node scripts/ingest-dld-rents.mjs -
 *                                                   # stream straight into the ingest,
 *                                                   # never materialising ~13.5 GB on disk
 *                                                   # (this is what CI uses — a runner
 *                                                   # has ~14 GB of free space total)
 *
 * Then:
 *   node scripts/ingest-dld-rents.mjs data/raw/rent_contracts.ndjson
 *
 * CAVEAT — the endpoint is an undocumented portal internal, not a published
 * product API. It exposes no total-record count and makes no ordering
 * guarantee across pages, so a page boundary could in principle repeat or skip
 * rows. Repeats are harmless: the ingest de-dups on contract_id|line_number.
 * Skips would show up as a coverage drop, which is what --check guards against.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// ── Config ───────────────────────────────────────────────────────────────
const BASE = process.env.DDA_DATASET_BASE || "https://data.dubai/o/dda/data-services/dataset-metadata";
const DATASET_ID = process.env.DDA_DATASET_ID || "468586"; // dld_rent_contracts
const PAGE_SIZE = Number(process.env.PAGE_SIZE || 7000);   // server caps at 7000
const START_PAGE = Number(process.env.START_PAGE || 2);    // page 1 returns a cached sample
const TIMEOUT_MS = Number(process.env.TIMEOUT_MS || 120_000);
const MAX_RETRIES = Number(process.env.MAX_RETRIES || 5);

const argv = process.argv.slice(2);
const argVal = (flag, dflt) => {
  const i = argv.indexOf(flag);
  return i !== -1 && argv[i + 1] ? Number(argv[i + 1]) : dflt;
};
const MAX_PAGES = argVal("--max-pages", Infinity);
const RESTART = argv.includes("--restart");
// Streaming mode: NDJSON to stdout, progress to stderr. No checkpoint, because
// a pipe cannot be resumed — an interrupted stream has to start over.
const STDOUT = argv.includes("--stdout");
const log = (...a) => (STDOUT ? console.error(...a) : console.log(...a));

const OUT = path.join(ROOT, "data", "raw", "rent_contracts.ndjson");
const CKPT = path.join(ROOT, "data", "raw", "rent_contracts.progress.json");

const sleep = ms => new Promise(r => setTimeout(r, ms));

// When the downstream consumer exits first, stdout raises EPIPE. That is a
// normal end to a streamed run, not a failure — exit quietly instead of
// dumping a stack trace over the consumer's own error.
process.stdout.on("error", err => {
  if (err.code === "EPIPE") process.exit(0);
  throw err;
});

async function fetchPage(page) {
  const url = `${BASE}?datasetId=${DATASET_ID}&page=${page}&pageSize=${PAGE_SIZE}`;
  let lastErr;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const rows = json.data ?? json.results ?? json.records ?? [];
      if (!Array.isArray(rows)) throw new Error("response.data is not an array");
      return rows;
    } catch (err) {
      lastErr = err;
      // Transient by assumption: back off and retry rather than losing the run.
      const wait = Math.min(30_000, 1000 * 2 ** (attempt - 1));
      console.warn(`  page ${page} attempt ${attempt}/${MAX_RETRIES} failed (${err.message}) — retrying in ${wait / 1000}s`);
      if (attempt < MAX_RETRIES) await sleep(wait);
    }
  }
  throw new Error(`page ${page} failed after ${MAX_RETRIES} attempts: ${lastErr.message}`);
}

async function main() {
  if (!STDOUT) fs.mkdirSync(path.dirname(OUT), { recursive: true });

  let startPage = START_PAGE;
  let rowsWritten = 0;
  if (STDOUT) {
    log(`Streaming to stdout from page ${startPage}, pageSize ${PAGE_SIZE}`);
  } else if (!RESTART && fs.existsSync(CKPT)) {
    const ck = JSON.parse(fs.readFileSync(CKPT, "utf8"));
    startPage = ck.nextPage;
    rowsWritten = ck.rowsWritten;
    console.log(`Resuming from page ${startPage} (${rowsWritten.toLocaleString()} rows already written)`);
  } else {
    // Clear BOTH the data file and the checkpoint. Truncating the data alone
    // leaves a checkpoint that would resume mid-dataset against an empty file,
    // silently skipping every page before it and overstating rowsWritten.
    if (fs.existsSync(OUT)) fs.unlinkSync(OUT);
    if (fs.existsSync(CKPT)) fs.unlinkSync(CKPT);
    console.log(`Starting fresh at page ${startPage}, pageSize ${PAGE_SIZE}`);
  }

  const out = STDOUT ? process.stdout : fs.createWriteStream(OUT, { flags: "a" });
  const t0 = Date.now();
  let page = startPage;
  let pagesPulled = 0;

  while (pagesPulled < MAX_PAGES) {
    const rows = await fetchPage(page);
    if (!rows.length) {
      log(`\nPage ${page} returned 0 rows — end of dataset.`);
      break;
    }

    // Backpressure: respect the stream's buffer instead of letting an 8GB
    // pull balloon in memory when the disk can't keep up.
    const chunk = rows.map(r => JSON.stringify(r)).join("\n") + "\n";
    if (!out.write(chunk)) await new Promise(r => out.once("drain", r));

    rowsWritten += rows.length;
    pagesPulled++;
    if (!STDOUT) fs.writeFileSync(CKPT, JSON.stringify({ nextPage: page + 1, rowsWritten }, null, 2));

    const mins = (Date.now() - t0) / 60000;
    const rate = pagesPulled / Math.max(mins, 0.0001);
    log(
      `page ${String(page).padStart(5)} | +${String(rows.length).padStart(5)} rows | ` +
      `total ${rowsWritten.toLocaleString().padStart(12)} | ${rate.toFixed(1)} pages/min`
    );

    if (rows.length < PAGE_SIZE) {
      log(`\nShort page (${rows.length} < ${PAGE_SIZE}) — end of dataset.`);
      break;
    }
    page++;
  }

  // Never end() process.stdout — closing it would kill the downstream pipe
  // before the ingest has drained what is already buffered.
  if (!STDOUT) await new Promise(r => out.end(r));
  const mins = ((Date.now() - t0) / 60000).toFixed(1);
  log(`\n✓ ${rowsWritten.toLocaleString()} rows in ${mins} min` + (STDOUT ? " (streamed)" : ` -> ${OUT}`));
  if (!STDOUT) log(`  Next: node scripts/ingest-dld-rents.mjs ${path.relative(ROOT, OUT)}`);
}

main().catch(e => { console.error("\n✗", e.message); process.exit(1); });

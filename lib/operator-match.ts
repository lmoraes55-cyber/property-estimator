// Preference-based operator matching. Ranks the real, sourced companies in
// COMPETITOR_RESEARCH (lib/dubai-str-competitor-research.ts) against what the owner
// says matters to them, instead of a single fixed "best operator" list.
//
// communicationScore/flexibilityScore below are AssetIntel's OWN derived interpretation
// of the researcher's free-text notes (keyword-scored), not a figure any operator
// published or quoted — kept separate from the sourced fields for that reason.
// Deluxe is deliberately absent from COMPETITOR_RESEARCH (see DELUXE_OWN_FEE_NOTE) so
// it can never surface here as an "unbiased" match.

import { COMPETITOR_RESEARCH, CompetitorResearch } from "./dubai-str-competitor-research";
import { DUBAI_OPERATORS, DubaiOperator } from "./dubai-operators";

export type Priority = "low_fee" | "communication" | "portfolio" | "flexible_terms" | "luxury";

export const PRIORITY_OPTIONS: { value: Priority; label: string; description: string }[] = [
  { value: "low_fee", label: "Lowest management fee", description: "Prioritise operators quoting the lowest commission %" },
  { value: "communication", label: "Professional, responsive communication", description: "Prioritise operators our researchers found responsive and detail-oriented" },
  { value: "portfolio", label: "Large, established portfolio", description: "Prioritise operators managing the most units, with the strongest track record" },
  { value: "flexible_terms", label: "Flexible contract terms", description: "Prioritise short/no lock-in and low early-termination fees" },
  { value: "luxury", label: "Luxury / high-end specialist", description: "Prioritise operators positioned for premium properties" },
];

function feeMidpoint(op: CompetitorResearch): number | null {
  const f = op.managementFeePct;
  if (f == null) return null;
  return Array.isArray(f) ? (f[0] + f[1]) / 2 : f;
}

function scoreKeywords(text: string | null, positive: string[], negative: string[]): number {
  if (!text) return 0;
  const t = text.toLowerCase();
  let s = 0;
  for (const w of positive) if (t.includes(w)) s += 1;
  for (const w of negative) if (t.includes(w)) s -= 1;
  return s;
}

// -3..+3ish, derived from responseTime + serviceQuality + strengths/weaknesses text.
function communicationScore(op: CompetitorResearch): number {
  const positive = ["professional", "quick", "fast", "responsive", "detail", "transparent", "immediate", "right away", "straight to the point"];
  const negative = ["not professional", "no follow-up", "never called back", "delayed", "incomplete", "slow", "confusing", "not knowledgeable", "not forthcoming", "uncertain"];
  return (
    scoreKeywords(op.serviceQuality, positive, negative) +
    scoreKeywords(op.responseTime, positive, negative) +
    scoreKeywords(op.weaknesses, [], negative) +
    scoreKeywords(op.strengths, positive, [])
  );
}

// Higher = more flexible (short lock-in, low early-termination fee). Unknown terms
// score 0 (neutral) — absence of data is not evidence of flexibility, so it must
// never outrank or tie with an operator whose real terms are actually favorable.
function flexibilityScore(op: CompetitorResearch): number {
  let s = 0;
  const lock = (op.lockInPeriod ?? "").toLowerCase();
  const fee = (op.earlyTerminationFee ?? "").toLowerCase();
  if (lock.includes("3 month")) s += 1;
  else if (lock.includes("9 month")) s -= 2;
  else if (lock.includes("6 month") || lock.includes("1 year") || lock.includes("12 month")) s -= 1;
  if (op.earlyTerminationFee) {
    const match = fee.match(/(\d[\d,]*)/);
    const amount = match ? Number(match[1].replace(/,/g, "")) : null;
    if (amount != null) {
      if (amount <= 1500) s += 1;
      else if (amount >= 3000) s -= 1;
    }
  }
  return s;
}

function portfolioNumber(op: CompetitorResearch, quant: DubaiOperator | null): number {
  if (quant) return quant.listings;
  const match = (op.portfolioSize ?? "").match(/(\d[\d,]*)/);
  return match ? Number(match[1].replace(/,/g, "")) : 0;
}

function crossRefQuant(name: string): DubaiOperator | null {
  const norm = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return DUBAI_OPERATORS.find(d => {
    const dn = d.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    return dn === norm || dn.includes(norm) || norm.includes(dn);
  }) ?? null;
}

export interface MatchedOperator extends CompetitorResearch {
  quant: DubaiOperator | null;
  score: number;
  matchReasons: string[];
  // Best-available portfolio figure for display. Airbtics listing counts are measured
  // per-operator and more reliable than a phone quote — prefer them whenever the
  // operator cross-references, even though the quoted portfolioSize string stays in
  // the record above for provenance (e.g. Frank Porter: research call quoted "650",
  // Airbtics counts 88 actual listings — the two are not the same measure, and the
  // gap itself is worth surfacing rather than picking whichever number is bigger).
  displayPortfolio: string;
}

export function rankOperators(priorities: Priority[]): MatchedOperator[] {
  const matched: MatchedOperator[] = COMPETITOR_RESEARCH.map(op => {
    const quant = crossRefQuant(op.name);
    const commScore = communicationScore(op);
    const flexScore = flexibilityScore(op);
    const fee = feeMidpoint(op);
    const portfolio = portfolioNumber(op, quant);

    let score = 0;
    const reasons: string[] = [];

    if (priorities.includes("low_fee")) {
      if (fee != null) {
        score += Math.max(0, 25 - fee) * 2; // lower fee -> higher score
        if (fee <= 16) reasons.push(`Quoted management fee around ${fee}% — among the lowest researched`);
      }
    }
    if (priorities.includes("communication")) {
      score += commScore * 10;
      if (commScore >= 2) reasons.push("Researcher rated their communication professional and responsive");
    }
    if (priorities.includes("portfolio")) {
      score += Math.min(portfolio, 800) / 10;
      if (portfolio >= 200) reasons.push(`${portfolio.toLocaleString()}+ ${quant ? "listings tracked (Airbtics)" : "units under management (operator quoted)"}`);
    }
    if (priorities.includes("flexible_terms")) {
      score += flexScore * 10;
      if (flexScore >= 1) reasons.push("Shorter lock-in / lower early-termination fee than most operators researched");
    }
    if (priorities.includes("luxury")) {
      if (op.tier === "high") { score += 20; reasons.push("Positioned as a luxury/high-end specialist"); }
    }

    // No priorities selected: general composite so the list isn't empty/arbitrary.
    if (priorities.length === 0) {
      score = (fee != null ? Math.max(0, 25 - fee) : 0) + commScore * 3 + Math.min(portfolio, 800) / 40 + flexScore * 2;
    }

    // Some portfolioSize entries are a short quote ("650"), others are a full paragraph
    // (e.g. First Class's account-split explanation, GuestReady's two-figure caveat) —
    // truncate for the compact card either way; the full text is still in the record.
    const MAX_QUOTE_LEN = 40;
    const truncated = op.portfolioSize && op.portfolioSize.length > MAX_QUOTE_LEN
      ? `${op.portfolioSize.slice(0, MAX_QUOTE_LEN).trimEnd()}…`
      : op.portfolioSize;
    const displayPortfolio = quant
      ? `${quant.listings.toLocaleString()} listings (Airbtics)${truncated ? ` — operator quoted "${truncated}"` : ""}`
      : (truncated ?? "Not disclosed");

    return { ...op, quant, score, matchReasons: reasons, displayPortfolio };
  });

  return matched.sort((a, b) => b.score - a.score);
}

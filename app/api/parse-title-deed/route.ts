/**
 * POST /api/parse-title-deed
 *
 * Accepts a title deed image (JPEG/PNG/WEBP) or PDF as multipart form data.
 * Uses Claude's vision to extract structured property details.
 *
 * Returns TitleDeedExtract — no owner name is extracted or stored.
 */

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";

export interface TitleDeedExtract {
  titleDeedNumber: string | null;
  projectName: string | null;      // Exact name as on deed — the DLD canonical name
  unitNumber: string | null;
  floor: string | null;
  areaSqft: number | null;
  bedrooms: string | null;         // Studio | 1BR | 2BR | 3BR | 4BR | 5BR
  areaName: string | null;         // DLD administrative area
  propertyType: string | null;     // Apartment | Villa | Townhouse | Office | Shop
  isFreehold: boolean | null;
  transactionValue: number | null; // Purchase price in AED from the deed
  confidence: "high" | "medium" | "low";
}

const EXTRACTION_PROMPT = `You are analyzing a Dubai Land Department (DLD) title deed.
Extract property details and return ONLY a valid JSON object — no explanation, no markdown.

{
  "titleDeedNumber": "deed reference number",
  "projectName": "EXACT building/development name as printed — often labeled Building Name, Complex Name, Development, or Project. Copy it exactly as shown.",
  "unitNumber": "apartment or villa unit number",
  "floor": "floor number if shown",
  "areaSqft": numeric sq.ft value (if only sq.m. shown, multiply by 10.764),
  "bedrooms": "one of: Studio, 1BR, 2BR, 3BR, 4BR, 5BR — extract from any explicit bedroom label. If not stated, infer from Suite Area or total area in sq.ft: under 550=Studio, 550-900=1BR, 900-1400=2BR, 1400-2000=3BR, 2000-3000=4BR, above 3000=5BR+",
  "areaName": "DLD area/district as printed (e.g. DOWNTOWN DUBAI, DUBAI MARINA, BUSINESS BAY)",
  "propertyType": "Apartment, Villa, Townhouse, Office, Shop, etc.",
  "isFreehold": true or false based on deed type,
  "transactionValue": numeric AED amount from the purchase/sale price on the deed (look for 'amount', 'purchased for', or the Arabic equivalent — return as a plain integer, no commas),
  "confidence": "high if you can read most fields clearly, medium if some are unclear, low if the document is hard to read"
}

Critical: projectName must be copied EXACTLY as printed — do not abbreviate, translate, or paraphrase. Return null for any field you cannot find.`;

function normaliseBedrooms(raw: string | null): string | null {
  if (!raw) return null;
  const r = String(raw).toLowerCase().trim();
  if (r.includes("studio")) return "Studio";
  const m = r.match(/(\d+)\s*(?:b\/r|bedroom|bed|br)/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return n >= 1 && n <= 10 ? `${n}BR` : null;
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid multipart form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large — please use an image under 8 MB" }, { status: 413 });
  }

  const supportedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
  const mimeType = file.type || "image/jpeg";
  if (!supportedTypes.includes(mimeType)) {
    return NextResponse.json({ error: "Unsupported file type — upload JPEG, PNG, WEBP, or PDF" }, { status: 415 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");

  const client = new Anthropic({ apiKey });

  type ImageMediaType = "image/jpeg" | "image/png" | "image/webp" | "image/gif";

  const contentBlock =
    mimeType === "application/pdf"
      ? ({
          type: "document" as const,
          source: { type: "base64" as const, media_type: "application/pdf" as const, data: base64 },
        })
      : ({
          type: "image" as const,
          source: { type: "base64" as const, media_type: mimeType as ImageMediaType, data: base64 },
        });

  let rawText = "";
  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: [contentBlock, { type: "text", text: EXTRACTION_PROMPT }],
        },
      ],
    });
    rawText = message.content[0].type === "text" ? message.content[0].text : "";
  } catch (err) {
    console.error("[parse-title-deed] Claude error:", (err as Error).message);
    return NextResponse.json({ error: "Failed to analyse document" }, { status: 502 });
  }

  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json({ error: "Could not extract data from this document" }, { status: 422 });
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    return NextResponse.json({ error: "Malformed extraction response" }, { status: 422 });
  }

  const areaSqft = typeof parsed.areaSqft === "number" ? Math.round(parsed.areaSqft) : null;

  // Infer bedrooms from sqft if AI couldn't extract them explicitly
  let bedrooms = normaliseBedrooms((parsed.bedrooms as string) ?? null);
  if (!bedrooms && areaSqft) {
    if (areaSqft < 550)        bedrooms = "Studio";
    else if (areaSqft < 900)   bedrooms = "1BR";
    else if (areaSqft < 1400)  bedrooms = "2BR";
    else if (areaSqft < 2000)  bedrooms = "3BR";
    else if (areaSqft < 3000)  bedrooms = "4BR";
    else                       bedrooms = "5BR";
  }

  const result: TitleDeedExtract = {
    titleDeedNumber: (parsed.titleDeedNumber as string) ?? null,
    projectName:     (parsed.projectName as string) ?? null,
    unitNumber:      (parsed.unitNumber as string) ?? null,
    floor:           (parsed.floor as string) ?? null,
    areaSqft,
    bedrooms,
    areaName:        (parsed.areaName as string) ?? null,
    propertyType:    (parsed.propertyType as string) ?? null,
    isFreehold:      typeof parsed.isFreehold === "boolean" ? parsed.isFreehold : null,
    transactionValue: typeof parsed.transactionValue === "number" ? Math.round(parsed.transactionValue) : null,
    confidence:      (["high", "medium", "low"].includes(parsed.confidence as string)
                       ? (parsed.confidence as "high" | "medium" | "low")
                       : "medium"),
  };

  return NextResponse.json(result);
}

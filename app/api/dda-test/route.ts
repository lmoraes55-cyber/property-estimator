import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function getToken(base: string, appId: string, cid: string, secret: string): Promise<string> {
  const res = await fetch(
    `${base}/secure/ssis/dubaiai/gatewaytoken/1.0.0/getAccessToken`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "x-DDA-SecurityApplicationIdentifier": appId,
      },
      body: new URLSearchParams({ grant_type: "client_credentials", client_id: cid, client_secret: secret }).toString(),
      signal: AbortSignal.timeout(15_000),
    }
  );
  if (!res.ok) throw new Error(`Token fetch failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageSize = searchParams.get("pageSize") ?? "5";
  const page     = searchParams.get("page") ?? "1";
  const filter   = searchParams.get("filter") ?? "";
  const dataset  = searchParams.get("dataset") ?? "dld_rent_contracts-open-api";
  const entity   = searchParams.get("entity") ?? "dld";

  const base   = (process.env.DDA_BASE_URL        ?? "").trim();
  const appId  = (process.env.DDA_APP_IDENTIFIER  ?? "").trim();
  const cid    = (process.env.DDA_CLIENT_ID       ?? "").trim();
  const secret = (process.env.DDA_CLIENT_SECRET   ?? "").trim();

  if (!base || !appId || !cid || !secret) {
    return NextResponse.json({ ok: false, error: "Missing env vars" }, { status: 500 });
  }

  const token = await getToken(base, appId, cid, secret);

  const url = new URL(`${base}/open/${entity}/${dataset}`);
  url.searchParams.set("pageSize", pageSize);
  url.searchParams.set("page", page);
  if (filter) url.searchParams.set("filter", filter);

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    const body = await res.text();
    return NextResponse.json({ ok: false, httpStatus: res.status, body });
  }

  const data = await res.json();
  return NextResponse.json({ ok: true, total: data.total ?? data.count, results: data.results });
}

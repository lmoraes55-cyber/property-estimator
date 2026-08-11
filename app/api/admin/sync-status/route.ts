import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

// Internal-only: last sync status per data source. Gated by ADMIN_ACCESS_KEY,
// not exposed anywhere in the public site.

export async function GET(request: Request) {
  const key = request.headers.get("x-admin-key");
  if (!process.env.ADMIN_ACCESS_KEY || key !== process.env.ADMIN_ACCESS_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: logs } = await supabase
    .from("data_sync_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  const lastAirroi = logs?.find(l => l.service === "airroi") ?? null;
  const lastDld = logs?.find(l => l.service === "dld") ?? null;

  // Weekly cron: Mondays 03:00 UTC (see vercel.json).
  const now = new Date();
  const next = new Date(now);
  next.setUTCDate(now.getUTCDate() + ((1 + 7 - now.getUTCDay()) % 7 || 7));
  next.setUTCHours(3, 0, 0, 0);

  return NextResponse.json({
    lastAirroiSync: lastAirroi,
    lastDldSync: lastDld,
    nextScheduledRefresh: next.toISOString(),
    recentLogs: logs ?? [],
  });
}

import { NextResponse } from "next/server";
import { getAll2026Handovers } from "@/lib/dld-2026-handovers";
import { requireUser } from "@/lib/require-user";

// Read-only endpoint for the 2026 Handover Intelligence page — but the page
// itself gates this data behind sign-up (AccessGate), so the route must
// enforce that too. Reads ONLY from our database (dld_2026_handovers) —
// never calls DDA directly. The weekly cron (/api/cron/dld-2026-handovers-refresh)
// is the only caller of DDA.

export async function GET() {
  if (!(await requireUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const data = await getAll2026Handovers();
  return NextResponse.json(
    { data },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}

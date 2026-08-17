import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

interface ReportLogBody {
  reportType: string;
  userId?: string;
  name?: string;
  email?: string;
  phone?: string;
  buildingName?: string;
  unitSize?: string;
  params?: Record<string, unknown>;
  resultSnapshot?: Record<string, unknown>;
}

export async function POST(request: Request) {
  let body: ReportLogBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!body.reportType) {
    return NextResponse.json({ ok: false, error: "reportType is required" }, { status: 400 });
  }

  try {
    const supabase = createServiceClient();
    const { error } = await supabase.from("report_log").insert({
      report_type: body.reportType,
      user_id: body.userId || null,
      name: body.name || null,
      email: body.email || null,
      phone: body.phone || null,
      building_name: body.buildingName || null,
      unit_size: body.unitSize || null,
      params: body.params || null,
      result_snapshot: body.resultSnapshot || null,
    });
    if (error) throw new Error(error.message);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[REPORT-LOG]", (e as Error).message);
    // Non-fatal from the caller's point of view — the report itself already rendered.
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

import { createServiceClient } from "@/lib/supabase/service";
import { groupContactKey, reportNetIncome } from "@/lib/admin-people";

const TYPE_LABELS: Record<string, string> = {
  rental_analyzer: "Rental Analyzer",
  str_subleasing: "STR Sub-Leasing Risk",
  operator_match: "Operator Match",
};

export default async function AdminReportsPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const supabase = createServiceClient();

  let query = supabase.from("report_log").select("*").order("created_at", { ascending: false }).limit(200);
  if (type) query = query.eq("report_type", type);
  const { data: reports } = await query;

  return (
    <div>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 28, color: "#1B5E4A", marginBottom: 16 }}>
        Reports ({reports?.length ?? 0})
      </h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <a href="/admin/reports" style={{ fontSize: 13, fontWeight: !type ? 700 : 400, color: "#1B5E4A" }}>All</a>
        {Object.entries(TYPE_LABELS).map(([value, label]) => (
          <a key={value} href={`/admin/reports?type=${value}`} style={{ fontSize: 13, fontWeight: type === value ? 700 : 400, color: "#1B5E4A" }}>
            {label}
          </a>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "#E6E1D8" }}>
        {(reports ?? []).map(r => {
          const key = groupContactKey(r.email, r.phone);
          const netIncome = reportNetIncome(r);
          const rowContent = (
            <>
              <div>
                <div style={{ fontWeight: 700 }}>{TYPE_LABELS[r.report_type] || r.report_type} — {r.building_name || "—"}</div>
                <div style={{ fontSize: 12, color: "#6B6B6B" }}>{r.name || r.email || "—"}</div>
              </div>
              <div style={{ textAlign: "right" as const }}>
                {netIncome !== null && (
                  <div style={{ fontWeight: 700, color: "#1B5E4A" }}>AED {netIncome.toLocaleString()}/yr</div>
                )}
                <div style={{ fontSize: 12, color: "#6B6B6B" }}>{new Date(r.created_at).toLocaleString()}</div>
              </div>
            </>
          );
          const rowStyle = { display: "flex" as const, justifyContent: "space-between" as const, padding: "12px 16px", background: "#fff", textDecoration: "none", color: "#1A1A1A" };
          return key ? (
            <a key={r.id} href={`/admin/people/${encodeURIComponent(key)}`} style={rowStyle}>
              {rowContent}
            </a>
          ) : (
            <div key={r.id} style={rowStyle}>
              {rowContent}
            </div>
          );
        })}
        {(reports ?? []).length === 0 && (
          <div style={{ padding: 16, background: "#fff", color: "#6B6B6B" }}>No reports recorded yet.</div>
        )}
      </div>
    </div>
  );
}

import { createServiceClient } from "@/lib/supabase/service";
import { groupContactKey, reportNetIncome } from "@/lib/admin-people";

export default async function AdminPersonDetailPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const decodedKey = decodeURIComponent(key);
  const supabase = createServiceClient();

  const [leadsRes, reportsRes] = await Promise.all([
    supabase.from("leads").select("*").order("created_at", { ascending: false }),
    supabase.from("report_log").select("*").order("created_at", { ascending: false }),
  ]);

  const leads = (leadsRes.data ?? []).filter(l => groupContactKey(l.email, l.phone) === decodedKey);
  const reports = (reportsRes.data ?? []).filter(r => groupContactKey(r.email, r.phone) === decodedKey);
  const displayName = leads[0]?.name || reports[0]?.name || "(no name)";
  const displayContact = leads[0]?.email || reports[0]?.email || leads[0]?.phone || reports[0]?.phone || "";

  return (
    <div>
      <a href="/admin/people" style={{ fontSize: 13, color: "#4E5D56" }}>← Back to People</a>
      <h1 style={{ fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", fontSize: 31, color: "#1B5E4A", margin: "8px 0 4px" }}>{displayName}</h1>
      <p style={{ color: "#4E5D56", marginBottom: 24 }}>{displayContact}</p>

      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Reports ({reports.length})</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {reports.map(r => {
          const netIncome = reportNetIncome(r);
          return (
            <div key={r.id} style={{ padding: 12, background: "#fff", border: "1px solid #E2E8E5", borderRadius: 8, display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700 }}>{r.report_type} — {r.building_name || "—"}</div>
                <div style={{ fontSize: 12, color: "#4E5D56" }}>{new Date(r.created_at).toLocaleString()}</div>
              </div>
              {netIncome !== null && (
                <div style={{ fontWeight: 700, color: "#1B5E4A", alignSelf: "center" }}>AED {netIncome.toLocaleString()}/yr</div>
              )}
            </div>
          );
        })}
        {reports.length === 0 && <p style={{ color: "#4E5D56" }}>No reports.</p>}
      </div>

      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Leads ({leads.length})</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {leads.map(l => (
          <div key={l.id} style={{ padding: 12, background: "#fff", border: "1px solid #E2E8E5", borderRadius: 8 }}>
            <div style={{ fontWeight: 700 }}>{l.target_type || "lead"} — {l.target || "—"}</div>
            <div style={{ fontSize: 12, color: "#4E5D56" }}>{new Date(l.created_at).toLocaleString()}</div>
          </div>
        ))}
        {leads.length === 0 && <p style={{ color: "#4E5D56" }}>No leads.</p>}
      </div>
    </div>
  );
}

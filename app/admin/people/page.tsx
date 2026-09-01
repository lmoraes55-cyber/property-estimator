import { fetchPeople } from "@/lib/admin-people";

export default async function AdminPeoplePage() {
  const people = await fetchPeople();

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-display), ui-sans-serif, system-ui, sans-serif", fontSize: 31, color: "#1B5E4A", marginBottom: 16 }}>
        People ({people.length})
      </h1>
      <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "#E2E8E5" }}>
        {people.map(p => (
          <a
            key={p.key}
            href={`/admin/people/${encodeURIComponent(p.key)}`}
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px 16px", background: "#fff", textDecoration: "none", color: "#0F1D18",
            }}
          >
            <div>
              <div style={{ fontWeight: 700 }}>{p.name || "(no name)"}</div>
              <div style={{ fontSize: 12, color: "#4E5D56" }}>{p.email || p.phone}</div>
            </div>
            <div style={{ fontSize: 12, color: "#4E5D56", textAlign: "right" }}>
              {p.hasAccount && <span style={{ marginRight: 8 }}>Account</span>}
              <span style={{ marginRight: 8 }}>{p.leadCount} lead{p.leadCount === 1 ? "" : "s"}</span>
              <span>{p.reportCount} report{p.reportCount === 1 ? "" : "s"}</span>
            </div>
          </a>
        ))}
        {people.length === 0 && (
          <div style={{ padding: 16, background: "#fff", color: "#4E5D56" }}>No people recorded yet.</div>
        )}
      </div>
    </div>
  );
}

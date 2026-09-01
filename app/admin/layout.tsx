import { requireAdmin } from "@/lib/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div style={{ minHeight: "100vh", background: "#F7F9F8" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px" }}>
        <nav style={{ display: "flex", gap: 16, marginBottom: 24, fontSize: 14 }}>
          <a href="/admin/people" style={{ color: "#1B5E4A", fontWeight: 600, textDecoration: "none" }}>People</a>
          <a href="/admin/reports" style={{ color: "#1B5E4A", fontWeight: 600, textDecoration: "none" }}>Reports</a>
          <a
            href="https://vercel.com/leon-moraes-projects/property-estimator/analytics"
            target="_blank" rel="noopener noreferrer"
            style={{ color: "#4E5D56", fontWeight: 600, textDecoration: "none", marginLeft: "auto" }}
          >
            View traffic analytics →
          </a>
        </nav>
        {children}
      </div>
    </div>
  );
}

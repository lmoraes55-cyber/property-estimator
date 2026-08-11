"use client";

import { useState } from "react";
import { colors, serif } from "@/components/home/theme";

interface SyncLog {
  service: string;
  status: string;
  records_updated: number;
  started_at: string;
  completed_at: string | null;
  error: string | null;
}

interface SyncStatusResponse {
  lastAirroiSync: SyncLog | null;
  lastDldSync: SyncLog | null;
  nextScheduledRefresh: string;
  recentLogs: SyncLog[];
}

interface BayutLocation {
  id: number;
  externalID: string;
  name: string | null;
  slug: string | null;
  level: number;
  type: string;
  lat: number | null;
  lng: number | null;
  path: string;
  adCount: number | null;
}

function StatusPill({ status }: { status: string }) {
  const color = status === "success" ? colors.primary : status === "partial" ? colors.secondary : "#C0392B";
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.06em" }}>
      {status}
    </span>
  );
}

export default function AdminDataSyncPage() {
  const [key, setKey] = useState("");
  const [status, setStatus] = useState<SyncStatusResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [bayutQuery, setBayutQuery] = useState("");
  const [bayutResults, setBayutResults] = useState<BayutLocation[] | null>(null);
  const [bayutError, setBayutError] = useState("");
  const [bayutLoading, setBayutLoading] = useState(false);

  async function lookupBayut() {
    if (!bayutQuery.trim()) return;
    setBayutLoading(true);
    setBayutError("");
    try {
      const res = await fetch(`/api/admin/bayut-lookup?query=${encodeURIComponent(bayutQuery)}`, { headers: { "x-admin-key": key } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Lookup failed");
      setBayutResults(json.locations);
    } catch (e) {
      setBayutError((e as Error).message);
      setBayutResults(null);
    }
    setBayutLoading(false);
  }

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/sync-status", { headers: { "x-admin-key": key } });
      if (!res.ok) throw new Error("Invalid admin key or request failed.");
      setStatus(await res.json());
    } catch (e) {
      setError((e as Error).message);
      setStatus(null);
    }
    setLoading(false);
  }

  return (
    <div style={{ background: colors.bgMain, minHeight: "100vh", padding: "64px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 style={{ fontFamily: serif, fontSize: 26, color: colors.primary, marginBottom: 8 }}>Data Sync Status</h1>
        <p style={{ fontSize: 13, color: colors.textMuted, marginBottom: 28 }}>Internal view of the weekly AirROI / DLD refresh pipeline. Not linked from the public site.</p>

        {!status && (
          <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
            <input
              type="password"
              placeholder="Admin access key"
              value={key}
              onChange={e => setKey(e.target.value)}
              style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${colors.border}`, background: "#FBF9F5", fontSize: 14 }}
            />
            <button onClick={load} disabled={loading || !key} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: colors.primary, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
              {loading ? "Checking…" : "View Status"}
            </button>
          </div>
        )}

        {error && <p style={{ color: "#C0392B", fontSize: 13, marginBottom: 20 }}>{error}</p>}

        {status && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
              {[
                { label: "Last AirROI Sync", log: status.lastAirroiSync },
                { label: "Last DLD Sync", log: status.lastDldSync },
              ].map(({ label, log }) => (
                <div key={label} style={{ background: colors.bgSection, border: `1px solid ${colors.border}`, borderRadius: 14, padding: 18 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
                  {log ? (
                    <>
                      <StatusPill status={log.status} />
                      <div style={{ fontSize: 13, marginTop: 6 }}>{log.records_updated} records updated</div>
                      <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>{new Date(log.completed_at ?? log.started_at).toLocaleString()}</div>
                      {log.error && <div style={{ fontSize: 11, color: "#C0392B", marginTop: 6 }}>{log.error}</div>}
                    </>
                  ) : (
                    <div style={{ fontSize: 13, color: colors.textMuted }}>No sync recorded yet</div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ fontSize: 13, color: colors.textMuted, marginBottom: 28 }}>
              Next scheduled refresh: <b style={{ color: colors.textMain }}>{new Date(status.nextScheduledRefresh).toLocaleString()}</b>
            </div>

            <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: "uppercase", marginBottom: 10 }}>Recent Runs</div>
            <div style={{ border: `1px solid ${colors.border}`, borderRadius: 14, overflow: "hidden" }}>
              {status.recentLogs.map((log, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", borderBottom: i < status.recentLogs.length - 1 ? `1px solid ${colors.border}` : "none", fontSize: 12.5, background: colors.bgSection }}>
                  <span style={{ textTransform: "capitalize" }}>{log.service}</span>
                  <StatusPill status={log.status} />
                  <span style={{ color: colors.textMuted }}>{log.records_updated} records</span>
                  <span style={{ color: colors.textMuted }}>{new Date(log.started_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 40 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: "uppercase", marginBottom: 4 }}>Bayut Area Lookup</div>
              <p style={{ fontSize: 12, color: colors.textMuted, marginBottom: 14 }}>Cross-references an area name against Bayut&apos;s location hierarchy — useful for resolving DLD/AirROI naming mismatches. Internal reference only, never surfaced publicly.</p>
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <input
                  type="text"
                  placeholder="e.g. Dubai Hills, JVC, Business Bay"
                  value={bayutQuery}
                  onChange={e => setBayutQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && lookupBayut()}
                  style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${colors.border}`, background: "#FBF9F5", fontSize: 14 }}
                />
                <button onClick={lookupBayut} disabled={bayutLoading || !bayutQuery.trim()} style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: colors.secondary, color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                  {bayutLoading ? "Searching…" : "Search"}
                </button>
              </div>

              {bayutError && <p style={{ color: "#C0392B", fontSize: 13, marginBottom: 16 }}>{bayutError}</p>}

              {bayutResults && (
                <div style={{ border: `1px solid ${colors.border}`, borderRadius: 14, overflow: "hidden" }}>
                  {bayutResults.length === 0 && (
                    <div style={{ padding: "16px", fontSize: 13, color: colors.textMuted, background: colors.bgSection }}>No matches.</div>
                  )}
                  {bayutResults.map(loc => (
                    <div key={loc.id} style={{ padding: "12px 16px", borderBottom: `1px solid ${colors.border}`, background: colors.bgSection }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                        <span style={{ fontWeight: 700, fontSize: 13.5 }}>{loc.name}</span>
                        <span style={{ fontSize: 11, color: colors.textMuted }}>Level {loc.level} · {loc.type}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 3 }}>{loc.path}</div>
                      <div style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 3 }}>
                        {loc.lat != null && loc.lng != null ? `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}` : "no coordinates"}
                        {loc.adCount != null && ` · ${loc.adCount.toLocaleString()} active ads`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

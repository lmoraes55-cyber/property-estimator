"use client";

import React, { useEffect, useRef, useState } from "react";
import type { AreaStatsRow } from "@/lib/str-market-data";

// Real lat/lng centers for each tracked area — same coordinates used for the
// AirROI geo-radius fallback queries in the weekly refresh job.
export const AREA_LATLNG: Record<string, { lat: number; lng: number }> = {
  "Palm Jumeirah": { lat: 25.1150, lng: 55.1390 },
  "Dubai Marina": { lat: 25.0800, lng: 55.1400 },
  "JBR": { lat: 25.0787, lng: 55.1339 },
  "Al Furjan": { lat: 25.0310, lng: 55.1480 },
  "JVC": { lat: 25.0550, lng: 55.2080 },
  "Business Bay": { lat: 25.1870, lng: 55.2631 },
  "Downtown Dubai": { lat: 25.1972, lng: 55.2744 },
  "DIFC": { lat: 25.2117, lng: 55.2794 },
  "Dubai Hills Estate": { lat: 25.1010, lng: 55.2540 },
  "Dubai Creek Harbour": { lat: 25.1950, lng: 55.3480 },
  "MBR City": { lat: 25.1550, lng: 55.2900 },
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Muted ivory/forest-green custom style — light, editorial, no bright blues.
const MAP_STYLE = "mapbox://styles/mapbox/light-v11";

export type MapLayer = "sales" | "rentals" | "demand" | "adr" | "occ" | "revpar";

function demandLevel(row: AreaStatsRow): "high" | "medium" | "low" {
  const occ = row.occupancy ?? 0;
  const o = occ <= 1 ? occ * 100 : occ;
  if (o >= 65) return "high";
  if (o >= 45) return "medium";
  return "low";
}
function demandColor(level: "high" | "medium" | "low") {
  if (level === "high") return "#1B5E4A";
  if (level === "medium") return "#B88A44";
  return "#B5B0A3";
}
function circleMetricValue(r: AreaStatsRow, layer: MapLayer): number {
  if (layer === "sales") return r.sales_transactions ?? 0;
  if (layer === "rentals") return r.rental_transactions ?? 0;
  if (layer === "adr") return r.adr ?? 0;
  if (layer === "occ") return r.occupancy ?? 0;
  if (layer === "revpar") return r.revpar ?? 0;
  return (r.sales_transactions ?? 0) + (r.rental_transactions ?? 0);
}
function fmtAED(n: number | null | undefined): string {
  if (n == null) return "—";
  return `AED ${Math.round(n).toLocaleString()}`;
}
function fmtPct(n: number | null | undefined): string {
  if (n == null) return "—";
  return `${(n <= 1 ? n * 100 : n).toFixed(0)}%`;
}
function fmtNum(n: number | null | undefined): string {
  if (n == null) return "—";
  return Math.round(n).toLocaleString();
}

export default function AreaMap({
  areaStats,
  mapLayer,
  selectedArea,
  onSelectArea,
}: {
  areaStats: AreaStatsRow[];
  mapLayer: MapLayer;
  selectedArea: string | null;
  onSelectArea: (area: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [viewMode, setViewMode] = useState<"clusters" | "heatmap">("heatmap");

  useEffect(() => {
    if (!MAPBOX_TOKEN || !containerRef.current) return;
    let cancelled = false;

    import("mapbox-gl").then((mapboxgl) => {
      if (cancelled || !containerRef.current) return;
      mapboxgl.default.accessToken = MAPBOX_TOKEN;
      const map = new mapboxgl.default.Map({
        container: containerRef.current,
        style: MAP_STYLE,
        center: [55.22, 25.13],
        zoom: 10.4,
        attributionControl: false,
      });
      map.addControl(new mapboxgl.default.NavigationControl({ showCompass: false }), "top-right");
      map.on("load", () => setReady(true));
      map.on("error", () => setLoadError(true));
      mapRef.current = map;
    }).catch(() => setLoadError(true));

    return () => {
      cancelled = true;
      mapRef.current?.remove();
    };
  }, []);

  // Cluster markers — only rendered in "clusters" view mode.
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    let cancelled = false;

    import("mapbox-gl").then((mapboxgl) => {
      if (cancelled) return;
      const map = mapRef.current;

      if (viewMode !== "clusters") {
        for (const key of Object.keys(markersRef.current)) {
          markersRef.current[key].remove();
          delete markersRef.current[key];
        }
        return;
      }

      const maxVal = Math.max(...areaStats.map(r => circleMetricValue(r, mapLayer)), 1);

      // Remove markers for areas no longer present.
      for (const key of Object.keys(markersRef.current)) {
        if (!areaStats.find(r => r.area === key)) {
          markersRef.current[key].remove();
          delete markersRef.current[key];
        }
      }

      for (const row of areaStats) {
        const pos = AREA_LATLNG[row.area];
        if (!pos) continue;
        const val = circleMetricValue(row, mapLayer);
        const size = 30 + (val / maxVal) * 40;
        const color = mapLayer === "demand" ? demandColor(demandLevel(row)) : demandColor(demandLevel(row));
        const isSelected = selectedArea === row.area;

        let marker = markersRef.current[row.area];
        const el = document.createElement("div");
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.borderRadius = "50%";
        el.style.background = color;
        el.style.opacity = isSelected ? "0.95" : "0.82";
        el.style.border = `2px solid ${isSelected ? "#FDFBF7" : "rgba(255,255,255,0.65)"}`;
        el.style.boxShadow = isSelected ? "0 6px 18px rgba(0,0,0,0.28)" : "0 2px 8px rgba(0,0,0,0.16)";
        el.style.display = "flex";
        el.style.alignItems = "center";
        el.style.justifyContent = "center";
        el.style.color = "#fff";
        el.style.fontWeight = "800";
        el.style.fontSize = `${Math.min(12, size / 3.4)}px`;
        el.style.cursor = "pointer";
        el.style.fontFamily = "Arial, sans-serif";
        el.textContent = mapLayer === "occ" ? fmtPct(row.occupancy) : mapLayer === "adr" || mapLayer === "revpar" ? "" : fmtNum(val);
        el.title = row.area;
        el.onclick = () => onSelectArea(row.area);

        const popupHtml = `<div style="font-family:Arial, sans-serif;padding:2px 4px;min-width:150px;">
          <p style="font-weight:800;font-size:13px;color:#1B2A1F;margin:0 0 6px;">${row.area}</p>
          <p style="font-size:11.5px;color:#555;margin:0;">ADR ${fmtAED(row.adr)} · Occ ${fmtPct(row.occupancy)}</p>
          <p style="font-size:11.5px;color:#555;margin:2px 0 0;">RevPAR ${fmtAED(row.revpar)}</p>
        </div>`;
        const popup = new mapboxgl.default.Popup({ offset: 14, closeButton: false }).setHTML(popupHtml);

        if (marker) {
          marker.remove();
        }
        marker = new mapboxgl.default.Marker({ element: el })
          .setLngLat([pos.lng, pos.lat])
          .setPopup(popup)
          .addTo(map);
        el.addEventListener("mouseenter", () => marker.togglePopup());
        el.addEventListener("mouseleave", () => marker.togglePopup());
        markersRef.current[row.area] = marker;
      }
    });

    return () => { cancelled = true; };
  }, [ready, areaStats, mapLayer, selectedArea, onSelectArea, viewMode]);

  // Heatmap layer — a soft blob per area, weighted by the selected metric.
  // Mapbox's "heatmap" layer type expects many points to blend smoothly, so
  // each area is expanded into a small jittered cluster of synthetic points
  // around its real center rather than a single point (which would render as
  // a hard dot, not a heat blob).
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    let cancelled = false;

    import("mapbox-gl").then((mapboxgl) => {
      if (cancelled) return;
      const map = mapRef.current;
      const SOURCE_ID = "str-heatmap-source";
      const LAYER_ID = "str-heatmap-layer";

      const removeLayer = () => {
        if (map.getLayer(LAYER_ID)) map.removeLayer(LAYER_ID);
        if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
      };

      if (viewMode !== "heatmap") {
        removeLayer();
        return;
      }

      const maxVal = Math.max(...areaStats.map(r => circleMetricValue(r, mapLayer)), 1);
      const features: any[] = [];
      for (const row of areaStats) {
        const pos = AREA_LATLNG[row.area];
        if (!pos) continue;
        const weight = Math.max(0.15, circleMetricValue(row, mapLayer) / maxVal);
        const jitterPoints = 14;
        for (let i = 0; i < jitterPoints; i++) {
          const angle = (i / jitterPoints) * Math.PI * 2;
          const radius = 0.004 + Math.random() * 0.006;
          features.push({
            type: "Feature",
            geometry: { type: "Point", coordinates: [pos.lng + Math.cos(angle) * radius, pos.lat + Math.sin(angle) * radius] },
            properties: { weight },
          });
        }
      }

      const geojson = { type: "FeatureCollection", features };

      if (map.getSource(SOURCE_ID)) {
        (map.getSource(SOURCE_ID) as any).setData(geojson);
      } else {
        map.addSource(SOURCE_ID, { type: "geojson", data: geojson });
        map.addLayer({
          id: LAYER_ID,
          type: "heatmap",
          source: SOURCE_ID,
          paint: {
            "heatmap-weight": ["get", "weight"],
            "heatmap-intensity": 1.1,
            "heatmap-radius": 55,
            "heatmap-opacity": 0.75,
            "heatmap-color": [
              "interpolate", ["linear"], ["heatmap-density"],
              0, "rgba(253,251,247,0)",
              0.2, "rgba(200,218,208,0.55)",
              0.45, "rgba(184,138,68,0.65)",
              0.7, "rgba(45,122,94,0.75)",
              1, "rgba(27,94,74,0.9)",
            ],
          },
        });
      }
    });

    return () => { cancelled = true; };
  }, [ready, areaStats, mapLayer, viewMode]);

  if (!MAPBOX_TOKEN || loadError) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100%", minHeight: 340, borderRadius: 12, border: "1px dashed #E6E1D8",
        background: "#F2EFE9", color: "#999", fontSize: 12.5, textAlign: "center", padding: 24,
      }}>
        {loadError ? "Map failed to load." : "Live map requires a Mapbox access token (NEXT_PUBLIC_MAPBOX_TOKEN)."}
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", minHeight: 340 }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: 340, borderRadius: 12, overflow: "hidden" }} />
      <div style={{
        position: "absolute", top: 10, left: 10, zIndex: 2,
        display: "flex", background: "#FDFBF7", border: "1px solid #E6E1D8",
        borderRadius: 10, overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
      }}>
        {(["heatmap", "clusters"] as const).map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            style={{
              padding: "7px 14px", fontSize: 11.5, fontWeight: 700, border: "none", cursor: "pointer",
              background: viewMode === mode ? "#1B5E4A" : "transparent",
              color: viewMode === mode ? "#fff" : "#6B6B6B",
              textTransform: "capitalize",
            }}
          >
            {mode}
          </button>
        ))}
      </div>
    </div>
  );
}

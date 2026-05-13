"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

type Props = {
  latitude: number;
  longitude: number;
  nom: string;
  parking1?: { lat: number; lon: number };
  parking2?: { lat: number; lon: number };
};

/**
 * Mini-carte pour fiche site : centrée sur le point, marker glow ice,
 * avec optionnellement les deux parkings en accent orange.
 */
export function SiteMiniMap({
  latitude,
  longitude,
  nom,
  parking1,
  parking2,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [longitude, latitude],
      zoom: 13,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    // Marker du site : grand point glow.
    const siteEl = document.createElement("div");
    siteEl.setAttribute(
      "style",
      "width:18px;height:18px;border-radius:50%;background:#7ddeff;border:2px solid #050505;box-shadow:0 0 0 4px rgba(125,222,255,0.35),0 0 18px rgba(125,222,255,0.7);",
    );
    new maplibregl.Marker({ element: siteEl })
      .setLngLat([longitude, latitude])
      .setPopup(
        new maplibregl.Popup({ offset: 18, closeButton: false }).setHTML(
          `<div style="font-family:system-ui;color:#050505;font-weight:600;padding:4px 6px">${escapeHtml(nom)}</div>`,
        ),
      )
      .addTo(map);

    // Markers parkings éventuels (accent orange).
    for (const p of [parking1, parking2]) {
      if (!p) continue;
      const el = document.createElement("div");
      el.setAttribute(
        "style",
        "width:12px;height:12px;border-radius:50%;background:#ff7a26;border:2px solid #050505;",
      );
      new maplibregl.Marker({ element: el })
        .setLngLat([p.lon, p.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 12, closeButton: false }).setHTML(
            `<div style="font-family:system-ui;color:#050505;font-weight:600;padding:4px 6px">Parking</div>`,
          ),
        )
        .addTo(map);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [latitude, longitude, nom, parking1, parking2]);

  return (
    <div
      ref={containerRef}
      className="h-[360px] w-full overflow-hidden rounded-2xl border border-white/10 bg-coal-900 sm:h-[440px]"
      aria-label={`Carte centrée sur ${nom}`}
    />
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

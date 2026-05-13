"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import {
  siteHref,
  communeName,
  formatCotationRange,
  type SiteListItem,
} from "@/lib/sites";

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

type Props = {
  sites: SiteListItem[];
  departement: string;
};

/**
 * Carte focalisée sur les spots d'un département. Auto-cadre l'ensemble
 * des points, sans clustering (faible volume par département).
 */
export function DepartementMap({ sites, departement }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [selected, setSelected] = useState<SiteListItem | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const pts = sites.filter(
      (s): s is SiteListItem & { latitude: number; longitude: number } =>
        typeof s.latitude === "number" && typeof s.longitude === "number",
    );

    if (pts.length === 0) return;

    // Bounding box auto-calculée
    let minLat = pts[0].latitude;
    let maxLat = pts[0].latitude;
    let minLon = pts[0].longitude;
    let maxLon = pts[0].longitude;
    for (const p of pts) {
      if (p.latitude < minLat) minLat = p.latitude;
      if (p.latitude > maxLat) maxLat = p.latitude;
      if (p.longitude < minLon) minLon = p.longitude;
      if (p.longitude > maxLon) maxLon = p.longitude;
    }
    const bounds: [number, number, number, number] = [
      minLon - 0.1,
      minLat - 0.1,
      maxLon + 0.1,
      maxLat + 0.1,
    ];

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      bounds,
      fitBoundsOptions: { padding: 40 },
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right",
    );

    map.on("load", () => {
      map.addSource("dep-sites", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: pts.map((s) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [s.longitude, s.latitude] },
            properties: {
              id: s.id,
              nom: s.nom,
              commune: s.commune ?? "",
              cotation_min: s.cotation_min ?? "",
              cotation_max: s.cotation_max ?? "",
              nombre_voies: s.nombre_voies ?? 0,
            },
          })),
        },
      });

      // Halo léger sous chaque point pour bien le voir
      map.addLayer({
        id: "dep-halo",
        type: "circle",
        source: "dep-sites",
        paint: {
          "circle-color": "#7ddeff",
          "circle-opacity": 0.18,
          "circle-radius": 18,
          "circle-blur": 0.6,
        },
      });
      map.addLayer({
        id: "dep-point",
        type: "circle",
        source: "dep-sites",
        paint: {
          "circle-color": "#7ddeff",
          "circle-radius": 7,
          "circle-stroke-color": "#050505",
          "circle-stroke-width": 2,
        },
      });

      map.on("mouseenter", "dep-point", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "dep-point", () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("click", "dep-point", (e) => {
        const f = e.features?.[0];
        if (!f) return;
        const p = f.properties as Record<string, unknown>;
        setSelected({
          id: Number(p.id),
          nom: String(p.nom ?? ""),
          commune: (p.commune as string) || null,
          departement: null,
          code_departement: null,
          massif: null,
          type_site: null,
          cotation_min: (p.cotation_min as string) || null,
          cotation_max: (p.cotation_max as string) || null,
          nombre_voies:
            typeof p.nombre_voies === "number"
              ? p.nombre_voies
              : Number(p.nombre_voies) || null,
          latitude: (f.geometry as GeoJSON.Point).coordinates[1] ?? null,
          longitude: (f.geometry as GeoJSON.Point).coordinates[0] ?? null,
        });
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [sites]);

  if (sites.filter((s) => s.latitude && s.longitude).length === 0) {
    return null;
  }

  return (
    <div className="relative isolate">
      <div
        ref={containerRef}
        className="h-[55dvh] min-h-[420px] w-full overflow-hidden rounded-2xl border border-white/10 bg-coal-900"
        aria-label={`Carte des sites d'escalade en ${departement}`}
      />
      <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-full border border-white/15 bg-coal-900/80 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/80 backdrop-blur">
        {sites.filter((s) => s.latitude && s.longitude).length} sites · {departement}
      </div>

      {selected && (
        <div className="pointer-events-auto absolute inset-x-3 bottom-3 z-20 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-w-sm">
          <article className="rounded-2xl border border-white/10 bg-coal-900/95 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-xl font-medium leading-tight tracking-[-0.02em] sm:text-2xl">
                  {selected.nom}
                </h3>
                {selected.commune && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {communeName(selected.commune)}
                  </p>
                )}
              </div>
              <button
                type="button"
                aria-label="Fermer"
                onClick={() => setSelected(null)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 transition-colors hover:bg-white/10"
              >
                <span className="text-lg leading-none">×</span>
              </button>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Cotation
                </dt>
                <dd className="mt-1 font-mono tabular-nums text-foreground">
                  {formatCotationRange(
                    selected.cotation_min,
                    selected.cotation_max,
                  )}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Voies
                </dt>
                <dd className="mt-1 font-mono tabular-nums text-foreground">
                  {selected.nombre_voies && selected.nombre_voies > 0
                    ? selected.nombre_voies
                    : "—"}
                </dd>
              </div>
            </dl>

            <a
              href={siteHref(selected)}
              className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              Voir la fiche
              <span className="text-base leading-none">→</span>
            </a>
          </article>
        </div>
      )}
    </div>
  );
}

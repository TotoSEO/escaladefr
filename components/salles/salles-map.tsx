"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { type GeoJSONSource, type MapMouseEvent } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { formatPratique, statusLabel, type SalleListItem } from "@/lib/salles";

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const FRANCE_BBOX: [number, number, number, number] = [-5.5, 41, 10, 51.5];

type Props = {
  salles: SalleListItem[];
};

export function SallesMap({ salles }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [selected, setSelected] = useState<SalleListItem | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const features = salles
      .filter(
        (s): s is SalleListItem & { latitude: number; longitude: number } =>
          typeof s.latitude === "number" && typeof s.longitude === "number",
      )
      .map((s) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [s.longitude, s.latitude],
        },
        properties: {
          id: s.id,
          nom: s.nom,
          ville: s.ville ?? "",
          chaine: s.chaine ?? "",
          type_pratique: s.type_pratique ?? "",
          site_web: s.site_web ?? "",
          verified_status: s.verified_status ?? "",
          verified_at: s.verified_at ?? "",
        },
      }));

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      bounds: FRANCE_BBOX,
      fitBoundsOptions: { padding: 40 },
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right",
    );

    map.on("load", () => {
      map.addSource("salles", {
        type: "geojson",
        data: { type: "FeatureCollection", features },
        cluster: true,
        clusterRadius: 50,
        clusterMaxZoom: 13,
      });

      // Pour les salles : accent orange pour différencier de la carte des sites.
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "salles",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#ff7a26",
          "circle-opacity": 0.85,
          "circle-radius": [
            "step",
            ["get", "point_count"],
            14,
            10, 20,
            30, 26,
            100, 32,
          ],
          "circle-stroke-color": "#ff7a26",
          "circle-stroke-opacity": 0.25,
          "circle-stroke-width": 6,
        },
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "salles",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": 13,
        },
        paint: { "text-color": "#050505" },
      });

      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "salles",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#ff7a26",
          "circle-radius": 6,
          "circle-stroke-color": "#050505",
          "circle-stroke-width": 1.5,
          "circle-opacity": 0.95,
        },
      });

      map.on("mouseenter", "unclustered-point", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "unclustered-point", () => {
        map.getCanvas().style.cursor = "";
      });
      map.on("mouseenter", "clusters", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "clusters", () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("click", "clusters", async (e: MapMouseEvent) => {
        const feats = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
        const clusterId = feats[0]?.properties?.cluster_id;
        if (clusterId == null) return;
        const source = map.getSource("salles") as GeoJSONSource;
        const zoom = await source.getClusterExpansionZoom(clusterId);
        const geometry = feats[0].geometry as GeoJSON.Point;
        map.easeTo({ center: geometry.coordinates as [number, number], zoom });
      });

      map.on("click", "unclustered-point", (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const props = feature.properties as Record<string, unknown>;
        setSelected({
          id: Number(props.id),
          nom: String(props.nom ?? ""),
          ville: (props.ville as string) || null,
          code_postal: null,
          chaine: (props.chaine as string) || null,
          type_pratique: (props.type_pratique as string) || null,
          site_web: (props.site_web as string) || null,
          latitude: (feature.geometry as GeoJSON.Point).coordinates[1] ?? null,
          longitude: (feature.geometry as GeoJSON.Point).coordinates[0] ?? null,
          verified_status: (props.verified_status as SalleListItem["verified_status"]) ?? null,
          verified_at: (props.verified_at as string) || null,
        });
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [salles]);

  return (
    <div className="relative isolate">
      <div
        ref={containerRef}
        className="h-[70dvh] min-h-[480px] w-full overflow-hidden rounded-2xl border border-white/10 bg-coal-900"
        aria-label="Carte interactive des salles d'escalade indoor en France"
      />
      <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-full border border-white/15 bg-coal-900/80 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/80 backdrop-blur">
        {salles.length.toLocaleString("fr-FR")} salles · clique pour le détail
      </div>

      {selected && (
        <div className="pointer-events-auto absolute inset-x-3 bottom-3 z-20 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-w-sm">
          <article className="rounded-2xl border border-white/10 bg-coal-900/95 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                {selected.chaine && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
                    {selected.chaine}
                  </span>
                )}
                <h3 className="mt-1 font-display text-2xl font-medium leading-tight tracking-[-0.02em]">
                  {selected.nom}
                </h3>
                {selected.ville && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {selected.ville}
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
                  Pratique
                </dt>
                <dd className="mt-1 text-foreground">
                  {formatPratique(selected.type_pratique)}
                </dd>
              </div>
              {selected.verified_status && (
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    Statut
                  </dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] ${
                        selected.verified_status === "active"
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : selected.verified_status === "unknown"
                          ? "border-accent/40 bg-accent/10 text-accent"
                          : "border-white/15 bg-white/5 text-muted-foreground"
                      }`}
                    >
                      {selected.verified_status === "active" && (
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                      {statusLabel(selected.verified_status)}
                    </span>
                  </dd>
                </div>
              )}
            </dl>

            {selected.site_web && (
              <a
                href={selected.site_web}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-accent text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground transition-transform hover:scale-[1.02]"
              >
                Site officiel
                <span className="text-base leading-none">↗</span>
              </a>
            )}
          </article>
        </div>
      )}
    </div>
  );
}

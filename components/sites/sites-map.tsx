"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import maplibregl, { type GeoJSONSource, type MapMouseEvent } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import {
  siteHref,
  communeName,
  formatCotationRange,
  type SiteListItem,
} from "@/lib/sites";

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const FRANCE_BBOX: [number, number, number, number] = [-5.5, 41, 10, 51.5];

type Props = {
  sites: SiteListItem[];
};

export function SitesMap({ sites }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [selected, setSelected] = useState<SiteListItem | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const features = sites
      .filter(
        (s): s is SiteListItem & { latitude: number; longitude: number } =>
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
          commune: s.commune ?? "",
          departement: s.departement ?? "",
          cotation_min: s.cotation_min ?? "",
          cotation_max: s.cotation_max ?? "",
          nombre_voies: s.nombre_voies ?? 0,
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
      map.addSource("sites", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features,
        },
        cluster: true,
        clusterRadius: 50,
        clusterMaxZoom: 14,
      });

      // Clusters
      map.addLayer({
        id: "clusters",
        type: "circle",
        source: "sites",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#7ddeff",
          "circle-opacity": 0.85,
          "circle-radius": [
            "step",
            ["get", "point_count"],
            16,
            10, 22,
            50, 28,
            200, 36,
          ],
          "circle-stroke-color": "#7ddeff",
          "circle-stroke-opacity": 0.25,
          "circle-stroke-width": 6,
        },
      });

      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "sites",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": 13,
        },
        paint: {
          "text-color": "#050505",
        },
      });

      // Points uniques
      map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "sites",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#7ddeff",
          "circle-radius": 6,
          "circle-stroke-color": "#050505",
          "circle-stroke-width": 1.5,
          "circle-opacity": 0.95,
        },
      });

      // Halo au hover
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

      // Click sur cluster : zoom
      map.on("click", "clusters", async (e: MapMouseEvent) => {
        const feats = map.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        });
        const clusterId = feats[0]?.properties?.cluster_id;
        if (clusterId == null) return;
        const source = map.getSource("sites") as GeoJSONSource;
        const zoom = await source.getClusterExpansionZoom(clusterId);
        const geometry = feats[0].geometry as GeoJSON.Point;
        map.easeTo({
          center: geometry.coordinates as [number, number],
          zoom,
        });
      });

      // Click sur point : afficher la mini-fiche
      map.on("click", "unclustered-point", (e) => {
        const feature = e.features?.[0];
        if (!feature) return;
        const props = feature.properties as Record<string, unknown>;
        setSelected({
          id: Number(props.id),
          nom: String(props.nom ?? ""),
          commune: (props.commune as string) || null,
          departement: (props.departement as string) || null,
          code_departement: null,
          massif: null,
          type_site: null,
          cotation_min: (props.cotation_min as string) || null,
          cotation_max: (props.cotation_max as string) || null,
          nombre_voies:
            typeof props.nombre_voies === "number"
              ? props.nombre_voies
              : Number(props.nombre_voies) || null,
          latitude: (feature.geometry as GeoJSON.Point).coordinates[1] ?? null,
          longitude: (feature.geometry as GeoJSON.Point).coordinates[0] ?? null,
        });
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [sites]);

  return (
    <div className="relative isolate">
      <div
        ref={containerRef}
        className="h-[70dvh] min-h-[480px] w-full overflow-hidden rounded-2xl border border-white/10 bg-coal-900"
        aria-label="Carte interactive des sites naturels d'escalade en France"
      />
      <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-full border border-white/15 bg-coal-900/80 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/80 backdrop-blur">
        {sites.length.toLocaleString("fr-FR")} sites · clique pour explorer
      </div>

      {selected && (
        <div className="pointer-events-auto absolute inset-x-3 bottom-3 z-20 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-w-sm">
          <article className="rounded-2xl border border-white/10 bg-coal-900/95 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                  {selected.departement || "Site"}
                </span>
                <h3 className="mt-1 font-display text-2xl font-medium leading-tight tracking-[-0.02em]">
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

            <Link
              href={siteHref(selected)}
              className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              Voir la fiche
              <span className="text-base leading-none">→</span>
            </Link>
          </article>
        </div>
      )}
    </div>
  );
}

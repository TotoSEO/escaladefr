/**
 * Helpers pour les sites naturels d'escalade.
 * Lecture Supabase + génération de slugs SEO.
 */

import { getSupabase } from "@/lib/supabase";

export type AccesStatut = "open" | "restricted" | "closed" | "seasonal" | "pending";

export type SiteListItem = {
  id: number;
  nom: string;
  commune: string | null;
  departement: string | null;
  code_departement: string | null;
  massif: string | null;
  type_site: string | null;
  cotation_min: string | null;
  cotation_max: string | null;
  nombre_voies: number | null;
  latitude: number | null;
  longitude: number | null;
  acces_statut?: AccesStatut | null;
};

/** Coordonnées d'affichage : on privilégie les coords affinées si dispo. */
export function bestCoords(
  site: { latitude: number | null; longitude: number | null; latitude_affine?: number | null; longitude_affine?: number | null },
): { lat: number; lon: number; affine: boolean } | null {
  if (
    typeof site.latitude_affine === "number" &&
    typeof site.longitude_affine === "number"
  ) {
    return { lat: site.latitude_affine, lon: site.longitude_affine, affine: true };
  }
  if (typeof site.latitude === "number" && typeof site.longitude === "number") {
    return { lat: site.latitude, lon: site.longitude, affine: false };
  }
  return null;
}

export function accesStatutLabel(s: AccesStatut | null | undefined): string {
  switch (s) {
    case "closed":
      return "Accès interdit";
    case "restricted":
      return "Accès restreint";
    case "seasonal":
      return "Restriction saisonnière";
    case "pending":
      return "À vérifier";
    case "open":
    case null:
    case undefined:
    default:
      return "Accès libre";
  }
}

export type SiteDetail = SiteListItem & {
  url: string | null;
  acces_routier: string | null;
  approche: string | null;
  orientation: string | null;
  cartographie: string | null;
  interet: string | null;
  presentation: string | null;
  rocher: string | null;
  hauteur_min_m: number | null;
  hauteur_max_m: number | null;
  informations_falaise: string | null;
  periodes_favorables: string[] | null;
  reglementation_particuliere: string | null;
  parking1_lat: number | null;
  parking1_lon: number | null;
  parking2_lat: number | null;
  parking2_lon: number | null;
  bibliographie: string[] | null;
  derniere_mise_a_jour: string | null;
  // Versions reformulées par notre rédaction (anti-duplicate)
  presentation_reformule: string | null;
  acces_routier_reformule: string | null;
  approche_reformule: string | null;
  interet_reformule: string | null;
  informations_falaise_reformule: string | null;
  reglementation_reformule: string | null;
  reformule_at: string | null;
  // Statut d'accès + coordonnées affinées
  acces_statut: AccesStatut | null;
  acces_notes: string | null;
  acces_source_url: string | null;
  acces_verified_at: string | null;
  latitude_affine: number | null;
  longitude_affine: number | null;
  geocodage_source: string | null;
  geocodage_distance_m: number | null;
  // Enrichissement Camptocamp (CC-BY-SA 4.0)
  c2c_document_id: number | null;
  c2c_match_score: number | null;
  c2c_routes_qty: number | null;
  c2c_summary: string | null;
  c2c_access_period: string | null;
  c2c_url: string | null;
};

export type CamptocampImage = {
  document_id: number;
  filename: string;
  title: string | null;
  author: string | null;
  width: number | null;
  height: number | null;
};

const LIST_COLUMNS =
  "id,nom,commune,departement,code_departement,massif,type_site,cotation_min,cotation_max,nombre_voies,latitude,longitude";

const LIST_COLUMNS_WITH_ACCESS = `${LIST_COLUMNS},acces_statut`;

const DETAIL_COLUMNS_BASE = `${LIST_COLUMNS},url,acces_routier,approche,orientation,cartographie,interet,presentation,rocher,hauteur_min_m,hauteur_max_m,informations_falaise,periodes_favorables,reglementation_particuliere,parking1_lat,parking1_lon,parking2_lat,parking2_lon,bibliographie,derniere_mise_a_jour,presentation_reformule,acces_routier_reformule,approche_reformule,interet_reformule,informations_falaise_reformule,reglementation_reformule,reformule_at`;

const DETAIL_COLUMNS_FULL = `${DETAIL_COLUMNS_BASE},acces_statut,acces_notes,acces_source_url,acces_verified_at,latitude_affine,longitude_affine,geocodage_source,geocodage_distance_m,c2c_document_id,c2c_match_score,c2c_routes_qty,c2c_summary,c2c_access_period,c2c_url`;

/** URL CDN d'une image Camptocamp. Le CDN sert l'original via media.camptocamp.org/c2corg-active/<filename>. */
export function camptocampImageUrl(filename: string): string {
  return `https://media.camptocamp.org/c2corg-active/${filename}`;
}

export async function fetchCamptocampImagesForWaypoint(
  waypointId: number,
  limit = 6,
): Promise<CamptocampImage[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("camptocamp_images")
    .select("document_id,filename,title,author,width,height")
    .eq("waypoint_id", waypointId)
    .eq("image_type", "collaborative")
    .not("filename", "is", null)
    .order("document_id", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data as CamptocampImage[];
}

/* ───────────────── Fetch helpers ───────────────── */

export async function fetchAllSitesForMap(): Promise<SiteListItem[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  // Supabase REST limite à 1000 lignes par défaut. On pagine par tranches
  // de 1000 jusqu'à épuisement (~3 requêtes pour ~3000 sites).
  const PAGE = 1000;
  const all: SiteListItem[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from("sites_naturels")
      .select(LIST_COLUMNS)
      .order("id")
      .range(from, from + PAGE - 1);
    if (error || !data || data.length === 0) break;
    all.push(...(data as SiteListItem[]));
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

export async function fetchSiteById(id: number): Promise<SiteDetail | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  // On essaie d'abord avec les colonnes acces_* + lat/lon affinées,
  // fallback sans si la migration n'a pas encore été appliquée.
  let res = await supabase
    .from("sites_naturels")
    .select(DETAIL_COLUMNS_FULL)
    .eq("id", id)
    .maybeSingle();
  if (res.error) {
    res = await supabase
      .from("sites_naturels")
      .select(DETAIL_COLUMNS_BASE)
      .eq("id", id)
      .maybeSingle();
  }
  if (res.error || !res.data) return null;
  return res.data as SiteDetail;
}

export type SiteImage = {
  id: number;
  site_id: number;
  url: string;
  thumbnail_url: string | null;
  auteur: string | null;
  licence: string | null;
  licence_url: string | null;
  source_url: string | null;
  titre: string | null;
  source: string | null;
  position: number;
  width: number | null;
  height: number | null;
};

export async function fetchSiteImages(siteId: number): Promise<SiteImage[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("site_images")
    .select("id,site_id,url,thumbnail_url,auteur,licence,licence_url,source_url,titre,source,position,width,height")
    .eq("site_id", siteId)
    .order("position", { ascending: true });
  if (error || !data) return [];
  return data as SiteImage[];
}

export async function fetchSitesByAccessStatus(
  statuts: AccesStatut[],
): Promise<(SiteListItem & { acces_statut: AccesStatut; acces_notes: string | null; acces_verified_at: string | null })[]> {
  const supabase = getSupabase();
  if (!supabase || statuts.length === 0) return [];
  const filter = statuts.map((s) => `"${s}"`).join(",");
  const { data, error } = await supabase
    .from("sites_naturels")
    .select(`${LIST_COLUMNS_WITH_ACCESS},acces_notes,acces_verified_at,acces_source_url`)
    .filter("acces_statut", "in", `(${filter})`)
    .order("acces_statut")
    .order("nom");
  if (error || !data) return [];
  return data as (SiteListItem & {
    acces_statut: AccesStatut;
    acces_notes: string | null;
    acces_verified_at: string | null;
  })[];
}

export async function fetchSitesByDepartement(
  departement: string,
): Promise<SiteListItem[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const PAGE = 1000;
  const all: SiteListItem[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from("sites_naturels")
      .select(LIST_COLUMNS)
      .eq("departement", departement)
      .order("nom")
      .range(from, from + PAGE - 1);
    if (error || !data || data.length === 0) break;
    all.push(...(data as SiteListItem[]));
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

export async function fetchDepartements(): Promise<
  { departement: string; code_departement: string | null; count: number }[]
> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const PAGE = 1000;
  const rows: { departement: string | null; code_departement: string | null }[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from("sites_naturels")
      .select("departement,code_departement")
      .not("departement", "is", null)
      .range(from, from + PAGE - 1);
    if (error || !data || data.length === 0) break;
    rows.push(
      ...(data as { departement: string | null; code_departement: string | null }[]),
    );
    if (data.length < PAGE) break;
    from += PAGE;
  }
  const map = new Map<
    string,
    { departement: string; code_departement: string | null; count: number }
  >();
  for (const row of rows) {
    if (!row.departement) continue;
    const key = row.departement;
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(key, {
        departement: row.departement,
        code_departement: row.code_departement,
        count: 1,
      });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

/* ───────────────── Slug helpers ───────────────── */

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Construit un slug stable pour les pages détail de site. */
export function siteSlug(site: Pick<SiteListItem, "nom" | "commune">): string {
  const base = [site.nom, communeName(site.commune)].filter(Boolean).join(" ");
  return slugify(base);
}

export function siteHref(site: Pick<SiteListItem, "id" | "nom" | "commune">): string {
  return `/sites/${site.id}/${siteSlug(site)}`;
}

/** Extrait le nom de la commune depuis "Mont-Saxonnex (Haute-Savoie - 74)" */
export function communeName(commune: string | null): string {
  if (!commune) return "";
  return commune.replace(/\s*\(.*?\)\s*$/, "").trim();
}

export function departementHref(
  code: string | null,
  departement: string,
): string {
  const codePart = code ?? slugify(departement);
  return `/sites/dep/${codePart}/${slugify(departement)}`;
}

/* ───────────────── Affichage helpers ───────────────── */

export function formatCotationRange(
  min: string | null,
  max: string | null,
): string {
  if (min && max && min !== max) return `${min} → ${max}`;
  return min || max || "Non renseignée";
}

export function formatTypeSite(t: string | null): string {
  if (!t) return "Site d'escalade";
  return t;
}

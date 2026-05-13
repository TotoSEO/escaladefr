/**
 * Helpers pour les sites naturels d'escalade.
 * Lecture Supabase + génération de slugs SEO.
 */

import { getSupabase } from "@/lib/supabase";

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
};

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
};

const LIST_COLUMNS =
  "id,nom,commune,departement,code_departement,massif,type_site,cotation_min,cotation_max,nombre_voies,latitude,longitude";

const DETAIL_COLUMNS = `${LIST_COLUMNS},url,acces_routier,approche,orientation,cartographie,interet,presentation,rocher,hauteur_min_m,hauteur_max_m,informations_falaise,periodes_favorables,reglementation_particuliere,parking1_lat,parking1_lon,parking2_lat,parking2_lon,bibliographie,derniere_mise_a_jour,presentation_reformule,acces_routier_reformule,approche_reformule,interet_reformule,informations_falaise_reformule,reglementation_reformule,reformule_at`;

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
  const { data, error } = await supabase
    .from("sites_naturels")
    .select(DETAIL_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data as SiteDetail;
}

export async function fetchSitesByDepartement(
  departement: string,
): Promise<SiteListItem[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("sites_naturels")
    .select(LIST_COLUMNS)
    .eq("departement", departement)
    .order("nom");
  if (error) return [];
  return (data as SiteListItem[]) ?? [];
}

export async function fetchDepartements(): Promise<
  { departement: string; code_departement: string | null; count: number }[]
> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("sites_naturels")
    .select("departement,code_departement")
    .not("departement", "is", null);
  if (error) return [];

  const map = new Map<
    string,
    { departement: string; code_departement: string | null; count: number }
  >();
  for (const row of (data ?? []) as {
    departement: string | null;
    code_departement: string | null;
  }[]) {
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

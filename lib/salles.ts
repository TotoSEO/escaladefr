import { getSupabase } from "@/lib/supabase";

export type SalleListItem = {
  id: number;
  nom: string;
  ville: string | null;
  code_postal: string | null;
  chaine: string | null;
  type_pratique: string | null;
  site_web: string | null;
  latitude: number | null;
  longitude: number | null;
  verified_status: "active" | "closed" | "unknown" | "pending" | null;
  verified_at: string | null;
};

const SALLE_LIST_COLUMNS_FULL =
  "id,nom,ville,code_postal,chaine,type_pratique,site_web,latitude,longitude,verified_status,verified_at";
const SALLE_LIST_COLUMNS_BASE =
  "id,nom,ville,code_postal,chaine,type_pratique,site_web,latitude,longitude";

export async function fetchAllSallesForMap(): Promise<SalleListItem[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  async function fetchAll(cols: string): Promise<SalleListItem[] | null> {
    const PAGE = 1000;
    const all: SalleListItem[] = [];
    let from = 0;
    while (true) {
      const { data, error } = await supabase!
        .from("salles_escalade")
        .select(cols)
        .order("nom")
        .range(from, from + PAGE - 1);
      if (error) return null;
      if (!data || data.length === 0) break;
      all.push(...(data as unknown as SalleListItem[]));
      if (data.length < PAGE) break;
      from += PAGE;
    }
    return all;
  }

  // On essaie d'abord avec les colonnes verified_*, fallback sans si elles
  // n'existent pas encore en base.
  let rows = await fetchAll(SALLE_LIST_COLUMNS_FULL);
  if (rows === null) {
    rows = (await fetchAll(SALLE_LIST_COLUMNS_BASE)) ?? [];
    rows = rows.map((r) => ({ ...r, verified_status: null, verified_at: null }));
  }
  return rows.filter((s) => s.verified_status !== "closed");
}

export async function fetchSallesStats(): Promise<{
  total: number;
  active: number;
  unknown: number;
  closed: number;
}> {
  const supabase = getSupabase();
  if (!supabase) return { total: 0, active: 0, unknown: 0, closed: 0 };
  const all: { verified_status: string | null }[] = [];
  const PAGE = 1000;
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from("salles_escalade")
      .select("verified_status")
      .range(from, from + PAGE - 1);
    if (error || !data || data.length === 0) break;
    all.push(...(data as { verified_status: string | null }[]));
    if (data.length < PAGE) break;
    from += PAGE;
  }
  const stats = { total: all.length, active: 0, unknown: 0, closed: 0 };
  for (const r of all) {
    if (r.verified_status === "active") stats.active += 1;
    else if (r.verified_status === "closed") stats.closed += 1;
    else stats.unknown += 1;
  }
  return stats;
}

export function formatPratique(t: string | null): string {
  if (!t) return "Salle d'escalade";
  if (t === "bloc") return "Bloc";
  if (t === "voie") return "Voie";
  if (t === "mixte") return "Voie + bloc";
  return t;
}

export function statusLabel(status: SalleListItem["verified_status"]): string {
  switch (status) {
    case "active":
      return "Vérifiée";
    case "unknown":
      return "À vérifier";
    case "closed":
      return "Fermée";
    case "pending":
      return "En cours";
    default:
      return "Non vérifiée";
  }
}

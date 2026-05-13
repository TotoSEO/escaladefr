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
};

const SALLE_LIST_COLUMNS =
  "id,nom,ville,code_postal,chaine,type_pratique,site_web,latitude,longitude";

export async function fetchAllSallesForMap(): Promise<SalleListItem[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const PAGE = 1000;
  const all: SalleListItem[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from("salles_escalade")
      .select(SALLE_LIST_COLUMNS)
      .order("nom")
      .range(from, from + PAGE - 1);
    if (error || !data || data.length === 0) break;
    all.push(...(data as SalleListItem[]));
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

export function formatPratique(t: string | null): string {
  if (!t) return "Salle d'escalade";
  if (t === "bloc") return "Bloc";
  if (t === "voie") return "Voie";
  if (t === "mixte") return "Voie + bloc";
  return t;
}

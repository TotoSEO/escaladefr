/**
 * Tableaux de conversion des cotations d'escalade.
 *
 * Sources croisées (les correspondances internationales restent indicatives,
 * il n'existe pas de table officielle universellement acceptée) :
 *  - theCrag.com (référence internationale)
 *  - Mountain Equipment Co-op (MEC), Wikipedia FR, alpiniste.fr
 *  - Pratique courante des grimpeurs et topo-guides français
 *
 * La présence d'un séparateur "/" indique une plage d'équivalence
 * (ex. "VI+/VII-") quand la correspondance varie selon les sources.
 */

export type RouteGrade = {
  fr: string;
  uiaa: string;
  yds: string;
  britTech: string;
  britAdj: string;
};

export type BoulderGrade = {
  font: string;
  v: string;
};

export const ROUTE_GRADES: RouteGrade[] = [
  { fr: "3",   uiaa: "III",        yds: "5.4",   britTech: "—",  britAdj: "Mod" },
  { fr: "3+",  uiaa: "III+",       yds: "5.5",   britTech: "—",  britAdj: "Diff" },
  { fr: "4",   uiaa: "IV",         yds: "5.6",   britTech: "—",  britAdj: "VDiff" },
  { fr: "4+",  uiaa: "IV+",        yds: "5.7",   britTech: "—",  britAdj: "Sev" },
  { fr: "5a",  uiaa: "V",          yds: "5.8",   britTech: "4a", britAdj: "HS" },
  { fr: "5b",  uiaa: "V+",         yds: "5.9",   britTech: "4b", britAdj: "VS" },
  { fr: "5c",  uiaa: "VI-",        yds: "5.10a", britTech: "4c", britAdj: "HVS" },
  { fr: "6a",  uiaa: "VI",         yds: "5.10b", britTech: "5a", britAdj: "E1" },
  { fr: "6a+", uiaa: "VI+",        yds: "5.10c", britTech: "5a", britAdj: "E1" },
  { fr: "6b",  uiaa: "VI+/VII-",   yds: "5.10d", britTech: "5b", britAdj: "E2" },
  { fr: "6b+", uiaa: "VII-",       yds: "5.11a", britTech: "5b", britAdj: "E2" },
  { fr: "6c",  uiaa: "VII",        yds: "5.11b", britTech: "5c", britAdj: "E3" },
  { fr: "6c+", uiaa: "VII+",       yds: "5.11c", britTech: "5c", britAdj: "E3" },
  { fr: "7a",  uiaa: "VII+/VIII-", yds: "5.11d", britTech: "6a", britAdj: "E4" },
  { fr: "7a+", uiaa: "VIII-",      yds: "5.12a", britTech: "6a", britAdj: "E4" },
  { fr: "7b",  uiaa: "VIII",       yds: "5.12b", britTech: "6a", britAdj: "E5" },
  { fr: "7b+", uiaa: "VIII+",      yds: "5.12c", britTech: "6b", britAdj: "E5" },
  { fr: "7c",  uiaa: "VIII+/IX-",  yds: "5.12d", britTech: "6b", britAdj: "E5/E6" },
  { fr: "7c+", uiaa: "IX-",        yds: "5.13a", britTech: "6b", britAdj: "E6" },
  { fr: "8a",  uiaa: "IX",         yds: "5.13b", britTech: "6c", britAdj: "E6" },
  { fr: "8a+", uiaa: "IX+",        yds: "5.13c", britTech: "6c", britAdj: "E7" },
  { fr: "8b",  uiaa: "IX+/X-",     yds: "5.13d", britTech: "7a", britAdj: "E7" },
  { fr: "8b+", uiaa: "X-",         yds: "5.14a", britTech: "7a", britAdj: "E8" },
  { fr: "8c",  uiaa: "X",          yds: "5.14b", britTech: "7a", britAdj: "E8" },
  { fr: "8c+", uiaa: "X+",         yds: "5.14c", britTech: "7b", britAdj: "E9" },
  { fr: "9a",  uiaa: "X+/XI-",     yds: "5.14d", britTech: "7b", britAdj: "E9" },
  { fr: "9a+", uiaa: "XI-",        yds: "5.15a", britTech: "7c", britAdj: "E10" },
  { fr: "9b",  uiaa: "XI",         yds: "5.15b", britTech: "7c", britAdj: "E10" },
  { fr: "9b+", uiaa: "XI+",        yds: "5.15c", britTech: "7c", britAdj: "E11" },
  { fr: "9c",  uiaa: "XII-",       yds: "5.15d", britTech: "7c", britAdj: "E11" },
];

export const BOULDER_GRADES: BoulderGrade[] = [
  { font: "3",   v: "VB" },
  { font: "4",   v: "V0-" },
  { font: "4+",  v: "V0" },
  { font: "5",   v: "V0+" },
  { font: "5+",  v: "V1" },
  { font: "6A",  v: "V2" },
  { font: "6A+", v: "V3" },
  { font: "6B",  v: "V3" },
  { font: "6B+", v: "V4" },
  { font: "6C",  v: "V4" },
  { font: "6C+", v: "V5" },
  { font: "7A",  v: "V6" },
  { font: "7A+", v: "V7" },
  { font: "7B",  v: "V8" },
  { font: "7B+", v: "V8" },
  { font: "7C",  v: "V9" },
  { font: "7C+", v: "V10" },
  { font: "8A",  v: "V11" },
  { font: "8A+", v: "V12" },
  { font: "8B",  v: "V13" },
  { font: "8B+", v: "V14" },
  { font: "8C",  v: "V15" },
  { font: "8C+", v: "V16" },
  { font: "9A",  v: "V17" },
];

export const ROUTE_LEVELS = {
  fr: {
    label: "Français",
    short: "FR",
    description: "Standard de l'escalade sportive. Utilisé en France, Espagne, Italie, et internationalement sur les sites équipés.",
  },
  uiaa: {
    label: "UIAA",
    short: "UIAA",
    description: "Système de la Fédération internationale. Très répandu en Allemagne, Autriche, Suisse, Europe centrale.",
  },
  yds: {
    label: "Yosemite (USA)",
    short: "YDS",
    description: "Yosemite Decimal System. La référence aux États-Unis, au Canada, en Amérique latine.",
  },
  britTech: {
    label: "Britannique tech.",
    short: "GB tech",
    description: "Cotation technique britannique. Évalue la difficulté du mouvement le plus dur de la voie.",
  },
  britAdj: {
    label: "Britannique adj.",
    short: "GB E",
    description: "Cotation d'engagement britannique (E-grade). Combine difficulté technique, sérieux et qualité de la protection.",
  },
} as const;

export const BOULDER_LEVELS = {
  font: {
    label: "Fontainebleau",
    short: "Font",
    description: "Standard mondial du bloc, né dans la forêt de Fontainebleau. Échelle de 3 à 9A.",
  },
  v: {
    label: "V-scale (Hueco)",
    short: "V-scale",
    description: "Échelle née à Hueco Tanks, Texas. Utilisée aux États-Unis et largement dans les salles.",
  },
} as const;

export type RouteSystem = keyof typeof ROUTE_LEVELS;
export type BoulderSystem = keyof typeof BOULDER_LEVELS;

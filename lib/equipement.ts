import { promises as fs } from "fs";
import path from "path";

/* ───── Types ───── */

export type AffiliateProduct = {
  /** Identifiant interne unique pour le produit dans la LP. */
  id: string;
  /** Nom commercial du produit (ex. "La Sportiva Tarantula"). */
  name: string;
  /** Marque (ex. "La Sportiva"). */
  brand: string;
  /** Slogan court / accroche (1 ligne). */
  tagline?: string;
  /** Note moyenne (sur 5), affichée en étoiles. */
  rating?: number;
  /** Nombre d'avis cumulés (sources marchands + blogs). */
  reviewCount?: number;
  /** Prix indicatif en euros (médiane constatée). */
  priceFrom?: number;
  /** Image principale du produit (chemin public ou URL absolue). */
  image: string;
  /** Alt text descriptif obligatoire. */
  imageAlt: string;
  /** Liste des points forts (3-6 items). */
  pros: string[];
  /** Liste des points faibles (1-3 items). */
  cons?: string[];
  /** Description éditoriale (2-4 phrases). */
  description: string;
  /** Profil cible : "débutant" | "intermédiaire" | "expert" | "polyvalent". */
  level?: "débutant" | "intermédiaire" | "expert" | "polyvalent";
  /** Liens d'affiliation par marchand. */
  links: {
    /** Nom affiché du marchand (ex. "Snowleader", "Decathlon"). */
    merchant: string;
    /** URL d'affiliation. Sera rendue avec rel="sponsored nofollow noopener". */
    url: string;
    /** Prix éventuellement spécifique au marchand. */
    price?: number;
  }[];
  /** Tag éditorial : "top-rated" | "best-value" | "editor-choice" | "premium". */
  badge?: "top-rated" | "best-value" | "editor-choice" | "premium";
};

export type AffiliateFaqItem = { q: string; a: string };

export type AffiliateContentBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; html: string }
  | { type: "list"; title?: string; items: { title?: string; body: string }[] }
  | { type: "table"; caption?: string; headers: string[]; rows: string[][] }
  | { type: "callout"; title: string; body: string; tone?: "info" | "warn" };

export type AffiliateLanding = {
  /** URL slug (ex. "chaussons-escalade-debutant"). */
  slug: string;
  /** Catégorie produit (ex. "chaussons", "baudriers", "cordes"). */
  category:
    | "chaussons"
    | "baudriers"
    | "cordes"
    | "casques"
    | "degaines"
    | "assurage"
    | "magnesie"
    | "crashpads"
    | "hangboards"
    | "vetements";
  /** Title HTML (50-65 char). */
  title: string;
  /** H1 sur la page. */
  h1: string;
  /** Meta description (120-160 char). */
  description: string;
  /** Sous-titre éditorial sous le H1. */
  subtitle: string;
  /** Année de référence affichée (ex. 2026). */
  year: number;
  /** Date de dernière mise à jour ISO. */
  updatedAt: string;
  /** Image hero de la LP. */
  heroImage: string;
  heroImageAlt: string;
  /** Sélection produits (3-8 items recommandés). */
  products: AffiliateProduct[];
  /** Bloc éditorial principal (méthodologie, critères, conseils). */
  content: AffiliateContentBlock[];
  /** FAQ pour rich snippet Google. */
  faq: AffiliateFaqItem[];
  /** Articles blog liés (slugs). */
  relatedBlogSlugs?: string[];
};

/* ───── Helpers I/O (server-only) ───── */

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data", "equipement");

async function readLandingFile(slug: string): Promise<AffiliateLanding | null> {
  const file = path.join(DATA_DIR, `${slug}.json`);
  try {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw) as AffiliateLanding;
  } catch {
    return null;
  }
}

export async function fetchAffiliateLanding(slug: string): Promise<AffiliateLanding | null> {
  return readLandingFile(slug);
}

export async function fetchAllAffiliateLandings(): Promise<AffiliateLanding[]> {
  try {
    const files = await fs.readdir(DATA_DIR);
    const json = files.filter((f) => f.endsWith(".json"));
    const out: AffiliateLanding[] = [];
    for (const f of json) {
      const slug = f.replace(/\.json$/, "");
      const lp = await readLandingFile(slug);
      if (lp) out.push(lp);
    }
    return out;
  } catch {
    return [];
  }
}

export const CATEGORY_LABEL: Record<AffiliateLanding["category"], string> = {
  chaussons: "Chaussons",
  baudriers: "Baudriers",
  cordes: "Cordes",
  casques: "Casques",
  degaines: "Dégaines",
  assurage: "Systèmes d'assurage",
  magnesie: "Magnésie",
  crashpads: "Crashpads",
  hangboards: "Hangboards",
  vetements: "Vêtements",
};

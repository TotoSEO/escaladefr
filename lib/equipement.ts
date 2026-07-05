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
  /** Liens marchands (non affiliés, non rémunérés). */
  links: {
    /** Nom affiché du marchand (ex. "Hardloop", "Alpinstore"). */
    merchant: string;
    /** URL de la fiche produit. Sera rendue avec rel="nofollow noopener". */
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

/* ───── Pages avis (test long format d'un produit) ───── */

export type EquipementReview = {
  /** URL slug après /equipement/avis/ (ex. "baudrier-petzl-corax"). */
  slug: string;
  /** Catégorie produit, alignée sur AffiliateLanding["category"]. */
  category: AffiliateLanding["category"];
  /** Nom commercial exact du produit testé. */
  productName: string;
  brand: string;
  /** Title HTML (50-65 char), format "Avis <produit> (2026) : …". */
  title: string;
  h1: string;
  /** Meta description (120-160 char). */
  description: string;
  /** Chapo éditorial sous le H1 (2-3 phrases). */
  chapo: string;
  /** Note d'Antoine sur 5 (ex. 4.5). */
  rating: number;
  /** Verdict en une ou deux phrases, affiché en encadré et repris par les LLMs. */
  verdict: string;
  /** Contexte de test affiché (ex. "8 mois d'utilisation, salle et falaise"). */
  testContext: string;
  /** Prix indicatif constaté (euros). */
  priceFrom?: number;
  publishedAt: string;
  updatedAt: string;
  image: string;
  imageAlt: string;
  pros: string[];
  cons: string[];
  /** Corps de l'avis (mêmes blocs que les LP). */
  sections: AffiliateContentBlock[];
  /** Alternatives comparées en fin d'avis. */
  alternatives?: {
    name: string;
    comment: string;
    /** Lien interne éventuel (autre avis ou LP). */
    href?: string;
  }[];
  faq?: AffiliateFaqItem[];
  /** Liens marchands (non affiliés). */
  links: { merchant: string; url: string; price?: number }[];
  /** LP "meilleurs …" liée pour le maillage. */
  relatedLandingSlug?: string;
  /** id du produit correspondant dans la LP liée (pour lier LP → avis). */
  productId?: string;
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

const REVIEWS_DIR = path.join(ROOT, "data", "equipement", "avis");

export async function fetchEquipementReview(
  slug: string,
): Promise<EquipementReview | null> {
  const file = path.join(REVIEWS_DIR, `${slug}.json`);
  try {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw) as EquipementReview;
  } catch {
    return null;
  }
}

export async function fetchAllEquipementReviews(): Promise<EquipementReview[]> {
  try {
    const files = await fs.readdir(REVIEWS_DIR);
    const out: EquipementReview[] = [];
    for (const f of files.filter((n) => n.endsWith(".json"))) {
      const review = await fetchEquipementReview(f.replace(/\.json$/, ""));
      if (review) out.push(review);
    }
    // Les plus récents d'abord (date de mise à jour).
    return out.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
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

/* ───── Politiques marchand pour JSON-LD Product ───── */

// Politiques publiques constatées sur les CGV des marchands (mai 2026).
// On les expose dans le schema Offer pour satisfaire l'exigence Google
// "merchant listing" (shippingDetails + hasMerchantReturnPolicy) tout en
// déclarant explicitement le seller — le site n'est pas vendeur et n'a
// aucun lien commercial avec ces marchands.
type MerchantPolicy = {
  url: string;
  shippingThreshold: number;
  shippingRate: number;
  returnDays: number;
};

const MERCHANT_POLICIES: Record<string, MerchantPolicy> = {
  Snowleader: {
    url: "https://www.snowleader.com",
    shippingThreshold: 50,
    shippingRate: 4.95,
    returnDays: 30,
  },
  Hardloop: {
    url: "https://www.hardloop.fr",
    shippingThreshold: 60,
    shippingRate: 4.9,
    returnDays: 30,
  },
  Decathlon: {
    url: "https://www.decathlon.fr",
    shippingThreshold: 30,
    shippingRate: 3.9,
    returnDays: 365,
  },
};

export function buildOfferMerchantFields(merchant: string | undefined) {
  if (!merchant) return {};
  const policy = MERCHANT_POLICIES[merchant];
  if (!policy) return {};

  return {
    seller: {
      "@type": "Organization",
      name: merchant,
      url: policy.url,
    },
    shippingDetails: {
      "@type": "OfferShippingDetails",
      shippingRate: {
        "@type": "MonetaryAmount",
        value: policy.shippingRate,
        currency: "EUR",
      },
      shippingDestination: {
        "@type": "DefinedRegion",
        addressCountry: "FR",
      },
      deliveryTime: {
        "@type": "ShippingDeliveryTime",
        handlingTime: {
          "@type": "QuantitativeValue",
          minValue: 0,
          maxValue: 1,
          unitCode: "DAY",
        },
        transitTime: {
          "@type": "QuantitativeValue",
          minValue: 2,
          maxValue: 4,
          unitCode: "DAY",
        },
      },
    },
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "FR",
      returnPolicyCategory:
        "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: policy.returnDays,
      returnMethod: "https://schema.org/ReturnByMail",
      returnFees: "https://schema.org/FreeReturn",
    },
  };
}

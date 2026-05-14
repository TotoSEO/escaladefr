/**
 * Lecture des articles de blog depuis Supabase.
 * Stocke les articles avec body_blocks JSON (rich content typé).
 */

import fs from "node:fs";
import path from "node:path";

import { getSupabase } from "@/lib/supabase";

export type Cocon =
  | "techniques"
  | "materiel"
  | "noeuds"
  | "sites"
  | "personnalites"
  | "preparation"
  | "securite"
  | "environnement"
  | "culture";

export type ArticleType = "hub" | "guide" | "liste" | "profil" | "astuce";

export type FaqItem = { q: string; a: string };

export type InternalLink = {
  slug: string;
  anchor: string;
  /** Contexte pour le rédacteur, pas affiché. */
  context?: string;
};

/* ───── Blocs typés du body ───── */

export type BlockH2 = { type: "h2"; text: string; id?: string };
export type BlockH3 = { type: "h3"; text: string; id?: string };
export type BlockP = { type: "p"; html: string };
export type BlockTable = {
  type: "table";
  caption?: string;
  headers: string[];
  rows: string[][];
};
export type BlockImageText = {
  type: "image_text";
  image: string; // chemin /public ou URL absolue
  alt: string;
  caption?: string;
  text: string;
  position?: "left" | "right";
};
export type BlockList = {
  type: "list";
  /** "numbered" | "bullets" | "cards" */
  variant: "numbered" | "bullets" | "cards";
  title?: string;
  items: {
    title?: string;
    body: string;
  }[];
};
export type BlockQuote = {
  type: "quote";
  text: string;
  author?: string;
  role?: string;
};
export type BlockTip = {
  type: "tip";
  title: string;
  body: string;
  /** 'astuce' | 'attention' | 'erreur' */
  tone?: "astuce" | "attention" | "erreur";
};

export type BlogBlock =
  | BlockH2
  | BlockH3
  | BlockP
  | BlockTable
  | BlockImageText
  | BlockList
  | BlockQuote
  | BlockTip;

/* ───── Type article complet ───── */

export type BlogArticleListItem = {
  id: number;
  slug: string;
  cocon: Cocon;
  type_article: ArticleType;
  title: string;
  h1: string;
  description: string;
  chapo: string;
  cover_image: string;
  cover_alt: string;
  word_count: number | null;
  published_at: string;
  scheduled_at: string;
};

export type BlogArticle = BlogArticleListItem & {
  takeaways: string[];
  body_blocks: BlogBlock[];
  faq: FaqItem[] | null;
  internal_links: InternalLink[] | null;
  author_name: string;
  author_url: string;
};

const LIST_COLS =
  "id,slug,cocon,type_article,title,h1,description,chapo,cover_image,cover_alt,word_count,published_at,scheduled_at";
const FULL_COLS = `${LIST_COLS},takeaways,body_blocks,faq,internal_links,author_name,author_url`;

/* ───── Fetch helpers ───── */

export async function fetchPublishedArticles(
  limit?: number,
  cocon?: Cocon,
): Promise<BlogArticleListItem[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  let q = supabase
    .from("blog_articles")
    .select(LIST_COLS)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });
  if (cocon) q = q.eq("cocon", cocon);
  if (limit) q = q.limit(limit);
  const { data, error } = await q;
  if (error || !data) return [];
  return data as BlogArticleListItem[];
}

export async function fetchArticleBySlug(
  slug: string,
): Promise<BlogArticle | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("blog_articles")
    .select(FULL_COLS)
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();
  if (error || !data) return null;

  const article = data as BlogArticle;

  // Liens internes auto-résolus : <a href='/blog/<slug>'> n'est conservé
  // que si la cible est elle-même publiée. Sinon le lien est réduit à son
  // texte d'ancre seul (évite les 404 sur les articles publiés en avance
  // dans le calendrier).
  const publishedSet = await fetchPublishedSlugsSet();
  article.body_blocks = resolveInternalLinks(article.body_blocks, publishedSet);

  // Cover fallback : si l'image définitive n'est pas encore générée
  // (job background gpt-image-2 toujours en cours), on sert un placeholder
  // brand. Dès que le fichier final apparaît au même chemin /blog/<slug>.webp,
  // il remplace automatiquement le placeholder au prochain build.
  article.cover_image = resolveCoverImage(article.cover_image, slug);

  return article;
}

const PLACEHOLDER_COVER = "/blog/_placeholder.webp";
let _coverCache: Set<string> | null = null;

function listAvailableCovers(): Set<string> {
  if (_coverCache !== null) return _coverCache;
  try {
    const dir = path.join(process.cwd(), "public", "blog");
    const files = fs.readdirSync(dir);
    _coverCache = new Set(files.filter((f) => f.endsWith(".webp")));
  } catch {
    _coverCache = new Set();
  }
  return _coverCache;
}

export function resolveCoverImage(declared: string, slug: string): string {
  if (typeof window !== "undefined") return declared; // côté client : trust DB
  const filename = `${slug}.webp`;
  const covers = listAvailableCovers();
  if (covers.has(filename)) return declared;
  return PLACEHOLDER_COVER;
}

async function fetchPublishedSlugsSet(): Promise<Set<string>> {
  const slugs = await fetchArticleSlugs();
  return new Set(slugs.map((s) => s.slug));
}

function resolveInternalLinks(
  blocks: BlogBlock[],
  publishedSlugs: Set<string>,
): BlogBlock[] {
  return blocks.map((b) => {
    if (b.type !== "p" || !b.html) return b;
    const fixed = b.html.replace(
      /<a\s+href="\/blog\/([^"]+)"[^>]*>([^<]+)<\/a>/g,
      (_m, targetSlug: string, anchor: string) => {
        return publishedSlugs.has(targetSlug)
          ? `<a href="/blog/${targetSlug}">${anchor}</a>`
          : anchor;
      },
    );
    return { ...b, html: fixed };
  });
}

export async function fetchArticleSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("blog_articles")
    .select("slug,published_at")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString());
  if (error || !data) return [];
  return data.map((r) => ({ slug: r.slug as string, updated_at: r.published_at as string }));
}

export async function fetchRelatedArticles(
  cocon: Cocon,
  excludeSlug: string,
  limit = 4,
): Promise<BlogArticleListItem[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("blog_articles")
    .select(LIST_COLS)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .eq("cocon", cocon)
    .neq("slug", excludeSlug)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data as BlogArticleListItem[];
}

/* ───── Affichage / labels ───── */

export const COCON_LABEL: Record<Cocon, string> = {
  techniques: "Techniques",
  materiel: "Matériel",
  noeuds: "Nœuds",
  sites: "Sites",
  personnalites: "Personnalités",
  preparation: "Préparation",
  securite: "Sécurité",
  environnement: "Environnement",
  culture: "Culture",
};

export const COCON_SLUG: Record<Cocon, string> = {
  techniques: "techniques",
  materiel: "materiel",
  noeuds: "noeuds",
  sites: "sites-mythiques",
  personnalites: "personnalites",
  preparation: "preparation",
  securite: "securite",
  environnement: "environnement",
  culture: "culture",
};

export function cocronTo(c: Cocon): { label: string; slug: string } {
  return { label: COCON_LABEL[c], slug: COCON_SLUG[c] };
}

export function articleHref(slug: string): string {
  return `/blog/${slug}`;
}

export function coconHref(c: Cocon): string {
  return `/blog/cocon/${COCON_SLUG[c]}`;
}

/** Trouve le cocon depuis son slug d'URL (inverse de COCON_SLUG). */
export function coconFromSlug(slug: string): Cocon | null {
  for (const [k, v] of Object.entries(COCON_SLUG)) {
    if (v === slug) return k as Cocon;
  }
  return null;
}

/** Description SEO de chaque cocon, utilisée sur la page d'index dédiée. */
export const COCON_DESCRIPTION: Record<Cocon, string> = {
  techniques:
    "Tout pour progresser en escalade : techniques de pied, lecture de voie, dyno, crochets de talon, gestion du dévers, mental, transition salle vers falaise.",
  materiel:
    "Chaussons, baudriers, cordes, casques, dégaines, systèmes d'assurage : panorama complet du matériel d'escalade en 2026, avec tests et entretien.",
  noeuds:
    "Les nœuds essentiels en escalade : huit, cabestan, demi-cabestan, prussik, machard, jonctions de rappel et auto-bloquants en grande voie.",
  sites:
    "Les sites d'escalade emblématiques de France : Verdon, Céüse, Bleau, Calanques, Sainte-Victoire, Buoux, Annot, Corse et confidentiels.",
  personnalites:
    "Portraits des grimpeurs et grimpeuses qui ont marqué l'histoire de l'escalade : Edlinger, Destivelle, Ondra, Garnbret, Honnold, Messner et autres.",
  preparation:
    "Préparation physique et mentale du grimpeur : musculation, hangboard, gainage, endurance, étirements, alimentation, sommeil, gestion du stress.",
  securite:
    "Sécurité en escalade : triple vérification, gestion de la chute, facteurs de chute, premiers secours, alerte des secours, hélitreuillage, météo.",
  environnement:
    "Grimper en respectant les sites : nidification, arrêtés préfectoraux, conventions départementales, parcs nationaux, magnésie, rocher fragile.",
  culture:
    "Histoire et culture de l'escalade : JO de Paris 2024, Fontainebleau, vie des grimpeurs pros, films cultes, livres de référence.",
};

const FR_MONTH_FULL = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

export function formatPublishedDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${FR_MONTH_FULL[d.getMonth()]} ${d.getFullYear()}`;
}

export function readingTimeMinutes(wordCount: number | null): number {
  if (!wordCount || wordCount < 1) return 1;
  return Math.max(1, Math.round(wordCount / 230));
}

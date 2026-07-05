/**
 * Index de sitemaps : référence les 4 sous-sitemaps thématiques.
 * Chaque sous-sitemap porte ses propres dates de modification réelles.
 */

import { fetchArticleSlugs } from "@/lib/blog";
import {
  fetchAllAffiliateLandings,
  fetchAllEquipementReviews,
} from "@/lib/equipement";
import { SITE, buildSitemapIndexXml, xmlResponse } from "@/lib/sitemap";

export const revalidate = 3600;

export async function GET(): Promise<Response> {
  // lastmod de chaque sous-sitemap = contenu le plus récent qu'il contient.
  let blogLastmod: string | undefined;
  let equipementLastmod: string | undefined;
  try {
    const [articles, landings, reviews] = await Promise.all([
      fetchArticleSlugs(),
      fetchAllAffiliateLandings(),
      fetchAllEquipementReviews(),
    ]);
    blogLastmod = articles
      .map((a) => a.updated_at)
      .sort()
      .at(-1);
    equipementLastmod = [
      ...landings.map((l) => l.updatedAt),
      ...reviews.map((r) => r.updatedAt),
    ]
      .sort()
      .at(-1);
  } catch {
    // Index toujours servi, même sans lastmod.
  }

  const xml = buildSitemapIndexXml([
    { url: `${SITE}/sitemap-sites-escalade.xml` },
    { url: `${SITE}/sitemap-blog.xml`, lastmod: blogLastmod },
    { url: `${SITE}/sitemap-equipement.xml`, lastmod: equipementLastmod },
    { url: `${SITE}/sitemap-pages.xml` },
  ]);
  return xmlResponse(xml);
}

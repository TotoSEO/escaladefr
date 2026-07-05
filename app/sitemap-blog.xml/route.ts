/**
 * Sitemap du blog : hub /blog, pages catégories, articles.
 * lastmod des articles = dernière publication/mise à jour connue.
 */

import { COCON_SLUG, fetchArticleSlugs } from "@/lib/blog";
import { SITE, buildUrlsetXml, xmlResponse, type SitemapUrlEntry } from "@/lib/sitemap";

export const revalidate = 3600;

export async function GET(): Promise<Response> {
  const entries: SitemapUrlEntry[] = [];
  let latest: string | undefined;

  let articles: { slug: string; updated_at: string }[] = [];
  try {
    articles = await fetchArticleSlugs();
    latest = articles
      .map((a) => a.updated_at)
      .sort()
      .at(-1);
  } catch {
    // Blog vide : on liste quand même les hubs.
  }

  entries.push({
    url: `${SITE}/blog`,
    lastmod: latest,
    changefreq: "weekly",
    priority: 0.8,
  });

  for (const slug of Object.values(COCON_SLUG)) {
    entries.push({
      url: `${SITE}/blog/categorie/${slug}`,
      changefreq: "weekly",
      priority: 0.7,
    });
  }

  for (const a of articles) {
    entries.push({
      url: `${SITE}/blog/${a.slug}`,
      lastmod: a.updated_at,
      changefreq: "monthly",
      priority: 0.75,
    });
  }

  return xmlResponse(buildUrlsetXml(entries));
}

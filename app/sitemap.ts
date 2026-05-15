import type { MetadataRoute } from "next";

import { COCON_SLUG, fetchArticleSlugs } from "@/lib/blog";
import {
  fetchAllSitesForMap,
  fetchDepartements,
  siteSlug,
  slugify,
} from "@/lib/sites";

const SITE = "https://escalade-france.fr";

export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE}/sites`, lastModified: now, changeFrequency: "daily", priority: 0.95 },
    { url: `${SITE}/sites/fermes-et-restrictions`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE}/salles`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE}/outils`, lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${SITE}/outils/cotations`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${SITE}/outils/meteo`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
    { url: `${SITE}/outils/jonctions`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE}/glossaire-escalade`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${SITE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    ...Object.values(COCON_SLUG).map((s) => ({
      url: `${SITE}/blog/categorie/${s}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    { url: `${SITE}/boutique`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/a-propos`, lastModified: now, changeFrequency: "monthly", priority: 0.75 },
    { url: `${SITE}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE}/mentions-legales`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Routes dynamiques : départements + sites individuels + articles blog.
  try {
    const [sites, departements, articles] = await Promise.all([
      fetchAllSitesForMap(),
      fetchDepartements(),
      fetchArticleSlugs(),
    ]);

    const departementEntries: MetadataRoute.Sitemap = departements
      .filter((d) => d.code_departement)
      .map((d) => ({
        url: `${SITE}/sites/dep/${d.code_departement}/${slugify(d.departement)}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.75,
      }));

    const siteEntries: MetadataRoute.Sitemap = sites.map((s) => ({
      url: `${SITE}/sites/${s.id}/${siteSlug(s)}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    const articleEntries: MetadataRoute.Sitemap = articles.map((a) => ({
      url: `${SITE}/blog/${a.slug}`,
      lastModified: new Date(a.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.75,
    }));

    return [...staticEntries, ...departementEntries, ...siteEntries, ...articleEntries];
  } catch {
    return staticEntries;
  }
}

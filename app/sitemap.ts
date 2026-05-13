import type { MetadataRoute } from "next";

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
    { url: `${SITE}/glossaire-escalade`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${SITE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE}/boutique`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE}/mentions-legales`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Routes dynamiques : départements + sites individuels.
  // Si Supabase n'est pas configuré, on retombe sur les statics seules.
  try {
    const [sites, departements] = await Promise.all([
      fetchAllSitesForMap(),
      fetchDepartements(),
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

    return [...staticEntries, ...departementEntries, ...siteEntries];
  } catch {
    return staticEntries;
  }
}

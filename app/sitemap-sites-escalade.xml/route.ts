/**
 * Sitemap des sites naturels d'escalade : hub /sites, pages départements,
 * pages détail de site, sites fermés/restrictions.
 */

import {
  fetchIndexableSitesForSitemap,
  fetchDepartements,
  siteSlug,
  slugify,
} from "@/lib/sites";
import { SITE, buildUrlsetXml, xmlResponse, type SitemapUrlEntry } from "@/lib/sitemap";

export const revalidate = 86400;

export async function GET(): Promise<Response> {
  const entries: SitemapUrlEntry[] = [
    { url: `${SITE}/sites`, changefreq: "daily", priority: 0.95 },
    {
      url: `${SITE}/sites/fermes-et-restrictions`,
      changefreq: "weekly",
      priority: 0.6,
    },
  ];

  try {
    const [sites, departements] = await Promise.all([
      fetchIndexableSitesForSitemap(),
      fetchDepartements(),
    ]);

    for (const d of departements) {
      if (!d.code_departement) continue;
      entries.push({
        url: `${SITE}/sites/dep/${d.code_departement}/${slugify(d.departement)}`,
        changefreq: "weekly",
        priority: 0.75,
      });
    }

    for (const s of sites) {
      entries.push({
        url: `${SITE}/sites/${s.id}/${siteSlug(s)}`,
        changefreq: "monthly",
        priority: 0.6,
      });
    }
  } catch {
    // On sert au minimum les pages hub.
  }

  return xmlResponse(buildUrlsetXml(entries));
}

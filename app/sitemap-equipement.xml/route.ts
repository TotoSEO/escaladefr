/**
 * Sitemap équipement : hub /equipement, comparatifs "meilleurs …",
 * index des avis et pages avis. lastmod = updatedAt réel de chaque page.
 */

import {
  fetchAllAffiliateLandings,
  fetchAllEquipementReviews,
} from "@/lib/equipement";
import { SITE, buildUrlsetXml, xmlResponse, type SitemapUrlEntry } from "@/lib/sitemap";

export const revalidate = 3600;

export async function GET(): Promise<Response> {
  const [landings, reviews] = await Promise.all([
    fetchAllAffiliateLandings(),
    fetchAllEquipementReviews(),
  ]);

  const allDates = [
    ...landings.map((l) => l.updatedAt),
    ...reviews.map((r) => r.updatedAt),
  ].sort();

  const entries: SitemapUrlEntry[] = [
    {
      url: `${SITE}/equipement`,
      lastmod: allDates.at(-1),
      changefreq: "weekly",
      priority: 0.8,
    },
    ...landings.map((l): SitemapUrlEntry => ({
      url: `${SITE}/equipement/${l.slug}`,
      lastmod: l.updatedAt,
      changefreq: "monthly",
      priority: 0.75,
    })),
  ];

  if (reviews.length > 0) {
    entries.push({
      url: `${SITE}/equipement/avis`,
      lastmod: reviews.map((r) => r.updatedAt).sort().at(-1),
      changefreq: "weekly",
      priority: 0.7,
    });
    for (const r of reviews) {
      entries.push({
        url: `${SITE}/equipement/avis/${r.slug}`,
        lastmod: r.updatedAt,
        changefreq: "monthly",
        priority: 0.7,
      });
    }
  }

  return xmlResponse(buildUrlsetXml(entries));
}

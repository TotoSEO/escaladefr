/**
 * Sitemap des pages restantes : accueil, salles, outils, glossaire,
 * à-propos, contact, mentions légales.
 */

import {
  SITE,
  STATIC_PAGES_LASTMOD,
  buildUrlsetXml,
  xmlResponse,
  type SitemapUrlEntry,
} from "@/lib/sitemap";

export const revalidate = 86400;

const PAGES: {
  path: string;
  changefreq: SitemapUrlEntry["changefreq"];
  priority: number;
}[] = [
  { path: "/", changefreq: "daily", priority: 1.0 },
  { path: "/salles", changefreq: "weekly", priority: 0.9 },
  { path: "/outils", changefreq: "weekly", priority: 0.85 },
  { path: "/outils/cotations", changefreq: "monthly", priority: 0.85 },
  { path: "/outils/meteo", changefreq: "daily", priority: 0.85 },
  { path: "/outils/jonctions", changefreq: "monthly", priority: 0.7 },
  { path: "/glossaire-escalade", changefreq: "monthly", priority: 0.85 },
  { path: "/a-propos", changefreq: "monthly", priority: 0.75 },
  { path: "/contact", changefreq: "yearly", priority: 0.4 },
  { path: "/mentions-legales", changefreq: "yearly", priority: 0.3 },
];

export function GET(): Response {
  const entries: SitemapUrlEntry[] = PAGES.map((p) => ({
    url: `${SITE}${p.path === "/" ? "/" : p.path}`,
    lastmod: STATIC_PAGES_LASTMOD[p.path],
    changefreq: p.changefreq,
    priority: p.priority,
  }));
  return xmlResponse(buildUrlsetXml(entries));
}

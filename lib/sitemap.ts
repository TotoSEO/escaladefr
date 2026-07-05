/**
 * Helpers de génération des sitemaps XML.
 *
 * Le sitemap du site est découpé en 4 sous-sitemaps référencés par un index
 * (/sitemap.xml) :
 *   - /sitemap-sites-escalade.xml : annuaire des sites naturels + départements
 *   - /sitemap-blog.xml           : blog, catégories et articles
 *   - /sitemap-equipement.xml     : hub équipement, comparatifs et avis
 *   - /sitemap-pages.xml          : le reste (accueil, salles, outils, glossaire…)
 *
 * Règle lastmod : on n'émet une date QUE lorsqu'on la connaît vraiment
 * (updatedAt des contenus). Jamais de "new Date()" globale — une date de
 * modification identique sur toutes les pages est ignorée par Google et
 * fait perdre la confiance dans le champ.
 */

export const SITE = "https://www.escalade-france.fr";

export type SitemapUrlEntry = {
  /** URL absolue. */
  url: string;
  /** Date ISO de dernière modification réelle du contenu (optionnelle). */
  lastmod?: string;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Formate une date ISO en YYYY-MM-DD (suffisant pour un sitemap). */
export function toLastmod(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function buildUrlsetXml(entries: SitemapUrlEntry[]): string {
  const body = entries
    .map((e) => {
      const parts = [`    <loc>${escapeXml(e.url)}</loc>`];
      if (e.lastmod) {
        const lastmod = toLastmod(e.lastmod);
        if (lastmod) parts.push(`    <lastmod>${lastmod}</lastmod>`);
      }
      if (e.changefreq) parts.push(`    <changefreq>${e.changefreq}</changefreq>`);
      if (e.priority !== undefined)
        parts.push(`    <priority>${e.priority.toFixed(2)}</priority>`);
      return `  <url>\n${parts.join("\n")}\n  </url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export function buildSitemapIndexXml(
  sitemaps: { url: string; lastmod?: string }[],
): string {
  const body = sitemaps
    .map((s) => {
      const parts = [`    <loc>${escapeXml(s.url)}</loc>`];
      if (s.lastmod) {
        const lastmod = toLastmod(s.lastmod);
        if (lastmod) parts.push(`    <lastmod>${lastmod}</lastmod>`);
      }
      return `  <sitemap>\n${parts.join("\n")}\n  </sitemap>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</sitemapindex>\n`;
}

export function xmlResponse(xml: string): Response {
  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

/**
 * Dates de dernière modification réelle des pages statiques.
 * À mettre à jour quand le contenu d'une de ces pages change.
 */
export const STATIC_PAGES_LASTMOD: Record<string, string> = {
  "/": "2026-07-05",
  "/salles": "2026-07-05",
  "/outils": "2026-05-20",
  "/outils/cotations": "2026-05-20",
  "/outils/meteo": "2026-05-20",
  "/outils/jonctions": "2026-05-20",
  "/glossaire-escalade": "2026-05-20",
  "/a-propos": "2026-07-05",
  "/contact": "2026-07-05",
  "/mentions-legales": "2026-04-15",
};

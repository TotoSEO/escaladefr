import type { MetadataRoute } from "next";

const SITE = "https://www.escalade-france.fr";

/**
 * Chemins techniques sans intérêt pour aucun crawler.
 * Tout le contenu éditorial est explicitement ouvert, y compris aux
 * crawlers IA (réponse aux moteurs génératifs : Google AI Overviews,
 * ChatGPT, Claude, Perplexity…). Voir aussi /llms.txt.
 *
 * IMPORTANT : on ne bloque PAS /_next/. Next.js y sert le CSS compilé
 * (/_next/static/css/*), le JS et les polices (/_next/static/media/*).
 * Bloquer /_next/ empêche Googlebot de charger ces ressources : le moteur
 * rend alors la page « brute » (sans styles), ce qu'on voit dans l'outil
 * d'inspection d'URL de la Search Console, et ça dégrade l'indexation.
 * Seules les routes API (aucun contenu indexable) restent fermées.
 */
const TECHNICAL_PATHS = ["/api/"];

/**
 * Crawlers IA connus, autorisés explicitement (l'absence de règle vaut
 * déjà autorisation, mais une règle dédiée lève toute ambiguïté et
 * documente le choix).
 */
const AI_CRAWLERS = [
  // OpenAI : entraînement, recherche, navigation à la demande.
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  // Anthropic : entraînement, recherche, navigation à la demande.
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  // Google : usage IA (Gemini / AI Overviews).
  "Google-Extended",
  // Perplexity : index et navigation à la demande.
  "PerplexityBot",
  "Perplexity-User",
  // Apple Intelligence.
  "Applebot-Extended",
  // Common Crawl (alimente de nombreux modèles ouverts).
  "CCBot",
  // Meta AI.
  "meta-externalagent",
  // Mistral AI.
  "MistralAI-User",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: TECHNICAL_PATHS,
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: TECHNICAL_PATHS,
      })),
    ],
    sitemap: [
      `${SITE}/sitemap.xml`,
      `${SITE}/sitemap-sites-escalade.xml`,
      `${SITE}/sitemap-blog.xml`,
      `${SITE}/sitemap-equipement.xml`,
      `${SITE}/sitemap-pages.xml`,
    ],
    host: SITE,
  };
}

/**
 * llms.txt — fichier au format de la spec llmstxt.org.
 *
 * Sert d'index lisible par les agents IA et LLMs pour comprendre le
 * périmètre du site et accéder rapidement à ses pages importantes.
 *
 * Spec : https://llmstxt.org/
 */

import { NextResponse } from "next/server";

export const dynamic = "force-static";
export const revalidate = 3600;

const SITE = "https://escalade-france.fr";

const CONTENT = `# escalade-france.fr

> Annuaire indépendant de l'escalade en France. Recense les sites naturels d'escalade (falaises, sites de bloc) et les salles d'escalade indoor du pays. Propose des outils interactifs, un glossaire complet, un blog, et une sélection d'équipement. Données publiques officielles, mises à jour mensuelles, consultation gratuite.

Le contenu est rédigé en français, ciblé pour les grimpeurs francophones, débutants comme confirmés. Les cotations sont au format français (3 à 9c) avec équivalences UIAA, YDS et britannique disponibles dans le convertisseur.

## Pages principales

- [Accueil](${SITE}/): présentation du projet, statistiques en direct depuis la base de sites naturels, top des départements les plus équipés.
- [Sites naturels d'escalade](${SITE}/sites): annuaire et carte interactive des sites naturels d'escalade en France, filtrable par département, massif et niveau.
- [Salles d'escalade](${SITE}/salles): annuaire des salles indoor en France, recherche par ville et par type de pratique (bloc, voie, mixte).
- [Glossaire de l'escalade](${SITE}/glossaire-escalade): plus de 130 termes techniques et expressions de l'escalade définis et classés par catégorie, avec recherche instantanée.

## Outils interactifs

- [Tous les outils](${SITE}/outils): index de la suite d'outils interactifs gratuits.
- [Convertisseur de cotations](${SITE}/outils/cotations): conversion entre cotation française, UIAA, YDS américain et britannique, pour la voie et le bloc, avec tableau de référence complet et explications par niveau.

## Contenus éditoriaux

- [Blog](${SITE}/blog): tests de matériel, récits de sorties, guides pratiques, analyses du milieu. À paraître.
- [Boutique](${SITE}/boutique): sélection de matériel d'escalade testé (chaussons, baudriers, cordes, casques). À paraître.

## À propos

- Stack technique : Next.js 15, Supabase (PostgreSQL + PostGIS), Vercel.
- Données sites naturels : recensement public officiel, base privée enrichie.
- Données salles : compilation à partir d'OpenStreetMap (© OpenStreetMap contributors, licence ODbL) puis enrichissement manuel.
- Licence du convertisseur de cotations et du glossaire : contenu éditorial original, source d'inspiration croisée (Wikipédia, USR, Décathlon Conseilsport, theCrag, MEC).
- Site rédigé et opéré depuis la France, en français.

## Contact et légal

- [Contact](${SITE}/contact): pour signaler une erreur, proposer un site, ou contacter la rédaction (contact@escalade-france.fr).
- [Mentions légales](${SITE}/mentions-legales): éditeur, hébergement, propriété intellectuelle, RGPD.

## Optional

- [Sitemap XML](${SITE}/sitemap.xml): index complet des URLs indexables.
- [robots.txt](${SITE}/robots.txt): directives d'exploration pour les crawlers.
`;

export function GET(): NextResponse {
  return new NextResponse(CONTENT, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

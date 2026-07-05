/**
 * llms.txt — fichier au format de la spec llmstxt.org.
 *
 * Sert d'index lisible par les agents IA et LLMs pour comprendre le
 * périmètre du site et accéder rapidement à ses pages importantes.
 * La section équipement est générée dynamiquement depuis les données
 * pour rester exacte (comparatifs et avis publiés).
 *
 * Spec : https://llmstxt.org/
 */

import { NextResponse } from "next/server";

import {
  CATEGORY_LABEL,
  fetchAllAffiliateLandings,
  fetchAllEquipementReviews,
} from "@/lib/equipement";

export const revalidate = 3600;

const SITE = "https://www.escalade-france.fr";

async function buildContent(): Promise<string> {
  const [landings, reviews] = await Promise.all([
    fetchAllAffiliateLandings(),
    fetchAllEquipementReviews(),
  ]);

  const equipementLines = landings
    .map(
      (l) =>
        `- [${l.h1}](${SITE}/equipement/${l.slug}): comparatif ${CATEGORY_LABEL[
          l.category
        ].toLowerCase()}, ${l.products.length} modèles, prix vérifiés, mis à jour le ${l.updatedAt.slice(0, 10)}.`,
    )
    .join("\n");

  const avisLines = reviews
    .map(
      (r) =>
        `- [${r.h1}](${SITE}/equipement/avis/${r.slug}): avis détaillé sur le ${r.productName} (${r.brand}), note ${r.rating}/5, mis à jour le ${r.updatedAt.slice(0, 10)}.`,
    )
    .join("\n");

  return `# escalade-france.fr

> Annuaire indépendant de l'escalade en France. Recense les sites naturels d'escalade (falaises, sites de bloc) et les salles d'escalade indoor du pays. Propose des outils interactifs, un glossaire complet, un blog éditorial et des comparatifs d'équipement avec avis détaillés. Données publiques officielles, mises à jour mensuelles, consultation gratuite, aucun lien rémunéré.

Le contenu est rédigé en français, ciblé pour les grimpeurs francophones, débutants comme confirmés. Les cotations sont au format français (3 à 9c) avec équivalences UIAA, YDS et britannique disponibles dans le convertisseur.

## Pages principales

- [Accueil](${SITE}/): présentation du projet, statistiques en direct depuis la base de sites naturels, top des départements les plus équipés.
- [Sites naturels d'escalade](${SITE}/sites): annuaire et carte interactive des sites naturels d'escalade en France, filtrable par département, massif et niveau.
- [Sites fermés et restrictions](${SITE}/sites/fermes-et-restrictions): suivi des fermetures, arrêtés préfectoraux et restrictions d'accès aux falaises françaises.
- [Salles d'escalade](${SITE}/salles): annuaire des salles indoor en France, recherche par ville et par type de pratique (bloc, voie, mixte).
- [Glossaire de l'escalade](${SITE}/glossaire-escalade): plus de 130 termes techniques et expressions de l'escalade définis et classés par catégorie, avec recherche instantanée.

## Outils interactifs

- [Tous les outils](${SITE}/outils): index de la suite d'outils interactifs gratuits.
- [Convertisseur de cotations](${SITE}/outils/cotations): conversion entre cotation française, UIAA, YDS américain et britannique, pour la voie et le bloc, avec tableau de référence complet.
- [Météo des falaises](${SITE}/outils/meteo): conditions météo sur les sites d'escalade français.
- [Jonctions de cordes](${SITE}/outils/jonctions): guide interactif des nœuds de jonction selon l'usage.

## Blog

- [Blog](${SITE}/blog): articles réguliers sur les techniques, le matériel, les nœuds, les sites mythiques, la préparation, la sécurité, l'environnement et la culture de l'escalade.
- Navigation par thématique : [Techniques](${SITE}/blog/categorie/techniques), [Matériel](${SITE}/blog/categorie/materiel), [Nœuds](${SITE}/blog/categorie/noeuds), [Sites mythiques](${SITE}/blog/categorie/sites-mythiques), [Personnalités](${SITE}/blog/categorie/personnalites), [Préparation](${SITE}/blog/categorie/preparation), [Sécurité](${SITE}/blog/categorie/securite), [Environnement](${SITE}/blog/categorie/environnement), [Culture](${SITE}/blog/categorie/culture).

## Équipement : comparatifs

- [Hub équipement](${SITE}/equipement): toutes les sélections de matériel, comparatifs indépendants sans lien rémunéré, disponibilité vérifiée chez les marchands français.
${equipementLines}

## Équipement : avis détaillés

- [Tous les avis matériel](${SITE}/equipement/avis): tests long format rédigés après plusieurs mois d'utilisation réelle, défauts compris.
${avisLines}

## À propos

- Stack technique : Next.js 15, Supabase (PostgreSQL + PostGIS), Vercel.
- Données sites naturels : recensement public officiel, base privée enrichie.
- Données salles : compilation à partir d'OpenStreetMap (© OpenStreetMap contributors, licence ODbL) puis enrichissement manuel.
- Licence du convertisseur de cotations et du glossaire : contenu éditorial original, source d'inspiration croisée (Wikipédia, USR, Décathlon Conseilsport, theCrag, MEC).
- Site rédigé et opéré depuis la France, en français. Auteur principal : Antoine ([à propos](${SITE}/a-propos)).

## Contact et légal

- [Contact](${SITE}/contact): pour signaler une erreur, proposer un site, ou contacter la rédaction (contact@escalade-france.fr).
- [Mentions légales](${SITE}/mentions-legales): éditeur, hébergement, propriété intellectuelle, RGPD.

## Optional

- [Index des sitemaps](${SITE}/sitemap.xml): index référençant les sitemaps sites-escalade, blog, équipement et pages.
- [robots.txt](${SITE}/robots.txt): directives d'exploration, crawlers IA explicitement autorisés.
`;
}

export async function GET(): Promise<NextResponse> {
  const content = await buildContent();
  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

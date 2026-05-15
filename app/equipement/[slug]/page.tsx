import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AffiliateLandingView } from "@/components/equipement/AffiliateLandingView";
import {
  CATEGORY_LABEL,
  fetchAffiliateLanding,
  fetchAllAffiliateLandings,
} from "@/lib/equipement";
import { fetchPublishedArticleHeadings } from "@/lib/blog";

export const revalidate = 3600;

type Params = { slug: string };

export async function generateStaticParams() {
  const all = await fetchAllAffiliateLandings();
  return all.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const { slug } = await params;
  const landing = await fetchAffiliateLanding(slug);
  if (!landing) return { title: "Sélection introuvable" };
  return {
    title: landing.title,
    description: landing.description,
    alternates: { canonical: `/equipement/${landing.slug}` },
    openGraph: {
      title: landing.title,
      description: landing.description,
      type: "article",
      url: `https://escalade-france.fr/equipement/${landing.slug}`,
      images: [
        {
          url: `https://escalade-france.fr${landing.heroImage}`,
          width: 1600,
          height: 900,
          alt: landing.heroImageAlt,
        },
      ],
    },
  };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

export default async function EquipementLandingPage(
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params;
  const landing = await fetchAffiliateLanding(slug);
  if (!landing) notFound();

  // On ne propose que les articles déjà publiés (les autres seraient en 404).
  const relatedArticles = landing.relatedBlogSlugs
    ? await fetchPublishedArticleHeadings(landing.relatedBlogSlugs)
    : [];

  const url = `https://escalade-france.fr/equipement/${landing.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://escalade-france.fr/#organization",
        name: "escalade-france.fr",
        url: "https://escalade-france.fr",
      },
      {
        "@type": "Person",
        "@id": "https://escalade-france.fr/a-propos#antoine",
        name: "Antoine",
        url: "https://escalade-france.fr/a-propos",
      },
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: landing.title,
        description: landing.description,
        isPartOf: { "@id": "https://escalade-france.fr/#website" },
        inLanguage: "fr-FR",
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: "https://escalade-france.fr" },
          { "@type": "ListItem", position: 2, name: "Équipement", item: "https://escalade-france.fr/equipement" },
          { "@type": "ListItem", position: 3, name: CATEGORY_LABEL[landing.category], item: url },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${url}#itemlist`,
        name: landing.h1,
        numberOfItems: landing.products.length,
        itemListElement: landing.products.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Product",
            "@id": `${url}#product-${p.id}`,
            name: p.name,
            brand: { "@type": "Brand", name: p.brand },
            description: p.description,
            image: `https://escalade-france.fr${p.image}`,
            ...(p.rating
              ? {
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: p.rating,
                    reviewCount: p.reviewCount ?? 1,
                    bestRating: 5,
                  },
                }
              : {}),
            ...(p.priceFrom
              ? {
                  offers: {
                    "@type": "Offer",
                    price: p.priceFrom,
                    priceCurrency: "EUR",
                    availability: "https://schema.org/InStock",
                    url: p.links[0]?.url,
                  },
                }
              : {}),
          },
        })),
      },
      ...(landing.faq.length > 0
        ? [
            {
              "@type": "FAQPage",
              "@id": `${url}#faq`,
              mainEntity: landing.faq.map((qa, i) => ({
                "@type": "Question",
                "@id": `${url}#faq-${i}`,
                name: qa.q,
                acceptedAnswer: { "@type": "Answer", text: stripHtml(qa.a) },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AffiliateLandingView landing={landing} relatedArticles={relatedArticles} />
    </>
  );
}

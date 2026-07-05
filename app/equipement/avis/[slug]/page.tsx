import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ReviewView } from "@/components/equipement/ReviewView";
import {
  buildOfferMerchantFields,
  fetchAffiliateLanding,
  fetchAllEquipementReviews,
  fetchEquipementReview,
} from "@/lib/equipement";
import { fetchPublishedArticleHeadings } from "@/lib/blog";

export const revalidate = 3600;

type Params = { slug: string };

export async function generateStaticParams() {
  const all = await fetchAllEquipementReviews();
  return all.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const { slug } = await params;
  const review = await fetchEquipementReview(slug);
  if (!review) return { title: "Avis introuvable" };
  return {
    title: review.title,
    description: review.description,
    alternates: { canonical: `/equipement/avis/${review.slug}` },
    openGraph: {
      title: review.title,
      description: review.description,
      type: "article",
      url: `https://www.escalade-france.fr/equipement/avis/${review.slug}`,
      images: [{ url: review.image, alt: review.imageAlt }],
    },
  };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

export default async function EquipementReviewPage(
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params;
  const [review, allReviews] = await Promise.all([
    fetchEquipementReview(slug),
    fetchAllEquipementReviews(),
  ]);
  if (!review) notFound();

  const [relatedLanding, relatedArticles] = await Promise.all([
    review.relatedLandingSlug
      ? fetchAffiliateLanding(review.relatedLandingSlug)
      : Promise.resolve(null),
    review.relatedBlogSlugs
      ? fetchPublishedArticleHeadings(review.relatedBlogSlugs)
      : Promise.resolve([]),
  ]);

  const otherReviews = allReviews
    .filter((r) => r.slug !== review.slug)
    .slice(0, 2)
    .map((r) => ({ slug: r.slug, h1: r.h1, rating: r.rating }));

  const url = `https://www.escalade-france.fr/equipement/avis/${review.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://www.escalade-france.fr/#organization",
        name: "escalade-france.fr",
        url: "https://www.escalade-france.fr",
      },
      {
        "@type": "Person",
        "@id": "https://www.escalade-france.fr/a-propos#antoine",
        name: "Antoine",
        url: "https://www.escalade-france.fr/a-propos",
      },
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: review.title,
        description: review.description,
        isPartOf: { "@id": "https://www.escalade-france.fr/#website" },
        inLanguage: "fr-FR",
        breadcrumb: { "@id": `${url}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: "https://www.escalade-france.fr" },
          { "@type": "ListItem", position: 2, name: "Équipement", item: "https://www.escalade-france.fr/equipement" },
          { "@type": "ListItem", position: 3, name: "Avis", item: "https://www.escalade-france.fr/equipement/avis" },
          { "@type": "ListItem", position: 4, name: review.productName, item: url },
        ],
      },
      {
        "@type": "Product",
        "@id": `${url}#product`,
        name: review.productName,
        brand: { "@type": "Brand", name: review.brand },
        image: review.image,
        description: review.description,
        review: { "@id": `${url}#review` },
        ...(review.priceFrom
          ? {
              offers: {
                "@type": "Offer",
                price: review.priceFrom,
                priceCurrency: "EUR",
                availability: "https://schema.org/InStock",
                url: review.links[0]?.url,
                ...buildOfferMerchantFields(review.links[0]?.merchant),
              },
            }
          : {}),
      },
      {
        "@type": "Review",
        "@id": `${url}#review`,
        itemReviewed: { "@id": `${url}#product` },
        author: { "@id": "https://www.escalade-france.fr/a-propos#antoine" },
        publisher: { "@id": "https://www.escalade-france.fr/#organization" },
        datePublished: review.publishedAt,
        dateModified: review.updatedAt,
        inLanguage: "fr-FR",
        name: review.title,
        reviewBody: review.verdict,
        reviewRating: {
          "@type": "Rating",
          ratingValue: review.rating,
          bestRating: 5,
          worstRating: 1,
        },
        positiveNotes: {
          "@type": "ItemList",
          itemListElement: review.pros.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: p,
          })),
        },
        negativeNotes: {
          "@type": "ItemList",
          itemListElement: review.cons.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c,
          })),
        },
      },
      ...(review.faq && review.faq.length > 0
        ? [
            {
              "@type": "FAQPage",
              "@id": `${url}#faq`,
              mainEntity: review.faq.map((qa, i) => ({
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
      <ReviewView
        review={review}
        relatedLanding={
          relatedLanding
            ? { slug: relatedLanding.slug, h1: relatedLanding.h1 }
            : null
        }
        relatedArticles={relatedArticles}
        otherReviews={otherReviews}
      />
    </>
  );
}

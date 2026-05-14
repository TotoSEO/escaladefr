import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowUpRight, Clock, Calendar as CalendarIcon } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { RenderBlock, KeyTakeaways } from "@/components/blog/blocks";
import { TableOfContents } from "@/components/blog/toc";
import {
  COCON_LABEL,
  categoryHref,
  articleHref,
  fetchArticleBySlug,
  formatPublishedDate,
  readingTimeMinutes,
} from "@/lib/blog";

export const revalidate = 3600;

type Params = { slug: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);
  if (!article) return { title: "Article introuvable" };
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      url: `https://escalade-france.fr/blog/${article.slug}`,
      images: [
        {
          url: `https://escalade-france.fr${article.cover_image}`,
          width: 1600,
          height: 900,
          alt: article.cover_alt,
        },
      ],
      publishedTime: article.published_at,
      modifiedTime: article.updated_at ?? article.published_at,
      authors: [article.author_name],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.description,
      images: [`https://escalade-france.fr${article.cover_image}`],
    },
  };
}

export default async function BlogArticlePage(
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params;
  const article = await fetchArticleBySlug(slug);
  if (!article) notFound();

  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://escalade-france.fr" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://escalade-france.fr/blog" },
      {
        "@type": "ListItem",
        position: 3,
        name: COCON_LABEL[article.cocon],
        item: `https://escalade-france.fr${categoryHref(article.cocon)}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: article.h1,
        item: `https://escalade-france.fr/blog/${article.slug}`,
      },
    ],
  };

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `https://escalade-france.fr/blog/${article.slug}#article`,
        headline: article.h1,
        description: article.description,
        image: {
          "@type": "ImageObject",
          url: `https://escalade-france.fr${article.cover_image}`,
          width: 1600,
          height: 900,
        },
        datePublished: article.published_at,
        dateModified: article.updated_at ?? article.published_at,
        author: {
          "@type": "Person",
          name: article.author_name,
          url: `https://escalade-france.fr${article.author_url}`,
        },
        publisher: {
          "@type": "Organization",
          name: "escalade-france.fr",
          url: "https://escalade-france.fr",
          logo: {
            "@type": "ImageObject",
            url: "https://escalade-france.fr/og/logo.png",
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `https://escalade-france.fr/blog/${article.slug}`,
        },
        articleSection: COCON_LABEL[article.cocon],
        wordCount: article.word_count ?? undefined,
        inLanguage: "fr-FR",
      },
      breadcrumb,
      ...(article.faq && article.faq.length > 0
        ? [
            {
              "@type": "FAQPage",
              mainEntity: article.faq.map((qa) => ({
                "@type": "Question",
                name: qa.q,
                acceptedAnswer: { "@type": "Answer", text: qa.a },
              })),
            },
          ]
        : []),
    ],
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero avec cover */}
      <article>
        <header className="relative overflow-hidden border-b border-white/10 surface-1 text-foreground">
          <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-12 lg:gap-12 lg:px-12 lg:py-24">
            <div className="lg:col-span-6">
              <nav
                aria-label="Fil d'Ariane"
                className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground"
              >
                <Link href="/" className="hover:text-foreground">
                  Accueil
                </Link>
                <span aria-hidden>›</span>
                <Link href="/blog" className="hover:text-foreground">
                  Blog
                </Link>
                <span aria-hidden>›</span>
                <Link
                  href={categoryHref(article.cocon)}
                  className="hover:text-foreground"
                >
                  {COCON_LABEL[article.cocon]}
                </Link>
                <span aria-hidden>›</span>
                <span className="line-clamp-1 max-w-[40ch] text-foreground/85">
                  {article.h1}
                </span>
              </nav>

              <h1
                className="mt-6 font-display font-medium leading-[0.96] tracking-[-0.025em] text-balance sm:mt-8"
                style={{ fontSize: "clamp(2rem, 5.4vw, 4rem)" }}
              >
                {article.h1}
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {article.chapo}
              </p>


              <div className="mt-8 flex flex-wrap items-center gap-4 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                  {formatPublishedDate(article.published_at)}
                </span>
                <span className="text-white/15">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  {readingTimeMinutes(article.word_count)} min de lecture
                </span>
                <span className="text-white/15">·</span>
                <span className="text-foreground/85">{article.author_name}</span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-coal-900 shadow-2xl">
                <Image
                  src={article.cover_image}
                  alt={article.cover_alt}
                  width={1600}
                  height={900}
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="h-auto w-full"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Corps de l'article */}
        <section className="relative surface-2 text-foreground">
          <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20 lg:px-0 lg:py-24">
            <KeyTakeaways items={article.takeaways} />

            <TableOfContents blocks={article.body_blocks} />

            <div className="mt-6">
              {article.body_blocks.map((b, i) => (
                <RenderBlock key={i} block={b} />
              ))}
            </div>

            {article.faq && article.faq.length > 0 && (
              <section className="mt-16 rounded-3xl border border-white/10 bg-coal-900/60 p-6 sm:p-10">
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                  § FAQ
                </p>
                <h2
                  className="mt-3 font-display font-medium leading-tight tracking-[-0.02em]"
                  style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)" }}
                >
                  Foire aux questions sur {faqSubject(article.h1)}.
                </h2>
                <div className="mt-6 divide-y divide-white/10">
                  {article.faq.map((qa, i) => (
                    <details
                      key={i}
                      className="group py-5 transition-colors open:bg-white/[0.03]"
                    >
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                        <span className="flex flex-1 items-baseline gap-3 font-display font-medium tracking-[-0.01em] sm:gap-4">
                          <span className="font-mono text-xs text-muted-foreground tabular-nums">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span
                            style={{ fontSize: "clamp(1rem, 2vw, 1.3rem)" }}
                          >
                            {qa.q}
                          </span>
                        </span>
                        <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 transition-transform group-open:rotate-45">
                          <span className="block h-3 w-px bg-foreground" />
                          <span className="block h-px w-3 -translate-x-3 bg-foreground" />
                        </span>
                      </summary>
                      <p className="mt-4 max-w-3xl pl-8 pr-1 text-sm leading-relaxed text-muted-foreground sm:pl-12 sm:text-base">
                        {qa.a}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* Auteur / signature */}
            <div className="mt-16 flex flex-col gap-5 rounded-3xl border border-white/10 bg-coal-900/60 px-6 py-7 sm:flex-row sm:gap-7 sm:px-8 sm:py-9">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10 sm:h-20 sm:w-20">
                <Image
                  src="/blog/antoine-escalade-france.webp"
                  alt="Antoine, rédacteur d'escalade-france.fr"
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                  Écrit par
                </p>
                <p className="mt-1 font-display text-xl font-medium tracking-[-0.01em] sm:text-2xl">
                  Antoine
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Grimpeur depuis 13 ans. Premiers blocs au lycée Camille Sée
                  de Colmar, premières voies en falaise sur les contreforts
                  vosgiens, et désormais des semaines à sillonner la France
                  pour identifier et tester les meilleurs spots. Niveau actuel
                  8a en falaise sport, 7b en bloc, classé top 200 jeunes au
                  ranking FFME en 2012-2014. Quelques voies ouvertes dans le
                  Jura et les Vosges depuis 2018.
                </p>
                <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Aucun contenu généré · Aucune affiliation cachée · Tous les
                  articles relus avant publication
                </p>
              </div>
            </div>
          </div>
        </section>

      </article>
    </PageShell>
  );
}

/** Extrait un sujet court depuis le H1 pour le titre FAQ. Premier segment
 * avant la première virgule ou les deux-points, en minuscule.
 */
function faqSubject(h1: string): string {
  const segment = h1.split(/[,:]/)[0].trim();
  const lower = segment.charAt(0).toLowerCase() + segment.slice(1);
  return lower;
}

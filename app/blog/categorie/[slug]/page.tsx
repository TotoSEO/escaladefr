import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import { PageShell, PageHeader } from "@/components/page-shell";
import {
  COCONS,
  COCON_DESCRIPTION,
  COCON_H1,
  COCON_LABEL,
  COCON_SLUG,
  COCON_SUBTITLE,
  COCON_TITLE,
  articleHref,
  categoryHref,
  coconFromSlug,
  fetchNextScheduledArticle,
  fetchPublishedArticles,
  fetchPublishedCountByCocon,
  formatPublishedDate,
  readingTimeMinutes,
  type BlogArticleListItem,
} from "@/lib/blog";

export const revalidate = 3600;

type Params = { slug: string };

export async function generateStaticParams() {
  return COCONS.map((c) => ({ slug: COCON_SLUG[c] }));
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const { slug } = await params;
  const cocon = coconFromSlug(slug);
  if (!cocon) return { title: "Page introuvable" };

  // noindex tant que la catégorie n'a aucun article publié
  const published = await fetchPublishedArticles(1, cocon);
  const hasContent = published.length > 0;

  return {
    title: COCON_TITLE[cocon],
    description: COCON_DESCRIPTION[cocon],
    alternates: { canonical: `/blog/categorie/${slug}` },
    robots: hasContent ? undefined : { index: false, follow: true },
    openGraph: {
      title: COCON_TITLE[cocon],
      description: COCON_DESCRIPTION[cocon],
      type: "website",
      url: `https://www.escalade-france.fr/blog/categorie/${slug}`,
    },
  };
}

export default async function CoconPage(
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params;
  const cocon = coconFromSlug(slug);
  if (!cocon) notFound();

  const [articles, nextArticle, countsByCocon] = await Promise.all([
    fetchPublishedArticles(100, cocon),
    fetchNextScheduledArticle(cocon),
    fetchPublishedCountByCocon(),
  ]);
  const label = COCON_LABEL[cocon];
  const h1 = COCON_H1[cocon];
  const description = COCON_DESCRIPTION[cocon];
  const subtitle = COCON_SUBTITLE[cocon];

  // Article "hub" : le guide de référence de la thématique, mis en avant en
  // tête de page. S'il en existe plusieurs, le plus récent est retenu, les
  // autres rejoignent la grille classique.
  const hub = articles.find((a) => a.type_article === "hub") ?? null;
  const otherArticles = hub ? articles.filter((a) => a.id !== hub.id) : articles;
  // Ordre d'affichage (hub en premier), réutilisé par le JSON-LD ItemList.
  const orderedArticles = hub ? [hub, ...otherArticles] : articles;

  // Navigation croisée : les autres thématiques ayant du contenu publié.
  const otherCocons = COCONS.filter((c) => c !== cocon && countsByCocon[c] > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `https://www.escalade-france.fr/blog/categorie/${slug}`,
        url: `https://www.escalade-france.fr/blog/categorie/${slug}`,
        name: COCON_TITLE[cocon],
        description,
        isPartOf: { "@id": "https://www.escalade-france.fr/blog" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: "https://www.escalade-france.fr" },
          { "@type": "ListItem", position: 2, name: "Blog", item: "https://www.escalade-france.fr/blog" },
          { "@type": "ListItem", position: 3, name: h1, item: `https://www.escalade-france.fr/blog/categorie/${slug}` },
        ],
      },
      ...(articles.length > 0
        ? [
            {
              "@type": "ItemList",
              name: `Articles ${label}`,
              itemListElement: orderedArticles.slice(0, 30).map((a, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: a.h1,
                url: `https://www.escalade-france.fr${articleHref(a.slug)}`,
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

      <PageHeader
        section="§ Blog"
        status={articles.length > 0 ? "live" : "soon"}
        surface="cool"
        title={
          <>
            <span className="italic text-primary glow-ice-text">{h1}</span>.
          </>
        }
        subtitle={subtitle}
      />

      <section className="relative surface-1 text-foreground">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
          {articles.length > 0 && (
            <div className="mb-8 flex items-baseline justify-between gap-4 sm:mb-12">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                § {articles.length} article{articles.length > 1 ? "s" : ""}
              </span>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-primary"
              >
                Toutes les thématiques
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {articles.length === 0 ? (
            <CategoryEmptyState next={nextArticle} label={label} />
          ) : (
            <>
              {hub && (
                <div className="mb-14 sm:mb-16">
                  <h2 className="mb-5 font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                    § Le guide de référence
                  </h2>
                  <HubCard a={hub} />
                </div>
              )}
              {otherArticles.length > 0 && (
                <div>
                  {hub && (
                    <h2 className="mb-5 font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                      § Les derniers articles
                    </h2>
                  )}
                  <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {otherArticles.map((a) => (
                      <ArticleCard key={a.id} a={a} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {otherCocons.length > 0 && (
        <section className="relative surface-2 text-foreground">
          <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
            <div className="mb-8 flex items-baseline justify-between gap-4">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                § Explorer les autres thématiques
              </h2>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-primary"
              >
                Tout le blog
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <nav aria-label="Autres thématiques du blog">
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {otherCocons.map((c) => (
                  <li key={c}>
                    <Link
                      href={categoryHref(c)}
                      className="group flex h-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-coal-900 px-5 py-4 transition-all hover:border-primary/40 hover:bg-coal-800"
                    >
                      <span className="flex flex-col gap-0.5">
                        <span className="font-display text-sm font-medium tracking-[-0.01em] sm:text-base">
                          {COCON_LABEL[c]}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                          {countsByCocon[c]} article{countsByCocon[c] > 1 ? "s" : ""}
                        </span>
                      </span>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </section>
      )}
    </PageShell>
  );
}

function CategoryEmptyState({
  next,
  label,
}: {
  next: { slug: string; h1: string; scheduled_at: string } | null;
  label: string;
}) {
  if (!next) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-coal-900/60 px-6 py-12 text-center sm:px-10 sm:py-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
          Bientôt en ligne
        </p>
        <h2
          className="mt-4 font-display font-medium leading-tight tracking-[-0.02em]"
          style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}
        >
          Les articles {label.toLowerCase()} arrivent prochainement.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Reviens dans quelques semaines, le calendrier éditorial publie trois
          articles par semaine.
        </p>
      </div>
    );
  }
  const dateLabel = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(next.scheduled_at));
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-primary/30 bg-coal-900/60 px-6 py-12 text-center sm:px-10 sm:py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
        Prochaine publication
      </p>
      <h2
        className="mt-4 font-display font-medium leading-tight tracking-[-0.02em] text-balance"
        style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}
      >
        {next.h1}
      </h2>
      <p className="mt-4 font-mono text-xs uppercase tracking-[0.22em] text-foreground/70">
        {dateLabel} · 09 h 00
      </p>
      <p className="mt-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
        Les articles {label.toLowerCase()} se remplissent progressivement, à
        raison de trois publications par semaine. Reviens bientôt.
      </p>
      <Link
        href="/blog"
        className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.22em] text-foreground/80 transition-colors hover:border-primary/40 hover:text-foreground"
      >
        Voir les autres thématiques
        <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

function HubCard({ a }: { a: BlogArticleListItem }) {
  return (
    <Link
      href={articleHref(a.slug)}
      className="group relative grid overflow-hidden rounded-2xl border border-primary/40 bg-coal-900 transition-all hover:border-primary lg:grid-cols-2"
    >
      <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-primary-foreground shadow-lg">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary-foreground/70" />
        Guide de référence
      </span>
      <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[320px]">
        <Image
          src={a.cover_image}
          alt={a.cover_alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-col justify-center gap-3 p-6 sm:p-8 lg:p-10">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
          <span>{formatPublishedDate(a.published_at)}</span>
          <span className="text-white/15">·</span>
          <span className="text-muted-foreground">
            {readingTimeMinutes(a.word_count)} min
          </span>
        </div>
        <h3
          className="font-display font-medium leading-tight tracking-[-0.02em] text-balance"
          style={{ fontSize: "clamp(1.5rem, 3.2vw, 2.3rem)" }}
        >
          {a.h1}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          {a.chapo}
        </p>
        <span className="mt-2 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
          Lire le guide
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

function ArticleCard({ a }: { a: BlogArticleListItem }) {
  return (
    <Link
      href={articleHref(a.slug)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-coal-900 transition-all hover:border-primary/40"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={a.cover_image}
          alt={a.cover_alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-col gap-2 p-5 sm:p-6">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
          <span>{formatPublishedDate(a.published_at)}</span>
          <span className="text-white/15">·</span>
          <span className="text-muted-foreground">
            {readingTimeMinutes(a.word_count)} min
          </span>
        </div>
        <h3
          className="font-display font-medium leading-tight tracking-[-0.01em]"
          style={{ fontSize: "clamp(1.15rem, 2.2vw, 1.4rem)" }}
        >
          {a.h1}
        </h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {a.chapo}
        </p>
      </div>
    </Link>
  );
}

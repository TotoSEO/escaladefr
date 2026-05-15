import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import { PageShell, PageHeader } from "@/components/page-shell";
import {
  COCON_DESCRIPTION,
  COCON_H1,
  COCON_LABEL,
  COCON_SLUG,
  COCON_SUBTITLE,
  COCON_TITLE,
  articleHref,
  coconFromSlug,
  fetchNextScheduledArticle,
  fetchPublishedArticles,
  formatPublishedDate,
  readingTimeMinutes,
  type Cocon,
  type BlogArticleListItem,
} from "@/lib/blog";

export const revalidate = 3600;

type Params = { slug: string };

const COCONS: Cocon[] = [
  "techniques", "materiel", "noeuds", "sites", "personnalites",
  "preparation", "securite", "environnement", "culture",
];

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
      url: `https://escalade-france.fr/blog/categorie/${slug}`,
    },
  };
}

export default async function CoconPage(
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params;
  const cocon = coconFromSlug(slug);
  if (!cocon) notFound();

  const [articles, nextArticle] = await Promise.all([
    fetchPublishedArticles(100, cocon),
    fetchNextScheduledArticle(cocon),
  ]);
  const label = COCON_LABEL[cocon];
  const h1 = COCON_H1[cocon];
  const description = COCON_DESCRIPTION[cocon];
  const subtitle = COCON_SUBTITLE[cocon];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `https://escalade-france.fr/blog/categorie/${slug}`,
        url: `https://escalade-france.fr/blog/categorie/${slug}`,
        name: COCON_TITLE[cocon],
        description,
        isPartOf: { "@id": "https://escalade-france.fr/blog" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: "https://escalade-france.fr" },
          { "@type": "ListItem", position: 2, name: "Blog", item: "https://escalade-france.fr/blog" },
          { "@type": "ListItem", position: 3, name: h1, item: `https://escalade-france.fr/blog/categorie/${slug}` },
        ],
      },
      ...(articles.length > 0
        ? [
            {
              "@type": "ItemList",
              name: `Articles ${label}`,
              itemListElement: articles.slice(0, 30).map((a, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: a.h1,
                url: `https://escalade-france.fr${articleHref(a.slug)}`,
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
                Tous les cocons
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {articles.length === 0 ? (
            <CategoryEmptyState next={nextArticle} label={label} />
          ) : (
            <>
              {articles.filter((a) => a.type_article === "hub").length > 0 && (
                <div className="mb-12">
                  <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                    § Le guide essentiel — épinglé
                  </p>
                  <div className="grid grid-cols-1 gap-5 sm:gap-6">
                    {articles.filter((a) => a.type_article === "hub").map((a) => (
                      <ArticleCard key={a.id} a={a} pinned />
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {articles.filter((a) => a.type_article !== "hub").map((a) => (
                  <ArticleCard key={a.id} a={a} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
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

function ArticleCard({ a, pinned }: { a: BlogArticleListItem; pinned?: boolean }) {
  return (
    <Link
      href={articleHref(a.slug)}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-coal-900 transition-all ${
        pinned ? "border-primary/40 hover:border-primary" : "border-white/10 hover:border-primary/40"
      }`}
    >
      {pinned && (
        <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-primary-foreground shadow-lg">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary-foreground/70" />
          Épinglé
        </span>
      )}
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
        <h2
          className="font-display font-medium leading-tight tracking-[-0.01em]"
          style={{ fontSize: "clamp(1.15rem, 2.2vw, 1.4rem)" }}
        >
          {a.h1}
        </h2>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {a.chapo}
        </p>
      </div>
    </Link>
  );
}

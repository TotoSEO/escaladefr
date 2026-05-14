import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import { PageShell, PageHeader } from "@/components/page-shell";
import {
  COCON_DESCRIPTION,
  COCON_LABEL,
  COCON_SLUG,
  articleHref,
  coconFromSlug,
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
  if (!cocon) return { title: "Cocon introuvable" };
  return {
    title: `Blog ${COCON_LABEL[cocon]} | articles sur l'escalade en France`,
    description: COCON_DESCRIPTION[cocon],
    alternates: { canonical: `/blog/categorie/${slug}` },
  };
}

export default async function CoconPage(
  { params }: { params: Promise<Params> },
) {
  const { slug } = await params;
  const cocon = coconFromSlug(slug);
  if (!cocon) notFound();

  const articles = await fetchPublishedArticles(100, cocon);
  const label = COCON_LABEL[cocon];
  const description = COCON_DESCRIPTION[cocon];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `https://escalade-france.fr/blog/categorie/${slug}`,
        url: `https://escalade-france.fr/blog/categorie/${slug}`,
        name: `Blog ${label}`,
        description,
        isPartOf: { "@id": "https://escalade-france.fr/blog" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: "https://escalade-france.fr" },
          { "@type": "ListItem", position: 2, name: "Blog", item: "https://escalade-france.fr/blog" },
          { "@type": "ListItem", position: 3, name: label, item: `https://escalade-france.fr/blog/categorie/${slug}` },
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
        section={`§ Blog · ${label}`}
        status="live"
        surface="cool"
        title={
          <>
            Cocon{" "}
            <span className="italic text-primary glow-ice-text">{label}</span>.
          </>
        }
        subtitle={description}
      />

      <section className="relative surface-1 text-foreground">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
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

          {articles.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-coal-900/60 p-8 text-center text-sm text-muted-foreground sm:text-base">
              Les articles de ce cocon sortiront prochainement selon le calendrier
              éditorial. Reviens d&apos;ici quelques semaines.
            </p>
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

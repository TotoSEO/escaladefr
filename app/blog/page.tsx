import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

import { PageShell, PageHeader } from "@/components/page-shell";
import {
  COCON_H1,
  COCON_LABEL,
  COCON_SLUG,
  articleHref,
  categoryHref,
  fetchPublishedArticles,
  fetchPublishedCountByCocon,
  formatPublishedDate,
  readingTimeMinutes,
  type BlogArticleListItem,
} from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog escalade : guides, sites, matériel, technique en France",
  description:
    "Le blog escalade-france.fr : techniques de grimpe, tests matériel, profils, sites mythiques, nœuds, sécurité. Trois articles par semaine, écrits à la main.",
  alternates: { canonical: "/blog" },
};

export const revalidate = 3600;

export default async function BlogPage() {
  const [articles, countsByCocon] = await Promise.all([
    fetchPublishedArticles(200),
    fetchPublishedCountByCocon(),
  ]);
  // Tri : piliers hubs en premier, puis les autres triés par date desc
  const hubs = articles.filter((a) => a.type_article === "hub");
  const others = articles.filter((a) => a.type_article !== "hub");
  const orderedArticles = [...hubs, ...others];

  // Catégories visibles : seulement celles avec au moins un article publié.
  const visibleCocons = (Object.keys(COCON_LABEL) as (keyof typeof COCON_LABEL)[])
    .filter((c) => countsByCocon[c] > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": "https://escalade-france.fr/blog",
        url: "https://escalade-france.fr/blog",
        name: "Blog escalade-france.fr",
        description:
          "Techniques, matériel, sites mythiques, profils et sécurité de l'escalade en France.",
        isPartOf: { "@id": "https://escalade-france.fr/#website" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: "https://escalade-france.fr" },
          { "@type": "ListItem", position: 2, name: "Blog", item: "https://escalade-france.fr/blog" },
        ],
      },
      ...(articles.length > 0
        ? [
            {
              "@type": "ItemList",
              name: "Derniers articles du blog escalade",
              itemListElement: articles.slice(0, 20).map((a, i) => ({
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
            Le blog escalade,
            <br />
            <span className="italic text-primary glow-ice-text">à la main</span>.
          </>
        }
        subtitle="Techniques de grimpe, tests matériel, profils, sites mythiques, nœuds et sécurité. Trois articles par semaine, sourcés et originaux, écrits par notre rédaction qui grimpe vraiment."
      />

      {/* Navigation par thématique : seulement les catégories avec contenu publié */}
      {visibleCocons.length > 0 && (
        <section className="relative surface-2 text-foreground">
          <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
            <div className="mb-8 flex items-baseline justify-between gap-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                § Navigation par thématique
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                {visibleCocons.length} thématique{visibleCocons.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3">
              {visibleCocons.map((c) => (
                <Link
                  key={c}
                  href={categoryHref(c)}
                  className="group flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-coal-900 px-5 py-4 transition-all hover:border-primary/40 hover:bg-coal-800 sm:px-6 sm:py-5"
                >
                  <span className="flex flex-col gap-0.5">
                    <span className="font-display text-base font-medium tracking-[-0.01em] sm:text-lg">
                      {COCON_H1[c]}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      {countsByCocon[c]} article{countsByCocon[c] > 1 ? "s" : ""}
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="relative surface-1 text-foreground">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          {articles.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="mb-10 flex items-baseline justify-between gap-4 sm:mb-14">
                <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                  § Tous les articles
                </span>
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  {articles.length} en ligne
                </span>
              </div>

              {hubs.length > 0 && (
                <div className="mb-12">
                  <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                    § Les guides essentiels — épinglés
                  </p>
                  <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {hubs.map((a, i) => (
                      <ArticleCard key={a.id} a={a} featured={i === 0 && hubs.length >= 4} pinned />
                    ))}
                  </div>
                </div>
              )}
              {others.length > 0 && (
                <div>
                  <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                    § Tous les autres articles
                  </p>
                  <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {others.map((a) => (
                      <ArticleCard key={a.id} a={a} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
}

function ArticleCard({ a, featured, pinned }: { a: BlogArticleListItem; featured?: boolean; pinned?: boolean }) {
  return (
    <Link
      href={articleHref(a.slug)}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-coal-900 transition-all ${
        pinned ? "border-primary/40 hover:border-primary" : "border-white/10 hover:border-primary/40"
      } ${
        featured ? "md:col-span-2 lg:col-span-3 lg:grid lg:grid-cols-2 lg:gap-6" : ""
      }`}
    >
      {pinned && (
        <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-primary-foreground shadow-lg">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary-foreground/70" />
          Épinglé
        </span>
      )}
      <div className={`relative aspect-[16/10] overflow-hidden ${featured ? "lg:aspect-auto" : ""}`}>
        <Image
          src={a.cover_image}
          alt={a.cover_alt}
          fill
          sizes={featured ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 768px) 50vw, 100vw"}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className={`flex flex-col gap-3 p-6 sm:p-7 ${featured ? "lg:justify-center lg:p-10" : ""}`}>
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
          <span>§ {COCON_LABEL[a.cocon]}</span>
          <span className="text-white/15">·</span>
          <span className="text-muted-foreground">
            {formatPublishedDate(a.published_at)}
          </span>
          <span className="text-white/15">·</span>
          <span className="text-muted-foreground">
            {readingTimeMinutes(a.word_count)} min
          </span>
        </div>
        <h2
          className="font-display font-medium leading-tight tracking-[-0.02em] text-balance text-foreground"
          style={{ fontSize: featured ? "clamp(1.6rem, 3.5vw, 2.5rem)" : "clamp(1.2rem, 2.4vw, 1.6rem)" }}
        >
          {a.h1}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          {a.chapo}
        </p>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-coal-900/60 px-6 py-12 text-center sm:px-10 sm:py-16">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
        Lancement imminent
      </p>
      <h2
        className="mt-4 font-display font-medium leading-tight tracking-[-0.02em] text-balance"
        style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)" }}
      >
        Premiers articles le 19 mai 2026.
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
        Trois articles par semaine, du mardi au samedi, sur les techniques de
        grimpe, le matériel, les nœuds, les sites mythiques, la préparation et
        la sécurité.
      </p>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Star, ExternalLink, Check, X, Award, Sparkles, Trophy } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import type {
  AffiliateLanding,
  AffiliateProduct,
  AffiliateContentBlock,
} from "@/lib/equipement";

const BADGE_LABEL: Record<NonNullable<AffiliateProduct["badge"]>, string> = {
  "top-rated": "Le mieux noté",
  "best-value": "Meilleur rapport qualité-prix",
  "editor-choice": "Notre choix",
  premium: "Haut de gamme",
};

const BADGE_ICON: Record<NonNullable<AffiliateProduct["badge"]>, typeof Award> = {
  "top-rated": Star,
  "best-value": Award,
  "editor-choice": Trophy,
  premium: Sparkles,
};

function ratingStars(rating: number | undefined) {
  if (!rating) return null;
  return (
    <span className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < Math.round(rating) ? "fill-accent text-accent" : "text-white/15"
          }`}
        />
      ))}
    </span>
  );
}

export function AffiliateLandingView({
  landing,
  relatedArticles,
  otherLandings,
}: {
  landing: AffiliateLanding;
  /** Articles liés déjà filtrés (publiés uniquement) avec leur H1 réel. */
  relatedArticles?: { slug: string; h1: string }[];
  /** Autres LP équipement à proposer en maillage interne. */
  otherLandings?: { slug: string; h1: string; categoryLabel: string }[];
}) {
  const updatedDate = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(landing.updatedAt));

  const editorChoice = landing.products.find((p) => p.badge === "editor-choice");
  const bestValue = landing.products.find((p) => p.badge === "best-value");
  const heroPicks = [editorChoice, bestValue].filter(Boolean) as AffiliateProduct[];
  const others = landing.products.filter((p) => !heroPicks.includes(p));

  return (
    <PageShell>
      {/* Hero compact, focus produit */}
      <header className="surface-warm border-b border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
          <nav
            aria-label="Fil d'Ariane"
            className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/70"
          >
            <Link href="/" className="hover:text-foreground">
              Accueil
            </Link>
            <span aria-hidden>›</span>
            <Link href="/equipement" className="hover:text-foreground">
              Équipement
            </Link>
          </nav>

          <h1
            className="mt-5 max-w-5xl font-display font-medium leading-[0.94] tracking-[-0.025em] text-balance"
            style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)" }}
          >
            {landing.h1}
          </h1>

          <p className="mt-5 max-w-3xl text-base leading-relaxed text-foreground/85 sm:text-lg">
            {landing.subtitle}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-2.5">
            <Pill>
              {landing.products.length} modèles comparés
            </Pill>
            <Pill>Mise à jour {updatedDate}</Pill>
            <Pill accent>Sélection {landing.year}</Pill>
          </div>
        </div>
      </header>

      {/* Bandeau transparence affiliation */}
      <aside className="border-b border-white/10 bg-coal-900/40">
        <div className="mx-auto max-w-7xl px-5 py-4 sm:px-8 lg:px-12">
          <p className="text-xs leading-relaxed text-foreground/65 sm:text-[13px]">
            <strong className="text-foreground/80">Affiliation</strong> · Cette
            page contient des liens d&apos;affiliation. Si tu achètes via l&apos;un
            de ces liens, le marchand nous reverse une petite commission sans
            surcoût pour toi. Cela finance le site.
          </p>
        </div>
      </aside>

      {/* PICKS du moment : grille immersive */}
      {heroPicks.length > 0 && (
        <section className="surface-1">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
            <div className="mb-8 flex items-baseline justify-between gap-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent">
                § Nos coups de cœur
              </span>
            </div>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
              {heroPicks.map((p) => (
                <HeroPickCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Grille compacte des autres produits */}
      {others.length > 0 && (
        <section className="border-t border-white/10 surface-1">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
            <div className="mb-8 flex items-baseline justify-between gap-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                § Aussi en sélection
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                {others.length} modèle{others.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {others.map((p) => (
                <CompactPickCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Comparatif rapide en tableau */}
      <section className="border-t border-white/10 surface-2">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
          <div className="mb-8 flex items-baseline justify-between gap-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
              § Comparatif rapide
            </span>
            <a
              href="#details"
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-primary"
            >
              Détails ↓
            </a>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-coal-900/60">
            <table className="w-full min-w-[640px] text-left text-sm sm:text-base">
              <thead>
                <tr className="border-b border-white/10 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  <th className="px-4 py-4 sm:px-5">Modèle</th>
                  <th className="px-4 py-4 sm:px-5">Niveau</th>
                  <th className="px-4 py-4 sm:px-5">Note</th>
                  <th className="px-4 py-4 sm:px-5">Prix</th>
                  <th className="px-4 py-4 sm:px-5"></th>
                </tr>
              </thead>
              <tbody>
                {landing.products.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 last:border-b-0">
                    <td className="px-4 py-4 sm:px-5">
                      <a
                        href={`#${p.id}`}
                        className="block font-semibold text-foreground transition-colors hover:text-accent"
                      >
                        {p.name}
                      </a>
                      <span className="block text-xs text-muted-foreground">
                        {p.brand}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-foreground/80 sm:px-5">
                      {p.level ?? "—"}
                    </td>
                    <td className="px-4 py-4 sm:px-5">
                      <span className="flex items-center gap-2">
                        {ratingStars(p.rating)}
                        {p.rating && (
                          <span className="font-mono text-xs tabular-nums text-foreground/80">
                            {p.rating.toFixed(1)}
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-display tabular-nums text-foreground sm:px-5 sm:text-lg">
                      {p.priceFrom ? `${p.priceFrom} €` : "—"}
                    </td>
                    <td className="px-4 py-4 text-right sm:px-5">
                      {p.links[0] && (
                        <a
                          href={p.links[0].url}
                          rel="sponsored nofollow noopener"
                          target="_blank"
                          className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.22em] text-accent hover:underline"
                        >
                          Voir →
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Détails produits, cards alternées image/texte */}
      <section id="details" className="border-t border-white/10 surface-1">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
          <div className="mb-10 flex items-baseline justify-between gap-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
              § Détails produit par produit
            </span>
          </div>
          <div className="grid grid-cols-1 gap-8 lg:gap-10">
            {landing.products.map((p, i) => (
              <DetailCard key={p.id} product={p} rank={i + 1} reverse={i % 2 === 1} />
            ))}
          </div>
        </div>
      </section>

      {/* Contenu éditorial SEO (compact en bas) */}
      {landing.content.length > 0 && (
        <section className="border-t border-white/10 surface-2 text-foreground">
          <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
              § Guide d&apos;achat
            </span>
            <div className="mt-4">
              {landing.content.map((b, i) => (
                <ContentBlock key={i} block={b} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {landing.faq.length > 0 && (
        <section className="border-t border-white/10 surface-1 text-foreground">
          <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
              § FAQ
            </span>
            <h2
              className="mt-3 font-display font-medium leading-tight tracking-[-0.02em]"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)" }}
            >
              Avant l&apos;achat, tout ce qui se demande.
            </h2>
            <div className="mt-6 divide-y divide-white/10">
              {landing.faq.map((qa, i) => (
                <details
                  key={i}
                  className="group py-5 transition-colors open:bg-white/[0.03]"
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                    <span className="flex flex-1 items-baseline gap-3 font-display font-medium tracking-[-0.01em] sm:gap-4">
                      <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span style={{ fontSize: "clamp(1rem, 2vw, 1.25rem)" }}>
                        {qa.q}
                      </span>
                    </span>
                    <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 transition-transform group-open:rotate-45">
                      <span className="block h-3 w-px bg-foreground" />
                      <span className="block h-px w-3 -translate-x-3 bg-foreground" />
                    </span>
                  </summary>
                  <p
                    className="mt-4 max-w-3xl pl-8 pr-1 text-sm leading-relaxed text-muted-foreground [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:decoration-primary/40 [&_a]:underline-offset-[3px] [&_a:hover]:decoration-primary [&_strong]:font-semibold [&_strong]:text-foreground sm:pl-12 sm:text-base"
                    dangerouslySetInnerHTML={{ __html: qa.a }}
                  />
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Articles liés (uniquement ceux déjà publiés, avec leur H1 réel) */}
      {relatedArticles && relatedArticles.length > 0 && (
        <section className="border-t border-white/10">
          <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
              § Pour aller plus loin
            </span>
            <ul className="mt-5 space-y-3">
              {relatedArticles.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/blog/${a.slug}`}
                    className="group inline-flex items-baseline gap-2 font-display text-base font-medium text-foreground/85 transition-colors hover:text-primary sm:text-lg"
                  >
                    <span className="text-primary">→</span>
                    <span className="underline decoration-primary/30 decoration-2 underline-offset-[6px] transition-colors group-hover:decoration-primary">
                      {a.h1}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Maillage inter-LP : suggère d'autres sélections équipement */}
      {otherLandings && otherLandings.length > 0 && (
        <section className="border-t border-white/10 surface-warm">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent">
              § Compléter ton matériel
            </span>
            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {otherLandings.map((l) => (
                <li key={l.slug}>
                  <Link
                    href={`/equipement/${l.slug}`}
                    className="group flex h-full flex-col gap-1.5 rounded-2xl border border-white/10 bg-coal-900/60 p-5 transition-colors hover:border-accent/40 hover:bg-coal-900"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
                      {l.categoryLabel}
                    </span>
                    <span className="font-display text-base font-medium tracking-[-0.01em] text-foreground sm:text-lg">
                      {l.h1}
                    </span>
                    <span className="mt-auto inline-flex items-center gap-1 text-xs uppercase tracking-[0.22em] text-accent/70 transition-colors group-hover:text-accent">
                      Voir la sélection →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Footer EEAT auteur — signal Google de qualité éditoriale */}
      <section className="border-t border-white/10">
        <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-7">
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
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">
                Sélection rédigée par Antoine
              </p>
              <p className="mt-3 text-sm leading-relaxed text-foreground/85 sm:text-base">
                Treize ans d&apos;escalade, ancien compétiteur jeune FFME, 8a
                en falaise et 7b en bloc. Cette sélection croise les avis de
                la communauté (Snowleader, Hardloop, forums Reddit
                r/climbharder), la presse spécialisée (Alpine Mag,
                PlanetGrimpe, LaFabriqueVerticale) et les marques de
                référence du marché.
              </p>
              <p className="mt-3 text-xs text-foreground/60">
                Dernière mise à jour : {updatedDate} ·{" "}
                <Link href="/a-propos" className="text-primary hover:underline">
                  En savoir plus sur l&apos;auteur
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Pill({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className={`rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] ${
        accent
          ? "border-accent/40 bg-accent/10 text-accent"
          : "border-white/15 bg-coal-900/60 text-foreground/80"
      }`}
    >
      {children}
    </span>
  );
}

function HeroPickCard({ product }: { product: AffiliateProduct }) {
  const Icon = product.badge ? BADGE_ICON[product.badge] : Trophy;
  return (
    <article
      id={product.id}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-accent/30 bg-coal-900 transition-all hover:border-accent/60"
    >
      {product.badge && (
        <span className="absolute left-5 top-5 z-10 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-foreground shadow-lg">
          <Icon className="h-3 w-3" />
          {BADGE_LABEL[product.badge]}
        </span>
      )}

      <div className="relative aspect-[16/12] w-full overflow-hidden bg-gradient-to-br from-white/5 to-coal-900">
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-7 sm:p-8">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
            {product.brand}
          </span>
          {product.level && (
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              · {product.level}
            </span>
          )}
        </div>

        <h3
          className="font-display font-medium leading-tight tracking-[-0.01em] text-balance"
          style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
        >
          {product.name}
        </h3>

        {product.tagline && (
          <p className="text-base italic text-foreground/75 sm:text-lg">
            {product.tagline}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-sm">
          {ratingStars(product.rating)}
          {product.rating && (
            <span className="font-mono text-xs tabular-nums text-foreground/80">
              {product.rating.toFixed(1)} / 5
            </span>
          )}
          {product.reviewCount && (
            <span className="font-mono text-xs text-foreground/60">
              ({product.reviewCount.toLocaleString("fr-FR")} avis)
            </span>
          )}
        </div>

        {product.priceFrom && (
          <p className="font-display tabular-nums text-foreground" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)" }}>
            dès <span className="text-accent">{product.priceFrom} €</span>
          </p>
        )}

        {product.links.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-2 pt-2">
            {product.links.map((l) => (
              <a
                key={l.url}
                href={l.url}
                rel="sponsored nofollow noopener"
                target="_blank"
                className="group/btn inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground transition-transform hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-6px_rgba(255,122,38,0.5)]"
              >
                Voir sur {l.merchant}
                {l.price ? (
                  <span className="tabular-nums opacity-80">— {l.price} €</span>
                ) : null}
                <ExternalLink className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function CompactPickCard({ product }: { product: AffiliateProduct }) {
  return (
    <article
      id={product.id}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-coal-900 transition-all hover:border-accent/40"
    >
      {product.badge && (
        <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-coal-900/90 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-accent">
          {BADGE_LABEL[product.badge]}
        </span>
      )}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-white/[0.03]">
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-primary">
            {product.brand}
          </span>
          {product.level && (
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
              · {product.level}
            </span>
          )}
        </div>
        <h3
          className="font-display font-medium leading-tight tracking-[-0.01em] text-balance"
          style={{ fontSize: "clamp(1.1rem, 2.2vw, 1.35rem)" }}
        >
          {product.name}
        </h3>
        <div className="flex items-center gap-2 text-sm">
          {ratingStars(product.rating)}
          {product.rating && (
            <span className="font-mono text-xs tabular-nums text-foreground/70">
              {product.rating.toFixed(1)}
            </span>
          )}
        </div>
        {product.priceFrom && (
          <p className="font-display text-xl tabular-nums text-foreground sm:text-2xl">
            dès {product.priceFrom} €
          </p>
        )}
        {product.links[0] && (
          <a
            href={product.links[0].url}
            rel="sponsored nofollow noopener"
            target="_blank"
            className="mt-auto inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-accent text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground transition-transform hover:-translate-y-0.5"
          >
            Voir sur {product.links[0].merchant}
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </article>
  );
}

function DetailCard({
  product,
  rank,
  reverse,
}: {
  product: AffiliateProduct;
  rank: number;
  reverse?: boolean;
}) {
  return (
    <article
      id={`${product.id}-detail`}
      className={`grid grid-cols-1 gap-6 overflow-hidden rounded-3xl border border-white/10 bg-coal-900 lg:grid-cols-2 lg:gap-10 ${
        reverse ? "lg:[&>div:first-child]:order-2" : ""
      }`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-white/[0.03] lg:aspect-auto lg:min-h-[400px]">
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-contain p-8"
        />
        {product.badge && (
          <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-foreground">
            {BADGE_LABEL[product.badge]}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-5 p-6 sm:p-8 lg:py-10 lg:pr-10">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/60">
            #{String(rank).padStart(2, "0")}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
            {product.brand}
          </span>
          {product.level && (
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              · niveau {product.level}
            </span>
          )}
        </div>
        <h3
          className="font-display font-medium leading-tight tracking-[-0.01em] text-balance"
          style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)" }}
        >
          {product.name}
        </h3>
        {product.tagline && (
          <p className="text-base italic text-foreground/75 sm:text-lg">
            {product.tagline}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {ratingStars(product.rating)}
          {product.rating && (
            <span className="font-mono text-xs tabular-nums text-foreground/80">
              {product.rating.toFixed(1)} / 5
            </span>
          )}
          {product.reviewCount && (
            <span className="font-mono text-xs text-foreground/60">
              ({product.reviewCount.toLocaleString("fr-FR")} avis)
            </span>
          )}
          {product.priceFrom && (
            <span className="ml-auto font-display text-2xl tabular-nums text-foreground">
              dès <span className="text-accent">{product.priceFrom} €</span>
            </span>
          )}
        </div>
        <p className="text-base leading-relaxed text-foreground/85 sm:text-[17px]">
          {product.description}
        </p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-300">
              + Points forts
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-foreground/85 sm:text-base">
              {product.pros.map((p, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          {product.cons && product.cons.length > 0 && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-300">
                − À savoir
              </p>
              <ul className="mt-2 space-y-1.5 text-sm text-foreground/85 sm:text-base">
                {product.cons.map((c, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {product.links.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {product.links.map((l) => (
              <a
                key={l.url}
                href={l.url}
                rel="sponsored nofollow noopener"
                target="_blank"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground transition-transform hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-6px_rgba(255,122,38,0.5)]"
              >
                Voir sur {l.merchant}
                {l.price ? (
                  <span className="tabular-nums opacity-80">— {l.price} €</span>
                ) : null}
                <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function ContentBlock({ block }: { block: AffiliateContentBlock }) {
  switch (block.type) {
    case "h2":
      return (
        <h2
          className="mt-10 font-display font-medium leading-tight tracking-[-0.02em] text-foreground first:mt-4"
          style={{ fontSize: "clamp(1.4rem, 2.8vw, 1.9rem)" }}
        >
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3
          className="mt-7 font-display font-medium leading-tight tracking-[-0.01em] text-foreground"
          style={{ fontSize: "clamp(1.15rem, 2.2vw, 1.5rem)" }}
        >
          {block.text}
        </h3>
      );
    case "p":
      return (
        <p
          className="mt-4 text-base leading-[1.75] text-foreground/85 [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:decoration-primary/40 [&_a]:underline-offset-[3px] [&_a:hover]:decoration-primary [&_strong]:font-semibold [&_strong]:text-foreground sm:text-[17px]"
          dangerouslySetInnerHTML={{ __html: block.html }}
        />
      );
    case "list":
      return (
        <div className="mt-7">
          {block.title && (
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
              {block.title}
            </p>
          )}
          <ul className="space-y-3">
            {block.items.map((item, i) => (
              <li key={i} className="flex gap-3 text-base leading-[1.7] text-foreground/85 sm:text-[17px]">
                <span className="mt-[10px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>
                  {item.title && (
                    <strong className="font-semibold text-foreground">
                      {item.title}.{" "}
                    </strong>
                  )}
                  {item.body}
                </span>
              </li>
            ))}
          </ul>
        </div>
      );
    case "table":
      return (
        <figure className="mt-8">
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-coal-900/60">
            <table className="w-full min-w-[420px] text-left text-sm sm:text-base">
              <thead>
                <tr className="border-b border-white/10 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {block.headers.map((h, i) => (
                    <th key={i} className="px-4 py-3 sm:px-5 sm:py-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={r} className="border-b border-white/5 tabular-nums last:border-b-0">
                    {row.map((cell, c) => (
                      <td
                        key={c}
                        className={`px-4 py-3 sm:px-5 sm:py-4 ${
                          c === 0 ? "font-semibold text-primary" : "text-foreground/85"
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {block.caption && (
            <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case "callout":
      return (
        <aside
          className={`mt-8 rounded-2xl border p-5 sm:p-6 ${
            block.tone === "warn"
              ? "border-amber-400/40 bg-amber-400/5"
              : "border-primary/40 bg-primary/5"
          }`}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
            {block.title}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/85 sm:text-base">
            {block.body}
          </p>
        </aside>
      );
  }
}

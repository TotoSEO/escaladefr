import Image from "next/image";
import Link from "next/link";
import { Star, ExternalLink, Check, X } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import type { AffiliateContentBlock, EquipementReview } from "@/lib/equipement";

function ratingStars(rating: number, size = "h-4 w-4") {
  return (
    <span className="flex items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${size} ${
            i < Math.round(rating) ? "fill-accent text-accent" : "text-white/15"
          }`}
        />
      ))}
    </span>
  );
}

export function ReviewView({
  review,
  relatedLanding,
  relatedArticles,
  otherReviews,
}: {
  review: EquipementReview;
  /** LP liée ("meilleurs …") pour le maillage retour. */
  relatedLanding?: { slug: string; h1: string } | null;
  /** Articles blog liés, déjà filtrés (publiés uniquement). */
  relatedArticles?: { slug: string; h1: string }[];
  /** Autres avis publiés pour le maillage. */
  otherReviews?: { slug: string; h1: string; rating: number }[];
}) {
  const updatedDate = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(review.updatedAt));

  return (
    <PageShell>
      {/* Hero */}
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
            <span aria-hidden>›</span>
            <Link href="/equipement/avis" className="hover:text-foreground">
              Avis
            </Link>
          </nav>

          <div className="mt-6 grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent">
                § Avis matériel · testé par Antoine
              </p>
              <h1
                className="mt-4 font-display font-medium leading-[0.96] tracking-[-0.025em] text-balance"
                style={{ fontSize: "clamp(1.9rem, 5vw, 3.4rem)" }}
              >
                {review.h1}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground/85 sm:text-lg">
                {review.chapo}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                <span className="flex items-center gap-2.5">
                  {ratingStars(review.rating, "h-5 w-5")}
                  <span className="font-display text-2xl tabular-nums text-foreground">
                    {review.rating.toFixed(1)}
                    <span className="text-base text-foreground/60"> / 5</span>
                  </span>
                </span>
                {review.priceFrom && (
                  <span className="font-display text-xl tabular-nums text-foreground/85">
                    dès <span className="text-accent">{review.priceFrom} €</span>
                  </span>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.22em]">
                <span className="rounded-full border border-white/15 bg-coal-900/60 px-3 py-1.5 text-foreground/80">
                  {review.testContext}
                </span>
                <span className="rounded-full border border-white/15 bg-coal-900/60 px-3 py-1.5 text-foreground/80">
                  Mis à jour le {updatedDate}
                </span>
              </div>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-coal-900">
              <Image
                src={review.image}
                alt={review.imageAlt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-contain p-8"
                priority
              />
            </div>
          </div>
        </div>
      </header>

      {/* Verdict direct */}
      <section className="surface-1">
        <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-12 lg:px-12">
          <div className="rounded-2xl border border-accent/25 bg-coal-900/70 p-5 sm:p-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
              Verdict en bref
            </p>
            <p className="mt-3 text-base leading-relaxed text-foreground/90 sm:text-lg">
              {review.verdict}
            </p>
          </div>

          {/* Pour / contre */}
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.04] p-5 sm:p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-300">
                + Ce qu&apos;on a aimé
              </p>
              <ul className="mt-3 space-y-2 text-sm text-foreground/85 sm:text-base">
                {review.pros.map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.04] p-5 sm:p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-300">
                − Ce qui peut freiner
              </p>
              <ul className="mt-3 space-y-2 text-sm text-foreground/85 sm:text-base">
                {review.cons.map((c, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Liens marchands */}
          {review.links.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-2">
              {review.links.map((l) => (
                <a
                  key={l.url}
                  href={l.url}
                  rel="nofollow noopener"
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground transition-transform hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-6px_rgba(255,122,38,0.5)]"
                >
                  Voir sur {l.merchant}
                  {l.price ? (
                    <span className="tabular-nums opacity-80">— {l.price} €</span>
                  ) : null}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ))}
              <span className="text-[11px] text-foreground/55">
                Lien non rémunéré, fourni à titre indicatif.
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Corps de l'avis */}
      <section className="border-t border-white/10 surface-2 text-foreground">
        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
          {review.sections.map((b, i) => (
            <ContentBlock key={i} block={b} />
          ))}
        </div>
      </section>

      {/* Alternatives */}
      {review.alternatives && review.alternatives.length > 0 && (
        <section className="border-t border-white/10 surface-1">
          <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
            <h2
              className="font-display font-medium leading-tight tracking-[-0.02em]"
              style={{ fontSize: "clamp(1.4rem, 2.8vw, 1.9rem)" }}
            >
              Les alternatives à considérer
            </h2>
            <ul className="mt-6 space-y-4">
              {review.alternatives.map((a, i) => (
                <li
                  key={i}
                  className="rounded-2xl border border-white/10 bg-coal-900/60 p-5 sm:p-6"
                >
                  <p className="font-display text-base font-medium text-foreground sm:text-lg">
                    {a.href ? (
                      <Link
                        href={a.href}
                        className="text-primary underline decoration-primary/40 underline-offset-[3px] hover:decoration-primary"
                      >
                        {a.name}
                      </Link>
                    ) : (
                      a.name
                    )}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/80 sm:text-base">
                    {a.comment}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* FAQ */}
      {review.faq && review.faq.length > 0 && (
        <section className="border-t border-white/10 surface-2 text-foreground">
          <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
              § FAQ
            </span>
            <h2
              className="mt-3 font-display font-medium leading-tight tracking-[-0.02em]"
              style={{ fontSize: "clamp(1.4rem, 2.8vw, 1.9rem)" }}
            >
              Les questions qu&apos;on nous pose sur le {review.productName}.
            </h2>
            <div className="mt-6 divide-y divide-white/10">
              {review.faq.map((qa, i) => (
                <details key={i} className="group py-5 transition-colors open:bg-white/[0.03]">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                    <span className="flex flex-1 items-baseline gap-3 font-display font-medium tracking-[-0.01em] sm:gap-4">
                      <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)" }}>{qa.q}</span>
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

      {/* Maillage : LP liée + autres avis */}
      {(relatedLanding || (otherReviews && otherReviews.length > 0)) && (
        <section className="border-t border-white/10 surface-warm">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent">
              § Continuer la lecture
            </span>
            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {relatedLanding && (
                <li>
                  <Link
                    href={`/equipement/${relatedLanding.slug}`}
                    className="group flex h-full flex-col gap-1.5 rounded-2xl border border-accent/25 bg-coal-900/60 p-5 transition-colors hover:border-accent/60 hover:bg-coal-900"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
                      Comparatif complet
                    </span>
                    <span className="font-display text-base font-medium tracking-[-0.01em] text-foreground sm:text-lg">
                      {relatedLanding.h1}
                    </span>
                    <span className="mt-auto inline-flex items-center gap-1 text-xs uppercase tracking-[0.22em] text-accent/70 transition-colors group-hover:text-accent">
                      Voir la sélection →
                    </span>
                  </Link>
                </li>
              )}
              {otherReviews?.map((r) => (
                <li key={r.slug}>
                  <Link
                    href={`/equipement/avis/${r.slug}`}
                    className="group flex h-full flex-col gap-1.5 rounded-2xl border border-white/10 bg-coal-900/60 p-5 transition-colors hover:border-primary/40 hover:bg-coal-900"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                      Avis matériel
                    </span>
                    <span className="font-display text-base font-medium tracking-[-0.01em] text-foreground sm:text-lg">
                      {r.h1}
                    </span>
                    <span className="mt-auto flex items-center gap-2 pt-1">
                      {ratingStars(r.rating, "h-3.5 w-3.5")}
                      <span className="font-mono text-xs tabular-nums text-foreground/70">
                        {r.rating.toFixed(1)} / 5
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {relatedArticles && relatedArticles.length > 0 && (
              <ul className="mt-8 space-y-3">
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
            )}
          </div>
        </section>
      )}

      {/* Footer EEAT auteur */}
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
                Avis rédigé par Antoine
              </p>
              <p className="mt-3 text-sm leading-relaxed text-foreground/85 sm:text-base">
                Treize ans d&apos;escalade, ancien compétiteur jeune FFME, 8a en
                falaise et 7b en bloc. Chaque avis croise l&apos;usage sur le
                terrain avec les retours de la communauté (forums, avis
                clients) et les tests de la presse spécialisée, pour donner un
                verdict honnête — défauts compris.
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

function ContentBlock({ block }: { block: AffiliateContentBlock }) {
  switch (block.type) {
    case "h2":
      return (
        <h2
          className="mt-10 font-display font-medium leading-tight tracking-[-0.02em] text-foreground first:mt-0"
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
              <li
                key={i}
                className="flex gap-3 text-base leading-[1.7] text-foreground/85 sm:text-[17px]"
              >
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
                  <tr
                    key={r}
                    className="border-b border-white/5 tabular-nums last:border-b-0"
                  >
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

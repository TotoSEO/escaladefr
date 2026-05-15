import Image from "next/image";
import Link from "next/link";
import { Star, ExternalLink, Check, X, Award, Sparkles } from "lucide-react";

import { PageShell, PageHeader } from "@/components/page-shell";
import type {
  AffiliateLanding,
  AffiliateProduct,
  AffiliateContentBlock,
} from "@/lib/equipement";

const BADGE_LABEL: Record<NonNullable<AffiliateProduct["badge"]>, string> = {
  "top-rated": "Le mieux noté",
  "best-value": "Meilleur rapport qualité-prix",
  "editor-choice": "Coup de cœur",
  premium: "Haut de gamme",
};

export function AffiliateLandingView({ landing }: { landing: AffiliateLanding }) {
  const updatedDate = new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(landing.updatedAt));

  return (
    <PageShell>
      <PageHeader
        section="§ Équipement"
        status="live"
        surface="warm"
        title={
          <>
            <span className="italic text-accent">{landing.h1}</span>
          </>
        }
        subtitle={landing.subtitle}
        image={{ src: landing.heroImage, alt: landing.heroImageAlt }}
      />

      <section className="relative surface-1 text-foreground">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
          <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/70">
            <span className="flex items-center gap-2 rounded-full border border-white/10 bg-coal-900/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em]">
              Mise à jour : {updatedDate}
            </span>
            <span className="flex items-center gap-2 rounded-full border border-white/10 bg-coal-900/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em]">
              {landing.products.length} produits testés
            </span>
            <span className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
              Sélection {landing.year}
            </span>
          </div>

          <p className="mt-5 max-w-3xl text-sm leading-relaxed text-foreground/70 sm:text-[15px]">
            <strong className="text-foreground">Transparence affiliation :</strong>{" "}
            cette page contient des liens d&apos;affiliation. Si tu achètes via
            l&apos;un de ces liens, le marchand nous reverse une petite
            commission, sans surcoût pour toi. Cela finance le site sans
            transformer le contenu en publicité. Les produits sélectionnés sont
            ceux qu&apos;on recommande réellement.
          </p>
        </div>
      </section>

      {/* Liste des produits */}
      <section className="relative surface-1 text-foreground">
        <div className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12">
          <div className="grid grid-cols-1 gap-6">
            {landing.products.map((p, i) => (
              <ProductCard key={p.id} product={p} rank={i + 1} />
            ))}
          </div>
        </div>
      </section>

      {/* Contenu éditorial SEO */}
      {landing.content.length > 0 && (
        <section className="relative surface-2 text-foreground">
          <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
            <div className="prose-blog">
              {landing.content.map((b, i) => (
                <ContentBlock key={i} block={b} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      {landing.faq.length > 0 && (
        <section className="relative surface-1 text-foreground">
          <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
              § FAQ
            </p>
            <h2
              className="mt-3 font-display font-medium leading-tight tracking-[-0.02em]"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)" }}
            >
              Tout ce qui se demande avant l&apos;achat.
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

      {/* Articles liés */}
      {landing.relatedBlogSlugs && landing.relatedBlogSlugs.length > 0 && (
        <section className="border-t border-white/10">
          <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
              § Pour aller plus loin
            </p>
            <ul className="mt-5 space-y-3">
              {landing.relatedBlogSlugs.map((slug) => (
                <li key={slug}>
                  <Link
                    href={`/blog/${slug}`}
                    className="group inline-flex items-center gap-2 font-display text-base font-medium text-foreground/85 transition-colors hover:text-primary sm:text-lg"
                  >
                    <span className="underline decoration-primary/30 decoration-2 underline-offset-[6px] transition-colors group-hover:decoration-primary">
                      → Lire l&apos;article guide associé
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </PageShell>
  );
}

function ProductCard({ product, rank }: { product: AffiliateProduct; rank: number }) {
  return (
    <article
      className={`group relative grid grid-cols-1 gap-0 overflow-hidden rounded-3xl border bg-coal-900 transition-all hover:border-accent/40 lg:grid-cols-[280px_1fr] lg:gap-8 ${
        product.badge === "editor-choice"
          ? "border-accent/40"
          : "border-white/10"
      }`}
    >
      {product.badge && (
        <span className="absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-accent-foreground shadow-lg">
          {product.badge === "editor-choice" ? (
            <Sparkles className="h-3 w-3" />
          ) : (
            <Award className="h-3 w-3" />
          )}
          {BADGE_LABEL[product.badge]}
        </span>
      )}

      <div className="relative aspect-square overflow-hidden bg-white/5 lg:aspect-auto lg:min-h-[260px]">
        <Image
          src={product.image}
          alt={product.imageAlt}
          fill
          sizes="(min-width: 1024px) 280px, 100vw"
          className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-col gap-4 p-6 sm:p-7 lg:py-8 lg:pr-8">
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
          style={{ fontSize: "clamp(1.3rem, 2.6vw, 1.75rem)" }}
        >
          {product.name}
        </h3>

        {product.tagline && (
          <p className="text-sm italic text-foreground/70 sm:text-base">
            {product.tagline}
          </p>
        )}

        {(product.rating || product.reviewCount || product.priceFrom) && (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {product.rating && (
              <span className="flex items-center gap-1.5">
                <span className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < Math.round(product.rating!)
                          ? "fill-accent text-accent"
                          : "text-white/15"
                      }`}
                    />
                  ))}
                </span>
                <span className="font-mono text-xs tabular-nums text-foreground/80">
                  {product.rating.toFixed(1)}
                </span>
              </span>
            )}
            {product.reviewCount && (
              <span className="font-mono text-xs text-foreground/60">
                · {product.reviewCount} avis
              </span>
            )}
            {product.priceFrom && (
              <span className="ml-auto font-display text-lg tabular-nums text-foreground sm:text-xl">
                dès {product.priceFrom} €
              </span>
            )}
          </div>
        )}

        <p className="text-sm leading-relaxed text-foreground/85 sm:text-[15px]">
          {product.description}
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-300">
              + Points forts
            </p>
            <ul className="mt-2 space-y-1.5 text-sm text-foreground/80">
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
              <ul className="mt-2 space-y-1.5 text-sm text-foreground/80">
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
                className="group/btn inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground transition-transform hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-6px_rgba(255,122,38,0.5)]"
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

function ContentBlock({ block }: { block: AffiliateContentBlock }) {
  switch (block.type) {
    case "h2":
      return (
        <h2
          className="mt-12 font-display font-medium leading-tight tracking-[-0.02em] text-foreground first:mt-0"
          style={{ fontSize: "clamp(1.5rem, 3vw, 2.1rem)" }}
        >
          {block.text}
        </h2>
      );
    case "h3":
      return (
        <h3
          className="mt-8 font-display font-medium leading-tight tracking-[-0.01em] text-foreground"
          style={{ fontSize: "clamp(1.2rem, 2.4vw, 1.55rem)" }}
        >
          {block.text}
        </h3>
      );
    case "p":
      return (
        <p
          className="mt-5 text-base leading-[1.75] text-foreground/85 [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:decoration-primary/40 [&_a]:underline-offset-[3px] [&_a:hover]:decoration-primary [&_strong]:font-semibold [&_strong]:text-foreground sm:text-[17px]"
          dangerouslySetInnerHTML={{ __html: block.html }}
        />
      );
    case "list":
      return (
        <div className="mt-8">
          {block.title && (
            <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
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
        <figure className="mt-10">
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
          className={`mt-10 rounded-2xl border p-5 sm:p-6 ${
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

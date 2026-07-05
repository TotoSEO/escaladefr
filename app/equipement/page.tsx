import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Star } from "lucide-react";

import { PageShell, PageHeader } from "@/components/page-shell";
import {
  CATEGORY_LABEL,
  fetchAllAffiliateLandings,
  fetchAllEquipementReviews,
} from "@/lib/equipement";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Trouver son équipement d'escalade : les sélections 2026",
  description:
    "Les meilleurs chaussons, baudriers, cordes, casques d'escalade en 2026. Comparatifs indépendants, avis détaillés, prix vérifiés chez les marchands français.",
  alternates: { canonical: "/equipement" },
};

export default async function EquipementHubPage() {
  const [landings, reviews] = await Promise.all([
    fetchAllAffiliateLandings(),
    fetchAllEquipementReviews(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "https://www.escalade-france.fr/equipement",
        url: "https://www.escalade-france.fr/equipement",
        name: "Trouver son équipement d'escalade",
        description:
          "Sélections de matériel d'escalade et comparatifs indépendants pour bien acheter.",
        isPartOf: { "@id": "https://www.escalade-france.fr/#website" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: "https://www.escalade-france.fr" },
          { "@type": "ListItem", position: 2, name: "Équipement", item: "https://www.escalade-france.fr/equipement" },
        ],
      },
      ...(landings.length > 0
        ? [
            {
              "@type": "ItemList",
              name: "Sélections d'équipement d'escalade",
              itemListElement: landings.map((l, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: l.h1,
                url: `https://www.escalade-france.fr/equipement/${l.slug}`,
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
        section="§ Équipement"
        status={landings.length > 0 ? "live" : "soon"}
        surface="warm"
        title={
          <>
            Trouver{" "}
            <span className="italic text-accent">son équipement</span>
            <br />
            d&apos;escalade.
          </>
        }
        subtitle="Des sélections honnêtes et 100 % indépendantes, mises à jour chaque saison. Pour chaque catégorie, on présente les modèles qu'on recommande vraiment, avec leurs forces et leurs limites — et la disponibilité est vérifiée chez les marchands."
      />

      <section className="relative surface-1 text-foreground">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          {landings.length === 0 ? (
            <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-coal-900/60 px-6 py-12 text-center sm:px-10 sm:py-16">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent">
                Bientôt en ligne
              </p>
              <h2
                className="mt-4 font-display font-medium leading-tight tracking-[-0.02em]"
                style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)" }}
              >
                Les premières sélections arrivent.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                Chaussons, baudriers, cordes, casques, crashpads. Une catégorie
                par semaine à partir de juin 2026, avec tests terrain et
                comparatifs chiffrés.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8 flex items-baseline justify-between gap-4">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent">
                  § Les sélections par catégorie
                </h2>
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                  {landings.length} comparatif{landings.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {landings.map((l) => (
                  <Link
                    key={l.slug}
                    href={`/equipement/${l.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-coal-900 transition-all hover:border-accent/40 hover:bg-coal-800"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={l.heroImage}
                        alt={l.heroImageAlt}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="flex flex-col gap-2 p-5 sm:p-6">
                      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
                        <span>§ {CATEGORY_LABEL[l.category]}</span>
                        <span className="text-white/15">·</span>
                        <span className="text-muted-foreground">
                          {l.products.length} modèles
                        </span>
                      </div>
                      <h3
                        className="font-display font-medium leading-tight tracking-[-0.01em]"
                        style={{ fontSize: "clamp(1.15rem, 2.2vw, 1.4rem)" }}
                      >
                        {l.h1}
                      </h3>
                      <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {l.subtitle}
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1 text-xs uppercase tracking-[0.22em] text-accent">
                        Voir la sélection
                        <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* Avis long format */}
          {reviews.length > 0 && (
            <div className="mt-16 border-t border-white/10 pt-12">
              <div className="mb-8 flex items-baseline justify-between gap-4">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                  § Nos avis matériel détaillés
                </h2>
                <Link
                  href="/equipement/avis"
                  className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-primary"
                >
                  Tous les avis →
                </Link>
              </div>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                {reviews.slice(0, 6).map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={`/equipement/avis/${r.slug}`}
                      className="group flex h-full flex-col gap-1.5 rounded-2xl border border-white/10 bg-coal-900/60 p-5 transition-colors hover:border-primary/40 hover:bg-coal-900"
                    >
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                        § {CATEGORY_LABEL[r.category]} · avis
                      </span>
                      <span className="font-display text-base font-medium tracking-[-0.01em] text-foreground sm:text-lg">
                        {r.h1}
                      </span>
                      <span className="mt-auto flex items-center gap-2 pt-1">
                        <span className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < Math.round(r.rating)
                                  ? "fill-accent text-accent"
                                  : "text-white/15"
                              }`}
                            />
                          ))}
                        </span>
                        <span className="font-mono text-xs tabular-nums text-foreground/70">
                          {r.rating.toFixed(1)} / 5
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-16 grid grid-cols-12 gap-y-6 border-t border-white/10 pt-12">
            <span className="col-span-12 font-mono text-[11px] uppercase tracking-[0.28em] text-primary sm:col-span-4">
              § Indépendance éditoriale
            </span>
            <div className="col-span-12 sm:col-span-8">
              <p className="text-base leading-relaxed text-foreground/85 sm:text-lg">
                Ces pages ne contiennent aucun lien rémunéré et aucune
                publicité. Les liens vers les marchands sont fournis
                uniquement pour t&apos;aider à trouver le produit au meilleur
                prix — le site ne touche rien sur tes achats.
              </p>
              <p className="mt-4 text-base leading-relaxed text-foreground/85 sm:text-lg">
                Les sélections s&apos;appuient sur l&apos;usage réel, les avis
                de la communauté (Snowleader, Hardloop, Decathlon), les
                comparatifs de la presse spécialisée (Alpine Mag,
                PlanetGrimpe) et le croisement avec les marques de référence
                du marché. Tu trouveras toujours les forces et les limites de
                chaque modèle, pas seulement les arguments commerciaux.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Star, ArrowUpRight } from "lucide-react";

import { PageShell, PageHeader } from "@/components/page-shell";
import { CATEGORY_LABEL, fetchAllEquipementReviews } from "@/lib/equipement";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Avis matériel d'escalade : nos tests détaillés et honnêtes",
  description:
    "Baudriers, chaussons, assureurs, casques : les avis détaillés d'Antoine sur le matériel d'escalade, après des mois d'utilisation réelle. Défauts compris.",
  alternates: { canonical: "/equipement/avis" },
};

export default async function EquipementAvisIndexPage() {
  const reviews = await fetchAllEquipementReviews();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "https://www.escalade-france.fr/equipement/avis",
        url: "https://www.escalade-france.fr/equipement/avis",
        name: "Avis matériel d'escalade",
        description:
          "Tests détaillés du matériel d'escalade après plusieurs mois d'utilisation réelle.",
        isPartOf: { "@id": "https://www.escalade-france.fr/#website" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: "https://www.escalade-france.fr" },
          { "@type": "ListItem", position: 2, name: "Équipement", item: "https://www.escalade-france.fr/equipement" },
          { "@type": "ListItem", position: 3, name: "Avis", item: "https://www.escalade-france.fr/equipement/avis" },
        ],
      },
      ...(reviews.length > 0
        ? [
            {
              "@type": "ItemList",
              name: "Avis matériel d'escalade",
              itemListElement: reviews.map((r, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: r.h1,
                url: `https://www.escalade-france.fr/equipement/avis/${r.slug}`,
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
        section="§ Équipement / Avis"
        status={reviews.length > 0 ? "live" : "soon"}
        surface="warm"
        title={
          <>
            Nos avis matériel,
            <br />
            <span className="italic text-accent">sans langue de bois</span>.
          </>
        }
        subtitle="Chaque avis est le fruit de plusieurs mois d'utilisation réelle, croisé avec les retours de la communauté et les tests de la presse spécialisée. On dit ce qui va — et ce qui ne va pas."
      />

      <section className="relative surface-1 text-foreground">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          {reviews.length === 0 ? (
            <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-coal-900/60 px-6 py-12 text-center sm:px-10 sm:py-16">
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent">
                Bientôt en ligne
              </p>
              <h2
                className="mt-4 font-display font-medium leading-tight tracking-[-0.02em]"
                style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)" }}
              >
                Les premiers avis arrivent.
              </h2>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r) => (
                <Link
                  key={r.slug}
                  href={`/equipement/avis/${r.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-coal-900 transition-all hover:border-accent/40 hover:bg-coal-800"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-white/5 to-coal-900">
                    <Image
                      src={r.image}
                      alt={r.imageAlt}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      className="object-contain p-6 transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5 sm:p-6">
                    <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
                      <span>§ {CATEGORY_LABEL[r.category]}</span>
                      <span className="text-white/15">·</span>
                      <span className="text-muted-foreground">{r.brand}</span>
                    </div>
                    <h2
                      className="font-display font-medium leading-tight tracking-[-0.01em]"
                      style={{ fontSize: "clamp(1.15rem, 2.2vw, 1.4rem)" }}
                    >
                      {r.h1}
                    </h2>
                    <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {r.verdict}
                    </p>
                    <span className="mt-auto flex items-center justify-between pt-2">
                      <span className="flex items-center gap-2">
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
                        <span className="font-mono text-xs tabular-nums text-foreground/80">
                          {r.rating.toFixed(1)}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.22em] text-accent">
                        Lire l&apos;avis
                        <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-16 grid grid-cols-12 gap-y-6 border-t border-white/10 pt-12">
            <span className="col-span-12 font-mono text-[11px] uppercase tracking-[0.28em] text-primary sm:col-span-4">
              § Notre méthode
            </span>
            <div className="col-span-12 sm:col-span-8">
              <p className="text-base leading-relaxed text-foreground/85 sm:text-lg">
                Chaque produit est utilisé plusieurs mois en conditions
                réelles — salle, falaise, bloc — avant qu&apos;on publie un
                avis. On croise ensuite notre expérience avec les retours de
                la communauté (forums, avis clients) et les tests de la presse
                spécialisée. Aucun lien rémunéré, aucun produit offert par une
                marque : quand un modèle déçoit, on l&apos;écrit.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

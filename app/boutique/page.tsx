import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";

import { PageShell, PageHeader } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Boutique escalade · chaussons, baudriers, cordes et plus",
  description:
    "Sélections de matériel d'escalade testé : chaussons, baudriers, cordes, casques. Comparatifs honnêtes et liens d'affiliation transparents.",
  alternates: { canonical: "/boutique" },
};

const CATEGORIES = [
  {
    cat: "Chaussons",
    desc: "Sport, polyvalent, dévers, dalle. On compare par usage réel, pas par marque.",
  },
  {
    cat: "Baudriers",
    desc: "Falaise, grande voie, alpinisme léger. Tout dépend de comment tu grimpes.",
  },
  {
    cat: "Cordes",
    desc: "Diamètre, longueur, traitement. Ce qui change vraiment selon le terrain.",
  },
  {
    cat: "Sécurité",
    desc: "Casques, dégaines, descendeurs, anti-chute. Les bases qu'on ne lésine pas.",
  },
  {
    cat: "Crashpads",
    desc: "Pour le bloc en extérieur. Densité, taille, transport.",
  },
  {
    cat: "Confort & entraînement",
    desc: "Magnésie, brosses, hangboards. Les petits trucs qui changent la donne.",
  },
];

export default function BoutiquePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "https://escalade-france.fr/boutique",
        url: "https://escalade-france.fr/boutique",
        name: "Boutique d'équipement d'escalade",
        isPartOf: { "@id": "https://escalade-france.fr/#website" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: "https://escalade-france.fr" },
          { "@type": "ListItem", position: 2, name: "Boutique", item: "https://escalade-france.fr/boutique" },
        ],
      },
      {
        "@type": "ItemList",
        name: "Catégories de matériel d'escalade",
        itemListElement: CATEGORIES.map((c, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: c.cat,
          description: c.desc,
        })),
      },
    ],
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader
        section="§ Boutique"
        status="later"
        surface="warm"
        title={
          <>
            Du matos{" "}
            <span className="italic text-accent">choisi</span>,
            <br />
            pas du matos poussé.
          </>
        }
        subtitle="Bientôt : des sélections de matériel testé sur des sessions réelles. Liens d'affiliation transparents pour soutenir le projet, sans transformer le site en supermarché."
      />

      <section className="relative surface-1 text-foreground">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c, i) => (
              <article
                key={i}
                className="group flex items-start gap-4 bg-coal-900 p-6 transition-colors hover:bg-coal-800 sm:p-8"
              >
                <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-foreground/80 transition-colors group-hover:border-accent group-hover:text-accent">
                  <ShoppingBag className="h-4 w-4" />
                </span>
                <div>
                  <h3
                    className="font-display font-medium tracking-[-0.02em]"
                    style={{ fontSize: "clamp(1.4rem, 2.6vw, 1.875rem)" }}
                  >
                    {c.cat}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                    {c.desc}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-16 grid grid-cols-12 gap-y-6 border-t border-white/10 pt-12">
            <span className="col-span-12 font-mono text-[11px] uppercase tracking-[0.28em] text-primary sm:col-span-4">
              § Notre règle
            </span>
            <div className="col-span-12 sm:col-span-8">
              <p
                className="font-display font-medium leading-[0.96] tracking-[-0.02em] text-balance"
                style={{ fontSize: "clamp(1.7rem, 4vw, 3.5rem)" }}
              >
                Si on ne grimperait pas avec,
                <br />
                <span className="italic text-accent">on ne le vend pas</span>.
              </p>
              <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Les liens d&apos;affiliation financent le projet, on l&apos;assume.
                Mais on refuse de transformer le site en catalogue. Chaque
                produit recommandé sera testé sur le terrain par quelqu&apos;un
                qui l&apos;utilise vraiment. Pas de gros volume, juste les
                bonnes pioches.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

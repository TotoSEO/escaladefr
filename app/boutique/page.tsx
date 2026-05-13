import type { Metadata } from "next";
import { ShoppingBag } from "lucide-react";

import { PageShell, PageHeader } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Boutique · sélections matériel escalade",
  description:
    "Sélections de matériel d'escalade testé. Chaussons, baudriers, cordes, casques. Comparatifs honnêtes, liens d'affiliation transparents. Bientôt en ligne.",
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
  return (
    <PageShell>
      <PageHeader
        section="§ Boutique"
        status="later"
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

      <section className="relative bg-background">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((c, i) => (
              <article
                key={i}
                className="group flex items-start gap-4 bg-background p-6 transition-colors hover:bg-secondary sm:p-8"
              >
                <span className="mt-1 flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground/80 transition-colors group-hover:border-accent group-hover:text-accent">
                  <ShoppingBag className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-display text-2xl font-medium tracking-[-0.02em] sm:text-3xl">
                    {c.cat}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                    {c.desc}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-16 grid grid-cols-12 gap-y-6 border-t border-border pt-12">
            <span className="col-span-12 font-mono text-[11px] uppercase tracking-[0.28em] text-primary sm:col-span-4">
              § Notre règle
            </span>
            <div className="col-span-12 sm:col-span-8">
              <p className="font-display text-3xl font-medium leading-tight tracking-[-0.02em] sm:text-4xl lg:text-5xl">
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

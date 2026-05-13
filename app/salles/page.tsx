import type { Metadata } from "next";
import Link from "next/link";

import { PageShell, PageHeader } from "@/components/page-shell";
import { SallesMap } from "@/components/salles/salles-map";
import { fetchAllSallesForMap } from "@/lib/salles";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const salles = await fetchAllSallesForMap();
  const total = salles.length;
  return {
    title: `${total.toLocaleString("fr-FR")} salles d'escalade en France · Carte`,
    description: `Carte interactive des ${total.toLocaleString("fr-FR")} salles d'escalade indoor en France. Bloc, voie, mixte. Filtre par ville et par discipline.`,
    alternates: { canonical: "/salles" },
  };
}

const FAQ = [
  {
    q: "À quoi sert un annuaire des salles ?",
    a: "À trouver vite. Tu déménages, tu pars en week-end, tu cherches une salle pour une session de bloc à 21h un mardi. La question n'est pas seulement où elle se trouve, mais quel type de pratique elle propose, quels horaires, quel niveau de difficulté. On regroupe tout ça pour que le filtre fasse le boulot à ta place.",
  },
  {
    q: "Vous référencez tous les types de salles ?",
    a: "Oui : les salles de bloc pures, les salles de voie avec moulinette ou tête, les salles mixtes, les bigwall, les structures associatives, les structures privées. Tant que c'est une infrastructure dédiée à l'escalade ouverte au public, on la liste.",
  },
  {
    q: "D'où viennent les données ?",
    a: "On part d'une compilation de données publiques (notamment OpenStreetMap), qu'on croise avec les sites officiels des salles et les ouvertures récentes. C'est un travail vivant : si tu vois manquer une salle ou si une fiche contient une erreur, écris-nous.",
  },
  {
    q: "Est-ce qu'on peut comparer plusieurs salles ?",
    a: "Pas encore, mais c'est dans la liste des fonctionnalités. L'idée c'est de pouvoir cocher 2 ou 3 salles côte à côte pour comparer les surfaces, les niveaux proposés, les tarifs, les horaires. Utile quand on hésite entre deux salles proches.",
  },
];

export default async function SallesPage() {
  const salles = await fetchAllSallesForMap();
  const total = salles.length;
  const villesMap = new Map<string, number>();
  const chainesMap = new Map<string, number>();
  for (const s of salles) {
    if (s.ville) villesMap.set(s.ville, (villesMap.get(s.ville) ?? 0) + 1);
    if (s.chaine) chainesMap.set(s.chaine, (chainesMap.get(s.chaine) ?? 0) + 1);
  }
  const topVilles = [...villesMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
  const topChaines = [...chainesMap.entries()].sort((a, b) => b[1] - a[1]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://escalade-france.fr/salles",
        url: "https://escalade-france.fr/salles",
        name: `${total} salles d'escalade en France`,
        description:
          "Annuaire et carte interactive des salles d'escalade indoor en France.",
        isPartOf: { "@id": "https://escalade-france.fr/#website" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: "https://escalade-france.fr" },
          { "@type": "ListItem", position: 2, name: "Salles d'escalade", item: "https://escalade-france.fr/salles" },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
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
        section="§ Pilier 02 / Indoor"
        status="live"
        surface="warm"
        title={
          <>
            {total.toLocaleString("fr-FR")} salles
            <br />
            d&apos;escalade{" "}
            <span className="italic text-primary glow-ice-text">indoor</span>,
            <br />
            sur une carte.
          </>
        }
        subtitle="Toutes les salles d'escalade indoor recensées en France. Bloc, voie, mixte, bigwall. Données publiques et collecte vivante."
      />

      {/* Carte */}
      <section className="relative surface-1 text-foreground">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
          <SallesMap salles={salles} />
          <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:text-xs">
            Fond de carte © OpenStreetMap contributors, © CARTO · Données salles © OpenStreetMap contributors (ODbL)
          </p>
        </div>
      </section>

      {/* Top villes + top chaînes */}
      <section className="relative surface-2 text-foreground">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="grid grid-cols-12 gap-y-12 sm:gap-x-12">
            <div className="col-span-12 sm:col-span-6">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                § Top villes
              </span>
              <h2
                className="mt-3 font-display font-medium leading-[0.96] tracking-[-0.02em] text-balance"
                style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.6rem)" }}
              >
                Les villes les plus équipées.
              </h2>
              {topVilles.length > 0 ? (
                <ul className="mt-6 divide-y divide-white/10 rounded-2xl border border-white/10 bg-coal-900/60">
                  {topVilles.map(([ville, count], i) => (
                    <li
                      key={ville}
                      className="flex items-baseline justify-between gap-3 px-5 py-3.5"
                    >
                      <span className="flex items-baseline gap-3">
                        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="font-display text-base sm:text-lg">{ville}</span>
                      </span>
                      <span className="font-mono text-xs tabular-nums text-primary">
                        {count}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-6 text-muted-foreground">
                  Aucune ville renseignée pour le moment.
                </p>
              )}
            </div>

            <div className="col-span-12 sm:col-span-6">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent">
                § Chaînes détectées
              </span>
              <h2
                className="mt-3 font-display font-medium leading-[0.96] tracking-[-0.02em] text-balance"
                style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.6rem)" }}
              >
                Réseaux et enseignes.
              </h2>
              {topChaines.length > 0 ? (
                <ul className="mt-6 grid grid-cols-1 gap-2">
                  {topChaines.map(([chaine, count]) => (
                    <li
                      key={chaine}
                      className="flex items-baseline justify-between gap-3 rounded-xl border border-white/10 bg-coal-900/60 px-5 py-3.5"
                    >
                      <span className="font-display text-base sm:text-lg">
                        {chaine}
                      </span>
                      <span className="font-mono text-xs tabular-nums text-accent">
                        {count} salle{count > 1 ? "s" : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-6 text-muted-foreground">
                  Aucune chaîne identifiée pour le moment.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative surface-warm text-foreground">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="mb-10 sm:mb-14">
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
              § FAQ
            </span>
            <h2
              className="mt-4 font-display font-medium leading-[0.96] tracking-[-0.02em] text-balance"
              style={{ fontSize: "clamp(1.85rem, 5vw, 4.4rem)" }}
            >
              Avant qu&apos;on{" "}
              <span className="italic text-primary glow-ice-text">vous le demande</span>.
            </h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-coal-900/60">
            {FAQ.map((item, i) => (
              <details
                key={i}
                className="group border-b border-white/10 px-5 py-5 transition-colors last:border-b-0 open:bg-white/[0.03] sm:px-7 sm:py-7"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                  <span className="flex flex-1 items-baseline gap-3 font-display font-medium tracking-[-0.01em] sm:gap-4">
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span style={{ fontSize: "clamp(1.1rem, 2.2vw, 1.6rem)" }}>
                      {item.q}
                    </span>
                  </span>
                  <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 transition-transform group-open:rotate-45">
                    <span className="block h-3 w-px bg-foreground" />
                    <span className="block h-px w-3 -translate-x-3 bg-foreground" />
                  </span>
                </summary>
                <p className="mt-4 max-w-3xl pl-8 pr-1 text-sm leading-relaxed text-muted-foreground sm:pl-12 sm:text-base">
                  {item.a}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center">
            <p className="max-w-xl text-sm text-muted-foreground">
              Tu gères une salle et tu veux vérifier ses infos ? Écris-nous,
              on prépare un accès dédié pour ça.
            </p>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-5 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:border-primary hover:text-primary"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

    </PageShell>
  );
}

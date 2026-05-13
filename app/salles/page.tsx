import type { Metadata } from "next";
import Link from "next/link";
import { Search, Filter, MapPin, Building2 } from "lucide-react";

import { PageShell, PageHeader } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Annuaire des salles d'escalade en France · Bloc et voie",
  description:
    "Annuaire des salles d'escalade en France. Bloc, voie, bigwall. Filtre par ville et par discipline. Carte interactive complète à venir.",
  alternates: { canonical: "/salles" },
};

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
    q: "Comment vous récupérez les informations ?",
    a: "Pour l'instant, à la main. On part des listes publiques de clubs et de salles, on croise avec les ouvertures récentes qui ne sont pas toujours référencées, et on vérifie chaque fiche sur le site officiel de la salle. C'est long, mais c'est le seul moyen d'avoir des infos justes. À terme on ouvrira un formulaire pour que les salles puissent corriger directement leur fiche.",
  },
  {
    q: "Est-ce qu'on peut comparer plusieurs salles ?",
    a: "Pas encore, mais c'est dans la liste des fonctionnalités. L'idée c'est de pouvoir cocher 2 ou 3 salles côte à côte pour comparer les surfaces, les niveaux proposés, les tarifs, les horaires. Utile quand on hésite entre deux salles proches.",
  },
];

export default function SallesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://escalade-france.fr/salles",
        url: "https://escalade-france.fr/salles",
        name: "Annuaire des salles d'escalade en France",
        description:
          "Annuaire complet des salles d'escalade indoor en France : bloc, voie, mixte.",
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
        status="soon"
        surface="warm"
        title={
          <>
            L&apos;annuaire des{" "}
            <span className="italic text-primary glow-ice-text">salles</span>
            <br />
            d&apos;escalade de France.
          </>
        }
        subtitle="Bloc, voie, bigwall. Filtre par ville, par discipline, par horaires. La liste complète arrive en juin 2026 avec une carte interactive."
      />

      {/* Aperçu split layout — surface 1 */}
      <section className="relative overflow-hidden surface-1 text-foreground">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-20 lg:px-12">
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 lg:grid-cols-[420px_1fr]">
            {/* Colonne gauche : liste filtrable placeholder */}
            <div className="bg-coal-900 p-5 sm:p-7">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3">
                <Search className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Rechercher une salle, une ville
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {["Bloc", "Voie", "Bigwall", "Salle mixte", "< 5 km"].map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/70"
                  >
                    <Filter className="h-3 w-3" />
                    {f}
                  </span>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                {[
                  { nom: "Arkose Nation", ville: "Paris 12", type: "Bloc" },
                  { nom: "Climb Up Aubervilliers", ville: "Seine-Saint-Denis", type: "Voie + bloc" },
                  { nom: "Vertical'Art Pigalle", ville: "Paris 9", type: "Voie + bloc" },
                  { nom: "Hardbloc", ville: "Paris 19", type: "Bloc" },
                  { nom: "Antrebloc", ville: "Villeurbanne", type: "Bloc" },
                ].map((salle, i) => (
                  <article
                    key={i}
                    className="group flex items-start gap-3 border-b border-white/5 pb-3 last:border-0"
                  >
                    <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/5">
                      <Building2 className="h-3.5 w-3.5 text-primary" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-display text-lg font-medium tracking-[-0.01em]">
                        {salle.nom}
                      </h3>
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        {salle.ville} · {salle.type}
                      </p>
                    </div>
                  </article>
                ))}
                <p className="pt-2 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Aperçu · base complète en construction
                </p>
              </div>
            </div>

            {/* Colonne droite : carte placeholder */}
            <div className="relative aspect-[4/3] bg-gradient-to-br from-coal-800 to-coal-900 lg:aspect-auto noise">
              <div
                aria-hidden
                className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(125,222,255,0.15),transparent_55%)]"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                <MapPin className="h-6 w-6 text-primary" />
                <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                  Carte de France
                </p>
                <p
                  className="max-w-sm font-display font-medium leading-tight tracking-[-0.01em]"
                  style={{ fontSize: "clamp(1.3rem, 3vw, 2rem)" }}
                >
                  Toutes les salles, visibles d&apos;un coup d&apos;œil.
                </p>
              </div>
              {[
                { top: "25%", left: "30%" },
                { top: "30%", left: "55%" },
                { top: "60%", left: "20%" },
                { top: "55%", left: "70%" },
                { top: "70%", left: "45%" },
                { top: "20%", left: "70%" },
              ].map((p, i) => (
                <span
                  key={i}
                  className="absolute h-1.5 w-1.5 rounded-full bg-primary pulse-ice"
                  style={{ top: p.top, left: p.left }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SEO content — surface 0 noir pur */}
      <section className="relative surface-0 text-foreground">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="grid grid-cols-12 gap-y-10 sm:gap-x-12">
            <div className="col-span-12 sm:col-span-4 lg:col-span-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                § Ce qu&apos;on prépare
              </span>
            </div>
            <div className="col-span-12 sm:col-span-8 lg:col-span-9">
              <h2
                className="font-display font-medium leading-[0.96] tracking-[-0.02em] text-balance"
                style={{ fontSize: "clamp(1.85rem, 4.6vw, 4rem)" }}
              >
                Trouver une salle ne devrait pas{" "}
                <span className="italic text-primary glow-ice-text">
                  prendre 20 minutes
                </span>
                .
              </h2>
              <div className="mt-10 grid gap-8 text-base leading-relaxed text-muted-foreground sm:grid-cols-2 sm:gap-12 sm:text-lg">
                <p>
                  Quand on déménage, qu&apos;on part en déplacement pro, ou
                  qu&apos;on cherche juste une salle plus proche que celle
                  qu&apos;on connaît, on perd un temps fou à comparer cinq
                  sites différents. Chacun a sa carte, ses horaires planqués
                  dans le footer, ses tarifs réservés aux abonnés.
                </p>
                <p>
                  L&apos;idée ici, c&apos;est de tout ramener à un endroit
                  unique. La liste complète des salles, classées par ville et
                  par discipline. Une carte qui te montre ce qu&apos;il y a
                  autour de toi. Des fiches qui répondent aux questions
                  concrètes : ça ouvre à quelle heure, c&apos;est combien le
                  pass séance, est-ce qu&apos;il y a du bloc et de la voie.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ — surface chaude */}
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
              <span className="italic text-primary glow-ice-text">
                vous le demande
              </span>
              .
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
              Tu gères une salle et tu veux vérifier ses infos avant la mise en
              ligne ? Écris-nous, on prépare un accès dédié pour ça.
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

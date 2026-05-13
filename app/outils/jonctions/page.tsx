import type { Metadata } from "next";
import Link from "next/link";

import { PageShell, PageHeader } from "@/components/page-shell";
import { JonctionsCalculator } from "@/components/tools/jonctions-calculator";

export const metadata: Metadata = {
  title: "Calculateur de jonctions et rappels grande voie",
  description:
    "Pour les grandes voies : hauteur, nombre de longueurs, type de corde. On calcule la longueur moyenne par relais et le nombre de rappels pour la descente.",
  alternates: { canonical: "/outils/jonctions" },
};

const FAQ = [
  {
    q: "À quoi sert ce calculateur exactement ?",
    a: "À planifier une grande voie avant le départ. Tu donnes la hauteur totale, le nombre de relais et la corde dont tu disposes. On te dit si ta corde permet d'enchaîner les longueurs telles qu'elles sont coupées sur le topo, combien de rappels prévoir pour la descente, et quelques alertes selon la configuration (corde simple sur grande voie, zigzags, manœuvres allongées).",
  },
  {
    q: "Pourquoi 2 m de marge sur la longueur de corde ?",
    a: "Une corde de 60 m ne donne pas 60 m utiles. Il faut compter le nœud d'attache au baudrier (1 m) et la marge au relais pour clipper le mousqueton et avoir de quoi vacher le second. On retient donc 58 m utiles pour une corde de 60 m, ce qui correspond à ce qu'on observe en pratique sur les grandes voies françaises.",
  },
  {
    q: "Comment se calcule le nombre de rappels ?",
    a: "Avec une corde simple plié en deux, on descend sur la moitié de sa longueur, marge déduite. Une 60 m permet donc environ 29 m de rappel. Avec deux brins joints (double 60 m), on descend sur la longueur entière moins une marge, soit environ 58 m. Le nombre de rappels c'est la hauteur totale divisée par cette descente par rappel, arrondie au supérieur.",
  },
  {
    q: "Et si je veux descendre par une autre voie ?",
    a: "Le calcul reste le même : c'est la hauteur à descendre qui compte, pas la voie. Sur un site où la descente se fait à pied par un sentier, ce calculateur n'a pas d'intérêt. Il sert vraiment quand la sortie de la voie n'a pas d'option pédestre et que tu dois redescendre sur la voie ou sur une voie de rappel équipée.",
  },
  {
    q: "Pourquoi recommander une corde de rappel sur grande voie en simple ?",
    a: "Une corde simple plié en deux limite chaque rappel à 25-29 m selon le diamètre. Sur une grande voie qui dépasse 200 m, ça multiplie les manœuvres et le temps perdu. La corde de rappel statique légère (50 ou 70 m, autour de 6 mm) se nettoie sur le sac et permet de faire des rappels longs en complément de la corde simple, sans alourdir la grimpe en tête.",
  },
  {
    q: "Le double brin, c'est pour qui ?",
    a: "Pour la grande voie engagée avec passages en zigzag, pour le trad où on peut séparer les deux brins entre les protections pour limiter le tirage, et pour pouvoir descendre en rappel sur deux brins (donc longueur entière au lieu de la moitié). Le double pèse plus, oblige à gérer deux brins au relais, mais reste la configuration de référence pour les grandes voies sérieuses en France.",
  },
];

export default function JonctionsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Calculateur de jonctions et rappels grande voie",
        applicationCategory: "SportsApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        url: "https://escalade-france.fr/outils/jonctions",
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: "https://escalade-france.fr" },
          { "@type": "ListItem", position: 2, name: "Outils", item: "https://escalade-france.fr/outils" },
          {
            "@type": "ListItem",
            position: 3,
            name: "Calculateur de jonctions",
            item: "https://escalade-france.fr/outils/jonctions",
          },
        ],
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
        section="§ Outil 03 / Jonctions"
        status="live"
        surface="cool"
        title={
          <>
            Grande voie :
            <br />
            <span className="italic text-primary glow-ice-text">
              corde, relais, rappels
            </span>
            .
          </>
        }
        subtitle="Tu donnes la hauteur totale, le nombre de longueurs et la corde que tu emportes. On vérifie que ça passe, on compte les rappels pour la descente, on te prévient si la configuration mérite réflexion."
      />

      {/* Calculateur */}
      <section className="relative surface-2 text-foreground">
        <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
          <JonctionsCalculator />
          <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Les marges retenues (2 m sur les longueurs, 1 m sur les rappels)
            correspondent à la pratique courante. Adapte si ta corde est très
            usée, allongée ou si tu pars en double sur un terrain humide.
          </p>
        </div>
      </section>

      {/* Pratique */}
      <section className="relative surface-3 text-foreground">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="grid grid-cols-12 gap-y-10 sm:gap-x-12">
            <div className="col-span-12 sm:col-span-4 lg:col-span-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                § Avant le départ
              </span>
            </div>
            <div className="col-span-12 sm:col-span-8 lg:col-span-9">
              <h2
                className="font-display font-medium leading-[0.96] tracking-[-0.02em] text-balance"
                style={{ fontSize: "clamp(1.85rem, 5vw, 4.4rem)" }}
              >
                Préparer la grande voie,{" "}
                <span className="italic text-primary glow-ice-text">
                  pas seulement le matériel
                </span>
                .
              </h2>
              <div className="mt-12 grid gap-8 sm:grid-cols-2 sm:gap-10">
                <Point
                  title="Lis le topo intégralement"
                  body="Hauteur totale, nombre de longueurs annoncées, longueur la plus longue, équipement à demeure ou non, présence de relais d'abandon pour le rappel. Si une seule longueur dépasse 30 m, ton choix de corde doit s'y adapter."
                />
                <Point
                  title="Choisis la fenêtre météo"
                  body="Une grande voie expose plus longtemps qu'une école d'escalade. Vise quatre à six heures de météo stable, vent inférieur à 30 km/h, pas de risque orageux annoncé même tard l'après-midi. L'orientation joue aussi : nord à l'ombre tout l'été, sud trop chaud d'avril à septembre."
                />
                <Point
                  title="Prévois la descente"
                  body="Le calcul ci-dessus te donne le nombre de rappels. Note l'emplacement de chaque relais de rappel sur le topo, repère les zones de tirage (anneaux mal placés, voies en zigzag), prépare une corde de rappel statique légère si tu pars en simple et que la descente est longue."
                />
                <Point
                  title="Garde une marge de temps"
                  body="Sur une grande voie de 300 m en 5/6, prévois 5-7 h pour une cordée homogène, montée + descente. Si l'horaire dérape, mieux vaut renoncer à mi-voie et redescendre que de bivouaquer à 200 m du sol par 8°C la nuit."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative surface-1 text-foreground">
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
              Les questions{" "}
              <span className="italic text-primary glow-ice-text">utiles</span>.
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

          <div className="mt-12 flex items-center justify-between gap-4 border-t border-white/10 pt-8 sm:mt-16">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Outil 03 / 03
            </span>
            <Link
              href="/outils"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors hover:border-primary hover:text-primary"
            >
              Tous les outils
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Point({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3
        className="font-display font-medium tracking-[-0.01em]"
        style={{ fontSize: "clamp(1.3rem, 2.4vw, 1.875rem)" }}
      >
        {title}
      </h3>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">
        {body}
      </p>
    </div>
  );
}

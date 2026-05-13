import type { Metadata } from "next";
import Link from "next/link";

import { PageShell, PageHeader } from "@/components/page-shell";
import { GradeConverter } from "@/components/tools/grade-converter";
import { ROUTE_GRADES, BOULDER_GRADES } from "@/lib/grades";

export const metadata: Metadata = {
  title: "Convertisseur de cotations d'escalade · français, UIAA, YDS",
  description:
    "Convertis les cotations d'escalade entre français, UIAA, YDS américain et britannique. Pour la voie et le bloc. Outil gratuit en ligne.",
  alternates: { canonical: "/outils/cotations" },
  openGraph: {
    title: "Convertisseur de cotations d'escalade",
    description:
      "Conversions entre cotation française, UIAA, YDS et britannique. Voie et bloc.",
    type: "website",
  },
};

const FAQ = [
  {
    q: "Pourquoi les conversions varient-elles d'un site à l'autre ?",
    a: "Il n'existe pas de table officielle universellement acceptée. Chaque système a sa propre logique : le français découpe finement la difficulté technique, le britannique combine engagement et technique, le YDS américain raisonne plus globalement. Les correspondances qu'on présente ici croisent plusieurs sources de référence pour rester au plus proche de la pratique courante. Vois-les comme des repères solides, pas comme des conversions exactes au sens mathématique.",
  },
  {
    q: "Comment lire la cotation française ?",
    a: "Un chiffre (de 3 à 9) suivi d'une lettre (a, b, c) et parfois d'un plus. Le chiffre indique le niveau global, la lettre raffine dans ce niveau, le plus indique un cran de difficulté supplémentaire. 6a est plus facile que 6a+, qui est plus facile que 6b. Le saut entre deux niveaux complets (par exemple 6c vers 7a) est ressenti comme conséquent.",
  },
  {
    q: "Quelle différence entre la voie et le bloc ?",
    a: "La voie se grimpe à la corde, en longueur. La cotation prend en compte l'effort global et la résistance demandée. Le bloc se grimpe sans corde, près du sol, sur des passages très courts et explosifs. Le système Font (Fontainebleau) est la référence mondiale pour le bloc, le V-scale (de Hueco Tanks au Texas) est l'équivalent américain.",
  },
  {
    q: "Le système UIAA est-il encore utilisé ?",
    a: "Oui, principalement en Allemagne, en Autriche, en Suisse et plus largement en Europe centrale. Il reste pertinent pour les grandes voies alpines et les sites d'Europe de l'Est. En France, en Espagne ou en Italie, on rencontre plutôt la cotation française dans la pratique courante.",
  },
  {
    q: "Le système britannique a deux notations, pourquoi ?",
    a: "Le britannique combine deux infos. La cotation technique (4a, 5a, 6b...) évalue uniquement la difficulté du mouvement le plus dur. La cotation d'engagement (E1, E2, E3...) évalue le sérieux global de la voie : qualité de la protection, hauteur potentielle de chute, exposition. Une voie peut être techniquement abordable mais dangereuse, ou inversement. Les deux notations vont ensemble.",
  },
  {
    q: "Pour un débutant qui sort de salle, c'est quoi un bon objectif ?",
    a: "En salle on commence souvent autour du 4 à 5. Sortir en falaise dans le 5b ou 5c est déjà une belle étape : le rocher demande des techniques différentes des prises de salle, et la lecture du passage devient cruciale. Vise plutôt de la qualité de mouvement que la difficulté brute en début.",
  },
];

export default function CotationsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Convertisseur de cotations d'escalade",
        description:
          "Outil de conversion entre les cotations d'escalade française, UIAA, YDS américain et britannique, pour la voie et le bloc.",
        applicationCategory: "SportsApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        url: "https://escalade-france.fr/outils/cotations",
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
            name: "Convertisseur de cotations",
            item: "https://escalade-france.fr/outils/cotations",
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
        section="§ Outil 01 / Convertisseur"
        status="live"
        surface="cool"
        title={
          <>
            Cotations d&apos;escalade,
            <br />
            <span className="italic text-primary glow-ice-text">tous systèmes</span>.
          </>
        }
        subtitle="Du français à l'américain en passant par le britannique. Voie et bloc. Sélectionne une cotation, on te donne les équivalences dans les autres systèmes."
      />

      {/* Convertisseur */}
      <section className="relative surface-2 text-foreground">
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
          <GradeConverter />
          <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Les correspondances sont indicatives : il n&apos;existe pas de
            tableau officiel universellement accepté. On a croisé plusieurs
            références internationales pour rester au plus proche de la
            pratique.
          </p>
        </div>
      </section>

      {/* Comprendre les systèmes — surface 2 */}
      <section className="relative surface-3 text-foreground">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="grid grid-cols-12 gap-y-10 sm:gap-x-12">
            <div className="col-span-12 sm:col-span-4 lg:col-span-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                § Comprendre
              </span>
            </div>
            <div className="col-span-12 sm:col-span-8 lg:col-span-9">
              <h2
                className="font-display font-medium leading-[0.96] tracking-[-0.02em] text-balance"
                style={{ fontSize: "clamp(1.85rem, 5vw, 4.4rem)" }}
              >
                Cinq systèmes,{" "}
                <span className="italic text-primary glow-ice-text">
                  une réalité commune
                </span>
                .
              </h2>
              <div className="mt-12 grid gap-8 sm:grid-cols-2 sm:gap-10">
                <SystemCard
                  short="FR"
                  title="Français"
                  body="Chiffre de 3 à 9, lettre a/b/c, parfois un plus. C'est la référence en France, en Espagne, en Italie et largement à l'international sur les sites sportifs équipés. La progression entre niveaux est progressive et bien marquée."
                />
                <SystemCard
                  short="UIAA"
                  title="UIAA"
                  body="Chiffres romains de I à XII, suffixes + et −. Système de la fédération internationale, encore très utilisé en Allemagne, en Autriche, en Suisse, et pour les grandes voies alpines. Plus une voie monte dans les chiffres romains, plus elle est dure."
                />
                <SystemCard
                  short="YDS"
                  title="Yosemite Decimal System"
                  body="Notation 5.x où le 5 indique l'escalade technique (par opposition à la rando). Le chiffre après le point va jusqu'à 15. À partir de 5.10, on suffixe avec a/b/c/d. C'est la référence aux États-Unis et au Canada."
                />
                <SystemCard
                  short="GB"
                  title="Britannique"
                  body="Deux notations en parallèle. La cotation technique (4a à 7c) note uniquement la difficulté du mouvement le plus dur. La cotation d'engagement (Mod, Diff, VS, HVS, E1 à E11) intègre la qualité de la protection et le sérieux global de la voie."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tableau complet — surface mesh-warm */}
      <section className="relative surface-2 text-foreground">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="mb-10 sm:mb-14">
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
              § Référence
            </span>
            <h2
              className="mt-4 font-display font-medium leading-[0.96] tracking-[-0.02em] text-balance"
              style={{ fontSize: "clamp(1.85rem, 5vw, 4.4rem)" }}
            >
              Le tableau{" "}
              <span className="italic text-primary glow-ice-text">complet</span>.
            </h2>
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Toutes les correspondances en un coup d&apos;œil. Pour la voie en
              haut, pour le bloc en dessous.
            </p>
          </div>

          {/* Voie */}
          <div className="mb-12 sm:mb-16">
            <h3 className="mb-4 font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
              Voie
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-coal-700/60">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="border-b border-white/10 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    <th className="px-4 py-3 sm:px-5">Français</th>
                    <th className="px-4 py-3 sm:px-5">UIAA</th>
                    <th className="px-4 py-3 sm:px-5">YDS</th>
                    <th className="px-4 py-3 sm:px-5">GB tech.</th>
                    <th className="px-4 py-3 sm:px-5">GB E-grade</th>
                  </tr>
                </thead>
                <tbody>
                  {ROUTE_GRADES.map((g, i) => (
                    <tr
                      key={g.fr}
                      className={`border-b border-white/5 font-mono text-sm tabular-nums last:border-b-0 ${
                        i % 2 === 0 ? "bg-white/[0.015]" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold text-primary sm:px-5">{g.fr}</td>
                      <td className="px-4 py-3 text-foreground/85 sm:px-5">{g.uiaa}</td>
                      <td className="px-4 py-3 text-foreground/85 sm:px-5">{g.yds}</td>
                      <td className="px-4 py-3 text-foreground/85 sm:px-5">{g.britTech}</td>
                      <td className="px-4 py-3 text-foreground/85 sm:px-5">{g.britAdj}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bloc */}
          <div>
            <h3 className="mb-4 font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
              Bloc
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-coal-700/60">
              <table className="w-full min-w-[360px] text-left">
                <thead>
                  <tr className="border-b border-white/10 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    <th className="px-4 py-3 sm:px-5">Font (France)</th>
                    <th className="px-4 py-3 sm:px-5">V-scale (USA)</th>
                  </tr>
                </thead>
                <tbody>
                  {BOULDER_GRADES.map((g, i) => (
                    <tr
                      key={g.font}
                      className={`border-b border-white/5 font-mono text-sm tabular-nums last:border-b-0 ${
                        i % 2 === 0 ? "bg-white/[0.015]" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold text-primary sm:px-5">{g.font}</td>
                      <td className="px-4 py-3 text-foreground/85 sm:px-5">{g.v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Niveau par niveau */}
      <section className="relative surface-1 text-foreground">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="grid grid-cols-12 gap-y-10 sm:gap-x-12">
            <div className="col-span-12 sm:col-span-4 lg:col-span-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                § Niveau par niveau
              </span>
            </div>
            <div className="col-span-12 sm:col-span-8 lg:col-span-9">
              <h2
                className="font-display font-medium leading-[0.96] tracking-[-0.02em] text-balance"
                style={{ fontSize: "clamp(1.85rem, 5vw, 4.4rem)" }}
              >
                Ce que veut dire{" "}
                <span className="italic text-primary glow-ice-text">
                  une cotation française
                </span>
                , concrètement.
              </h2>
              <div className="mt-12 grid gap-3 sm:mt-16">
                <LevelRow
                  range="3 à 4"
                  yds="5.4 à 5.6"
                  title="Initiation"
                  body="Vraies prises bien marquées, voies très peu déversantes, équipement rapproché. C'est le niveau où on apprend à se déplacer en grimpe, à clipper la corde, à grimper en tête sereinement. Adapté aux enfants et à toute première sortie."
                />
                <LevelRow
                  range="5a à 5c"
                  yds="5.7 à 5.10a"
                  title="Sortir de l'apprentissage"
                  body="Les prises se font plus petites, on commence à devoir réfléchir au placement de pied. Une voie en 5c demande de l'endurance, un peu de lecture, et marque l'entrée dans l'escalade autonome. C'est un palier psychologique important pour beaucoup."
                />
                <LevelRow
                  range="6a à 6c+"
                  yds="5.10b à 5.11c"
                  title="Niveau intermédiaire"
                  body="La gamme la plus fréquente en falaise française. À ce niveau on grimpe régulièrement, on a un peu d'expérience du dévers, on commence à savoir poser des dégaines en hauteur sans paniquer. Un grimpeur qui sort 6c en falaise toutes les sessions est déjà solide."
                />
                <LevelRow
                  range="7a à 7c+"
                  yds="5.11d à 5.13a"
                  title="Confirmé à haut niveau"
                  body="On parle ici de grimpeurs réguliers qui s'entraînent. Une voie en 7a fait basculer dans une grimpe plus exigeante : continuité, dévers prononcé, prises fines. Le 7c+ est déjà du haut niveau amateur."
                />
                <LevelRow
                  range="8a à 8c+"
                  yds="5.13b à 5.14c"
                  title="Élite"
                  body="On entre dans le domaine de la compétition et des grimpeurs qui s'entraînent à temps plein ou presque. À ce niveau, on lit chaque méthode, on s'investit sur un projet pendant des semaines, parfois des mois."
                />
                <LevelRow
                  range="9a à 9c"
                  yds="5.14d à 5.15d"
                  title="Niveau mondial"
                  body="Le sommet absolu. Le 9c, plus haute cotation jamais validée, n'a été ouvert qu'une fois : Silence, à Flatanger en Norvège, par Adam Ondra en 2017. Une poignée de grimpeurs au monde grimpent dans le 9b et plus."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Records mondiaux */}
      <section className="relative surface-2 text-foreground">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="grid grid-cols-12 gap-y-10 sm:gap-x-12">
            <div className="col-span-12 sm:col-span-4 lg:col-span-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                § Records actuels
              </span>
            </div>
            <div className="col-span-12 sm:col-span-8 lg:col-span-9">
              <h2
                className="font-display font-medium leading-[0.96] tracking-[-0.02em] text-balance"
                style={{ fontSize: "clamp(1.85rem, 5vw, 4.4rem)" }}
              >
                Les{" "}
                <span className="italic text-primary glow-ice-text">
                  plus hautes cotations
                </span>{" "}
                jamais ouvertes.
              </h2>

              <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 sm:mt-16">
                <RecordCard
                  category="Voie · sport"
                  grade="9c"
                  name="Silence"
                  by="Adam Ondra"
                  year="2017"
                  spot="Flatanger, Norvège"
                  body="Première et unique voie cotée 9c au monde. Une voie de 45 mètres, trois sections de bloc enchaînées dans un dévers vertigineux. Adam Ondra y a travaillé plus de 4 ans avant la première ascension."
                />
                <RecordCard
                  category="Bloc"
                  grade="9A · V17"
                  name="Burden of Dreams"
                  by="Nalle Hukkataival"
                  year="2016"
                  spot="Lappnor, Finlande"
                  body="Premier bloc coté 9A de l'histoire, resté longtemps non répété. Confirmé à V17 lors des répétitions ultérieures par d'autres grimpeurs de top niveau. La référence mondiale du bloc extrême."
                />
                <RecordCard
                  category="Voie · trad"
                  grade="E11 7a"
                  name="Rhapsody"
                  by="Dave MacLeod"
                  year="2006"
                  spot="Dumbarton Rock, Écosse"
                  body="Une des voies trad les plus engagées au monde. Cotation britannique d'engagement E11 : difficulté technique soutenue et protection minimaliste, conséquences sévères en cas de chute."
                />
                <RecordCard
                  category="Femme · sport"
                  grade="9b/9b+"
                  name="DNA"
                  by="Janja Garnbret"
                  year="2024"
                  spot="Verdon, France"
                  body="Une des cotations les plus dures jamais réalisées par une grimpeuse en falaise. Janja Garnbret, double championne olympique, repousse régulièrement les limites du haut niveau féminin."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Voie vs bloc */}
      <section className="relative surface-1 text-foreground">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="grid grid-cols-12 gap-y-10 sm:gap-x-12">
            <div className="col-span-12 sm:col-span-4 lg:col-span-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                § Comparaison
              </span>
            </div>
            <div className="col-span-12 sm:col-span-8 lg:col-span-9">
              <h2
                className="font-display font-medium leading-[0.96] tracking-[-0.02em] text-balance"
                style={{ fontSize: "clamp(1.85rem, 5vw, 4.4rem)" }}
              >
                Voie ou bloc :{" "}
                <span className="italic text-primary glow-ice-text">
                  pas la même logique
                </span>
                .
              </h2>

              <div className="mt-12 grid gap-8 text-base leading-relaxed text-muted-foreground sm:mt-16 sm:grid-cols-2 sm:gap-10 sm:text-lg">
                <div>
                  <h3 className="mb-3 font-display text-2xl font-medium tracking-[-0.02em] text-foreground sm:text-3xl">
                    La voie
                  </h3>
                  <p>
                    Elle se grimpe avec une corde, en longueur. Une voie peut
                    faire 8 mètres ou 45. La cotation tient compte de la
                    difficulté technique du passage le plus dur, mais aussi de
                    la continuité globale. Une voie homogène en 7a est souvent
                    plus dure à réussir qu&apos;une voie de même cotation avec
                    un seul pas en 7c et le reste plus facile.
                  </p>
                  <p className="mt-4">
                    Le sport, le trad et la grande voie partagent l&apos;échelle
                    de cotation française mais l&apos;engagement n&apos;est pas
                    le même : en sport on tombe sur des points, en trad on
                    pose ses propres protections, en grande voie on enchaîne
                    plusieurs longueurs avec relais.
                  </p>
                </div>
                <div>
                  <h3 className="mb-3 font-display text-2xl font-medium tracking-[-0.02em] text-foreground sm:text-3xl">
                    Le bloc
                  </h3>
                  <p>
                    Pas de corde. La hauteur reste limitée (deux à six mètres
                    en général), on chute sur un crashpad ou plusieurs. La
                    cotation porte sur un mouvement ou une courte séquence,
                    pas sur l&apos;endurance. Un bloc en 7B peut se résumer à
                    deux mouvements ultra-puissants.
                  </p>
                  <p className="mt-4">
                    L&apos;échelle Font (Fontainebleau) va de 3 à 9A en majuscules
                    pour distinguer du système des voies. À niveau perçu
                    équivalent, une cotation de bloc est généralement plus
                    élevée en chiffres : un grimpeur qui sort le 7b en voie
                    enchaînera plus souvent du 6C+ ou du 7A en bloc.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative surface-3 text-foreground">
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

          <div className="rounded-2xl border border-white/10 bg-coal-700/60">
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
              Outil 01 / 04
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

function SystemCard({
  short,
  title,
  body,
}: {
  short: string;
  title: string;
  body: string;
}) {
  return (
    <div>
      <div className="inline-flex h-9 items-center justify-center rounded-full border border-primary/30 bg-primary/10 px-3 font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
        {short}
      </div>
      <h3
        className="mt-5 font-display font-medium tracking-[-0.02em]"
        style={{ fontSize: "clamp(1.4rem, 2.6vw, 1.875rem)" }}
      >
        {title}
      </h3>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">
        {body}
      </p>
    </div>
  );
}

function LevelRow({
  range,
  yds,
  title,
  body,
}: {
  range: string;
  yds: string;
  title: string;
  body: string;
}) {
  return (
    <div className="grid grid-cols-12 gap-x-4 rounded-2xl border border-white/10 bg-[#1e1e1e] p-5 sm:gap-x-8 sm:p-7">
      <div className="col-span-12 flex flex-col gap-1 sm:col-span-3 lg:col-span-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
          Français
        </span>
        <span
          className="font-display font-medium leading-none tracking-[-0.03em] text-foreground"
          style={{ fontSize: "clamp(1.8rem, 3.4vw, 2.6rem)" }}
        >
          {range}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          YDS · {yds}
        </span>
      </div>
      <div className="col-span-12 mt-4 sm:col-span-9 sm:mt-0 lg:col-span-10">
        <h3 className="font-display text-xl font-medium tracking-[-0.02em] sm:text-2xl">
          {title}
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {body}
        </p>
      </div>
    </div>
  );
}

function RecordCard({
  category,
  grade,
  name,
  by,
  year,
  spot,
  body,
}: {
  category: string;
  grade: string;
  name: string;
  by: string;
  year: string;
  spot: string;
  body: string;
}) {
  return (
    <div className="flex flex-col gap-4 bg-[#1e1e1e] p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
          {category}
        </span>
        <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs font-semibold tabular-nums text-primary">
          {grade}
        </span>
      </div>
      <div>
        <h3
          className="font-display font-medium leading-none tracking-[-0.025em]"
          style={{ fontSize: "clamp(1.7rem, 3.4vw, 2.5rem)" }}
        >
          {name}
        </h3>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {by} · {year} · {spot}
        </p>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
        {body}
      </p>
    </div>
  );
}

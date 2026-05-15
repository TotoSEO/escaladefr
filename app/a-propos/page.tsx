import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { PageShell, PageHeader } from "@/components/page-shell";
import { fetchPublishedArticleHeadings } from "@/lib/blog";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "À propos · Antoine, rédacteur d'escalade-france.fr",
  description:
    "Antoine, treize ans d'escalade, ancien compétiteur jeune FFME, 8a en falaise. Le parcours derrière les articles d'escalade-france.fr et la promesse éditoriale.",
  alternates: { canonical: "/a-propos" },
  openGraph: {
    title: "À propos d'Antoine, rédacteur d'escalade-france.fr",
    description:
      "Treize ans de pratique, du club FFME jeune à la grande voie en autonomie. Le parcours qui alimente les articles.",
    type: "profile",
  },
};

const COCONS = [
  {
    label: "Techniques",
    slug: "apprendre-escalade-debutant",
    desc: "Bloc, voie, lecture, placement et progression.",
  },
  {
    label: "Matériel",
    slug: "materiel-escalade-essentiel",
    desc: "Chaussons, baudrier, corde, dégaines, casque.",
  },
  {
    label: "Nœuds",
    slug: "noeuds-escalade-utiles-guide",
    desc: "Huit, prussik, cabestan, demi-cabestan, pêcheur.",
  },
  {
    label: "Sites",
    slug: "sites-escalade-emblematiques-france",
    desc: "Bleau, Verdon, Céüse, Buoux, Calanques et les pépites.",
  },
  {
    label: "Sécurité",
    slug: "securite-escalade-regles-essentielles",
    desc: "Vérifications, communication, gestion des risques.",
  },
  {
    label: "Préparation",
    slug: "preparer-corps-tete-grimpe",
    desc: "Échauffement, hangboard, mental, récupération.",
  },
  {
    label: "Personnalités",
    slug: "grimpeurs-grimpeuses-histoire-france",
    desc: "Edlinger, Destivelle, Legrand, Honnold, Ondra.",
  },
  {
    label: "Environnement",
    slug: "grimper-respect-sites-faune",
    desc: "Nidification, érosion, déchets, accès durables.",
  },
  {
    label: "Histoire",
    slug: "histoire-escalade-france-alpes-salle",
    desc: "Bleausards, Verdon, ouverture du libre, JO 2024.",
  },
];

export default async function AProposPage() {
  // Filtre les hubs déjà publiés pour ne pas linker vers du 404.
  const publishedHubs = await fetchPublishedArticleHeadings(
    COCONS.map((c) => c.slug),
  );
  const publishedSet = new Set(publishedHubs.map((h) => h.slug));
  const visibleCocons = COCONS.filter((c) => publishedSet.has(c.slug));
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": "https://escalade-france.fr/a-propos#antoine",
        name: "Antoine",
        url: "https://escalade-france.fr/a-propos",
        image: "https://escalade-france.fr/blog/antoine-escalade-france.webp",
        jobTitle: "Rédacteur escalade",
        description:
          "Treize ans de pratique, ancien compétiteur jeune FFME, 8a en falaise et 7b en bloc, pratiquant régulier de la grande voie depuis 2018.",
        knowsAbout: [
          "Escalade sportive",
          "Bloc",
          "Grande voie",
          "Sécurité en falaise",
          "Histoire de l'escalade française",
        ],
        worksFor: {
          "@type": "Organization",
          name: "escalade-france.fr",
          url: "https://escalade-france.fr",
        },
      },
      {
        "@type": "AboutPage",
        "@id": "https://escalade-france.fr/a-propos#page",
        url: "https://escalade-france.fr/a-propos",
        name: "À propos d'Antoine, rédacteur d'escalade-france.fr",
        about: { "@id": "https://escalade-france.fr/a-propos#antoine" },
        inLanguage: "fr-FR",
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
        section="À propos"
        title={
          <>
            Antoine,{" "}
            <span className="text-primary">treize ans de grimpe</span> derrière
            le clavier.
          </>
        }
        subtitle="Treize ans de pratique en salle et en falaise, du club FFME jeune à la grande voie en autonomie. Tous les articles de ce site partent d'une expérience vécue, pas d'une compilation Wikipedia."
      />

      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:gap-12">
          <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10 sm:h-48 sm:w-48">
            <Image
              src="/blog/antoine-escalade-france.webp"
              alt="Antoine, rédacteur d'escalade-france.fr"
              fill
              sizes="(min-width: 640px) 192px, 160px"
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">
              En une ligne
            </p>
            <p
              className="mt-3 font-display font-medium leading-[1.1] tracking-[-0.015em] text-foreground"
              style={{ fontSize: "clamp(1.4rem, 3.4vw, 2.1rem)" }}
            >
              Ancien compétiteur jeune FFME, 8a en falaise, pratiquant régulier
              de la grande voie depuis 2018.
            </p>
            <p className="mt-4 text-base leading-relaxed text-foreground/85 sm:text-[17px]">
              J'ai commencé l'escalade en 2013, dans un gymnase scolaire avec
              un créneau ouvert au public le mercredi. Treize ans plus tard,
              j'écris sur la grimpe à plein temps pour escalade-france.fr.
              Tout ce que je publie, je l'ai vécu sur le mur ou sur le rocher,
              parfois douloureusement.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12">
        <h2
          className="font-display font-medium leading-tight tracking-[-0.02em]"
          style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.4rem)" }}
        >
          Mon parcours en escalade
        </h2>

        <ol className="mt-8 space-y-5">
          <Step year="2013" title="Première séance en salle">
            Mercredi après-midi dans un gymnase municipal en heures creuses.
            Incapable de tenir un 5a et avant-bras en feu après quarante-cinq
            minutes. Le déclic vient ce jour-là.
          </Step>
          <Step year="2014" title="Première sortie en falaise">
            Saffres en Bourgogne, sur du 5a calcaire après avoir grimpé du 5c
            en salle. Je me casse les dents parce que je cherche des prises
            résinées invisibles. Je comprends que le rocher est une autre
            discipline.
          </Step>
          <Step year="2012-2014" title="Compétitions jeunes FFME">
            Top 200 jeunes à 14 ans, plusieurs départementales et régionales
            minimes. Je ne deviens pas champion, mais l'exigence technique de
            la compétition jeune façonne ma lecture de voie et mon clip.
          </Step>
          <Step year="2015-2016" title="Premier vrai palier">
            Bloqué à 6c+ pendant quatorze mois. Le déblocage vient en
            travaillant le bassin et la poussée des jambes, pas la force.
            J'apprends que les paliers cachent toujours un facteur dominant.
          </Step>
          <Step year="2017" title="Premier 7a">
            Après quatre mois de chutes volontaires contrôlées pour casser la
            peur de la chute. C'est l'exercice qui a le plus changé ma
            grimpe, durablement.
          </Step>
          <Step year="2018" title="Fracture de cheville à Saussois">
            Arrêt de plusieurs mois. Quatorze mois pour retrouver le niveau,
            avec un travail mental aussi important que la rééducation
            physique. La grande voie devient un objectif à cette période.
          </Step>
          <Step year="2021" title="Première grande voie en autonomie">
            Éperon Sublime au Verdon, 8 longueurs. Pris par la nuit à la 7e
            longueur faute de gestion du temps. Leçon retenue, depuis je
            soigne les relais.
          </Step>
          <Step year="2026" title="Aujourd'hui">
            8a en falaise, 7b en bloc, des centaines de voies enchaînées du
            Verdon à Annot, des Calanques à Bleau. J'écris des guides pour
            transmettre ce que j'aurais aimé lire à mes débuts.
          </Step>
        </ol>
      </section>

      <section className="surface-warm border-y border-white/10">
        <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
          <h2
            className="font-display font-medium leading-tight tracking-[-0.02em]"
            style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.4rem)" }}
          >
            Pourquoi escalade-france.fr ?
          </h2>
          <div className="mt-6 grid gap-5 text-foreground/85 sm:grid-cols-2 sm:gap-8 sm:text-[17px]">
            <p className="leading-relaxed">
              La majorité des sites d'escalade francophones sont soit des
              bases de données pures (topos, cotations), soit des marchands
              déguisés en média. Il manque un endroit qui raconte la grimpe
              comme un grimpeur la vit : avec ses paliers, ses doutes, ses
              moments de bascule.
            </p>
            <p className="leading-relaxed">
              C'est l'objectif d'escalade-france.fr. Chaque article part d'une
              expérience personnelle ou d'une question que je me suis posée à
              mes débuts. Pas de listes prémâchées, pas de copier-coller, et
              quand je me trompe, je corrige publiquement.
            </p>
          </div>

          <ul className="mt-10 grid gap-4 sm:grid-cols-3">
            <Fact label="Articles publiés" value="159" />
            <Fact label="Thématiques" value="9" />
            <Fact label="Ans de pratique" value="13" />
          </ul>
        </div>
      </section>

      {visibleCocons.length > 0 && (
      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <h2
          className="font-display font-medium leading-tight tracking-[-0.02em]"
          style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.4rem)" }}
        >
          Par où commencer ?
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/80 sm:text-[17px]">
          Les thématiques du blog disponibles aujourd&apos;hui, avec un article
          pivot par cocon. Tu peux entrer par celle qui parle à ton niveau
          actuel.
        </p>
        <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {visibleCocons.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/blog/${c.slug}`}
                className="group flex h-full flex-col gap-2 rounded-2xl border border-white/10 bg-coal-900/60 p-5 transition-colors hover:border-primary/40 hover:bg-coal-900"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                  {c.label}
                </span>
                <span className="font-display text-base font-medium tracking-[-0.01em] text-foreground sm:text-lg">
                  Voir tous les articles
                </span>
                <span className="text-sm leading-relaxed text-foreground/70">
                  {c.desc}
                </span>
                <span className="mt-auto inline-flex items-center gap-1 text-xs uppercase tracking-[0.22em] text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Explorer →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
      )}

      <section className="border-t border-white/10">
        <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
          <h2
            className="font-display font-medium leading-tight tracking-[-0.02em]"
            style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}
          >
            Une question, une remarque, une correction ?
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/80 sm:text-[17px]">
            Je relis et je corrige quand je me trompe. Les retours qui font
            avancer les articles sont les bienvenus.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Page contact →
          </Link>
        </div>
      </section>
    </PageShell>
  );
}

function Step({
  year,
  title,
  children,
}: {
  year: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="grid grid-cols-[auto_1fr] gap-x-5 rounded-2xl border border-white/10 bg-coal-900/60 p-5 sm:gap-x-7 sm:p-6">
      <span
        className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary tabular-nums"
        style={{ minWidth: "3.5rem" }}
      >
        {year}
      </span>
      <div>
        <h3 className="font-display text-lg font-medium tracking-[-0.01em] text-foreground sm:text-xl">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-foreground/80 sm:text-base">
          {children}
        </p>
      </div>
    </li>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <li className="rounded-2xl border border-white/10 bg-coal-900/60 p-5">
      <p
        className="font-display tabular-nums leading-none text-primary"
        style={{ fontSize: "clamp(2.2rem, 5vw, 3rem)" }}
      >
        {value}
      </p>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/70">
        {label}
      </p>
    </li>
  );
}

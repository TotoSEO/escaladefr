import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CloudSun, Ruler, Scale } from "lucide-react";

import { PageShell, PageHeader } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Outils interactifs gratuits pour grimpeurs et escalade",
  description:
    "Convertisseur de cotations, météo escalade par site, calculateur de jonctions et rappels grande voie. Outils gratuits, sans inscription.",
  alternates: { canonical: "/outils" },
};

type Tool = {
  num: string;
  title: string;
  tagline: string;
  desc: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const TOOLS: Tool[] = [
  {
    num: "I",
    title: "Convertisseur de cotations",
    tagline: "Français · UIAA · YDS · GB",
    desc: "Quatre systèmes côte à côte, pour la voie et pour le bloc (Font et V-scale). Tableau de référence complet inclus.",
    href: "/outils/cotations",
    icon: Scale,
  },
  {
    num: "II",
    title: "Météo escalade par site",
    tagline: "Cinq jours, heure par heure",
    desc: "Bulletin Open-Meteo croisé avec l'orientation de la falaise. Verdict idéal / correct / à éviter par créneau, meilleure fenêtre du jour identifiée.",
    href: "/outils/meteo",
    icon: CloudSun,
  },
  {
    num: "III",
    title: "Calculateur de jonctions",
    tagline: "Grande voie · cordes · rappels",
    desc: "Hauteur, nombre de relais, corde dispo. On valide que ça passe et on compte les rappels descente avec alertes contextuelles.",
    href: "/outils/jonctions",
    icon: Ruler,
  },
];

export default function OutilsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://escalade-france.fr/outils",
        url: "https://escalade-france.fr/outils",
        name: "Outils interactifs pour grimpeurs",
        isPartOf: { "@id": "https://escalade-france.fr/#website" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: "https://escalade-france.fr" },
          { "@type": "ListItem", position: 2, name: "Outils", item: "https://escalade-france.fr/outils" },
        ],
      },
      {
        "@type": "ItemList",
        name: "Outils interactifs pour l'escalade",
        itemListElement: TOOLS.map((t, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: t.title,
          description: t.desc,
          url: `https://escalade-france.fr${t.href}`,
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
        section="§ Outils"
        status="live"
        surface="warm"
        title={
          <>
            Trois outils
            <br />
            qui{" "}
            <span className="italic text-primary glow-ice-text">vont servir</span>.
          </>
        }
        subtitle="Une suite d'outils interactifs gratuits, pensés pour les questions qu'on se pose vraiment au moment de planifier une session, comparer deux sites ou comprendre une cotation."
      />

      {/* 3 outils en colonnes */}
      <section className="relative surface-1 text-foreground">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
          <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3">
            {TOOLS.map((t) => (
              <ToolCard key={t.num} tool={t} />
            ))}
          </div>
        </div>
      </section>

      {/* Garanties */}
      <section className="relative surface-2 text-foreground">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="grid grid-cols-12 gap-y-10 sm:gap-x-12">
            <div className="col-span-12 sm:col-span-4 lg:col-span-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                § Le contrat
              </span>
            </div>
            <div className="col-span-12 sm:col-span-8 lg:col-span-9">
              <h2
                className="font-display font-medium leading-[0.96] tracking-[-0.02em] text-balance"
                style={{ fontSize: "clamp(1.85rem, 5vw, 4.4rem)" }}
              >
                Gratuits,{" "}
                <span className="italic text-primary glow-ice-text">
                  sans inscription, sans tracker
                </span>
                .
              </h2>
              <div className="mt-12 grid gap-8 sm:grid-cols-2 sm:gap-10">
                <Guarantee
                  title="Aucune donnée perso collectée"
                  body="Les calculs sont faits côté navigateur. Aucun envoi, aucun enregistrement de tes recherches, pas de cookie tiers, pas d'analytics intrusif. Tu peux désactiver JavaScript pour le convertisseur, il reste partiellement utilisable."
                />
                <Guarantee
                  title="Données ouvertes et citées"
                  body="La météo vient d'Open-Meteo (licence CC-BY 4.0). Les coordonnées des sites viennent du recensement officiel français. Chaque source est citée sur la page concernée, sans paywall ni dépendance commerciale."
                />
                <Guarantee
                  title="Pas d'API à acheter, pas de quota"
                  body="On n'utilise que des APIs gratuites et stables. Le convertisseur tourne offline. La météo a un quota généreux Open-Meteo non payant. Le calculateur de jonctions n'utilise rien d'externe."
                />
                <Guarantee
                  title="Mis à jour quand ça change"
                  body="Si une cotation évolue, si Open-Meteo change son API, si une formule de calcul mérite révision, on met à jour et on l'écrit dans le changelog. Le code est en clair, vérifiable, et améliorable."
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  return (
    <Link
      href={tool.href}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-coal-900 p-7 transition-all hover:border-primary/50 hover:bg-coal-800 sm:p-9"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 font-display text-[11rem] font-medium italic leading-none tracking-[-0.04em] text-foreground/[0.04] sm:text-[14rem]"
      >
        {tool.num}
      </div>

      <div className="relative flex items-center justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-primary">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          En ligne
        </span>
      </div>

      <div className="relative mt-10 flex flex-1 flex-col">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {tool.tagline}
        </span>
        <h2
          className="mt-3 font-display font-medium leading-[0.96] tracking-[-0.025em]"
          style={{ fontSize: "clamp(1.5rem, 3vw, 2.1rem)" }}
        >
          {tool.title}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {tool.desc}
        </p>
      </div>

      <div className="relative mt-8 flex items-center justify-between border-t border-white/10 pt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/70 transition-colors group-hover:text-primary">
        Ouvrir l&apos;outil
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition-all group-hover:-rotate-12 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

function Guarantee({ title, body }: { title: string; body: string }) {
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

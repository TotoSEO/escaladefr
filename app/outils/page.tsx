import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

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
  desc: string;
  href: string;
  status: "live" | "soon" | "later";
};

const TOOLS: Tool[] = [
  {
    num: "I",
    title: "Convertisseur de cotations",
    desc: "Français, UIAA, YDS américain, britannique. Pour la voie et pour le bloc (Font et V-scale). Tableau de référence complet inclus.",
    href: "/outils/cotations",
    status: "live",
  },
  {
    num: "II",
    title: "Météo escalade par site",
    desc: "Bulletin Open-Meteo heure par heure sur cinq jours, croisé avec l'orientation de la falaise. Pour savoir si Buoux est faisable cet aprem.",
    href: "/outils/meteo",
    status: "live",
  },
  {
    num: "III",
    title: "Calculateur de jonctions",
    desc: "Pour les grandes voies. Hauteur totale, nombre de relais, corde dispo. On valide que ça passe et on compte les rappels pour la descente.",
    href: "/outils/jonctions",
    status: "live",
  },
];

const STATUS_LABEL: Record<Tool["status"], string> = {
  live: "En ligne",
  soon: "En cours",
  later: "À venir",
};

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
          url: t.status === "live" ? `https://escalade-france.fr${t.href}` : undefined,
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
            Quatre outils
            <br />
            qui{" "}
            <span className="italic text-primary glow-ice-text">vont servir</span>.
          </>
        }
        subtitle="Une suite d'outils interactifs gratuits, pensés pour les questions qu'on se pose vraiment au moment de planifier une session, comparer deux sites, ou comprendre une cotation."
      />

      {/* Outil vedette */}
      <section className="relative surface-1 text-foreground">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
          <Link
            href="/outils/cotations"
            className="group relative block overflow-hidden rounded-3xl border border-primary/40 bg-coal-900 p-7 transition-all hover:border-primary sm:p-10 lg:p-14"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(125,222,255,0.18),transparent_55%)]"
            />
            <div className="relative grid grid-cols-12 items-center gap-8">
              <div className="col-span-12 lg:col-span-8">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-primary">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                    </span>
                    En ligne
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    Outil vedette
                  </span>
                </div>
                <h2
                  className="mt-6 font-display font-medium leading-[0.96] tracking-[-0.025em] text-balance"
                  style={{ fontSize: "clamp(2rem, 5.4vw, 4.5rem)" }}
                >
                  Convertisseur de cotations
                  <span className="block italic text-primary glow-ice-text">
                    français · UIAA · YDS · GB
                  </span>
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Choisis une cotation, on te donne ses équivalences dans tous
                  les systèmes. Pour la voie comme pour le bloc.
                </p>
              </div>
              <div className="col-span-12 flex items-center gap-3 lg:col-span-4 lg:justify-end">
                <span className="inline-flex h-14 items-center gap-3 rounded-full bg-primary px-6 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-transform group-hover:scale-[1.02] sm:h-16 sm:px-8">
                  Ouvrir l&apos;outil
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-coal-900 text-primary transition-transform group-hover:rotate-45">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Liste des outils */}
      <section className="relative surface-2 text-foreground">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          <div className="mb-8 flex items-center gap-3 sm:mb-12">
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
              § Toute la suite
            </span>
          </div>

          <div className="space-y-px overflow-hidden rounded-2xl border border-white/10">
            {TOOLS.map((t, i) => {
              const isLive = t.status === "live";
              const inner = (
                <div className="grid grid-cols-12 items-baseline gap-x-4 sm:gap-x-8">
                  <span
                    className={`col-span-3 font-display font-medium italic leading-none tracking-[-0.04em] transition-colors sm:col-span-2 ${
                      isLive ? "text-primary" : "text-foreground/15"
                    }`}
                    style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}
                  >
                    {t.num}
                  </span>
                  <div className="col-span-9 flex flex-col gap-3 sm:col-span-7">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className="font-display font-medium tracking-[-0.02em]"
                        style={{ fontSize: "clamp(1.4rem, 2.8vw, 2.25rem)" }}
                      >
                        {t.title}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] ${
                          isLive
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-white/15 bg-white/5 text-muted-foreground"
                        }`}
                      >
                        {isLive && (
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                          </span>
                        )}
                        {STATUS_LABEL[t.status]}
                      </span>
                    </div>
                    <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
                      {t.desc}
                    </p>
                  </div>
                  <span
                    className={`col-span-12 mt-3 inline-flex items-center justify-end gap-2 font-mono text-[10px] uppercase tracking-[0.22em] transition-colors sm:col-span-3 sm:mt-0 sm:text-xs ${
                      isLive
                        ? "text-foreground/70 group-hover:text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {isLive ? (
                      <>
                        Ouvrir
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </>
                    ) : (
                      "Bientôt"
                    )}
                  </span>
                </div>
              );

              return (
                <article key={i}>
                  {isLive ? (
                    <Link
                      href={t.href}
                      className="group block bg-coal-900 p-6 transition-colors hover:bg-coal-800 sm:p-10"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div className="group bg-coal-900 p-6 sm:p-10">
                      {inner}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

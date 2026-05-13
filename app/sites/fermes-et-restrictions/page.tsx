import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ShieldAlert, CalendarClock, HelpCircle } from "lucide-react";

import { PageShell, PageHeader } from "@/components/page-shell";
import {
  fetchSitesByAccessStatus,
  siteHref,
  communeName,
  accesStatutLabel,
  type AccesStatut,
} from "@/lib/sites";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Sites d'escalade fermés ou réglementés en France",
  description:
    "Liste des sites d'escalade naturels en France dont l'accès est interdit, restreint ou soumis à une réglementation saisonnière. Mise à jour mensuelle.",
  alternates: { canonical: "/sites/fermes-et-restrictions" },
};

const STATUTS_ORDER: AccesStatut[] = ["closed", "restricted", "seasonal", "pending"];

const STATUT_META: Record<AccesStatut, {
  icon: React.ComponentType<{ className?: string }>;
  intro: string;
  color: string;
  borderColor: string;
  bgColor: string;
}> = {
  closed: {
    icon: ShieldAlert,
    intro:
      "Sites dont l'escalade est interdite par arrêté municipal, préfectoral ou accord avec le propriétaire foncier. La pratique y est passible de sanctions et ne doit pas avoir lieu.",
    color: "text-red-300",
    borderColor: "border-red-500/30",
    bgColor: "bg-red-500/10",
  },
  restricted: {
    icon: AlertTriangle,
    intro:
      "Sites dont l'accès est conditionné par des règles strictes : créneaux horaires, autorisation préalable, équipement obligatoire, ou cohabitation avec d'autres usages. Lis attentivement la fiche avant ta sortie.",
    color: "text-accent",
    borderColor: "border-accent/30",
    bgColor: "bg-accent/10",
  },
  seasonal: {
    icon: CalendarClock,
    intro:
      "Sites fermés à l'escalade pendant une partie de l'année, généralement pour préserver la nidification des rapaces (printemps) ou suite à un accord local. Le reste de l'année, la pratique est libre.",
    color: "text-primary",
    borderColor: "border-primary/30",
    bgColor: "bg-primary/10",
  },
  pending: {
    icon: HelpCircle,
    intro:
      "Sites où une information de fermeture a été détectée par notre système, mais qui restent en cours de vérification. À considérer avec prudence en attendant confirmation.",
    color: "text-accent",
    borderColor: "border-accent/20",
    bgColor: "bg-accent/5",
  },
  open: {
    icon: AlertTriangle,
    intro: "",
    color: "",
    borderColor: "",
    bgColor: "",
  },
};

export default async function FermesRestrictionsPage() {
  const sites = await fetchSitesByAccessStatus(STATUTS_ORDER);

  // Regroupement par statut
  const grouped = new Map<AccesStatut, typeof sites>();
  for (const s of sites) {
    if (!grouped.has(s.acces_statut)) grouped.set(s.acces_statut, []);
    grouped.get(s.acces_statut)!.push(s);
  }

  const totalConcernes = sites.length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "https://escalade-france.fr/sites/fermes-et-restrictions",
        url: "https://escalade-france.fr/sites/fermes-et-restrictions",
        name: "Sites d'escalade fermés ou réglementés en France",
        description:
          "Recensement des sites naturels d'escalade soumis à interdiction, restriction ou fermeture saisonnière en France.",
        isPartOf: { "@id": "https://escalade-france.fr/#website" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: "https://escalade-france.fr" },
          { "@type": "ListItem", position: 2, name: "Sites naturels", item: "https://escalade-france.fr/sites" },
          { "@type": "ListItem", position: 3, name: "Fermés et réglementés", item: "https://escalade-france.fr/sites/fermes-et-restrictions" },
        ],
      },
      ...(sites.length > 0
        ? [
            {
              "@type": "ItemList",
              name: "Sites d'escalade avec accès limité ou interdit",
              numberOfItems: sites.length,
              itemListElement: sites.slice(0, 200).map((s, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: s.nom,
                url: `https://escalade-france.fr${siteHref(s)}`,
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
        section="§ Accès régulé"
        status="live"
        surface="warm"
        title={
          <>
            Sites d&apos;escalade{" "}
            <span className="italic text-accent">fermés</span>{" "}
            ou réglementés
            <br />
            en France.
          </>
        }
        subtitle={`${totalConcernes} site${totalConcernes > 1 ? "s" : ""} dont l'accès est limité par un arrêté, un accord foncier ou une fermeture saisonnière. Liste mise à jour mensuellement.`}
      />

      {/* Intro éditoriale */}
      <section className="relative surface-1 text-foreground">
        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
          <div className="space-y-6 text-base leading-relaxed text-foreground/90 sm:text-lg">
            <p>
              Plusieurs sites naturels d&apos;escalade en France sont
              aujourd&apos;hui fermés à la pratique, soit définitivement par
              arrêté municipal, soit partiellement selon la saison, soit dans
              un cadre négocié avec les propriétaires fonciers ou les
              gestionnaires d&apos;espaces protégés. Cette page rassemble tous
              ces sites pour que tu puisses vérifier l&apos;état d&apos;un
              spot avant d&apos;y aller.
            </p>
            <p>
              Les motifs de fermeture les plus fréquents sont la protection
              des nidifications de rapaces au printemps, les arrêtés de
              protection de biotope sur certains massifs sensibles, les
              conflits d&apos;usage avec la randonnée ou la chasse, et les
              accidents qui ont conduit à un retrait d&apos;autorisation par
              la mairie. Dans tous les cas, le respect de ces décisions est
              essentiel pour préserver l&apos;accès aux sites qui restent
              ouverts.
            </p>
            <p>
              Si tu vois manquer un site sur cette page, ou si tu sais
              qu&apos;un site listé ici a rouvert, n&apos;hésite pas à nous
              écrire. On met à jour mensuellement, mais le signalement
              communautaire reste la voie la plus rapide.
            </p>
          </div>
        </div>
      </section>

      {/* Sections par statut */}
      {sites.length === 0 ? (
        <section className="relative surface-2 text-foreground">
          <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
            <p className="text-base text-muted-foreground sm:text-lg">
              Aucun site n&apos;est actuellement signalé comme fermé ou
              réglementé dans notre base. Si tu en connais, écris-nous, on
              les ajoutera.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors hover:border-primary hover:text-primary"
            >
              Signaler un site fermé
            </Link>
          </div>
        </section>
      ) : (
        STATUTS_ORDER.filter((s) => grouped.has(s)).map((statut) => {
          const sitesOfStatut = grouped.get(statut)!;
          const meta = STATUT_META[statut];
          const Icon = meta.icon;
          return (
            <section key={statut} className="relative surface-2 text-foreground">
              <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
              <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
                <div className={`mb-8 rounded-2xl border ${meta.borderColor} ${meta.bgColor} p-6 sm:mb-12 sm:p-8`}>
                  <div className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-full border ${meta.borderColor} ${meta.bgColor}`}>
                      <Icon className={`h-4 w-4 ${meta.color}`} />
                    </span>
                    <h2
                      className={`font-display font-medium tracking-[-0.02em] ${meta.color}`}
                      style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}
                    >
                      {accesStatutLabel(statut)}
                      <span className="ml-3 font-mono text-sm text-foreground/60">
                        {sitesOfStatut.length} site{sitesOfStatut.length > 1 ? "s" : ""}
                      </span>
                    </h2>
                  </div>
                  <p className="mt-4 max-w-3xl text-sm leading-relaxed text-foreground/90 sm:text-base">
                    {meta.intro}
                  </p>
                </div>

                <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 lg:grid-cols-2">
                  {sitesOfStatut.map((s) => (
                    <li key={s.id}>
                      <Link
                        href={siteHref(s)}
                        className="group flex flex-col gap-2 bg-coal-900 p-5 transition-colors hover:bg-[#1a1a1a] sm:p-7"
                      >
                        <h3 className="font-display text-lg font-medium tracking-[-0.01em] sm:text-xl">
                          {s.nom}
                        </h3>
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                          {communeName(s.commune) || "Localisation indéterminée"}
                          {s.departement ? ` · ${s.departement}` : ""}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          );
        })
      )}

      {/* CTA bas */}
      <section className="relative surface-1 text-foreground">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
        <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8 sm:py-20 lg:px-12">
          <h2
            className="font-display font-medium leading-tight tracking-[-0.02em] text-balance"
            style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)" }}
          >
            Un site qui devrait être ici (ou plus) ?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Le terrain bouge vite. Si tu vois un arrêté qui passe entre nos
            mailles, une fermeture levée, ou une nouvelle restriction
            saisonnière, signale-le nous. On met à jour rapidement.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-transform hover:scale-[1.02]"
          >
            Nous écrire
          </Link>
        </div>
      </section>
    </PageShell>
  );
}

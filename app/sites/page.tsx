import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, MapPin, Mountain, Sparkles } from "lucide-react";

import { PageShell, PageHeader } from "@/components/page-shell";
import { SitesMap } from "@/components/sites/sites-map";
import {
  fetchAllSitesForMap,
  fetchDepartements,
  departementHref,
  type SiteListItem,
} from "@/lib/sites";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const sites = await fetchAllSitesForMap();
  const total = sites.length || 3000;
  return {
    title: `${total.toLocaleString("fr-FR")} sites d'escalade naturels en France · Carte`,
    description: `Carte interactive de ${total.toLocaleString("fr-FR")} sites d'escalade naturels en France. Filtrable par département et massif, avec cotations et accès.`,
    alternates: { canonical: "/sites" },
  };
}

const FAQ = [
  {
    q: "Comment cette base est-elle constituée ?",
    a: "On agrège les sites naturels d'escalade répertoriés dans le recensement public officiel français, sans en altérer les données factuelles (coordonnées, cotations, nombre de voies). On enrichit ensuite chaque fiche avec nos propres analyses, des liens vers le département et le massif, et bientôt les salles indoor les plus proches.",
  },
  {
    q: "Est-ce que tous les spots y sont ?",
    a: "Non. La base recense uniquement les sites officiellement répertoriés. Les ouvertures récentes non encore documentées, les terrains d'aventure peu documentés et les accords privés entre clubs locaux n'y figurent pas systématiquement. Croise toujours avec un topo papier récent ou des grimpeurs locaux quand tu te lances sur un site engagé.",
  },
  {
    q: "Pourquoi certains sites n'apparaissent pas sur la carte ?",
    a: "Soit la fiche source n'indique pas de coordonnées, soit l'accès est volontairement discret pour préserver le rocher ou éviter les conflits fonciers. On les liste quand même dans le répertoire de leur département, sans point sur la carte.",
  },
  {
    q: "Les cotations sont-elles fiables ?",
    a: "Elles viennent du recensement officiel. La cotation reste subjective par nature et évolue avec les rééquipements et les usures de prises. Sers-toi en comme repère, pas comme vérité absolue. Pour les voies engageantes, croise avec un topo récent.",
  },
];

export default async function SitesPage() {
  const [sites, departements] = await Promise.all([
    fetchAllSitesForMap(),
    fetchDepartements(),
  ]);

  const total = sites.length;
  const totalLabel = total.toLocaleString("fr-FR");

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": "https://escalade-france.fr/sites",
        url: "https://escalade-france.fr/sites",
        name: `${totalLabel} sites d'escalade naturels en France`,
        description:
          "Carte interactive et annuaire des sites naturels d'escalade en France.",
        isPartOf: { "@id": "https://escalade-france.fr/#website" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: "https://escalade-france.fr" },
          { "@type": "ListItem", position: 2, name: "Sites naturels", item: "https://escalade-france.fr/sites" },
        ],
      },
      {
        "@type": "Dataset",
        name: "Sites naturels d'escalade en France",
        description: `${totalLabel} sites naturels d'escalade recensés en France avec coordonnées GPS, cotations et accès.`,
        keywords: ["escalade", "falaise", "France", "outdoor"],
        isAccessibleForFree: true,
        spatialCoverage: { "@type": "Country", name: "France" },
        creator: { "@id": "https://escalade-france.fr/#organization" },
      },
      {
        "@type": "ItemList",
        name: "Départements d'escalade en France",
        itemListElement: departements.slice(0, 20).map((d, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: d.departement,
          url: `https://escalade-france.fr${departementHref(d.code_departement, d.departement)}`,
        })),
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
        section="§ Pilier 01 / Outdoor"
        status="live"
        surface="cool"
        title={
          <>
            {totalLabel} sites
            <br />
            d&apos;escalade{" "}
            <span className="italic text-primary glow-ice-text">naturels</span>,
            <br />
            tous sur une carte.
          </>
        }
        subtitle="Recensement officiel reconstruit en base navigable. Coordonnées GPS, cotations min et max, périodes favorables, accès routier et approche, pour chaque site."
      />

      {/* CARTE */}
      <section className="relative surface-1 text-foreground">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
          <SitesMap sites={sites} />
          <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:text-xs">
            Fond de carte © OpenStreetMap contributors, © CARTO
          </p>
        </div>
      </section>

      {/* DÉPARTEMENTS — listing complet */}
      <section className="relative surface-2 text-foreground">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="mb-10 grid grid-cols-12 gap-y-6 sm:mb-14">
            <div className="col-span-12 sm:col-span-4 lg:col-span-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                § Tous les départements
              </span>
            </div>
            <div className="col-span-12 sm:col-span-8 lg:col-span-9">
              <h2
                className="font-display font-medium leading-[0.96] tracking-[-0.02em] text-balance"
                style={{ fontSize: "clamp(1.85rem, 5vw, 4rem)" }}
              >
                {departements.length} départements,{" "}
                <span className="italic text-primary glow-ice-text">
                  un seul annuaire
                </span>
                .
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Cliquez sur un département pour voir tous ses sites, du plus
                renommé au plus confidentiel.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {departements.map((d) => (
              <Link
                key={`${d.code_departement}-${d.departement}`}
                href={departementHref(d.code_departement, d.departement)}
                className="group flex items-baseline justify-between gap-3 bg-coal-900 px-5 py-5 transition-colors hover:bg-[#1a1a1a] sm:px-7 sm:py-6"
              >
                <span className="flex items-baseline gap-3">
                  {d.code_departement && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      {d.code_departement}
                    </span>
                  )}
                  <span className="font-display text-lg font-medium tracking-[-0.01em] sm:text-xl">
                    {d.departement}
                  </span>
                </span>
                <span className="flex items-baseline gap-3 font-mono text-xs tabular-nums text-muted-foreground">
                  {d.count}
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* POURQUOI ce projet — contenu original (pas du contenu scrapé) */}
      <section className="relative surface-1 text-foreground">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="grid grid-cols-12 gap-y-10 sm:gap-x-12">
            <div className="col-span-12 sm:col-span-4 lg:col-span-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                § Pourquoi
              </span>
            </div>
            <div className="col-span-12 sm:col-span-8 lg:col-span-9">
              <h2
                className="font-display font-medium leading-[0.96] tracking-[-0.02em] text-balance"
                style={{ fontSize: "clamp(1.85rem, 4.6vw, 4rem)" }}
              >
                Une carte qui répond aux{" "}
                <span className="italic text-primary glow-ice-text">
                  bonnes questions
                </span>
                .
              </h2>
              <div className="mt-12 grid gap-8 sm:grid-cols-2 sm:gap-10">
                <Bullet
                  icon={Mountain}
                  title="Tout le territoire"
                  body="Verdon, Buoux, Céüse, on connaît. Mais il y a aussi des centaines de sites moins courus, parfaits pour éviter la foule. La carte les montre tous, sans hiérarchie commerciale."
                />
                <Bullet
                  icon={MapPin}
                  title="Les vraies infos pratiques"
                  body="Coordonnées GPS, type de roche, exposition, cotation, période favorable. Toutes les données factuelles dont tu as besoin pour décider si tu y vas, présentées de manière claire."
                />
                <Bullet
                  icon={Sparkles}
                  title="Une lecture vraiment utile"
                  body="On ne se contente pas d'agréger : on enrichit chaque fiche avec son contexte, les sites voisins, le massif auquel elle appartient et bientôt les salles indoor les plus proches."
                />
                <Bullet
                  icon={ArrowUpRight}
                  title="Une plateforme indépendante"
                  body="Aucune affiliation commerciale n'influence le contenu. Pas de tracker tiers qui te suit, pas de pub agressive, pas de compte obligatoire pour consulter."
                />
              </div>
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
        </div>
      </section>
    </PageShell>
  );
}

function Bullet({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div>
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <h3
        className="mt-5 font-display font-medium tracking-[-0.01em]"
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

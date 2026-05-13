import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowUpRight, MapPin, Mountain, Calendar, Compass } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import {
  fetchSiteById,
  communeName,
  siteSlug,
  formatCotationRange,
  formatTypeSite,
  departementHref,
  type SiteDetail,
} from "@/lib/sites";

export const revalidate = 86400;

type Params = { id: string; slug: string };

async function loadSite(idStr: string): Promise<SiteDetail | null> {
  const id = Number.parseInt(idStr, 10);
  if (!Number.isFinite(id) || id <= 0) return null;
  return fetchSiteById(id);
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const { id } = await params;
  const site = await loadSite(id);
  if (!site) return { title: "Site introuvable" };

  const dep = site.departement ? ` · ${site.departement}` : "";
  const cot = formatCotationRange(site.cotation_min, site.cotation_max);
  const title = `${site.nom}${dep} · Site d'escalade`;
  const desc = `${site.nom}, site d'escalade naturel à ${communeName(site.commune) || "France"}${dep}. Cotation ${cot}${site.nombre_voies ? `, ${site.nombre_voies} voies` : ""}.`;

  return {
    title: title.length > 64 ? title.slice(0, 61) + "…" : title,
    description: desc.length > 158 ? desc.slice(0, 155) + "…" : desc,
    alternates: { canonical: `/sites/${id}/${siteSlug(site)}` },
  };
}

const MOIS_ORDRE = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function orderedMonths(months: string[] | null): string[] {
  if (!months) return [];
  const set = new Set(months.map((m) => m.toLowerCase()));
  return MOIS_ORDRE.filter((m) => set.has(m.toLowerCase()));
}

export default async function SiteDetailPage(
  { params }: { params: Promise<Params> },
) {
  const { id, slug } = await params;
  const site = await loadSite(id);
  if (!site) notFound();

  // SEO : si le slug ne matche pas le slug canonique, redirect 308 vers
  // la bonne URL pour éviter les doublons.
  const canonical = siteSlug(site);
  if (slug !== canonical) {
    redirect(`/sites/${site.id}/${canonical}`);
  }

  const months = orderedMonths(site.periodes_favorables);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Place",
        "@id": `https://escalade-france.fr/sites/${site.id}/${canonical}#place`,
        name: site.nom,
        description: `Site naturel d'escalade situé à ${communeName(site.commune) || "France"}${site.departement ? `, ${site.departement}` : ""}.`,
        url: `https://escalade-france.fr/sites/${site.id}/${canonical}`,
        ...(site.latitude && site.longitude
          ? {
              geo: {
                "@type": "GeoCoordinates",
                latitude: site.latitude,
                longitude: site.longitude,
              },
            }
          : {}),
        ...(site.commune
          ? {
              address: {
                "@type": "PostalAddress",
                addressLocality: communeName(site.commune),
                addressRegion: site.departement ?? undefined,
                addressCountry: "FR",
              },
            }
          : {}),
        additionalType: "https://schema.org/TouristAttraction",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: "https://escalade-france.fr" },
          { "@type": "ListItem", position: 2, name: "Sites naturels", item: "https://escalade-france.fr/sites" },
          ...(site.departement
            ? [
                {
                  "@type": "ListItem",
                  position: 3,
                  name: site.departement,
                  item: `https://escalade-france.fr${departementHref(site.code_departement, site.departement)}`,
                },
                { "@type": "ListItem", position: 4, name: site.nom, item: `https://escalade-france.fr/sites/${site.id}/${canonical}` },
              ]
            : [
                { "@type": "ListItem", position: 3, name: site.nom, item: `https://escalade-france.fr/sites/${site.id}/${canonical}` },
              ]),
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

      {/* Hero — surface cool */}
      <section className="relative overflow-hidden surface-cool text-foreground">
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-px divider-glow" />
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
          {/* Breadcrumb */}
          <nav
            aria-label="Fil d'Ariane"
            className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground"
          >
            <Link href="/sites" className="hover:text-foreground">
              Sites naturels
            </Link>
            {site.departement && (
              <>
                <span>·</span>
                <Link
                  href={departementHref(site.code_departement, site.departement)}
                  className="hover:text-foreground"
                >
                  {site.departement}
                </Link>
              </>
            )}
            <span>·</span>
            <span className="text-foreground/80">{site.nom}</span>
          </nav>

          <h1
            className="mt-6 font-display font-medium leading-[0.92] tracking-[-0.025em] text-balance sm:mt-10"
            style={{ fontSize: "clamp(2.4rem, 8vw, 6.5rem)" }}
          >
            {site.nom}
          </h1>

          {site.commune && (
            <p
              className="mt-4 font-display italic text-primary glow-ice-text"
              style={{ fontSize: "clamp(1.2rem, 3vw, 2rem)" }}
            >
              {communeName(site.commune)}
            </p>
          )}

          {/* Stats clés */}
          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:mt-14 sm:grid-cols-4">
            <FactCard
              icon={Mountain}
              label="Cotation"
              value={formatCotationRange(site.cotation_min, site.cotation_max)}
            />
            <FactCard
              icon={Compass}
              label="Voies"
              value={
                site.nombre_voies && site.nombre_voies > 0
                  ? site.nombre_voies.toLocaleString("fr-FR")
                  : "—"
              }
            />
            <FactCard
              icon={MapPin}
              label="Type"
              value={formatTypeSite(site.type_site)}
            />
            <FactCard
              icon={Calendar}
              label="Période"
              value={
                months.length > 0
                  ? months.length === 12
                    ? "Toute l'année"
                    : `${months[0]} → ${months[months.length - 1]}`
                  : "Non renseignée"
              }
            />
          </dl>
        </div>
      </section>

      {/* Données factuelles structurées */}
      <section className="relative surface-1 text-foreground">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          <div className="grid grid-cols-12 gap-x-4 gap-y-10 sm:gap-x-10">
            <div className="col-span-12 sm:col-span-4 lg:col-span-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                § Données techniques
              </span>
              <p className="mt-3 max-w-[24ch] font-mono text-[11px] uppercase leading-relaxed tracking-[0.18em] text-muted-foreground">
                Fiche du recensement officiel public, augmentée par notre
                lecture.
              </p>
            </div>

            <div className="col-span-12 sm:col-span-8 lg:col-span-9">
              <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2">
                <FactRow label="Rocher" value={site.rocher} />
                <FactRow label="Orientation" value={site.orientation} />
                <FactRow
                  label="Hauteur min"
                  value={site.hauteur_min_m ? `${site.hauteur_min_m} m` : null}
                />
                <FactRow
                  label="Hauteur max"
                  value={site.hauteur_max_m ? `${site.hauteur_max_m} m` : null}
                />
                <FactRow label="Massif" value={site.massif} />
                <FactRow label="Département" value={site.departement} />
                {site.latitude && site.longitude && (
                  <FactRow
                    label="Coordonnées GPS"
                    value={`${site.latitude.toFixed(5)}, ${site.longitude.toFixed(5)}`}
                    mono
                  />
                )}
                <FactRow
                  label="Dernière mise à jour"
                  value={site.derniere_mise_a_jour}
                />
              </div>

              {months.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                    Calendrier favorable
                  </h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {MOIS_ORDRE.map((m) => {
                      const active = months
                        .map((x) => x.toLowerCase())
                        .includes(m.toLowerCase());
                      return (
                        <span
                          key={m}
                          className={`inline-flex h-9 items-center rounded-full border px-3 font-mono text-[10px] uppercase tracking-[0.18em] sm:text-xs ${
                            active
                              ? "border-primary bg-primary/15 text-primary"
                              : "border-white/10 bg-white/[0.03] text-muted-foreground/60"
                          }`}
                        >
                          {m.slice(0, 3)}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {site.reglementation_particuliere && (
                <div className="mt-10 rounded-2xl border border-accent/30 bg-accent/[0.05] p-5 sm:p-7">
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent">
                    Réglementation particulière
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/90 sm:text-base">
                    Ce site applique des restrictions spécifiques (accès,
                    nidifications, accord foncier). Consulte la source
                    officielle avant ta sortie pour avoir le détail à jour.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Note source */}
      <section className="relative surface-2 text-foreground">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
          <div className="grid grid-cols-12 gap-y-6 sm:gap-x-12">
            <div className="col-span-12 sm:col-span-4 lg:col-span-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                § Source
              </span>
            </div>
            <div className="col-span-12 sm:col-span-8 lg:col-span-9">
              <p className="max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Les données techniques de cette fiche (coordonnées, cotations,
                nombre de voies, périodes) proviennent du recensement officiel
                public des sites naturels d&apos;escalade en France. La
                rédaction longue (présentation, accès, approche) est en cours
                de réécriture par notre équipe pour offrir une lecture plus
                fluide et originale.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/sites"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors hover:border-primary hover:text-primary"
                >
                  Retour à la carte
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
                {site.departement && (
                  <Link
                    href={departementHref(site.code_departement, site.departement)}
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-transform hover:scale-[1.02]"
                  >
                    Plus de sites en {site.departement}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function FactCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-coal-900 p-5 sm:p-6">
      <div className="flex items-center gap-2 text-primary">
        <Icon className="h-3.5 w-3.5" />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em]">
          {label}
        </span>
      </div>
      <p className="mt-3 font-display text-xl font-medium tracking-[-0.01em] tabular-nums sm:text-2xl">
        {value}
      </p>
    </div>
  );
}

function FactRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
}) {
  return (
    <div className="bg-coal-900 px-5 py-4 sm:px-6 sm:py-5">
      <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </dt>
      <dd
        className={`mt-2 text-sm text-foreground sm:text-base ${
          mono ? "font-mono tabular-nums" : ""
        } ${!value ? "text-muted-foreground/60" : ""}`}
      >
        {value || "Non renseigné"}
      </dd>
    </div>
  );
}

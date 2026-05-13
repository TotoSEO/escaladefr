import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowUpRight, Mountain, MapPin, Compass, Sparkles } from "lucide-react";

import { PageShell, PageHeader } from "@/components/page-shell";
import { DepartementMap } from "@/components/sites/departement-map";
import { getSupabase } from "@/lib/supabase";
import {
  fetchSitesByDepartement,
  slugify,
  siteHref,
  formatCotationRange,
  communeName,
  type SiteListItem,
} from "@/lib/sites";
import { getDepartementSEO } from "@/data/departements_seo";

export const revalidate = 86400;

type Params = { code: string; slug: string };

async function findDepartementName(code: string): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase
    .from("sites_naturels")
    .select("departement,code_departement")
    .eq("code_departement", code)
    .not("departement", "is", null)
    .limit(1);
  const dep = (data as { departement: string }[] | null)?.[0]?.departement;
  return dep ?? null;
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const { code } = await params;
  const departement = await findDepartementName(code);
  if (!departement) return { title: "Département introuvable" };

  const sites = await fetchSitesByDepartement(departement);
  const count = sites.length;
  const title = `Sites d'escalade en ${departement} · ${count} spots recensés`;
  const description = `Carte et annuaire des ${count} sites d'escalade naturels du département ${departement} (${code}) en France. Cotations, GPS, accès.`;

  return {
    title: title.length > 64 ? title.slice(0, 61) + "…" : title,
    description: description.length > 158 ? description.slice(0, 155) + "…" : description,
    alternates: { canonical: `/sites/dep/${code}/${slugify(departement)}` },
  };
}

export default async function DepartementPage(
  { params }: { params: Promise<Params> },
) {
  const { code, slug } = await params;
  const departement = await findDepartementName(code);
  if (!departement) notFound();

  const canonicalSlug = slugify(departement);
  if (slug !== canonicalSlug) {
    redirect(`/sites/dep/${code}/${canonicalSlug}`);
  }

  const sites = await fetchSitesByDepartement(departement);
  const seo = getDepartementSEO(code);

  // Stats départementales
  const massifs = new Map<string, number>();
  let withGps = 0;
  let totalVoies = 0;
  let cotMin: string | null = null;
  let cotMax: string | null = null;
  for (const s of sites) {
    if (s.massif) massifs.set(s.massif, (massifs.get(s.massif) ?? 0) + 1);
    if (s.latitude && s.longitude) withGps += 1;
    if (s.nombre_voies) totalVoies += s.nombre_voies;
    if (s.cotation_min && (!cotMin || s.cotation_min < cotMin)) cotMin = s.cotation_min;
    if (s.cotation_max && (!cotMax || s.cotation_max > cotMax)) cotMax = s.cotation_max;
  }
  const topMassifs = [...massifs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  // Top 6 spots (les plus équipés en voies)
  const topSites = [...sites]
    .filter((s) => s.nombre_voies && s.nombre_voies > 0)
    .sort((a, b) => (b.nombre_voies ?? 0) - (a.nombre_voies ?? 0))
    .slice(0, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `https://escalade-france.fr/sites/dep/${code}/${canonicalSlug}`,
        url: `https://escalade-france.fr/sites/dep/${code}/${canonicalSlug}`,
        name: `Sites d'escalade en ${departement}`,
        description:
          seo?.intro ??
          `Sites naturels d'escalade dans le département ${departement}.`,
        isPartOf: { "@id": "https://escalade-france.fr/#website" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: "https://escalade-france.fr" },
          { "@type": "ListItem", position: 2, name: "Sites naturels", item: "https://escalade-france.fr/sites" },
          { "@type": "ListItem", position: 3, name: departement, item: `https://escalade-france.fr/sites/dep/${code}/${canonicalSlug}` },
        ],
      },
      {
        "@type": "ItemList",
        name: `Sites d'escalade en ${departement}`,
        numberOfItems: sites.length,
        itemListElement: sites.slice(0, 100).map((s, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: s.nom,
          url: `https://escalade-france.fr${siteHref(s)}`,
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
        section={`§ Département ${code}`}
        status="live"
        surface="cool"
        title={
          <>
            Sites d&apos;escalade en{" "}
            <span className="italic text-primary glow-ice-text">
              {departement}
            </span>
            <br />
            <span className="text-foreground/85">
              {sites.length} spot{sites.length > 1 ? "s" : ""} recensé
              {sites.length > 1 ? "s" : ""}.
            </span>
          </>
        }
        subtitle={`Tous les sites naturels d'escalade répertoriés en ${departement}, classés par ordre alphabétique. Cotations, coordonnées GPS, accès et carte interactive.`}
      />

      {/* Carte focalisée */}
      <section className="relative surface-1 text-foreground">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
          <DepartementMap sites={sites} departement={departement} />
          <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:text-xs">
            Fond de carte © OpenStreetMap contributors, © CARTO · clique sur un point pour voir la fiche
          </p>
        </div>
      </section>

      {/* Stats département */}
      <section className="relative surface-2 text-foreground">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4">
            <Stat label="Spots" value={sites.length.toLocaleString("fr-FR")} />
            <Stat label="Avec GPS" value={withGps.toLocaleString("fr-FR")} />
            <Stat
              label="Voies cumulées"
              value={totalVoies > 0 ? totalVoies.toLocaleString("fr-FR") : "—"}
            />
            <Stat
              label="Cotations"
              value={cotMin && cotMax ? `${cotMin} → ${cotMax}` : "—"}
            />
          </dl>

          {topMassifs.length > 0 && (
            <div className="mt-10">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                Massifs représentés
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {topMassifs.map(([m, n]) => (
                  <span
                    key={m}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/85 sm:text-xs"
                  >
                    {m}
                    <span className="text-primary tabular-nums">{n}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Contenu SEO rédigé */}
      {seo && (
        <section className="relative surface-1 text-foreground">
          <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
            <div className="grid grid-cols-12 gap-x-4 gap-y-10 sm:gap-x-12">
              <div className="col-span-12 sm:col-span-4 lg:col-span-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                  § Grimper en {departement}
                </span>
                <p className="mt-3 max-w-[26ch] font-mono text-[11px] uppercase leading-relaxed tracking-[0.18em] text-muted-foreground">
                  Notre lecture du département, par notre équipe.
                </p>
              </div>
              <div className="col-span-12 space-y-10 sm:col-span-8 lg:col-span-9">
                <SeoBlock
                  icon={Mountain}
                  title={`L'escalade en ${departement}`}
                  body={seo.intro}
                />
                <SeoBlock
                  icon={MapPin}
                  title="Terrains et styles dominants"
                  body={seo.terrains}
                />
                <SeoBlock
                  icon={Compass}
                  title="Saisons et conditions"
                  body={seo.saisons}
                />
                <SeoBlock
                  icon={Sparkles}
                  title="Conseils pratiques"
                  body={seo.conseils}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Top spots du département */}
      {topSites.length > 0 && (
        <section className="relative surface-2 text-foreground">
          <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
          <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
            <div className="mb-8 flex items-baseline gap-3 sm:mb-12">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                § Spots phares
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                par nombre de voies
              </span>
            </div>
            <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
              {topSites.map((s) => (
                <SiteCardLarge key={s.id} site={s} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Liste complète des sites */}
      <section className="relative surface-1 text-foreground">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          <div className="mb-8 flex items-center gap-3 sm:mb-12">
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
              § Tous les sites du département
            </span>
          </div>

          {sites.length === 0 ? (
            <p className="text-muted-foreground">
              Aucun site répertorié pour le moment dans ce département.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 lg:grid-cols-2">
              {sites.map((s) => (
                <li key={s.id}>
                  <SiteCard site={s} />
                </li>
              ))}
            </ul>
          )}

          <div className="mt-12 flex items-center justify-end gap-3">
            <Link
              href="/sites"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors hover:border-primary hover:text-primary"
            >
              Voir la carte de France
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-coal-900 p-5 sm:p-6">
      <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
        {label}
      </dt>
      <dd
        className="mt-2 font-display font-medium leading-none tracking-[-0.02em] tabular-nums"
        style={{ fontSize: "clamp(1.7rem, 3vw, 2.5rem)" }}
      >
        {value}
      </dd>
    </div>
  );
}

function SeoBlock({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  const paragraphs = body.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  return (
    <article className="rounded-2xl border border-white/10 bg-coal-900 p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="font-display text-xl font-medium tracking-[-0.02em] sm:text-2xl">
          {title}
        </h2>
      </div>
      <div className="mt-5 space-y-4 text-base leading-relaxed text-foreground/90 sm:text-lg">
        {paragraphs.map((p, i) => (
          <p key={i}>{p.trim()}</p>
        ))}
      </div>
    </article>
  );
}

function SiteCardLarge({ site }: { site: SiteListItem }) {
  return (
    <Link
      href={siteHref(site)}
      className="group relative flex flex-col gap-3 bg-coal-900 p-6 transition-colors hover:bg-[#1a1a1a] sm:p-8"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
        {site.massif || communeName(site.commune) || "Site"}
      </span>
      <h3
        className="font-display font-medium leading-tight tracking-[-0.02em]"
        style={{ fontSize: "clamp(1.4rem, 2.4vw, 1.75rem)" }}
      >
        {site.nom}
      </h3>
      <p className="text-sm text-muted-foreground">
        {communeName(site.commune)}
      </p>
      <dl className="mt-auto grid grid-cols-2 gap-3 pt-4 text-sm">
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Cotation
          </dt>
          <dd className="mt-1 font-mono tabular-nums">
            {formatCotationRange(site.cotation_min, site.cotation_max)}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Voies
          </dt>
          <dd className="mt-1 font-mono tabular-nums">
            {site.nombre_voies?.toLocaleString("fr-FR") ?? "—"}
          </dd>
        </div>
      </dl>
      <ArrowUpRight className="absolute right-5 top-5 h-4 w-4 text-foreground/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}

function SiteCard({ site }: { site: SiteListItem }) {
  return (
    <Link
      href={siteHref(site)}
      className="group flex items-baseline justify-between gap-4 bg-coal-900 px-5 py-5 transition-colors hover:bg-[#1a1a1a] sm:px-7 sm:py-6"
    >
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display text-base font-medium tracking-[-0.01em] sm:text-lg">
          {site.nom}
        </h3>
        <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {communeName(site.commune) || "Localisation indéterminée"}
          {site.massif ? ` · ${site.massif}` : ""}
        </p>
      </div>
      <div className="flex shrink-0 items-baseline gap-3 text-right">
        <span className="font-mono text-[10px] uppercase tabular-nums tracking-[0.18em] text-foreground/80 sm:text-xs">
          {formatCotationRange(site.cotation_min, site.cotation_max)}
        </span>
        <ArrowUpRight className="h-4 w-4 text-foreground/40 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
    </Link>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import { PageShell, PageHeader } from "@/components/page-shell";
import { getSupabase } from "@/lib/supabase";
import {
  fetchSitesByDepartement,
  slugify,
  siteHref,
  formatCotationRange,
  communeName,
  type SiteListItem,
} from "@/lib/sites";

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
  const title = `Escalade en ${departement} · ${count} site${count > 1 ? "s" : ""} naturels`;
  const description = `Annuaire des ${count} sites naturels d'escalade recensés dans le département ${departement} (${code}) en France. Cotations, coordonnées GPS.`;

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `https://escalade-france.fr/sites/dep/${code}/${canonicalSlug}`,
        url: `https://escalade-france.fr/sites/dep/${code}/${canonicalSlug}`,
        name: `Escalade en ${departement}`,
        description: `Sites naturels d'escalade dans le département ${departement}.`,
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
            Escalade en{" "}
            <span className="italic text-primary glow-ice-text">
              {departement}
            </span>
            <br />
            <span className="text-foreground/85">
              {sites.length} site{sites.length > 1 ? "s" : ""} recensé
              {sites.length > 1 ? "s" : ""}.
            </span>
          </>
        }
        subtitle={`Tous les sites naturels d'escalade répertoriés en ${departement}, classés par ordre alphabétique. Cotations, coordonnées GPS, accès quand l'info est disponible.`}
      />

      {/* Stats département */}
      <section className="relative surface-1 text-foreground">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-4">
            <Stat label="Sites" value={sites.length.toLocaleString("fr-FR")} />
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

      {/* Liste des sites */}
      <section className="relative surface-2 text-foreground">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          <div className="mb-8 flex items-center gap-3 sm:mb-12">
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
              § {sites.length} sites recensés
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

function SiteCard({ site }: { site: SiteListItem }) {
  return (
    <Link
      href={siteHref(site)}
      className="group flex items-baseline justify-between gap-4 bg-coal-900 px-5 py-5 transition-colors hover:bg-[#1a1a1a] sm:px-7 sm:py-7"
    >
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display text-lg font-medium tracking-[-0.01em] sm:text-xl">
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

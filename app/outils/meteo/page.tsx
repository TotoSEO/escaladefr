import type { Metadata } from "next";
import Link from "next/link";

import { PageShell, PageHeader } from "@/components/page-shell";
import { MeteoSiteChecker } from "@/components/tools/meteo-site-checker";
import { getSupabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Météo escalade par site naturel · 5 jours, heure par heure",
  description:
    "Bulletin Open-Meteo croisé avec orientation et heures d'ensoleillement par site naturel d'escalade. Pour savoir si tu peux y aller cet aprem.",
  alternates: { canonical: "/outils/meteo" },
};

export const revalidate = 3600;

type SiteRow = {
  id: number;
  nom: string;
  commune: string | null;
  departement: string | null;
  latitude: number | null;
  longitude: number | null;
  latitude_affine: number | null;
  longitude_affine: number | null;
  orientation: string | null;
};

async function fetchSitesIndex(): Promise<
  {
    id: number;
    nom: string;
    commune: string | null;
    departement: string | null;
    latitude: number;
    longitude: number;
    orientation: string | null;
  }[]
> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const PAGE = 1000;
  const rows: SiteRow[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from("sites_naturels")
      .select(
        "id,nom,commune,departement,latitude,longitude,latitude_affine,longitude_affine,orientation",
      )
      .not("latitude", "is", null)
      .not("longitude", "is", null)
      .order("nom")
      .range(from, from + PAGE - 1);
    if (error || !data || data.length === 0) break;
    rows.push(...(data as SiteRow[]));
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return rows
    .map((r) => {
      const lat = r.latitude_affine ?? r.latitude;
      const lon = r.longitude_affine ?? r.longitude;
      if (typeof lat !== "number" || typeof lon !== "number") return null;
      return {
        id: r.id,
        nom: r.nom,
        commune: r.commune,
        departement: r.departement,
        latitude: lat,
        longitude: lon,
        orientation: r.orientation,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
}

const FAQ = [
  {
    q: "D'où viennent les prévisions affichées ?",
    a: "On utilise l'API Open-Meteo, un service gratuit et sans clé d'accès, qui agrège les meilleurs modèles météo nationaux (Météo-France pour l'Europe, ICON pour l'Allemagne, GFS pour les États-Unis). Les bulletins sont mis à jour plusieurs fois par jour avec une résolution horaire et locale à 1-2 km près. Open-Meteo est sous licence CC-BY 4.0, accessible à tout site qui souhaite afficher ses données.",
  },
  {
    q: "Comment est calculé le verdict idéal / correct / à éviter ?",
    a: "On regarde quatre variables : précipitations en cours, température, vent et rafales. Pluie active au-dessus de 0,5 mm ou rafales au-dessus de 50 km/h passent en rouge. Gel ou plus de 33 °C passent en rouge aussi. Risque de pluie élevé, vent fort ou températures inconfortables passent en orange. Le reste passe en vert. C'est volontairement strict côté pluie : un rocher humide met plusieurs heures à sécher.",
  },
  {
    q: "Pourquoi mon site préféré n'apparaît pas dans la liste ?",
    a: "On affiche uniquement les sites avec des coordonnées GPS renseignées dans notre base. Si tu ne le trouves pas, soit la fiche source n'a pas de coordonnées (rare), soit c'est un site très confidentiel non recensé officiellement. Dans ce cas le calcul reste possible si tu connais les coordonnées, on prépare une version coordonnées libres.",
  },
  {
    q: "L'orientation de la falaise est-elle prise en compte ?",
    a: "On affiche l'orientation telle qu'elle est renseignée dans le recensement officiel et on explique ce qu'elle implique en termes d'exposition au soleil. La prévision Open-Meteo intègre déjà la couverture nuageuse et la température ressentie, donc le verdict horaire en tient compte. Pour l'instant on ne calcule pas finement la trajectoire solaire sur la falaise selon la saison, c'est une amélioration prévue.",
  },
  {
    q: "Peut-on planifier une session plusieurs semaines à l'avance ?",
    a: "Open-Meteo fournit ici cinq jours. Au-delà, la fiabilité chute brutalement et plus aucun grimpeur ne s'engage sur une prévision à 10 jours. Pour planifier des vacances de grimpe, raisonne en climat saisonnier (avril-juin parfait sur le Verdon, septembre-octobre sur la Loire, mai-juin sur Buoux), pas en prévision de la semaine.",
  },
];

export default async function MeteoPage() {
  const sites = await fetchSitesIndex();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Météo escalade par site naturel",
        applicationCategory: "SportsApplication",
        operatingSystem: "Web",
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        url: "https://escalade-france.fr/outils/meteo",
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
            name: "Météo escalade par site",
            item: "https://escalade-france.fr/outils/meteo",
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
        section="§ Outil 02 / Météo"
        status="live"
        surface="cool"
        title={
          <>
            Cet aprem,
            <br />
            <span className="italic text-primary glow-ice-text">grimpable</span>
            ?
          </>
        }
        subtitle={`Sélectionne un site parmi les ${sites.length.toLocaleString("fr-FR")} référencés. On t'affiche un bulletin Open-Meteo heure par heure sur cinq jours, croisé avec l'orientation de la falaise.`}
      />

      <section className="relative surface-2 text-foreground">
        <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
          <MeteoSiteChecker sites={sites} />
          <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground sm:text-sm">
            Données météo : <a
              href="https://open-meteo.com"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-primary/40 underline-offset-2 hover:decoration-primary"
            >
              Open-Meteo
            </a>{" "}
            (licence CC-BY 4.0). Mise à jour plusieurs fois par jour.
          </p>
        </div>
      </section>

      {/* Comment lire */}
      <section className="relative surface-3 text-foreground">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="grid grid-cols-12 gap-y-10 sm:gap-x-12">
            <div className="col-span-12 sm:col-span-4 lg:col-span-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                § Comment lire
              </span>
            </div>
            <div className="col-span-12 sm:col-span-8 lg:col-span-9">
              <h2
                className="font-display font-medium leading-[0.96] tracking-[-0.02em] text-balance"
                style={{ fontSize: "clamp(1.85rem, 5vw, 4.4rem)" }}
              >
                Trois variables{" "}
                <span className="italic text-primary glow-ice-text">
                  qui changent tout
                </span>
                .
              </h2>
              <div className="mt-12 grid gap-8 sm:grid-cols-2 sm:gap-10">
                <Point
                  title="La pluie de la veille"
                  body="Une falaise calcaire trempée la veille met 24 à 48 h à sécher selon l'orientation et le vent. Le grès sèche plus vite, le tuffeau plus lentement. Si la colonne précipitation des dernières 24 h dépasse 5 mm, considère que ce n'est pas grimpable, même si l'aprem est ensoleillé."
                />
                <Point
                  title="Le vent en altitude"
                  body="Sur une falaise haute (au-delà de 30 m), le vent au sommet peut être 30 à 50 % plus fort qu'à la base. Une rafale à 50 km/h annoncée à 2 m du sol devient inconfortable en haut. On flagge en orange dès 35 km/h en rafale, en rouge dès 50."
                />
                <Point
                  title="L'orientation et la saison"
                  body="Une falaise sud en juillet à midi, ce sont 50 °C en surface. La même falaise en janvier à midi, c'est le seul endroit grimpable du département. Croise toujours le verdict horaire avec l'orientation affichée pour ton site, et adapte ta plage d'attaque."
                />
                <Point
                  title="L'humidité résiduelle"
                  body="Open-Meteo ne sait pas si la résurgence située 50 m au-dessus de la falaise mouille la voie en permanence. C'est de la connaissance terrain : les voies à seepage en Provence, les voies sous surplomb humide en Bourgogne. Croise toujours avec un local ou un topo récent."
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
              Outil 02 / 03
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

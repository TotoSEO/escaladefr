import { getSupabase } from "@/lib/supabase";
import { fetchDepartements, departementHref } from "@/lib/sites";
import { Hero } from "@/components/home/hero";
import { Manifesto } from "@/components/home/manifesto";
import { TopDepartements } from "@/components/home/top-departements";
import { Missions } from "@/components/home/missions";
import { WhoIsBehind } from "@/components/home/who-is-behind";

export const revalidate = 3600;

type Stats = {
  total: number | null;
  avecGps: number | null;
  totalDepartements: number;
  topDepartements: {
    departement: string;
    code_departement: string | null;
    count: number;
  }[];
};

async function getStats(): Promise<Stats> {
  const supabase = getSupabase();
  if (!supabase) {
    return { total: null, avecGps: null, totalDepartements: 0, topDepartements: [] };
  }
  try {
    const [totalRes, gpsRes, deps] = await Promise.all([
      supabase.from("sites_naturels").select("*", { count: "exact", head: true }),
      supabase
        .from("sites_naturels")
        .select("*", { count: "exact", head: true })
        .not("latitude", "is", null),
      fetchDepartements(),
    ]);
    return {
      total: totalRes.count,
      avecGps: gpsRes.count,
      totalDepartements: deps.length,
      topDepartements: deps.slice(0, 8),
    };
  } catch {
    return { total: null, avecGps: null, totalDepartements: 0, topDepartements: [] };
  }
}

export default async function Home() {
  const stats = await getStats();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://escalade-france.fr/#organization",
        name: "escalade-france.fr",
        url: "https://escalade-france.fr",
        description:
          "Annuaire indépendant des sites naturels d'escalade et des salles d'escalade en France.",
        foundingDate: "2026",
        areaServed: { "@type": "Country", name: "France" },
        knowsAbout: [
          "Escalade",
          "Sites naturels d'escalade",
          "Salles d'escalade",
          "Bloc",
          "Voie",
          "Cotations d'escalade",
        ],
      },
      {
        "@type": "WebSite",
        "@id": "https://escalade-france.fr/#website",
        url: "https://escalade-france.fr",
        name: "escalade-france.fr",
        description:
          "Annuaire indépendant de l'escalade en France : 3 500 sites naturels, salles, outils, cartographie.",
        publisher: { "@id": "https://escalade-france.fr/#organization" },
        inLanguage: "fr-FR",
      },
      {
        "@type": "WebPage",
        "@id": "https://escalade-france.fr/",
        url: "https://escalade-france.fr",
        name: "escalade-france.fr · sites naturels et salles d'escalade",
        isPartOf: { "@id": "https://escalade-france.fr/#website" },
        about: { "@id": "https://escalade-france.fr/#organization" },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: "https://escalade-france.fr/hero/falaise.jpg",
        },
      },
      ...(stats.topDepartements.length > 0
        ? [
            {
              "@type": "ItemList",
              name: "Top départements d'escalade en France",
              description:
                "Classement des départements français les plus équipés en sites naturels d'escalade.",
              itemListElement: stats.topDepartements.map((d, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: d.departement,
                url: `https://escalade-france.fr${departementHref(d.code_departement, d.departement)}`,
              })),
            },
          ]
        : []),
      ...(stats.total !== null
        ? [
            {
              "@type": "Dataset",
              name: "Sites naturels d'escalade en France",
              description: `Base de ${stats.total.toLocaleString("fr-FR")} sites naturels d'escalade recensés en France, avec coordonnées GPS, cotations, accès et périodes favorables.`,
              keywords: ["escalade", "falaise", "France", "outdoor", "SNE"],
              isAccessibleForFree: true,
              spatialCoverage: { "@type": "Country", name: "France" },
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero totalSites={stats.total} />
      <Manifesto
        total={stats.total}
        avecGps={stats.avecGps}
        departements={stats.totalDepartements || null}
      />
      <TopDepartements items={stats.topDepartements} />
      <Missions />
      <WhoIsBehind />
    </>
  );
}

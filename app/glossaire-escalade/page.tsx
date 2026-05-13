import type { Metadata } from "next";

import { PageShell, PageHeader } from "@/components/page-shell";
import { GlossaireSearch } from "@/components/glossaire/search";
import { GLOSSAIRE, CATEGORIES } from "@/lib/glossaire";

export const metadata: Metadata = {
  title: "Glossaire de l'escalade · 130 termes techniques et jargon",
  description:
    "Lexique complet de l'escalade : matériel, mouvements, prises, sécurité, jargon. Recherche instantanée et filtres par catégorie. À vue, jeté, dièdre, dégaine…",
  alternates: { canonical: "/glossaire-escalade" },
  openGraph: {
    title: "Glossaire de l'escalade · 130 termes",
    description:
      "Tout le vocabulaire de l'escalade en un seul endroit, avec recherche instantanée.",
    type: "website",
  },
};

export default function GlossairePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "DefinedTermSet",
        "@id": "https://escalade-france.fr/glossaire-escalade#termset",
        name: "Glossaire de l'escalade",
        description:
          "Lexique des termes techniques et du jargon de l'escalade en français.",
        url: "https://escalade-france.fr/glossaire-escalade",
        hasDefinedTerm: GLOSSAIRE.map((e) => ({
          "@type": "DefinedTerm",
          "@id": `https://escalade-france.fr/glossaire-escalade#${e.id}`,
          name: e.terme,
          alternateName: e.alias && e.alias.length > 0 ? e.alias : undefined,
          description: e.definition,
          inDefinedTermSet:
            "https://escalade-france.fr/glossaire-escalade#termset",
          termCode: e.id,
          additionalType: e.categorie,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: "https://escalade-france.fr" },
          { "@type": "ListItem", position: 2, name: "Glossaire", item: "https://escalade-france.fr/glossaire-escalade" },
        ],
      },
      {
        "@type": "WebPage",
        "@id": "https://escalade-france.fr/glossaire-escalade",
        url: "https://escalade-france.fr/glossaire-escalade",
        name: "Glossaire de l'escalade",
        isPartOf: { "@id": "https://escalade-france.fr/#website" },
        mainEntity: {
          "@id": "https://escalade-france.fr/glossaire-escalade#termset",
        },
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
        section="§ Glossaire / Vocabulaire"
        status="live"
        surface="warm"
        title={
          <>
            Tout le{" "}
            <span className="italic text-primary glow-ice-text">
              vocabulaire
            </span>
            <br />
            de l&apos;escalade.
          </>
        }
        subtitle={`${GLOSSAIRE.length} termes classés en ${CATEGORIES.length} catégories. Du matériel aux mouvements, du jargon aux notions de sécurité. Cherche un mot, filtre par catégorie, ou parcours par ordre alphabétique.`}
      />

      <section className="relative surface-1 text-foreground">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-20">
          <GlossaireSearch />
        </div>
      </section>

      {/* CTA */}
      <section className="relative surface-2 text-foreground">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          <div className="grid grid-cols-12 gap-y-6 sm:gap-x-12">
            <div className="col-span-12 sm:col-span-5">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                § Une expression nous manque ?
              </span>
            </div>
            <div className="col-span-12 sm:col-span-7">
              <h2
                className="font-display font-medium leading-[0.96] tracking-[-0.02em] text-balance"
                style={{ fontSize: "clamp(1.6rem, 4vw, 3.2rem)" }}
              >
                Dis-le nous, on{" "}
                <span className="italic text-primary glow-ice-text">
                  l&apos;ajoute
                </span>
                .
              </h2>
              <p className="mt-5 max-w-prose text-base text-muted-foreground sm:text-lg">
                Le langage des grimpeurs évolue vite, et notre liste vivra avec.
                Si tu vois manquer un terme courant, un anglicisme ou un mot
                régional, propose-le via le formulaire de contact.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

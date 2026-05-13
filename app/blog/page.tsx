import type { Metadata } from "next";
import Link from "next/link";

import { PageShell, PageHeader } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Blog escalade · récits de sortie, guides et tests honnêtes",
  description:
    "Articles de fond sur l'escalade en France : tests matériel, récits de sortie, guides pratiques, analyse du milieu. Un article par semaine.",
  alternates: { canonical: "/blog" },
};

const TEASERS = [
  {
    cat: "Guide",
    title: "Préparer sa première sortie en falaise sans paniquer",
    desc: "Le matériel minimum, comment lire un topo, comment évaluer si une voie est dans tes cordes. Tout ce qu'on aurait aimé qu'on nous dise au début.",
  },
  {
    cat: "Test",
    title: "Six paires de chaussons à moins de 100 € passées au crible",
    desc: "On a grimpé deux semaines avec chacune sur les mêmes types de voies. Verdict honnête, sans favoritisme de marque.",
  },
  {
    cat: "Récit",
    title: "Trois jours à Céüse sans guide ni topo récent",
    desc: "L'expérience qu'on déconseille mais qu'on a faite. Ce qui s'est bien passé, ce qu'on a appris à la dure, et pourquoi on y retournera quand même.",
  },
  {
    cat: "Analyse",
    title: "Pourquoi tant de sites d'escalade ferment cet été ?",
    desc: "Conflits fonciers, nidifications de rapaces, accords avec les communes : on a appelé six gestionnaires de sites pour comprendre.",
  },
];

export default function BlogPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Blog",
        "@id": "https://escalade-france.fr/blog",
        url: "https://escalade-france.fr/blog",
        name: "Blog escalade-france.fr",
        description:
          "Récits, guides et tests d'escalade publiés chaque semaine.",
        isPartOf: { "@id": "https://escalade-france.fr/#website" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: "https://escalade-france.fr" },
          { "@type": "ListItem", position: 2, name: "Blog", item: "https://escalade-france.fr/blog" },
        ],
      },
      {
        "@type": "ItemList",
        name: "Prochains articles du blog escalade",
        itemListElement: TEASERS.map((t, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: t.title,
          description: t.desc,
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
        section="§ Blog"
        status="soon"
        surface="cool"
        title={
          <>
            Récits, guides
            <br />
            et{" "}
            <span className="italic text-primary glow-ice-text">tests honnêtes</span>.
          </>
        }
        subtitle="On démarre le blog dans quelques semaines. L'idée : un article par semaine, écrit par des gens qui grimpent vraiment. Voici un aperçu de ce qu'on prépare."
      />

      <section className="relative surface-1 text-foreground">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2">
            {TEASERS.map((t, i) => (
              <article
                key={i}
                className="group flex flex-col gap-4 bg-coal-900 p-7 transition-colors hover:bg-coal-800 sm:p-10"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">
                  § {t.cat}
                </span>
                <h3
                  className="font-display font-medium leading-tight tracking-[-0.02em]"
                  style={{ fontSize: "clamp(1.4rem, 2.8vw, 2.25rem)" }}
                >
                  {t.title}
                </h3>
                <p className="text-base text-muted-foreground sm:text-lg">
                  {t.desc}
                </p>
                <span className="mt-auto pt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Article en préparation
                </span>
              </article>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <p className="max-w-xl text-sm text-muted-foreground">
              Tu écris bien sur l&apos;escalade ? Tu as un sujet en tête qu&apos;on
              ne voit nulle part ailleurs ? Le blog est ouvert aux
              collaborations.
            </p>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-border px-5 text-xs font-semibold uppercase tracking-[0.2em] transition-colors hover:border-primary hover:text-primary"
            >
              Proposer un sujet
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

import type { Metadata } from "next";

import { PageShell, PageHeader } from "@/components/page-shell";

export const metadata: Metadata = {
  title: "Outils interactifs pour grimpeurs",
  description:
    "Convertisseur de cotations, calculateur d'équivalences, simulateur de progression. Des outils gratuits pour la planification et l'entraînement en escalade.",
};

const TOOLS = [
  {
    num: "I",
    title: "Convertisseur de cotations",
    desc: "Du français au UIAA, en passant par YDS américain et UK technical. Avec les correspondances habituelles entre cotations sport et trad.",
  },
  {
    num: "II",
    title: "Calculateur de jonctions",
    desc: "Pour les grandes voies. Tu donnes la longueur de la voie et le nombre de relais, on te dit combien de cordes prévoir et où placer les rappels.",
  },
  {
    num: "III",
    title: "Suivi de progression",
    desc: "Un carnet de voies simple : ce que tu as enchaîné, à quel niveau, quand. Avec une courbe de progression sur 12 mois.",
  },
  {
    num: "IV",
    title: "Météo escalade par site",
    desc: "Croisement de la météo, de l'orientation des voies et des heures d'ensoleillement pour chaque site. Pour savoir si Buoux est faisable cet aprem.",
  },
];

export default function OutilsPage() {
  return (
    <PageShell>
      <PageHeader
        section="§ Outils"
        status="soon"
        surface="warm"
        title={
          <>
            Quatre outils
            <br />
            qui{" "}
            <span className="italic text-primary glow-ice-text">vont servir</span>.
          </>
        }
        subtitle="On développe une suite d'outils interactifs gratuits, pensés pour les questions qu'on se pose vraiment au moment de planifier une session ou de comparer deux sites."
      />

      <section className="relative surface-1 text-foreground">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          <div className="space-y-px overflow-hidden rounded-2xl border border-white/10">
            {TOOLS.map((t, i) => (
              <article
                key={i}
                className="group grid grid-cols-12 gap-x-4 bg-coal-900 p-6 transition-colors hover:bg-coal-800 sm:gap-x-8 sm:p-10"
              >
                <span
                  className="col-span-3 font-display font-medium italic leading-none tracking-[-0.04em] text-foreground/15 transition-colors group-hover:text-primary sm:col-span-2"
                  style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}
                >
                  {t.num}
                </span>
                <div className="col-span-9 flex flex-col gap-3 sm:col-span-10">
                  <h3
                    className="font-display font-medium tracking-[-0.02em]"
                    style={{ fontSize: "clamp(1.4rem, 2.8vw, 2.25rem)" }}
                  >
                    {t.title}
                  </h3>
                  <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
                    {t.desc}
                  </p>
                  <span className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    En développement
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

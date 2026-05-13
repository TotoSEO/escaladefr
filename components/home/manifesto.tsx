"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";

export function Manifesto({
  total,
  avecGps,
  departements,
}: {
  total: number | null;
  avecGps: number | null;
  departements: number | null;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12%" });

  const big = (n: number | null, fallback: string) =>
    n !== null ? n.toLocaleString("fr-FR") : fallback;

  const STATS = [
    {
      number: big(total, "3 500"),
      label: "Sites recensés",
      note: "Données publiques officielles",
    },
    {
      number: big(avecGps, "2 800"),
      label: "Avec GPS précis",
      note: "Coordonnées au degré près",
    },
    {
      number: big(departements, "85"),
      label: "Départements couverts",
      note: "Du Pas-de-Calais aux Alpes-Maritimes",
    },
    {
      number: "0 €",
      label: "Pour consulter",
      note: "Aucun paywall, aucun compte requis",
      accent: true,
    },
  ];

  return (
    <section
      ref={ref}
      className="relative overflow-hidden surface-warm text-foreground"
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />

      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-32">
        <div className="grid grid-cols-12 gap-y-8 sm:gap-x-10">
          <motion.aside
            initial={{ opacity: 0, x: -16 }}
            animate={inView ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="col-span-12 flex flex-col gap-3 sm:col-span-4 lg:col-span-3"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
              § 01 / Notre fichier
            </span>
            <span className="block h-px w-12 bg-foreground/40" />
            <p className="max-w-[24ch] font-mono text-[11px] uppercase leading-relaxed tracking-[0.18em] text-muted-foreground">
              Mis à jour en mai 2026 à partir des données publiques officielles.
            </p>
          </motion.aside>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="col-span-12 sm:col-span-8 lg:col-span-9"
          >
            <p
              className="font-display font-medium leading-[0.98] tracking-[-0.02em] text-balance"
              style={{ fontSize: "clamp(1.85rem, 5.2vw, 4.8rem)" }}
            >
              On a passé{" "}
              <span className="italic text-primary glow-ice-text">
                deux mois
              </span>{" "}
              à reconstituer la carte que personne n&apos;avait.
            </p>
            <div className="mt-8 grid max-w-5xl grid-cols-1 gap-6 text-base leading-relaxed text-muted-foreground sm:mt-10 sm:grid-cols-12 sm:gap-10 sm:text-lg">
              <p className="sm:col-span-7">
                Tous les sites naturels publiés dans le recensement officiel,
                regroupés dans une base unique et navigable. Coordonnées GPS
                quand elles existent. Cotations min et max. Périodes
                favorables. Accès routier et approche.
              </p>
              <p className="sm:col-span-5">
                Pour l&apos;outdoor d&apos;abord. Pour les salles ensuite. Et
                pour l&apos;équipement après. L&apos;idée c&apos;est un seul
                endroit où retrouver tout ce dont on a besoin pour grimper.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Grille 2×2 régulière, claire et lisible */}
        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:mt-20 sm:grid-cols-2 lg:mt-24">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 18 }}
              animate={inView ? { opacity: 1, y: 0 } : undefined}
              transition={{
                delay: 0.2 + i * 0.08,
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative flex flex-col gap-3 bg-coal-900/95 p-6 transition-colors hover:bg-coal-900 sm:p-8 lg:p-10"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">
                {stat.label}
              </span>
              <span
                className={`font-display font-medium leading-none tracking-[-0.04em] tabular-nums ${
                  stat.accent ? "text-accent" : "text-foreground"
                }`}
                style={{ fontSize: "clamp(3.5rem, 8vw, 7rem)" }}
              >
                {stat.number}
              </span>
              <span className="mt-2 font-mono text-[11px] uppercase leading-relaxed tracking-[0.18em] text-muted-foreground/85">
                {stat.note}
              </span>
              <span className="absolute right-5 top-5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/50">
                0{i + 1}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

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
  const inView = useInView(ref, { once: true, margin: "-15%" });

  const big = (n: number | null, fallback: string) =>
    n !== null ? n.toLocaleString("fr-FR") : fallback;

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-background"
    >
      {/* Lignes décoratives */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
      />
      <div
        aria-hidden
        className="absolute -right-32 top-32 -z-10 h-[400px] w-[400px] rounded-full bg-primary/[0.07] blur-[120px]"
      />

      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-40">
        {/* Eyebrow + meta gauche */}
        <div className="grid grid-cols-12 gap-y-6">
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="col-span-12 flex flex-col gap-3 sm:col-span-4 lg:col-span-3"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
              § 01 / Notre fichier
            </span>
            <span className="block h-px w-12 bg-foreground/40" />
            <p className="max-w-[24ch] font-mono text-[11px] uppercase leading-relaxed tracking-[0.18em] text-muted-foreground">
              Mis à jour la dernière fois en mai 2026 depuis les données
              ouvertes de la Fédération.
            </p>
          </motion.aside>

          {/* Bloc principal éditorial */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="col-span-12 sm:col-span-8 lg:col-span-9"
          >
            <p className="font-display text-[8.5vw] font-medium leading-[0.95] tracking-[-0.025em] sm:text-[5.6vw] lg:text-[4.6vw]">
              On a passé{" "}
              <span className="italic text-primary glow-ice-text">deux mois</span>{" "}
              à reconstituer la carte que personne n&apos;avait.
            </p>
            <div className="mt-10 grid max-w-5xl grid-cols-1 gap-6 text-base leading-relaxed text-muted-foreground sm:mt-14 sm:grid-cols-12 sm:gap-10 sm:text-lg">
              <p className="sm:col-span-7">
                Tous les sites naturels publiés par la FFME, dans une base
                unique et navigable. Coordonnées GPS quand elles existent.
                Cotations min et max. Périodes favorables. Accès routier et
                approche. La fiche détaillée, sans pub, sans formulaire à
                rallonge.
              </p>
              <p className="sm:col-span-5">
                Pour l&apos;outdoor d&apos;abord. Pour les salles ensuite. Et
                pour l&apos;équipement après. L&apos;idée c&apos;est un seul
                endroit où retrouver tout ce dont on a besoin pour grimper en
                France.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Bandeau de chiffres XXL — pas des cards, des nombres qui parlent */}
        <div className="mt-20 grid grid-cols-12 gap-x-4 gap-y-12 sm:mt-28 sm:gap-x-8">
          <StatBig
            inView={inView}
            delay={0.25}
            number={big(total, "3 500")}
            label="Sites recensés"
            note="Fédération Française de Montagne et d'Escalade"
            className="col-span-12 sm:col-span-7 lg:col-span-6"
          />
          <StatBig
            inView={inView}
            delay={0.35}
            number={big(avecGps, "2 800")}
            label="Avec GPS précis"
            note="Latitude · longitude au degré près"
            align="right"
            className="col-span-12 sm:col-span-5 lg:col-span-6"
          />
          <StatBig
            inView={inView}
            delay={0.45}
            number={big(departements, "85")}
            label="Départements couverts"
            note="Du Pas-de-Calais aux Alpes-Maritimes"
            className="col-span-12 sm:col-span-6 lg:col-span-5 lg:col-start-3"
            small
          />
          <StatBig
            inView={inView}
            delay={0.55}
            number="0 €"
            label="Pour consulter"
            note="Pas de paywall, pas de compte obligatoire"
            align="right"
            className="col-span-12 sm:col-span-6 lg:col-span-4"
            small
            accent
          />
        </div>
      </div>
    </section>
  );
}

function StatBig({
  number,
  label,
  note,
  inView,
  delay,
  align = "left",
  className = "",
  small = false,
  accent = false,
}: {
  number: string;
  label: string;
  note: string;
  inView: boolean;
  delay: number;
  align?: "left" | "right";
  className?: string;
  small?: boolean;
  accent?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col gap-3 ${
        align === "right" ? "items-end text-right" : ""
      } ${className}`}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
        {label}
      </span>
      <span
        className={`font-display font-medium leading-none tracking-[-0.04em] tabular-nums ${
          small ? "text-[16vw] sm:text-[8vw] lg:text-[7vw]" : "text-[22vw] sm:text-[12vw] lg:text-[10vw]"
        } ${accent ? "text-accent" : "text-foreground"}`}
      >
        {number}
      </span>
      <span
        className={`max-w-[28ch] font-mono text-[11px] uppercase leading-relaxed tracking-[0.18em] text-muted-foreground/80 ${
          align === "right" ? "ml-auto" : ""
        }`}
      >
        {note}
      </span>
    </motion.div>
  );
}

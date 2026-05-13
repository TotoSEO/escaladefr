"use client";

import Link from "next/link";
import { motion, useInView } from "motion/react";
import { useRef } from "react";

type Mission = {
  step: string;
  title: string;
  body: string;
  href: string;
  status: "live" | "soon" | "later";
};

const MISSIONS: Mission[] = [
  {
    step: "I",
    title: "Sites naturels",
    body: "Tous les sites naturels d'escalade recensés en France, dans une base fouillable par département, par cotation, par massif. C'est en place aujourd'hui.",
    href: "/sites",
    status: "live",
  },
  {
    step: "II",
    title: "Salles d'escalade",
    body: "L'annuaire complet des salles indoor du pays. Filtre par ville, par discipline, par capacité. On commence à la collecter.",
    href: "/salles",
    status: "soon",
  },
  {
    step: "III",
    title: "Outils & blog",
    body: "Convertisseur de cotations, calculateur d'équivalences, fiches techniques. Plus un blog pour les sorties, les tests, les guides.",
    href: "/outils",
    status: "soon",
  },
  {
    step: "IV",
    title: "Boutique",
    body: "Une sélection de matériel pertinente, sans vendre du vent. Liens d'affiliation transparents, pas de promo pour des produits qu'on n'utiliserait pas.",
    href: "/boutique",
    status: "later",
  },
];

const STATUS_LABEL: Record<Mission["status"], string> = {
  live: "En ligne",
  soon: "En cours",
  later: "À venir",
};

export function Missions() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });

  return (
    <section ref={ref} className="relative overflow-hidden surface-1 text-foreground">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px divider-glow"
      />
      <div
        aria-hidden
        className="absolute -right-32 bottom-0 h-[400px] w-[400px] rounded-full bg-accent/[0.08] blur-[120px]"
      />

      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-40">
        <div className="grid grid-cols-12 gap-y-8">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={inView ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.6 }}
            className="col-span-12 flex flex-col gap-3 sm:col-span-4 lg:col-span-3"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
              § 03 / Programme
            </span>
            <span className="block h-px w-12 bg-foreground/40" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="col-span-12 font-display text-[10vw] font-medium leading-[0.95] tracking-[-0.02em] sm:col-span-8 sm:text-[5.4vw] lg:col-span-9 lg:text-[4.4vw]"
          >
            Quatre temps,{" "}
            <span className="italic text-accent">une plateforme</span>.
          </motion.h2>
        </div>

        <div className="mt-16 sm:mt-24">
          {MISSIONS.map((m, i) => (
            <motion.div
              key={m.step}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : undefined}
              transition={{
                delay: 0.2 + i * 0.12,
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="group relative grid grid-cols-12 gap-x-4 gap-y-3 border-t border-border py-10 last:border-b sm:gap-x-8 sm:py-14 lg:py-16"
            >
              {/* Chiffre romain massif */}
              <Link
                href={m.href}
                className="col-span-12 grid grid-cols-12 items-baseline gap-x-4 gap-y-3 sm:gap-x-8"
              >
                <span className="col-span-3 font-display text-[14vw] font-medium italic leading-none tracking-[-0.04em] text-foreground/15 transition-colors duration-500 group-hover:text-primary sm:col-span-2 sm:text-[8vw] lg:text-[6.5vw]">
                  {m.step}
                </span>

                <div className="col-span-9 sm:col-span-7 lg:col-span-7">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <h3 className="font-display text-3xl font-medium tracking-[-0.02em] sm:text-5xl lg:text-6xl">
                      {m.title}
                    </h3>
                    <Status status={m.status} />
                  </div>
                  <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-muted-foreground sm:mt-6 sm:text-base">
                    {m.body}
                  </p>
                </div>

                <span className="col-span-12 mt-2 inline-flex items-center justify-end gap-2 self-end font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/60 transition-colors group-hover:text-primary sm:col-span-3 sm:mt-0 sm:text-xs lg:col-span-3">
                  Aller voir
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="transition-transform group-hover:translate-x-1"
                  >
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="square"
                    />
                  </svg>
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Status({ status }: { status: Mission["status"] }) {
  const live = status === "live";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] ${
        live
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-muted text-muted-foreground"
      }`}
    >
      {live && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
        </span>
      )}
      {STATUS_LABEL[status]}
    </span>
  );
}

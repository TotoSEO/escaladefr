"use client";

import Link from "next/link";
import { motion, useInView } from "motion/react";
import { useRef, useState } from "react";
import { ArrowUpRight, MapPin, Building2, Wrench, ShoppingBag } from "lucide-react";

type Mission = {
  step: string;
  title: string;
  tagline: string;
  body: string;
  href: string;
  status: "live" | "soon" | "later";
  icon: React.ComponentType<{ className?: string }>;
};

const MISSIONS: Mission[] = [
  {
    step: "I",
    title: "Outdoor",
    tagline: "Tous les sites naturels d'escalade.",
    body: "Cotations, accès, périodes favorables, coordonnées. Filtrable par département, par massif. C'est en ligne aujourd'hui.",
    href: "/sites",
    status: "live",
    icon: MapPin,
  },
  {
    step: "II",
    title: "Indoor",
    tagline: "L'annuaire complet des salles.",
    body: "Bloc, voie, mixte. Carte interactive, filtres par ville et par discipline. On finalise la collecte des fiches.",
    href: "/salles",
    status: "soon",
    icon: Building2,
  },
  {
    step: "III",
    title: "Outils",
    tagline: "Convertisseur, météo, calculateurs.",
    body: "Tout ce qui aide à planifier ou à apprendre. Le convertisseur de cotations est déjà disponible.",
    href: "/outils",
    status: "live",
    icon: Wrench,
  },
  {
    step: "IV",
    title: "Équipement",
    tagline: "Sélection de matériel testé.",
    body: "Chaussons, baudriers, cordes. Tests honnêtes et liens d'affiliation transparents pour soutenir le projet.",
    href: "/boutique",
    status: "later",
    icon: ShoppingBag,
  },
];

const STATUS_LABEL: Record<Mission["status"], string> = {
  live: "En ligne",
  soon: "En cours",
  later: "À venir",
};

export function Missions() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12%" });
  const [active, setActive] = useState(0);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden surface-2 text-foreground"
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-accent/[0.07] blur-[140px]"
      />

      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-36">
        <div className="grid grid-cols-12 gap-y-6">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={inView ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.6 }}
            className="col-span-12 flex items-center gap-3 sm:col-span-4 lg:col-span-3"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
              § 03 / Le programme
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="col-span-12 font-display font-medium leading-[0.96] tracking-[-0.02em] text-balance sm:col-span-8 lg:col-span-9"
            style={{ fontSize: "clamp(1.85rem, 5vw, 4.4rem)" }}
          >
            Quatre temps,{" "}
            <span className="italic text-accent">une plateforme</span>.
          </motion.h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:mt-20 lg:grid-cols-[1fr_1.4fr]">
          <div className="bg-coal-900/95 p-2 sm:p-4">
            {MISSIONS.map((m, i) => {
              const Icon = m.icon;
              const isActive = active === i;
              return (
                <button
                  type="button"
                  key={m.step}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className={`group flex w-full items-center gap-4 rounded-xl px-4 py-5 text-left transition-colors sm:px-5 ${
                    isActive
                      ? "bg-white/[0.06] text-foreground"
                      : "text-foreground/70 hover:bg-white/[0.03] hover:text-foreground"
                  }`}
                >
                  <span
                    className={`font-display text-2xl font-medium italic tabular-nums sm:text-3xl ${
                      isActive ? "text-primary" : "text-foreground/40"
                    }`}
                  >
                    {m.step}
                  </span>
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      isActive
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-white/10 bg-white/5 text-foreground/70"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-lg font-medium tracking-[-0.01em] sm:text-xl">
                      {m.title}
                    </span>
                    <span className="block truncate font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {STATUS_LABEL[m.status]}
                    </span>
                  </span>
                  <ArrowUpRight
                    className={`h-4 w-4 shrink-0 transition-all duration-300 ${
                      isActive
                        ? "text-primary opacity-100"
                        : "text-foreground/30 opacity-0 group-hover:opacity-100"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="relative overflow-hidden bg-coal-900 p-6 sm:p-10 lg:p-14">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 font-display text-[16rem] font-medium italic leading-none tracking-[-0.04em] text-foreground/[0.04] sm:text-[20rem]"
            >
              {MISSIONS[active].step}
            </div>

            <motion.div
              key={MISSIONS[active].step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex h-full flex-col gap-6 sm:gap-8"
            >
              <div className="flex items-center gap-3">
                <Status status={MISSIONS[active].status} />
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Mission {MISSIONS[active].step}
                </span>
              </div>

              <h3
                className="font-display font-medium leading-[0.96] tracking-[-0.025em]"
                style={{ fontSize: "clamp(2.2rem, 6vw, 5rem)" }}
              >
                {MISSIONS[active].title}
                <span className="block italic text-primary glow-ice-text">
                  {MISSIONS[active].tagline}
                </span>
              </h3>

              <p className="max-w-[48ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
                {MISSIONS[active].body}
              </p>

              <Link
                href={MISSIONS[active].href}
                className="mt-auto inline-flex h-12 w-fit items-center gap-3 rounded-full bg-primary px-5 text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95 sm:h-14 sm:px-7 sm:text-sm"
              >
                Aller voir
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-coal-900 text-primary">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </motion.div>
          </div>
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
          : "border-white/15 bg-white/5 text-muted-foreground"
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

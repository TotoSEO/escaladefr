"use client";

import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { CheckCircle2, Circle, MapPin, Building2, Backpack, Sparkles } from "lucide-react";

type Mission = {
  step: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  done: boolean;
};

const MISSIONS: Mission[] = [
  {
    step: "01",
    title: "Sites naturels",
    desc: "Tous les SNE recensés par la FFME, cotations, accès, périodes favorables.",
    icon: MapPin,
    done: true,
  },
  {
    step: "02",
    title: "Carte interactive",
    desc: "Visualiser tous les sites sur une carte. Filtres, géolocalisation, itinéraires.",
    icon: MapPin,
    done: false,
  },
  {
    step: "03",
    title: "Salles indoor",
    desc: "L'annuaire de toutes les salles d'escalade de France : créneaux, tarifs, voies.",
    icon: Building2,
    done: false,
  },
  {
    step: "04",
    title: "Équipement",
    desc: "Comparatif d'équipement, guides d'achat, sélections par discipline.",
    icon: Backpack,
    done: false,
  },
];

export function Missions() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden border-t border-border/60 bg-stone-bg-50/40 dark:bg-stone-bg-900/30"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="mb-12 flex items-center gap-2 sm:mb-16">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            La roadmap
          </span>
        </div>

        <h2 className="max-w-3xl font-display text-3xl font-medium leading-tight tracking-tight sm:text-5xl">
          Une plateforme,{" "}
          <span className="italic text-muted-foreground">quatre missions.</span>
        </h2>

        <div className="mt-12 grid gap-6 sm:mt-16 sm:grid-cols-2 lg:gap-8">
          {MISSIONS.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.step}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : undefined}
                transition={{
                  delay: i * 0.1,
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg sm:p-8"
              >
                {/* Numéro très grand en filigrane */}
                <div
                  aria-hidden
                  className="absolute -right-4 -top-8 font-display text-[10rem] font-medium leading-none text-foreground/[0.04] transition-transform duration-700 group-hover:scale-110 sm:text-[14rem]"
                >
                  {m.step}
                </div>

                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider">
                    {m.done ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                        <span className="text-primary">En cours</span>
                      </>
                    ) : (
                      <>
                        <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">À venir</span>
                      </>
                    )}
                  </div>
                </div>

                <h3 className="relative mt-6 font-display text-2xl font-medium sm:text-3xl">
                  {m.title}
                </h3>
                <p className="relative mt-3 text-sm text-muted-foreground sm:text-base">
                  {m.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

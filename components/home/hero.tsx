"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Compass } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Hero({ totalSites }: { totalSites: number | null }) {
  const reduce = useReducedMotion();

  const eyebrowVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const titleWords = ["Toute", "l'escalade", "française,", "au", "même", "endroit."];

  return (
    <section className="relative isolate overflow-hidden">
      {/* Topo lines décoratives — courbes de niveau stylisées */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.18] dark:opacity-[0.08]"
      >
        <svg
          viewBox="0 0 800 600"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="topo-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--color-ember-500)" />
              <stop offset="100%" stopColor="var(--color-slate-deep-500)" />
            </linearGradient>
          </defs>
          {Array.from({ length: 12 }).map((_, i) => (
            <path
              key={i}
              d={`M -50 ${100 + i * 40} Q 200 ${60 + i * 35}, 400 ${
                140 + i * 30
              } T 850 ${120 + i * 32}`}
              fill="none"
              stroke="url(#topo-grad)"
              strokeWidth={1.2}
            />
          ))}
        </svg>
      </div>

      {/* Halo de couleur derrière le titre */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl sm:h-[600px] sm:w-[600px]"
      />

      <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-6xl flex-col justify-between px-4 pb-12 pt-10 sm:min-h-[calc(100dvh-4rem)] sm:px-6 sm:pb-16 sm:pt-16 lg:px-8 lg:pt-24">
        <div className="flex-1">
          <motion.div
            initial="hidden"
            animate="show"
            variants={eyebrowVariants}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground backdrop-blur"
          >
            <Compass className="h-3.5 w-3.5 text-primary" />
            Annuaire indépendant · FFME
          </motion.div>

          <h1 className="mt-6 font-display text-5xl font-medium leading-[0.95] tracking-tight text-foreground sm:mt-8 sm:text-7xl lg:text-8xl">
            {titleWords.map((word, i) => (
              <motion.span
                key={i}
                initial={reduce ? false : { opacity: 0, y: 28, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.15 + i * 0.07, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="mr-[0.22em] inline-block"
              >
                {word === "française," ? (
                  <span className="italic text-primary">française,</span>
                ) : (
                  word
                )}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-6 max-w-xl text-base text-muted-foreground sm:mt-8 sm:text-lg"
          >
            Plus de{" "}
            <strong className="text-foreground tabular-nums">
              {totalSites !== null ? totalSites.toLocaleString("fr-FR") : "3 500"}
            </strong>{" "}
            sites naturels recensés. Cotations, accès, périodes favorables,
            cartographie — tout sur une seule plateforme.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.6 }}
            className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row"
          >
            <Link
              href="/sites"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 gap-2 px-6 text-base sm:h-14 sm:px-8"
              )}
            >
              Explorer les sites
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/carte"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-12 px-6 text-base sm:h-14 sm:px-8"
              )}
            >
              Ouvrir la carte
            </Link>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="mt-12 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground"
        >
          <motion.span
            animate={reduce ? undefined : { y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="inline-block h-8 w-0.5 bg-foreground/30"
          />
          Faire défiler
        </motion.div>
      </div>
    </section>
  );
}

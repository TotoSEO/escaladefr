"use client";

import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useRef } from "react";
import { ArrowUpRight, MapPin } from "lucide-react";

const HEAD_TOP = ["Toute", "l'escalade"];
const HEAD_MID = "française";
const HEAD_END = ["au même", "endroit."];

const TICKER = [
  "Falaises calcaires",
  "Granit alpin",
  "Grès des Vosges",
  "Calanques",
  "Verdon",
  "Buoux",
  "Céüse",
  "Pays Basque",
  "Fontainebleau",
  "Annot",
  "Présles",
  "Saussois",
];

export function Hero({ totalSites }: { totalSites: number | null }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 1], [0.55, 0.95]);

  const reveal = (delay: number) => ({
    initial: reduce ? false : { y: "120%", opacity: 0 },
    animate: { y: "0%", opacity: 1 },
    transition: { delay, duration: 0.95, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <section
      ref={ref}
      className="relative isolate h-[100dvh] min-h-[680px] w-full overflow-hidden bg-coal-900 text-foreground"
    >
      {/* Photo plein cadre + parallax */}
      <motion.div
        style={{ y: imgY, scale: imgScale }}
        className="absolute inset-0 -z-10"
      >
        <Image
          src="/hero/falaise.jpg"
          alt="Falaise calcaire au lever du jour"
          fill
          priority
          sizes="100vw"
          quality={85}
          className="object-cover object-[60%_30%]"
        />
      </motion.div>

      {/* Overlay dégradé sombre */}
      <motion.div
        aria-hidden
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 -z-10 bg-gradient-to-b from-coal-900/40 via-coal-900/55 to-coal-900"
      />
      {/* Halo glacier */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(125,222,255,0.22),transparent_60%)]"
      />
      {/* Grain */}
      <div aria-hidden className="absolute inset-0 -z-10 noise" />

      {/* HUD coordonnées */}
      <div className="pointer-events-none absolute right-4 top-20 z-10 hidden text-right font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] text-foreground/70 sm:block sm:right-8 sm:top-24">
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          44° 18&apos; 02&quot; N · 5° 06&apos; 49&quot; E
          <br />
          <span className="text-primary">⏱ Mise à jour live</span>
        </motion.div>
      </div>

      <div className="relative z-0 flex h-full flex-col justify-end">
        <div className="mx-auto w-full max-w-7xl px-5 pb-14 pt-24 sm:px-8 sm:pb-20 sm:pt-32 lg:px-12 lg:pb-24">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8 flex items-center gap-3 sm:mb-10"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-foreground/85">
              Annuaire FFME · 2026
            </span>
          </motion.div>

          {/* Titre asymétrique */}
          <h1 className="font-display text-[15vw] font-medium leading-[0.88] tracking-[-0.02em] sm:text-[10vw] lg:text-[8.4vw]">
            <span className="block overflow-hidden">
              <motion.span className="block" {...reveal(0.35)}>
                {HEAD_TOP[0]}
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span className="block" {...reveal(0.45)}>
                {HEAD_TOP[1]}
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span
                className="block italic text-primary glow-ice-text"
                style={{ fontVariationSettings: '"SOFT" 100' }}
                {...reveal(0.6)}
              >
                {HEAD_MID}
              </motion.span>
            </span>
            <span className="block overflow-hidden pl-[8vw] sm:pl-[12vw] lg:pl-[18vw]">
              <motion.span className="block" {...reveal(0.75)}>
                {HEAD_END[0]}
              </motion.span>
            </span>
            <span className="block overflow-hidden pl-[12vw] sm:pl-[18vw] lg:pl-[26vw]">
              <motion.span className="block text-foreground/80" {...reveal(0.85)}>
                {HEAD_END[1]}
              </motion.span>
            </span>
          </h1>

          {/* Sous-titre + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.7 }}
            className="mt-10 grid grid-cols-1 gap-6 sm:mt-14 sm:grid-cols-12 sm:items-end sm:gap-8"
          >
            <p className="max-w-[42ch] text-base leading-relaxed text-foreground/85 sm:col-span-7 sm:text-lg lg:col-span-6">
              <span className="font-mono text-primary tabular-nums">
                {totalSites !== null
                  ? totalSites.toLocaleString("fr-FR")
                  : "3 500"}
              </span>{" "}
              sites naturels, leurs cotations, leurs accès, leurs périodes
              favorables. Plus toutes les salles d&apos;escalade de France
              qu&apos;on est en train de répertorier.
            </p>

            <div className="flex flex-col gap-3 sm:col-span-5 sm:items-end lg:col-span-6">
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/sites"
                  className="group relative inline-flex h-14 items-center gap-3 overflow-hidden rounded-full bg-primary px-7 text-sm font-semibold uppercase tracking-[0.16em] text-primary-foreground transition-transform duration-300 hover:scale-[1.02] active:scale-95 sm:h-16 sm:px-9 sm:text-base"
                >
                  <span className="relative z-10">Explorer la carte</span>
                  <span className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-coal-900 text-primary transition-transform duration-300 group-hover:rotate-45 sm:h-8 sm:w-8">
                    <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                  />
                </Link>
                <Link
                  href="/salles"
                  className="inline-flex h-14 items-center gap-2 text-sm font-medium uppercase tracking-[0.16em] text-foreground/80 underline-offset-8 transition-colors hover:text-primary hover:underline sm:h-16 sm:text-base"
                >
                  <MapPin className="h-4 w-4" />
                  Voir les salles
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Ticker bas plein largeur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="relative border-t border-white/10 bg-coal-900/70 py-3 backdrop-blur-sm"
        >
          <div className="flex w-full overflow-hidden">
            <div className="flex shrink-0 animate-marquee gap-12 whitespace-nowrap pr-12 font-mono text-[11px] uppercase tracking-[0.28em] text-foreground/75 sm:text-xs">
              {[...TICKER, ...TICKER].map((label, i) => (
                <span key={i} className="flex items-center gap-3">
                  <span className="h-1 w-1 rounded-full bg-primary" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

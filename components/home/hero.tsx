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
      className="relative isolate flex min-h-[100dvh] w-full flex-col overflow-hidden bg-coal-900 text-foreground"
    >
      {/* Photo plein cadre + parallax */}
      <motion.div
        style={{ y: imgY, scale: imgScale }}
        className="absolute inset-0 -z-10"
      >
        <Image
          src="/hero/falaise.jpg"
          alt="Grimpeur en dévers sur une falaise calcaire"
          fill
          priority
          sizes="100vw"
          quality={85}
          className="object-cover object-[30%_30%] sm:object-[40%_28%]"
        />
      </motion.div>

      <motion.div
        aria-hidden
        style={{ opacity: overlayOpacity }}
        className="absolute inset-0 -z-10 bg-gradient-to-b from-coal-900/40 via-coal-900/60 to-coal-900"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(125,222,255,0.20),transparent_60%)]"
      />
      <div aria-hidden className="absolute inset-0 -z-10 noise" />

      {/* HUD coordonnées */}
      <div className="pointer-events-none absolute right-5 top-24 z-10 hidden text-right font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] text-foreground/70 sm:block sm:right-8 sm:top-28">
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

      {/* Contenu */}
      <div className="relative z-0 flex flex-1 flex-col justify-end">
        <div className="mx-auto w-full max-w-7xl px-5 pt-28 pb-10 sm:px-8 sm:pt-36 sm:pb-14 lg:px-12 lg:pt-40">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-6 flex items-center gap-3 sm:mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-foreground/85 sm:text-[11px]">
              Annuaire indépendant · 2026
            </span>
          </motion.div>

          {/* Titre — sizing strict pour ne jamais déborder */}
          <h1
            className="font-display font-medium leading-[0.9] tracking-[-0.02em] text-balance"
            style={{ fontSize: "clamp(2.5rem, 11vw, 8.4rem)" }}
          >
            <span className="block overflow-hidden">
              <motion.span className="block" {...reveal(0.35)}>
                Toute l&apos;escalade
              </motion.span>
            </span>
            <span className="block overflow-hidden">
              <motion.span
                className="block italic text-primary glow-ice-text"
                style={{ fontVariationSettings: '"SOFT" 100' }}
                {...reveal(0.5)}
              >
                française
              </motion.span>
            </span>
            <span className="block overflow-hidden pl-[6vw] sm:pl-[10vw] lg:pl-[14vw]">
              <motion.span className="block text-foreground/85" {...reveal(0.65)}>
                au même endroit.
              </motion.span>
            </span>
          </h1>

          {/* Sous-titre + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.95, duration: 0.7 }}
            className="mt-8 grid grid-cols-1 gap-5 sm:mt-12 sm:grid-cols-12 sm:items-end sm:gap-8"
          >
            <p className="max-w-[42ch] text-sm leading-relaxed text-foreground/85 sm:col-span-7 sm:text-base lg:col-span-6 lg:text-lg">
              <span className="font-mono text-primary tabular-nums">
                {totalSites !== null
                  ? totalSites.toLocaleString("fr-FR")
                  : "3 500"}
              </span>{" "}
              sites naturels, leurs cotations, leurs accès, leurs périodes
              favorables. Plus toutes les salles indoor du pays, qu&apos;on
              répertorie en ce moment.
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:col-span-5 sm:justify-end lg:col-span-6">
              <Link
                href="/sites"
                className="group relative inline-flex h-12 items-center gap-3 overflow-hidden rounded-full bg-primary px-5 text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground transition-transform duration-300 hover:scale-[1.02] active:scale-95 sm:h-14 sm:px-7 sm:text-sm"
              >
                <span className="relative z-10">Explorer la carte</span>
                <span className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-coal-900 text-primary transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
                <span
                  aria-hidden
                  className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full"
                />
              </Link>
              <Link
                href="/salles"
                className="inline-flex h-12 items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-foreground/85 underline-offset-8 transition-colors hover:text-primary hover:underline sm:h-14 sm:text-sm"
              >
                <MapPin className="h-4 w-4" />
                Voir les salles
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Ticker bas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="relative border-t border-white/10 bg-coal-900/80 py-3 backdrop-blur-sm"
        >
          <div className="flex w-full overflow-hidden">
            <div className="flex shrink-0 animate-marquee gap-12 whitespace-nowrap pr-12 font-mono text-[10px] uppercase tracking-[0.28em] text-foreground/75 sm:text-xs">
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

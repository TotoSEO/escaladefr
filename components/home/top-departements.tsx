"use client";

import Link from "next/link";
import { motion, useInView } from "motion/react";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";

type Dep = { departement: string; count: number };

export function TopDepartements({ items }: { items: Dep[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });

  if (items.length === 0) return null;

  const maxCount = Math.max(...items.map((d) => d.count));

  return (
    <section ref={ref} className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mb-10 flex flex-col gap-3 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            Top destinations
          </div>
          <h2 className="mt-2 max-w-2xl font-display text-3xl font-medium leading-tight tracking-tight sm:text-5xl">
            Les départements
            <br className="hidden sm:block" />
            <span className="italic text-muted-foreground"> les plus équipés</span>
          </h2>
        </div>
        <Link
          href="/sites"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:gap-2.5"
        >
          Voir tous les départements
          <ArrowUpRight className="h-4 w-4 transition-transform" />
        </Link>
      </div>

      <ol className="space-y-3 sm:space-y-1">
        {items.map((d, i) => {
          const ratio = d.count / maxCount;
          return (
            <motion.li
              key={d.departement}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : undefined}
              transition={{
                delay: i * 0.05,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Link
                href={`/sites?departement=${encodeURIComponent(d.departement)}`}
                className="group relative block overflow-hidden rounded-lg border border-transparent px-4 py-4 transition-colors hover:border-border hover:bg-card sm:rounded-xl sm:px-6 sm:py-5"
              >
                {/* Barre de progression en fond */}
                <motion.div
                  aria-hidden
                  initial={{ scaleX: 0 }}
                  animate={inView ? { scaleX: ratio } : undefined}
                  transition={{
                    delay: 0.15 + i * 0.05,
                    duration: 0.9,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="absolute inset-y-0 left-0 origin-left bg-primary/[0.08]"
                  style={{ width: "100%" }}
                />

                <div className="relative flex items-center justify-between gap-4">
                  <div className="flex items-baseline gap-3 sm:gap-5">
                    <span className="font-display text-2xl font-medium text-muted-foreground/60 tabular-nums sm:text-3xl">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-xl font-medium sm:text-2xl">
                      {d.departement}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-5">
                    <span className="font-display text-base text-muted-foreground tabular-nums sm:text-lg">
                      {d.count.toLocaleString("fr-FR")} sites
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                </div>
              </Link>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}

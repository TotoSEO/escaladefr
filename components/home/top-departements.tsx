"use client";

import Link from "next/link";
import { motion, useInView } from "motion/react";
import { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";

import { departementHref } from "@/lib/sites";

type Dep = {
  departement: string;
  code_departement: string | null;
  count: number;
};

export function TopDepartements({ items }: { items: Dep[] }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12%" });
  const [hovered, setHovered] = useState<number | null>(null);

  if (items.length === 0) return null;

  const maxCount = Math.max(...items.map((d) => d.count));

  return (
    <section
      ref={ref}
      className="relative overflow-hidden surface-cool text-foreground"
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
      <div
        aria-hidden
        className="absolute -left-32 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-primary/[0.08] blur-[140px]"
      />

      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-36">
        <div className="grid grid-cols-12 gap-y-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.6 }}
            className="col-span-12 flex items-center gap-3 sm:col-span-4 lg:col-span-3"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
              § 02 / Hotspots
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.8, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="col-span-12 font-display text-[10vw] font-medium leading-[0.95] tracking-[-0.02em] sm:col-span-8 sm:text-[5.5vw] lg:col-span-9 lg:text-[4.4vw]"
          >
            Là où{" "}
            <span className="italic text-primary glow-ice-text">ça grimpe</span>{" "}
            le plus.
          </motion.h2>
        </div>

        <ol className="mt-14 sm:mt-20" onMouseLeave={() => setHovered(null)}>
          {items.map((d, i) => {
            const ratio = d.count / maxCount;
            const isHovered = hovered === i;
            return (
              <motion.li
                key={d.departement}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : undefined}
                transition={{
                  delay: 0.15 + i * 0.05,
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onMouseEnter={() => setHovered(i)}
                className="group relative border-t border-white/10 last:border-b"
              >
                <Link
                  href={departementHref(d.code_departement, d.departement)}
                  className="relative grid grid-cols-12 items-baseline gap-3 py-6 sm:gap-6 sm:py-8 lg:py-10"
                >
                  <motion.span
                    aria-hidden
                    initial={{ scaleX: 0 }}
                    animate={
                      inView
                        ? { scaleX: ratio * (isHovered ? 1.05 : 1) }
                        : undefined
                    }
                    transition={{
                      delay: 0.25 + i * 0.05,
                      duration: 1,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    style={{ transformOrigin: "left" }}
                    className={`absolute inset-y-0 left-0 -z-0 ${
                      isHovered ? "bg-primary/15" : "bg-white/[0.04]"
                    } transition-colors duration-300`}
                  />

                  <span className="col-span-2 font-mono text-xs tabular-nums text-muted-foreground sm:text-sm">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <span
                    className={`col-span-8 font-display font-medium leading-none tracking-[-0.02em] transition-transform duration-500 sm:col-span-7 ${
                      isHovered ? "translate-x-2 sm:translate-x-4" : ""
                    } text-[6vw] sm:text-[3.6vw] lg:text-[2.6vw]`}
                  >
                    {d.departement}
                  </span>

                  <span className="col-span-2 flex items-center justify-end gap-3 sm:col-span-3">
                    <span className="hidden font-mono text-xs uppercase tabular-nums tracking-[0.2em] text-muted-foreground sm:inline">
                      {d.count.toLocaleString("fr-FR")} sites
                    </span>
                    <span
                      className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-all duration-300 sm:h-11 sm:w-11 ${
                        isHovered
                          ? "bg-primary text-primary-foreground"
                          : "bg-white/5 text-foreground/70"
                      }`}
                    >
                      <ArrowUpRight
                        className={`h-4 w-4 transition-transform duration-300 ${
                          isHovered ? "rotate-12" : ""
                        }`}
                      />
                    </span>
                  </span>

                  <span className="col-span-12 -mt-2 pl-[16%] font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:hidden">
                    {d.count.toLocaleString("fr-FR")} sites
                  </span>
                </Link>
              </motion.li>
            );
          })}
        </ol>

        <div className="mt-12 flex items-center justify-end sm:mt-16">
          <Link
            href="/sites"
            className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-primary transition-colors hover:text-foreground sm:text-sm"
          >
            Voir toute la carte
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

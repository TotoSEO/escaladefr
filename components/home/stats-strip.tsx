"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { MapPin, Mountain, Compass, Sparkles } from "lucide-react";

type Stat = {
  label: string;
  value: number | null;
  suffix?: string;
  icon: React.ComponentType<{ className?: string }>;
};

function useCountUp(target: number, run: boolean, duration = 1400) {
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? target : 0);
  useEffect(() => {
    if (!run || reduce) {
      if (reduce) setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run, duration, reduce]);
  return value;
}

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const display = useCountUp(stat.value ?? 0, inView && stat.value !== null);
  const Icon = stat.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ delay: index * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="group relative shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40 sm:p-6 [--w:78vw] sm:[--w:auto] w-[var(--w)] sm:w-auto"
    >
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <span>{stat.label}</span>
      </div>
      <div className="mt-3 font-display text-4xl font-semibold tabular-nums sm:text-5xl">
        {stat.value !== null ? display.toLocaleString("fr-FR") : "—"}
        {stat.suffix && (
          <span className="ml-1 text-2xl text-muted-foreground sm:text-3xl">
            {stat.suffix}
          </span>
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-500 group-hover:scale-x-100" />
    </motion.div>
  );
}

export function StatsStrip({
  total,
  avecGps,
  departements,
}: {
  total: number | null;
  avecGps: number | null;
  departements: number | null;
}) {
  const stats: Stat[] = [
    { label: "Sites recensés", value: total, icon: Mountain },
    { label: "Avec GPS précis", value: avecGps, icon: MapPin },
    { label: "Départements", value: departements, icon: Compass, suffix: "+" },
    { label: "Mis à jour", value: 2026, icon: Sparkles },
  ];

  return (
    <section className="relative border-y border-border/60 bg-background/50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

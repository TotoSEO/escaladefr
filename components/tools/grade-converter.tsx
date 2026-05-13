"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";

import {
  ROUTE_GRADES,
  BOULDER_GRADES,
  ROUTE_LEVELS,
  BOULDER_LEVELS,
  type RouteGrade,
  type BoulderGrade,
  type RouteSystem,
  type BoulderSystem,
} from "@/lib/grades";

type Mode = "route" | "boulder";

const ROUTE_DEFAULT = 13; // 7a
const BOULDER_DEFAULT = 11; // 7A

export function GradeConverter() {
  const [mode, setMode] = useState<Mode>("route");
  const [routeIndex, setRouteIndex] = useState(ROUTE_DEFAULT);
  const [boulderIndex, setBoulderIndex] = useState(BOULDER_DEFAULT);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-[#1a1a1a]">
      {/* Toggle Voie / Bloc */}
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-7 sm:py-5">
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] p-1">
          <ModeButton
            active={mode === "route"}
            onClick={() => setMode("route")}
          >
            Voie
          </ModeButton>
          <ModeButton
            active={mode === "boulder"}
            onClick={() => setMode("boulder")}
          >
            Bloc
          </ModeButton>
        </div>
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:inline">
          {mode === "route"
            ? `${ROUTE_GRADES.length} cotations · 5 systèmes`
            : `${BOULDER_GRADES.length} cotations · 2 systèmes`}
        </span>
      </div>

      <div className="p-5 sm:p-7 lg:p-10">
        <AnimatePresence mode="wait">
          {mode === "route" ? (
            <motion.div
              key="route"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <RouteSelector index={routeIndex} onChange={setRouteIndex} />
              <RouteResult grade={ROUTE_GRADES[routeIndex]} />
            </motion.div>
          ) : (
            <motion.div
              key="boulder"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <BoulderSelector
                index={boulderIndex}
                onChange={setBoulderIndex}
              />
              <BoulderResult grade={BOULDER_GRADES[boulderIndex]} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative inline-flex h-9 items-center justify-center rounded-full px-5 font-mono text-[10px] uppercase tracking-[0.22em] transition-colors sm:text-xs ${
        active
          ? "text-coal-900"
          : "text-foreground/70 hover:text-foreground"
      }`}
    >
      {active && (
        <motion.span
          layoutId="mode-bg"
          className="absolute inset-0 rounded-full bg-primary"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <span className="relative">{children}</span>
    </button>
  );
}

/* ───────────────────────────────────────
   VOIE — Sélecteur + résultats
   ─────────────────────────────────────── */

function RouteSelector({
  index,
  onChange,
}: {
  index: number;
  onChange: (i: number) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Choisir une cotation
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {index + 1} / {ROUTE_GRADES.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {ROUTE_GRADES.map((g, i) => {
          const active = i === index;
          return (
            <button
              type="button"
              key={g.fr}
              onClick={() => onChange(i)}
              aria-pressed={active}
              aria-label={`Sélectionner la cotation ${g.fr}`}
              className={`inline-flex h-9 min-w-[2.75rem] items-center justify-center rounded-md border px-2 font-mono text-xs tabular-nums transition-all sm:h-10 sm:min-w-[3rem] sm:text-sm ${
                active
                  ? "border-primary bg-primary text-coal-900 glow-ice"
                  : "border-white/10 bg-white/[0.03] text-foreground/80 hover:border-white/30 hover:bg-white/[0.07] hover:text-foreground"
              }`}
            >
              {g.fr}
            </button>
          );
        })}
      </div>

      <div className="mt-5 sm:mt-6">
        <label
          htmlFor="route-slider"
          className="sr-only"
        >
          Cotation
        </label>
        <input
          id="route-slider"
          type="range"
          min={0}
          max={ROUTE_GRADES.length - 1}
          value={index}
          onChange={(e) => onChange(Number(e.target.value))}
          className="grade-slider w-full"
          aria-label="Sélectionner une cotation"
        />
      </div>
    </div>
  );
}

const ROUTE_OUTPUT_SYSTEMS: RouteSystem[] = ["fr", "uiaa", "yds", "britTech", "britAdj"];

function RouteResult({ grade }: { grade: RouteGrade }) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-5">
      {ROUTE_OUTPUT_SYSTEMS.map((sys) => (
        <ResultCard
          key={sys}
          label={ROUTE_LEVELS[sys].label}
          short={ROUTE_LEVELS[sys].short}
          value={grade[sys as keyof RouteGrade]}
          description={ROUTE_LEVELS[sys].description}
          accent={sys === "fr"}
        />
      ))}
    </div>
  );
}

/* ───────────────────────────────────────
   BLOC — Sélecteur + résultats
   ─────────────────────────────────────── */

function BoulderSelector({
  index,
  onChange,
}: {
  index: number;
  onChange: (i: number) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Choisir une cotation
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {index + 1} / {BOULDER_GRADES.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {BOULDER_GRADES.map((g, i) => {
          const active = i === index;
          return (
            <button
              type="button"
              key={g.font}
              onClick={() => onChange(i)}
              aria-pressed={active}
              aria-label={`Sélectionner la cotation ${g.font}`}
              className={`inline-flex h-9 min-w-[3rem] items-center justify-center rounded-md border px-2 font-mono text-xs tabular-nums transition-all sm:h-10 sm:min-w-[3.25rem] sm:text-sm ${
                active
                  ? "border-primary bg-primary text-coal-900 glow-ice"
                  : "border-white/10 bg-white/[0.03] text-foreground/80 hover:border-white/30 hover:bg-white/[0.07] hover:text-foreground"
              }`}
            >
              {g.font}
            </button>
          );
        })}
      </div>

      <div className="mt-5 sm:mt-6">
        <label htmlFor="boulder-slider" className="sr-only">
          Cotation bloc
        </label>
        <input
          id="boulder-slider"
          type="range"
          min={0}
          max={BOULDER_GRADES.length - 1}
          value={index}
          onChange={(e) => onChange(Number(e.target.value))}
          className="grade-slider w-full"
          aria-label="Sélectionner une cotation de bloc"
        />
      </div>
    </div>
  );
}

const BOULDER_OUTPUT_SYSTEMS: BoulderSystem[] = ["font", "v"];

function BoulderResult({ grade }: { grade: BoulderGrade }) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2">
      {BOULDER_OUTPUT_SYSTEMS.map((sys) => (
        <ResultCard
          key={sys}
          label={BOULDER_LEVELS[sys].label}
          short={BOULDER_LEVELS[sys].short}
          value={grade[sys as keyof BoulderGrade]}
          description={BOULDER_LEVELS[sys].description}
          accent={sys === "font"}
        />
      ))}
    </div>
  );
}

/* ───────────────────────────────────────
   Carte de résultat (commune)
   ─────────────────────────────────────── */

function ResultCard({
  label,
  short,
  value,
  description,
  accent = false,
}: {
  label: string;
  short: string;
  value: string;
  description: string;
  accent?: boolean;
}) {
  return (
    <div className="relative flex flex-col gap-3 bg-[#262626] p-5 transition-colors sm:p-7">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
          {label}
        </span>
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
          {short}
        </span>
      </div>
      <span
        className={`font-display font-medium leading-none tracking-[-0.03em] tabular-nums ${
          accent ? "text-accent" : "text-foreground"
        }`}
        style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
      >
        {value}
      </span>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
        {description}
      </p>
    </div>
  );
}

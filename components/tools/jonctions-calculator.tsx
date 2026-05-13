"use client";

import { useMemo, useState } from "react";

type Result = {
  averagePitch: number;
  fitsRope: boolean;
  longestPossible: number;
  rappelCount: number;
  rappelRopeLength: number;
  warnings: string[];
  notes: string[];
};

const ROPE_OPTIONS = [
  { id: "50s", label: "Simple 50 m", length: 50, mode: "single" as const },
  { id: "60s", label: "Simple 60 m", length: 60, mode: "single" as const },
  { id: "70s", label: "Simple 70 m", length: 70, mode: "single" as const },
  { id: "80s", label: "Simple 80 m", length: 80, mode: "single" as const },
  { id: "50d", label: "Double 2×50 m", length: 50, mode: "double" as const },
  { id: "60d", label: "Double 2×60 m", length: 60, mode: "double" as const },
];

function computeResult(
  totalHeight: number,
  pitches: number,
  rope: (typeof ROPE_OPTIONS)[number],
): Result {
  const averagePitch = totalHeight / pitches;
  const longestPossible = rope.length - 2; // marge nœud + relais

  const fitsRope = averagePitch <= longestPossible;

  // Descente en rappel : on rappelle sur la moitié de la corde si double brin
  // (deux brins joints) ou en doublant un simple plié en deux.
  const rappelLength = rope.mode === "double" ? rope.length - 2 : rope.length / 2 - 1;
  const rappelCount = Math.ceil(totalHeight / rappelLength);

  const warnings: string[] = [];
  const notes: string[] = [];

  if (!fitsRope) {
    warnings.push(
      `Longueur moyenne (${averagePitch.toFixed(0)} m) supérieure à ce que ta corde permet (${longestPossible} m utiles). Soit tu changes de corde, soit tu coupes en plus de longueurs.`,
    );
  }

  if (averagePitch > 35 && rope.mode === "single") {
    notes.push(
      "Longueur moyenne élevée pour une corde simple : prévois marge pour le tirage et les manœuvres au relais.",
    );
  }

  if (rappelCount > 5) {
    notes.push(
      `Descente en ${rappelCount} rappels. Compte au moins ${(rappelCount * 6).toFixed(0)}-${(rappelCount * 10).toFixed(0)} min de manœuvres rien que pour les rappels, hors gestion des cordes.`,
    );
  }

  if (rope.mode === "single" && totalHeight > 40) {
    notes.push(
      "Avec corde simple uniquement, prévois une corde de rappel additionnelle (corde de rappel statique 50-70 m, légère) pour descendre.",
    );
  }

  if (averagePitch < 15) {
    notes.push(
      "Longueurs courtes : les relais s'enchaînent vite, anticipe les manœuvres pour ne pas perdre de temps.",
    );
  }

  if (rope.mode === "double") {
    notes.push(
      "Configuration en double brin : 2 brins permettent de protéger les voies en zigzag et de réduire le tirage sur grande voie.",
    );
  }

  return {
    averagePitch,
    fitsRope,
    longestPossible,
    rappelCount,
    rappelRopeLength: rappelLength,
    warnings,
    notes,
  };
}

export function JonctionsCalculator() {
  const [totalHeight, setTotalHeight] = useState<number>(200);
  const [pitches, setPitches] = useState<number>(6);
  const [ropeId, setRopeId] = useState<string>("60d");

  const rope = ROPE_OPTIONS.find((r) => r.id === ropeId) ?? ROPE_OPTIONS[0];
  const result = useMemo(
    () => computeResult(totalHeight, pitches, rope),
    [totalHeight, pitches, rope],
  );

  return (
    <div className="rounded-3xl border border-white/10 bg-coal-900/80 p-5 shadow-2xl sm:p-8 lg:p-10">
      {/* Inputs */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
        <div>
          <label
            htmlFor="height"
            className="block font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground"
          >
            Hauteur totale
          </label>
          <div className="mt-2 flex items-baseline gap-2">
            <input
              id="height"
              type="number"
              inputMode="numeric"
              value={totalHeight}
              min={1}
              max={2000}
              onChange={(e) =>
                setTotalHeight(Math.max(1, Math.min(2000, Number(e.target.value) || 0)))
              }
              className="w-full appearance-none border-b border-white/15 bg-transparent pb-2 font-display text-4xl font-medium tabular-nums tracking-[-0.02em] text-foreground outline-none transition-colors focus:border-primary sm:text-5xl"
            />
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
              m
            </span>
          </div>
        </div>

        <div>
          <label
            htmlFor="pitches"
            className="block font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground"
          >
            Longueurs (relais)
          </label>
          <div className="mt-2 flex items-baseline gap-2">
            <input
              id="pitches"
              type="number"
              inputMode="numeric"
              value={pitches}
              min={1}
              max={40}
              onChange={(e) =>
                setPitches(Math.max(1, Math.min(40, Number(e.target.value) || 1)))
              }
              className="w-full appearance-none border-b border-white/15 bg-transparent pb-2 font-display text-4xl font-medium tabular-nums tracking-[-0.02em] text-foreground outline-none transition-colors focus:border-primary sm:text-5xl"
            />
            <span className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
              L
            </span>
          </div>
        </div>

        <div>
          <label
            htmlFor="rope"
            className="block font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground"
          >
            Corde
          </label>
          <select
            id="rope"
            value={ropeId}
            onChange={(e) => setRopeId(e.target.value)}
            className="mt-2 w-full appearance-none border-b border-white/15 bg-transparent pb-2 font-display text-2xl font-medium tracking-[-0.02em] text-foreground outline-none transition-colors focus:border-primary sm:text-3xl"
          >
            {ROPE_OPTIONS.map((r) => (
              <option key={r.id} value={r.id} className="bg-coal-900 text-foreground">
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Résultats */}
      <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <ResultCard
          label="Longueur moyenne"
          value={`${result.averagePitch.toFixed(1)} m`}
          accent={result.fitsRope ? "primary" : "warn"}
          sub={
            result.fitsRope
              ? `≤ ${result.longestPossible} m utiles ✓`
              : `> ${result.longestPossible} m utiles ✗`
          }
        />
        <ResultCard
          label="Rappels descente"
          value={`${result.rappelCount}`}
          accent="accent"
          sub={`${result.rappelRopeLength.toFixed(0)} m par rappel`}
        />
        <ResultCard
          label="Configuration"
          value={rope.mode === "double" ? "Double brin" : "Simple"}
          accent="default"
          sub={rope.mode === "double" ? "Sécurise les zigzags" : "Léger et rapide"}
        />
      </div>

      {/* Avertissements + notes */}
      {(result.warnings.length > 0 || result.notes.length > 0) && (
        <div className="mt-8 space-y-3">
          {result.warnings.map((w, i) => (
            <div
              key={`w-${i}`}
              className="rounded-2xl border border-red-500/40 bg-red-500/[0.08] px-5 py-4 text-sm leading-relaxed text-red-100 sm:text-base"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-red-400">
                Attention
              </span>
              <p className="mt-1.5">{w}</p>
            </div>
          ))}
          {result.notes.map((n, i) => (
            <div
              key={`n-${i}`}
              className="rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-4 text-sm leading-relaxed text-muted-foreground sm:text-base"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                À noter
              </span>
              <p className="mt-1.5">{n}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResultCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: "primary" | "accent" | "warn" | "default";
}) {
  const colorClass =
    accent === "primary"
      ? "text-primary"
      : accent === "accent"
      ? "text-accent"
      : accent === "warn"
      ? "text-red-400"
      : "text-foreground";
  return (
    <div className="rounded-2xl border border-white/10 bg-coal-900 px-5 py-5 sm:px-6 sm:py-6">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </span>
      <p
        className={`mt-2 font-display font-medium leading-none tracking-[-0.025em] ${colorClass}`}
        style={{ fontSize: "clamp(1.85rem, 4.5vw, 3rem)" }}
      >
        {value}
      </p>
      <p className="mt-2 text-xs text-muted-foreground sm:text-sm">{sub}</p>
    </div>
  );
}

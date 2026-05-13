"use client";

import { useEffect, useMemo, useState } from "react";

import {
  buildDays,
  evaluateHour,
  fetchForecast,
  frHour,
  frTime,
  orientationHint,
  type DayBucket,
  type HourEvaluation,
  type OpenMeteoResponse,
  type Verdict,
} from "@/lib/meteo";

type SiteIndexItem = {
  id: number;
  nom: string;
  commune: string | null;
  departement: string | null;
  latitude: number;
  longitude: number;
  orientation: string | null;
};

type Props = {
  sites: SiteIndexItem[];
};

const VERDICT_LABEL: Record<Verdict, string> = {
  good: "Idéal",
  ok: "Correct",
  bad: "À éviter",
  night: "Nuit",
};

const VERDICT_COLOR: Record<Verdict, string> = {
  good: "bg-primary text-primary-foreground",
  ok: "bg-accent/85 text-accent-foreground",
  bad: "bg-red-600/85 text-white",
  night: "bg-white/[0.04] text-muted-foreground",
};

function fold(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function MeteoSiteChecker({ sites }: Props) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<SiteIndexItem | null>(null);
  const [forecast, setForecast] = useState<OpenMeteoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const candidates = useMemo(() => {
    const q = fold(query.trim());
    if (q.length < 2) return [];
    return sites
      .filter((s) => {
        const hay = fold(`${s.nom} ${s.commune ?? ""} ${s.departement ?? ""}`);
        return hay.includes(q);
      })
      .slice(0, 8);
  }, [query, sites]);

  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setForecast(null);
    fetchForecast(selected.latitude, selected.longitude)
      .then((data) => {
        if (!cancelled) setForecast(data);
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Erreur Open-Meteo");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selected]);

  const days: DayBucket[] = useMemo(
    () => (forecast ? buildDays(forecast) : []),
    [forecast],
  );

  const orientationText = selected ? orientationHint(selected.orientation) : null;

  return (
    <div className="space-y-8">
      {/* Recherche */}
      <div className="rounded-3xl border border-white/10 bg-coal-900/80 p-5 shadow-2xl sm:p-8">
        <label
          htmlFor="meteo-search"
          className="block font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground"
        >
          Site d&apos;escalade
        </label>
        <input
          id="meteo-search"
          type="search"
          value={query}
          autoComplete="off"
          placeholder="Verdon, Saffres, Buoux, Saussois…"
          onChange={(e) => {
            setQuery(e.target.value);
            if (selected) setSelected(null);
          }}
          className="mt-2 w-full appearance-none border-b border-white/15 bg-transparent pb-2 font-display text-2xl font-medium tracking-[-0.02em] text-foreground outline-none transition-colors placeholder:text-foreground/30 focus:border-primary sm:text-3xl"
        />

        {candidates.length > 0 && !selected && (
          <ul className="mt-4 max-h-72 divide-y divide-white/10 overflow-y-auto rounded-2xl border border-white/10 bg-coal-900">
            {candidates.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(s);
                    setQuery(s.nom);
                  }}
                  className="flex w-full items-baseline justify-between gap-4 px-5 py-3 text-left transition-colors hover:bg-white/[0.04]"
                >
                  <span className="flex flex-col gap-0.5">
                    <span className="font-display text-base font-medium tracking-[-0.01em] sm:text-lg">
                      {s.nom}
                    </span>
                    {(s.commune || s.departement) && (
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                        {[s.commune, s.departement].filter(Boolean).join(" · ")}
                      </span>
                    )}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                    Choisir
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {query.length >= 2 && candidates.length === 0 && !selected && (
          <p className="mt-4 text-sm text-muted-foreground">
            Aucun site trouvé pour <span className="text-foreground">{query}</span>. Essaie un nom partiel ou un département.
          </p>
        )}
      </div>

      {/* État chargement / erreur */}
      {selected && (
        <div className="rounded-3xl border border-white/10 bg-coal-900/80 p-5 shadow-2xl sm:p-8">
          <header className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between sm:pb-6">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                Site sélectionné
              </span>
              <h2
                className="mt-2 font-display font-medium leading-[0.96] tracking-[-0.025em]"
                style={{ fontSize: "clamp(1.7rem, 4.2vw, 2.6rem)" }}
              >
                {selected.nom}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                {[selected.commune, selected.departement].filter(Boolean).join(" · ")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setForecast(null);
              }}
              className="inline-flex h-10 items-center gap-2 self-start rounded-full border border-white/15 px-4 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:border-primary hover:text-primary sm:self-auto"
            >
              Changer de site
            </button>
          </header>

          {orientationText && (
            <p className="mt-5 max-w-3xl rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                Orientation
              </span>
              <span className="mt-1 block">{orientationText}</span>
            </p>
          )}

          {loading && (
            <p className="mt-6 text-sm text-muted-foreground">Chargement du bulletin Open-Meteo…</p>
          )}
          {error && (
            <p className="mt-6 text-sm text-red-400">Erreur : {error}</p>
          )}

          {!loading && !error && days.length > 0 && (
            <div className="mt-8 space-y-6">
              {days.map((day) => (
                <DayRow key={day.dayIso} day={day} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Légende */}
      {selected && days.length > 0 && (
        <div className="space-y-4 rounded-2xl border border-white/10 bg-coal-900/60 p-5 sm:p-6">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Comment lire chaque case
            </span>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                <span className="text-foreground">Couleur de la case</span> = verdict grimpabilité. <span className="text-primary">Bleu</span> = idéal, <span className="text-accent">orange</span> = correct, <span className="text-red-400">rouge</span> = à éviter, gris = nuit.
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                <span className="text-foreground">Chiffre central</span> = température en °C. <span className="text-foreground">☁ %</span> = couverture nuageuse. <span className="text-foreground">💧 mm</span> = pluie attendue cette heure-là (absent si zéro).
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Verdicts
            </span>
            <LegendChip verdict="good" />
            <LegendChip verdict="ok" />
            <LegendChip verdict="bad" />
            <LegendChip verdict="night" />
          </div>
        </div>
      )}
    </div>
  );
}

function LegendChip({ verdict }: { verdict: Verdict }) {
  return (
    <span
      className={`inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 font-mono text-[9px] uppercase tracking-[0.18em] ${VERDICT_COLOR[verdict]}`}
    >
      {VERDICT_LABEL[verdict]}
    </span>
  );
}

function DayRow({ day }: { day: DayBucket }) {
  const dayHours = day.hours.filter((h) => h.verdict !== "night");
  const visibleHours = dayHours.length > 0 ? dayHours : day.hours;
  const goodInWindow = day.bestWindow?.verdict === "good";

  return (
    <article className="rounded-2xl border border-white/10 bg-coal-900 p-5 sm:p-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="font-display text-xl font-medium tracking-[-0.02em] sm:text-2xl">
            {day.dateLabel}
          </h3>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {day.tempMin.toFixed(0)}° → {day.tempMax.toFixed(0)}°
            <span className="mx-2 text-white/15">·</span>
            <span>💧 {day.precipSum.toFixed(1)} mm</span>
            <span className="mx-2 text-white/15">·</span>
            <span>☀ {frTime(day.sunrise)} – {frTime(day.sunset)}</span>
          </p>
        </div>
        {day.bestWindow && (
          <p
            className={`font-mono text-[11px] uppercase tracking-[0.22em] ${
              goodInWindow ? "text-primary" : "text-accent"
            }`}
          >
            {goodInWindow ? "Meilleur créneau · " : "Créneau correct · "}
            {frHour(day.bestWindow.start)} – {frHour(new Date(day.bestWindow.end.getTime() + 3600 * 1000))}
          </p>
        )}
      </header>

      <div className="mt-5 overflow-x-auto">
        <div className="flex min-w-[680px] gap-1">
          {visibleHours.map((h) => (
            <HourCell key={h.iso} h={h} />
          ))}
        </div>
      </div>
    </article>
  );
}

const VERDICT_DOT: Record<Verdict, string> = {
  good: "✓",
  ok: "~",
  bad: "✕",
  night: "·",
};

function HourCell({ h }: { h: HourEvaluation }) {
  const colorClass = VERDICT_COLOR[h.verdict];
  return (
    <div
      className={`group relative flex w-[68px] shrink-0 flex-col gap-0.5 rounded-lg px-2 py-2 transition-transform hover:-translate-y-0.5 sm:w-[78px]`}
      title={`${frHour(h.date)} · ${h.temp.toFixed(0)}°C · ${h.reason}`}
    >
      <div className={`absolute inset-0 rounded-lg ${colorClass}`} aria-hidden />
      <div className="relative flex w-full items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em]">
        <span>{frHour(h.date)}</span>
        <span className="opacity-80">{VERDICT_DOT[h.verdict]}</span>
      </div>
      <span className="relative text-center font-display text-xl font-medium tabular-nums leading-none sm:text-2xl">
        {h.temp.toFixed(0)}°
      </span>
      <div className="relative flex w-full items-center justify-between font-mono text-[9px] tabular-nums">
        <span className="opacity-90">☁{h.cloud.toFixed(0)}</span>
        {h.precip > 0 ? (
          <span className="font-semibold">💧{h.precip.toFixed(1)}</span>
        ) : (
          <span className="opacity-40">—</span>
        )}
      </div>
    </div>
  );
}

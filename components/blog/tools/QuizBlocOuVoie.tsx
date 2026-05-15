"use client";

import { useState } from "react";
import Link from "next/link";

type Choice = { label: string; bloc: number; voie: number };
type Question = { q: string; choices: Choice[] };

const QUESTIONS: Question[] = [
  {
    q: "Tu débarques en salle. Combien de temps tu peux y passer d'affilée ?",
    choices: [
      { label: "Une heure, je suis pris le reste de la journée", bloc: 2, voie: 0 },
      { label: "Deux à trois heures, plusieurs fois par semaine", bloc: 0, voie: 2 },
      { label: "Variable selon les jours", bloc: 1, voie: 1 },
    ],
  },
  {
    q: "Tu as un partenaire de pratique stable et dispo ?",
    choices: [
      { label: "Non, je viens seul", bloc: 2, voie: 0 },
      { label: "Oui, on grimpe ensemble", bloc: 0, voie: 2 },
      { label: "Je trouve sur place ou par hasard", bloc: 1, voie: 1 },
    ],
  },
  {
    q: "Tu préfères les efforts courts et intenses ou longs et continus ?",
    choices: [
      { label: "Courts, explosifs, en mode résolution de problème", bloc: 2, voie: 0 },
      { label: "Longs, en endurance, avec un rythme à tenir", bloc: 0, voie: 2 },
      { label: "Les deux", bloc: 1, voie: 1 },
    ],
  },
  {
    q: "La hauteur, c'est plutôt comment chez toi ?",
    choices: [
      { label: "Pas fan, je préfère rester proche du sol", bloc: 2, voie: 0 },
      { label: "Plutôt à l'aise, ça ne me bloque pas", bloc: 0, voie: 2 },
      { label: "Je verrai bien, ça dépend du jour", bloc: 1, voie: 1 },
    ],
  },
  {
    q: "Ton objectif à 12 mois ?",
    choices: [
      { label: "Progresser sans contrainte de matériel ou de partenaire", bloc: 2, voie: 0 },
      { label: "Aller en falaise avec un partenaire de cordée", bloc: 0, voie: 2 },
      { label: "Découvrir, sans objectif précis", bloc: 1, voie: 1 },
    ],
  },
];

export function QuizBlocOuVoie() {
  const [answers, setAnswers] = useState<(number | null)[]>(QUESTIONS.map(() => null));
  const [submitted, setSubmitted] = useState(false);

  const done = answers.every((a) => a !== null);
  const bloc = answers.reduce(
    (s, a, i) => s + (a !== null ? QUESTIONS[i].choices[a].bloc : 0),
    0,
  );
  const voie = answers.reduce(
    (s, a, i) => s + (a !== null ? QUESTIONS[i].choices[a].voie : 0),
    0,
  );
  const total = bloc + voie || 1;
  const blocPct = Math.round((bloc / total) * 100);
  const voiePct = 100 - blocPct;
  const reco =
    bloc - voie >= 3
      ? "bloc"
      : voie - bloc >= 3
        ? "voie"
        : "mixte";

  function reset() {
    setAnswers(QUESTIONS.map(() => null));
    setSubmitted(false);
  }

  return (
    <aside className="mt-12 overflow-hidden rounded-3xl border border-primary/30 bg-coal-900/80">
      <header className="border-b border-white/10 px-6 py-5 sm:px-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">
          Outil · Quiz interactif
        </p>
        <h3
          className="mt-2 font-display font-medium tracking-[-0.01em] text-foreground"
          style={{ fontSize: "clamp(1.2rem, 2.6vw, 1.7rem)" }}
        >
          Bloc ou voie pour démarrer ?
        </h3>
        <p className="mt-2 text-sm text-foreground/70">
          Cinq questions pour identifier la discipline qui colle à ton mode de
          vie et à ton profil.
        </p>
      </header>

      {!submitted ? (
        <div className="space-y-7 px-6 py-7 sm:px-8 sm:py-8">
          {QUESTIONS.map((q, qi) => (
            <fieldset key={qi}>
              <legend className="text-sm font-semibold leading-relaxed text-foreground sm:text-[15px]">
                <span className="mr-2 font-mono text-xs tabular-nums text-primary">
                  {String(qi + 1).padStart(2, "0")}
                </span>
                {q.q}
              </legend>
              <div className="mt-3 space-y-2">
                {q.choices.map((c, ci) => {
                  const selected = answers[qi] === ci;
                  return (
                    <button
                      key={ci}
                      type="button"
                      onClick={() => {
                        const next = [...answers];
                        next[qi] = ci;
                        setAnswers(next);
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors sm:text-[15px] ${
                        selected
                          ? "border-primary bg-primary/15 text-foreground"
                          : "border-white/10 bg-coal-900/40 text-foreground/80 hover:border-primary/50 hover:bg-coal-900/70"
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                          selected ? "border-primary bg-primary" : "border-white/30"
                        }`}
                      >
                        {selected && (
                          <span className="h-1.5 w-1.5 rounded-full bg-coal-900" />
                        )}
                      </span>
                      <span>{c.label}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <p className="text-xs text-foreground/60">
              {answers.filter((a) => a !== null).length} / {QUESTIONS.length}{" "}
              question{QUESTIONS.length > 1 ? "s" : ""} répondue
              {QUESTIONS.length > 1 ? "s" : ""}
            </p>
            <button
              type="button"
              disabled={!done}
              onClick={() => setSubmitted(true)}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
            >
              Voir ma reco
            </button>
          </div>
        </div>
      ) : (
        <div className="px-6 py-8 sm:px-8 sm:py-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">
            Ton profil
          </p>
          <h4
            className="mt-2 font-display font-medium tracking-[-0.01em] text-foreground"
            style={{ fontSize: "clamp(1.3rem, 3vw, 1.9rem)" }}
          >
            {reco === "bloc" && "Le bloc d'abord."}
            {reco === "voie" && "La voie d'abord."}
            {reco === "mixte" && "Bloc et voie, en parallèle."}
          </h4>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-2xl border border-white/10 bg-coal-900/60 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                Affinité bloc
              </p>
              <p
                className="mt-2 font-display tabular-nums"
                style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)" }}
              >
                {blocPct}%
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${blocPct}%` }}
                />
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-coal-900/60 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                Affinité voie
              </p>
              <p
                className="mt-2 font-display tabular-nums"
                style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)" }}
              >
                {voiePct}%
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${voiePct}%` }}
                />
              </div>
            </div>
          </div>

          <p className="mt-6 text-sm leading-relaxed text-foreground/85 sm:text-[15px]">
            {reco === "bloc" &&
              "Tu cherches une activité accessible, sans partenaire obligatoire, sur des efforts courts. Commence par une à deux séances de bloc en salle, prends une paire de chaussons, et tu progresseras rapidement."}
            {reco === "voie" &&
              "Tu as un partenaire stable et tu cherches l'endurance plus que la puissance. Passe le test d'assurage de ta salle ou réserve un cours d'initiation. La voie t'ouvrira ensuite l'univers de la falaise."}
            {reco === "mixte" &&
              "Ton profil colle aux deux disciplines. Beaucoup de grimpeurs alternent bloc en semaine (court, intense) et voie le week-end (endurant, social). Essaie une séance de chaque avant de trancher."}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {(reco === "bloc" || reco === "mixte") && (
              <Link
                href="/blog/bloc-techniques-base"
                className="rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
              >
                → Les techniques de base du bloc
              </Link>
            )}
            {(reco === "voie" || reco === "mixte") && (
              <Link
                href="/blog/grimper-en-moulinette"
                className="rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
              >
                → Grimper en moulinette pour démarrer la voie
              </Link>
            )}
            <Link
              href="/blog/premiere-fois-salle-escalade"
              className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:border-white/30"
            >
              → Première séance en salle
            </Link>
          </div>

          <button
            type="button"
            onClick={reset}
            className="mt-6 text-xs uppercase tracking-[0.22em] text-foreground/60 underline-offset-2 hover:text-foreground hover:underline"
          >
            Refaire le quiz
          </button>
        </div>
      )}
    </aside>
  );
}

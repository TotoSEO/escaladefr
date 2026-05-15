"use client";

import { useState } from "react";

export function CalculateurFacteurChute() {
  const [hauteurGrimpeur, setHauteurGrimpeur] = useState(8); // m au-dessus du sol
  const [derniereDegaine, setDerniereDegaine] = useState(6); // m au-dessus du sol

  const distance = Math.max(0, hauteurGrimpeur - derniereDegaine);
  const chute = distance * 2; // chute = 2× distance au-dessus du dernier point
  const cordeEmise = hauteurGrimpeur; // approximation : longueur corde émise = hauteur grimpeur
  const facteur = cordeEmise > 0 ? chute / cordeEmise : 0;

  let niveau: "ok" | "moyen" | "danger";
  let couleur: string;
  let label: string;
  let commentaire: string;

  if (facteur < 0.5) {
    niveau = "ok";
    couleur = "text-emerald-300";
    label = "Chute faible";
    commentaire =
      "Cette chute est gérable par un assurage classique. Le grimpeur ressent un coup modéré, la corde absorbe correctement l'énergie.";
  } else if (facteur < 1) {
    niveau = "moyen";
    couleur = "text-amber-300";
    label = "Chute sérieuse";
    commentaire =
      "Le grimpeur va prendre un vol significatif. L'assureur doit être attentif et prêt à dynamiser. La corde encaisse beaucoup d'énergie.";
  } else {
    niveau = "danger";
    couleur = "text-red-300";
    label = "Chute dangereuse (facteur > 1)";
    commentaire =
      "Force de choc très élevée, proche du facteur 2 théorique. Risque de blessure et de défaillance matérielle. Évite cette configuration en clippant plus tôt.";
  }

  return (
    <aside className="mt-12 overflow-hidden rounded-3xl border border-accent/30 bg-coal-900/80">
      <header className="border-b border-white/10 px-6 py-5 sm:px-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
          Outil · Calculateur
        </p>
        <h3
          className="mt-2 font-display font-medium tracking-[-0.01em] text-foreground"
          style={{ fontSize: "clamp(1.2rem, 2.6vw, 1.7rem)" }}
        >
          Facteur de chute en tête
        </h3>
        <p className="mt-2 text-sm text-foreground/70">
          Le facteur de chute mesure la sévérité d'un vol. Calculé en
          divisant la hauteur de chute par la longueur de corde émise. Au-delà
          de 1, c'est une zone à éviter absolument.
        </p>
      </header>

      <div className="space-y-6 px-6 py-7 sm:px-8 sm:py-8">
        <div>
          <div className="flex items-baseline justify-between">
            <label
              htmlFor="hauteur"
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/70"
            >
              Hauteur du grimpeur
            </label>
            <span className="font-display tabular-nums text-foreground">
              {hauteurGrimpeur} m
            </span>
          </div>
          <input
            id="hauteur"
            type="range"
            min={1}
            max={30}
            step={0.5}
            value={hauteurGrimpeur}
            onChange={(e) => {
              const v = Number(e.target.value);
              setHauteurGrimpeur(v);
              if (derniereDegaine > v) setDerniereDegaine(v);
            }}
            className="mt-2 w-full accent-accent"
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label
              htmlFor="degaine"
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/70"
            >
              Dernière dégaine clippée
            </label>
            <span className="font-display tabular-nums text-foreground">
              {derniereDegaine} m
            </span>
          </div>
          <input
            id="degaine"
            type="range"
            min={0}
            max={hauteurGrimpeur}
            step={0.5}
            value={derniereDegaine}
            onChange={(e) => setDerniereDegaine(Number(e.target.value))}
            className="mt-2 w-full accent-accent"
          />
          <p className="mt-1 text-xs text-foreground/60">
            Distance au-dessus de la dernière dégaine :{" "}
            <strong className="text-foreground/85">{distance.toFixed(1)} m</strong>
            {" · "}
            chute théorique : <strong className="text-foreground/85">{chute.toFixed(1)} m</strong>
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-coal-900/60 p-5 sm:p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/70">
            Facteur de chute
          </p>
          <div className="mt-1 flex items-baseline gap-4">
            <p
              className={`font-display tabular-nums ${couleur}`}
              style={{ fontSize: "clamp(2.5rem, 6vw, 4rem)" }}
            >
              {facteur.toFixed(2)}
            </p>
            <p className={`font-mono text-xs uppercase tracking-[0.22em] ${couleur}`}>
              {label}
            </p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full transition-all ${
                niveau === "ok"
                  ? "bg-emerald-400"
                  : niveau === "moyen"
                    ? "bg-amber-400"
                    : "bg-red-400"
              }`}
              style={{ width: `${Math.min(100, facteur * 50)}%` }}
            />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-foreground/85 sm:text-[15px]">
            {commentaire}
          </p>
        </div>

        <details className="rounded-xl border border-white/10 bg-coal-900/40 px-4 py-3 text-sm">
          <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/70">
            Comment se lit le facteur de chute
          </summary>
          <ul className="mt-3 space-y-2 text-foreground/80">
            <li>
              <strong className="text-emerald-300">Facteur &lt; 0.5</strong> :
              chute amortie, gérable.
            </li>
            <li>
              <strong className="text-amber-300">Facteur 0.5 à 1</strong> :
              chute sérieuse, dynamisation conseillée par l'assureur.
            </li>
            <li>
              <strong className="text-red-300">Facteur &gt; 1</strong> : zone
              dangereuse. Risque de blessure dorsale et de défaillance matériel.
            </li>
            <li>
              <strong>Facteur 2</strong> : maximum théorique (chute sans
              dégaine clippée). Quasi inatteignable en escalade sportive
              moderne grâce à la première dégaine basse.
            </li>
          </ul>
        </details>
      </div>
    </aside>
  );
}

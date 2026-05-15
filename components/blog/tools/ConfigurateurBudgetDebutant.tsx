"use client";

import { useState } from "react";
import Link from "next/link";

type Pratique = "bloc" | "voie" | "mixte";
type Frequence = "decouverte" | "regulier" | "intensif";
type Profil = "economique" | "confort" | "haut-de-gamme";

type Item = {
  label: string;
  blogSlug?: string;
  prix: Record<Profil, number>;
  /** Inclus dans cette combinaison de pratique seulement */
  pratiques: Pratique[];
  obligatoire?: boolean;
};

const ITEMS: Item[] = [
  {
    label: "Chaussons",
    blogSlug: "choisir-chaussons-escalade",
    prix: { economique: 70, confort: 110, "haut-de-gamme": 165 },
    pratiques: ["bloc", "voie", "mixte"],
    obligatoire: true,
  },
  {
    label: "Sac de magnésie + magnésie",
    blogSlug: "magnesie-marquage-rocher",
    prix: { economique: 15, confort: 25, "haut-de-gamme": 35 },
    pratiques: ["bloc", "voie", "mixte"],
  },
  {
    label: "Baudrier",
    blogSlug: "choisir-baudrier-escalade",
    prix: { economique: 55, confort: 85, "haut-de-gamme": 130 },
    pratiques: ["voie", "mixte"],
  },
  {
    label: "Système d'assurage",
    blogSlug: "systeme-assurage-comparatif",
    prix: { economique: 35, confort: 95, "haut-de-gamme": 120 },
    pratiques: ["voie", "mixte"],
  },
  {
    label: "Casque (falaise)",
    blogSlug: "casque-escalade-utilite-modeles",
    prix: { economique: 50, confort: 75, "haut-de-gamme": 110 },
    pratiques: ["voie", "mixte"],
  },
];

const PROFIL_LABEL: Record<Profil, string> = {
  economique: "Économique",
  confort: "Confort",
  "haut-de-gamme": "Haut de gamme",
};

const PRATIQUE_LABEL: Record<Pratique, string> = {
  bloc: "Bloc seul",
  voie: "Voie seule",
  mixte: "Bloc + voie",
};

const FREQ_LABEL: Record<Frequence, string> = {
  decouverte: "1 séance par semaine",
  regulier: "2 à 3 séances par semaine",
  intensif: "4 séances et +",
};

const FREQ_MULTIPLIER: Record<Frequence, number> = {
  decouverte: 0.6,
  regulier: 1,
  intensif: 1.4,
};

export function ConfigurateurBudgetDebutant() {
  const [pratique, setPratique] = useState<Pratique>("mixte");
  const [frequence, setFrequence] = useState<Frequence>("regulier");
  const [profil, setProfil] = useState<Profil>("confort");

  const selectedItems = ITEMS.filter((it) => it.pratiques.includes(pratique));
  const subtotal = selectedItems.reduce((s, it) => s + it.prix[profil], 0);
  const recommended = Math.round(subtotal * FREQ_MULTIPLIER[frequence]);

  const sessionsParSemaine =
    frequence === "decouverte" ? 1 : frequence === "regulier" ? 2.5 : 4;
  const sessionsParAn = sessionsParSemaine * 45;
  const locationParAn = sessionsParAn * 8; // 8€ moyen par session location

  return (
    <aside className="mt-12 overflow-hidden rounded-3xl border border-primary/30 bg-coal-900/80">
      <header className="border-b border-white/10 px-6 py-5 sm:px-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">
          Outil · Configurateur
        </p>
        <h3
          className="mt-2 font-display font-medium tracking-[-0.01em] text-foreground"
          style={{ fontSize: "clamp(1.2rem, 2.6vw, 1.7rem)" }}
        >
          Budget matériel débutant
        </h3>
        <p className="mt-2 text-sm text-foreground/70">
          Trois choix, et tu obtiens une estimation chiffrée de ce qu'il te
          faut investir dans ta première saison de pratique.
        </p>
      </header>

      <div className="space-y-7 px-6 py-7 sm:px-8 sm:py-8">
        <ChoiceGroup
          label="Quelle pratique ?"
          value={pratique}
          options={["bloc", "voie", "mixte"] as Pratique[]}
          renderLabel={(v) => PRATIQUE_LABEL[v as Pratique]}
          onChange={(v) => setPratique(v as Pratique)}
        />
        <ChoiceGroup
          label="Quelle fréquence ?"
          value={frequence}
          options={["decouverte", "regulier", "intensif"] as Frequence[]}
          renderLabel={(v) => FREQ_LABEL[v as Frequence]}
          onChange={(v) => setFrequence(v as Frequence)}
        />
        <ChoiceGroup
          label="Quel niveau de gamme ?"
          value={profil}
          options={["economique", "confort", "haut-de-gamme"] as Profil[]}
          renderLabel={(v) => PROFIL_LABEL[v as Profil]}
          onChange={(v) => setProfil(v as Profil)}
        />

        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 sm:p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
            Estimation pour {PRATIQUE_LABEL[pratique].toLowerCase()},{" "}
            {FREQ_LABEL[frequence]}, gamme {PROFIL_LABEL[profil].toLowerCase()}
          </p>
          <div className="mt-3 flex flex-wrap items-baseline gap-3">
            <p
              className="font-display tabular-nums text-foreground"
              style={{ fontSize: "clamp(2.4rem, 6vw, 3.6rem)" }}
            >
              {recommended} €
            </p>
            <p className="text-sm text-foreground/70">
              hors entrées de salle
            </p>
          </div>
          <p className="mt-3 text-sm text-foreground/85">
            Coût matériel amorti sur une saison contre{" "}
            <strong className="text-foreground">~{Math.round(locationParAn)} €</strong>{" "}
            de location à 8 € par session sur ~{Math.round(sessionsParAn)} séances/an.
          </p>
        </div>

        <div>
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/70">
            Détail du panier
          </p>
          <ul className="space-y-2">
            {selectedItems.map((it) => (
              <li
                key={it.label}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-coal-900/40 px-4 py-3"
              >
                <div className="min-w-0">
                  {it.blogSlug ? (
                    <Link
                      href={`/blog/${it.blogSlug}`}
                      className="text-sm font-medium text-primary underline decoration-primary/40 underline-offset-[3px] hover:decoration-primary"
                    >
                      {it.label}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium text-foreground">
                      {it.label}
                    </span>
                  )}
                </div>
                <span className="font-mono tabular-nums text-sm text-foreground/85">
                  {it.prix[profil]} €
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-right font-mono text-xs text-foreground/60">
            Sous-total matériel : <span className="text-foreground">{subtotal} €</span>{" "}
            × coefficient fréquence {FREQ_MULTIPLIER[frequence]} = {recommended} €
          </p>
        </div>

        <details className="rounded-xl border border-white/10 bg-coal-900/40 px-4 py-3 text-sm">
          <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-[0.22em] text-foreground/70">
            Logique du calcul
          </summary>
          <div className="mt-3 space-y-2 text-foreground/80">
            <p>
              Le panier liste les items obligatoires selon ta pratique. Le bloc
              ne demande pas de baudrier ni de système d'assurage, la voie en
              ajoute. Le casque est utile dès la première sortie en falaise.
            </p>
            <p>
              Le coefficient fréquence pondère le montant final pour anticiper
              le renouvellement matériel : à 4 séances/semaine, les chaussons
              s'usent en 6 mois et il faut prévoir un budget consommables.
            </p>
            <p>
              Les prix sont des médianes constatées en 2026 chez les distributeurs
              spécialisés (Decathlon, Au Vieux Campeur, Snowleader). Tu trouveras
              des modèles spécifiques dans chaque article lié.
            </p>
          </div>
        </details>
      </div>
    </aside>
  );
}

function ChoiceGroup({
  label,
  value,
  options,
  renderLabel,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  renderLabel: (v: string) => string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset>
      <legend className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/70">
        {label}
      </legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selected
                  ? "border border-primary bg-primary/15 text-foreground"
                  : "border border-white/15 bg-coal-900/40 text-foreground/80 hover:border-primary/50 hover:bg-coal-900/70"
              }`}
            >
              {renderLabel(opt)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

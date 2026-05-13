"use client";

import { useMemo, useState, useId } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X } from "lucide-react";

import {
  GLOSSAIRE,
  CATEGORIES,
  buildAlphaIndex,
  type GlossaireEntry,
  type Categorie,
} from "@/lib/glossaire";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

function matches(entry: GlossaireEntry, q: string): boolean {
  if (!q) return true;
  const haystack = [
    entry.terme,
    ...(entry.alias ?? []),
    entry.definition,
    entry.categorie,
  ]
    .map(normalize)
    .join(" ");
  return haystack.includes(normalize(q));
}

export function GlossaireSearch() {
  const [query, setQuery] = useState("");
  const [activeCats, setActiveCats] = useState<Set<Categorie>>(new Set());
  const inputId = useId();

  const filtered = useMemo(() => {
    return GLOSSAIRE.filter(
      (e) =>
        matches(e, query) &&
        (activeCats.size === 0 || activeCats.has(e.categorie))
    );
  }, [query, activeCats]);

  const index = useMemo(() => buildAlphaIndex(filtered), [filtered]);

  function toggleCat(cat: Categorie) {
    setActiveCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  return (
    <div className="relative">
      {/* Barre de recherche */}
      <div className="sticky top-16 z-30 -mx-5 mb-8 border-b border-white/10 bg-coal-900/95 px-5 py-4 backdrop-blur sm:top-20 sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <div className="group relative flex items-center gap-3 rounded-2xl border border-white/15 bg-[#1a1a1a] px-4 py-3 transition-colors focus-within:border-primary sm:px-5 sm:py-4">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <label htmlFor={inputId} className="sr-only">
              Rechercher un terme du glossaire d&apos;escalade
            </label>
            <input
              id={inputId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un terme : jeté, dégaine, dièdre…"
              className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none sm:text-lg"
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <button
                type="button"
                aria-label="Effacer la recherche"
                onClick={() => setQuery("")}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Catégories */}
          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const active = activeCats.has(cat);
              return (
                <button
                  type="button"
                  key={cat}
                  onClick={() => toggleCat(cat)}
                  aria-pressed={active}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors sm:text-xs ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-white/15 bg-white/[0.04] text-foreground/75 hover:border-white/30 hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
            {activeCats.size > 0 && (
              <button
                type="button"
                onClick={() => setActiveCats(new Set())}
                className="inline-flex h-8 items-center gap-1 rounded-full px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground sm:text-xs"
              >
                Réinitialiser
              </button>
            )}
          </div>

          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:text-xs">
            {filtered.length} terme{filtered.length > 1 ? "s" : ""} ·{" "}
            {GLOSSAIRE.length} au total
          </p>
        </div>
      </div>

      {/* Index alphabétique */}
      {index.length > 0 && query === "" && activeCats.size === 0 && (
        <nav
          aria-label="Index alphabétique"
          className="mb-12 flex flex-wrap gap-1.5 sm:gap-2"
        >
          {index.map(({ letter }) => (
            <a
              key={letter}
              href={`#lettre-${letter}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] font-mono text-sm font-semibold transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
            >
              {letter}
            </a>
          ))}
        </nav>
      )}

      {/* Résultats */}
      {filtered.length === 0 ? (
        <EmptyState
          query={query}
          onClear={() => {
            setQuery("");
            setActiveCats(new Set());
          }}
        />
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`${query}-${activeCats.size}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="space-y-12"
          >
            {index.map((group) => (
              <section
                key={group.letter}
                id={`lettre-${group.letter}`}
                className="scroll-mt-44 sm:scroll-mt-52"
              >
                <div className="mb-6 flex items-baseline gap-4 border-b border-white/10 pb-3">
                  <span
                    className="font-display font-medium italic leading-none text-primary glow-ice-text"
                    style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
                  >
                    {group.letter}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:text-xs">
                    {group.entries.length} terme
                    {group.entries.length > 1 ? "s" : ""}
                  </span>
                </div>
                <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 lg:grid-cols-2">
                  {group.entries.map((entry) => (
                    <Entry key={entry.id} entry={entry} />
                  ))}
                </dl>
              </section>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function Entry({ entry }: { entry: GlossaireEntry }) {
  return (
    <div
      id={entry.id}
      className="scroll-mt-44 bg-coal-900 p-5 transition-colors hover:bg-[#1a1a1a] sm:p-7"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <dt>
          <h3 className="font-display text-xl font-medium tracking-[-0.02em] sm:text-2xl">
            {entry.terme}
          </h3>
          {entry.alias && entry.alias.length > 0 && (
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              alias : {entry.alias.join(", ")}
            </p>
          )}
        </dt>
        <span className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-foreground/70">
          {entry.categorie}
        </span>
      </div>
      <dd className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {entry.definition}
      </dd>
    </div>
  );
}

function EmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-coal-900 p-12 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        Aucun résultat
      </p>
      <p
        className="mt-4 font-display font-medium tracking-[-0.02em] text-foreground"
        style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)" }}
      >
        Rien trouvé pour{" "}
        <span className="italic text-primary glow-ice-text">
          « {query || "ces filtres"} »
        </span>
      </p>
      <p className="mt-4 max-w-md mx-auto text-sm text-muted-foreground sm:text-base">
        Essaie un autre mot, ou écris-nous le terme manquant pour qu&apos;on
        l&apos;ajoute.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-6 inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 font-mono text-xs font-semibold uppercase tracking-[0.18em] transition-colors hover:border-primary hover:text-primary"
      >
        Réinitialiser
      </button>
    </div>
  );
}

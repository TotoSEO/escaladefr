import Link from "next/link";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Explorer",
    links: [
      { label: "Sites naturels", href: "/sites" },
      { label: "Carte interactive", href: "/sites" },
      { label: "Annuaire des salles", href: "/salles" },
      { label: "Outils", href: "/outils" },
    ],
  },
  {
    title: "Ressources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "Boutique", href: "/boutique" },
      { label: "Sources & données", href: "/sources" },
    ],
  },
  {
    title: "Le projet",
    links: [
      { label: "À propos", href: "/a-propos" },
      { label: "Contact", href: "/contact" },
      { label: "Mentions légales", href: "/legal" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden surface-0 text-foreground">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
      />

      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
        {/* Mega signature */}
        <div className="grid grid-cols-12 items-end gap-8">
          <div className="col-span-12 lg:col-span-8">
            <h2
              className="font-display font-medium leading-[0.92] tracking-[-0.03em] text-balance"
              style={{ fontSize: "clamp(2.5rem, 9vw, 7rem)" }}
            >
              On grimpe{" "}
              <span className="italic text-primary glow-ice-text">tous</span>{" "}
              ici.
            </h2>
          </div>

          <div className="col-span-12 flex flex-col gap-3 lg:col-span-4 lg:items-end lg:text-right">
            <p className="max-w-[32ch] text-sm leading-relaxed text-muted-foreground lg:max-w-[24ch]">
              Une plateforme indépendante. Pas de pub agressive, pas de tracker
              qui suit. Juste l&apos;information qu&apos;on cherche.
            </p>
            <Link
              href="/contact"
              className="mt-2 inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-5 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition-all hover:border-primary hover:bg-primary/5 hover:text-primary lg:self-end"
            >
              Nous écrire
            </Link>
          </div>
        </div>

        {/* Colonnes nav */}
        <div className="mt-20 grid grid-cols-12 gap-x-4 gap-y-12 border-t border-white/10 pt-12 sm:gap-x-8 sm:pt-16">
          {COLUMNS.map((col) => (
            <div key={col.title} className="col-span-6 sm:col-span-4 lg:col-span-3">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">
                {col.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-2 text-sm text-foreground/80 transition-colors hover:text-foreground"
                    >
                      <span className="h-px w-3 bg-foreground/30 transition-all group-hover:w-5 group-hover:bg-primary" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="col-span-12 lg:col-span-3">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">
              Données
            </h3>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              Sites naturels issus du recensement public officiel. Salles
              indoor en cours de collecte. Mises à jour mensuelles, base de
              données privée et indépendante.
            </p>
          </div>
        </div>

        {/* Baseline */}
        <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} escalade-france.fr</span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            Mis à jour · {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
          </span>
        </div>
      </div>
    </footer>
  );
}

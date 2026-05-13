import Link from "next/link";
import { Mountain } from "lucide-react";

const SECTIONS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Explorer",
    links: [
      { label: "Sites naturels", href: "/sites" },
      { label: "Carte interactive", href: "/carte" },
      { label: "Par département", href: "/sites" },
    ],
  },
  {
    title: "Bientôt",
    links: [
      { label: "Annuaire des salles", href: "/salles" },
      { label: "Guides & topos", href: "/guides" },
      { label: "Boutique équipement", href: "/boutique" },
    ],
  },
  {
    title: "À propos",
    links: [
      { label: "Le projet", href: "/a-propos" },
      { label: "Sources & données", href: "/sources" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-stone-bg-50/40 dark:bg-stone-bg-900/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Mountain className="h-4 w-4" strokeWidth={2.5} />
              </span>
              escalade<span className="text-primary">-france</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              L&apos;annuaire indépendant des sites naturels et des salles
              d&apos;escalade en France.
            </p>
          </div>

          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/80 transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} escalade-france.fr — Données issues
            de la FFME.
          </p>
          <p className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
            En altitude depuis 2026
          </p>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { AlertTriangle, ShieldAlert, CalendarClock, HelpCircle } from "lucide-react";

import type { AccesStatut } from "@/lib/sites";

type Props = {
  statut: AccesStatut | null;
  notes: string | null;
  sourceUrl: string | null;
  verifiedAt: string | null;
};

/**
 * Bandeau d'avertissement affiché en haut d'une fiche site quand
 * son accès est restreint, fermé, saisonnier ou en cours de
 * vérification. Pas affiché pour 'open' ou null.
 */
export function AccessBanner({ statut, notes, sourceUrl, verifiedAt }: Props) {
  if (!statut || statut === "open") return null;

  const cfg = configFor(statut);

  return (
    <section
      className={`relative border-y ${cfg.borderClass} ${cfg.bgClass} text-foreground`}
      role="alert"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 sm:px-8 sm:py-7 lg:px-12 lg:flex-row lg:items-start lg:gap-8">
        <div className="flex items-center gap-3 lg:shrink-0">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-full border ${cfg.iconBorder} ${cfg.iconBg}`}
          >
            <cfg.icon className={`h-4 w-4 ${cfg.iconColor}`} />
          </span>
          <span
            className={`font-mono text-[11px] uppercase tracking-[0.22em] ${cfg.iconColor}`}
          >
            {cfg.label}
          </span>
        </div>

        <div className="flex-1 space-y-3">
          <h2
            className="font-display font-medium leading-tight tracking-[-0.01em]"
            style={{ fontSize: "clamp(1.1rem, 2.2vw, 1.5rem)" }}
          >
            {cfg.headline}
          </h2>
          {notes && (
            <p className="max-w-3xl text-sm leading-relaxed text-foreground/90 sm:text-base whitespace-pre-line">
              {notes}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex h-9 items-center gap-2 rounded-full border px-4 font-mono text-[10px] uppercase tracking-[0.18em] ${cfg.linkBorder} ${cfg.iconColor} hover:bg-white/5`}
              >
                Source officielle ↗
              </a>
            )}
            <Link
              href="/sites/fermes-et-restrictions"
              className={`inline-flex h-9 items-center gap-2 rounded-full border px-4 font-mono text-[10px] uppercase tracking-[0.18em] ${cfg.linkBorder} ${cfg.iconColor} hover:bg-white/5`}
            >
              Voir tous les sites concernés
            </Link>
            {verifiedAt && (
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/60">
                Vérifié le {new Date(verifiedAt).toLocaleDateString("fr-FR")}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function configFor(s: AccesStatut) {
  switch (s) {
    case "closed":
      return {
        label: "Site interdit",
        headline:
          "Cette pratique de l'escalade n'est plus autorisée sur ce site.",
        icon: ShieldAlert,
        bgClass: "bg-red-500/10",
        borderClass: "border-red-500/30",
        iconBg: "bg-red-500/15",
        iconBorder: "border-red-500/40",
        iconColor: "text-red-300",
        linkBorder: "border-red-500/30",
      };
    case "restricted":
      return {
        label: "Accès restreint",
        headline:
          "L'accès à ce site est soumis à des règles particulières.",
        icon: AlertTriangle,
        bgClass: "bg-accent/10",
        borderClass: "border-accent/30",
        iconBg: "bg-accent/15",
        iconBorder: "border-accent/40",
        iconColor: "text-accent",
        linkBorder: "border-accent/30",
      };
    case "seasonal":
      return {
        label: "Restriction saisonnière",
        headline:
          "Ce site est fermé une partie de l'année (nidification, accord local).",
        icon: CalendarClock,
        bgClass: "bg-primary/10",
        borderClass: "border-primary/30",
        iconBg: "bg-primary/15",
        iconBorder: "border-primary/40",
        iconColor: "text-primary",
        linkBorder: "border-primary/30",
      };
    case "pending":
      return {
        label: "Information à vérifier",
        headline:
          "Une mention de fermeture a été détectée. Information en cours de vérification.",
        icon: HelpCircle,
        bgClass: "bg-accent/5",
        borderClass: "border-accent/20",
        iconBg: "bg-accent/10",
        iconBorder: "border-accent/30",
        iconColor: "text-accent",
        linkBorder: "border-accent/20",
      };
    default:
      return {
        label: "Information",
        headline: "Information sur ce site.",
        icon: AlertTriangle,
        bgClass: "bg-white/5",
        borderClass: "border-white/15",
        iconBg: "bg-white/5",
        iconBorder: "border-white/15",
        iconColor: "text-foreground",
        linkBorder: "border-white/15",
      };
  }
}

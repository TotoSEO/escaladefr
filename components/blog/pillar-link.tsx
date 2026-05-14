import Link from "next/link";

import {
  type Cocon,
  type BlogArticle,
  COCON_LABEL,
  coconHref,
} from "@/lib/blog";

/**
 * Carte de hiérarchie cocon affichée TRÈS HAUT dans l'article (juste
 * après le H1/chapô). Place le lien vers la tête de cocon en première
 * position de la page : conformément au surfer raisonnable de Google,
 * les liens en haut reçoivent le plus de poids.
 *
 * Cela permet aux sous-articles d'un cocon de faire monter le jus
 * d'autorité vers leur pilier hub naturellement à chaque rendu.
 */

// Slug du pilier hub par cocon
const HUB_SLUG: Record<Cocon, string> = {
  techniques: "apprendre-escalade-debutant-2026",
  materiel: "materiel-escalade-essentiel",
  noeuds: "noeuds-escalade-utiles-guide",
  sites: "sites-escalade-emblematiques-france",
  personnalites: "grimpeurs-grimpeuses-histoire-france",
  preparation: "preparer-corps-tete-grimpe",
  securite: "securite-escalade-regles-essentielles",
  environnement: "grimper-respect-sites-faune",
  culture: "histoire-escalade-france-alpes-salle",
};

const HUB_LABEL: Record<Cocon, string> = {
  techniques: "Apprendre l'escalade",
  materiel: "Le matériel d'escalade",
  noeuds: "Les nœuds en escalade",
  sites: "Les sites d'escalade",
  personnalites: "Les grimpeurs et grimpeuses",
  preparation: "La préparation du grimpeur",
  securite: "La sécurité en escalade",
  environnement: "L'escalade et l'environnement",
  culture: "L'histoire de l'escalade",
};

type Props = {
  article: Pick<BlogArticle, "slug" | "cocon" | "type_article">;
};

export function PillarLink({ article }: Props) {
  // Sur les piliers eux-mêmes, on n'affiche pas ce bloc (auto-référence).
  if (article.type_article === "hub") return null;
  const hubSlug = HUB_SLUG[article.cocon];
  if (hubSlug === article.slug) return null;

  return (
    <nav
      aria-label="Série d'articles"
      className="mt-10 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-l-2 border-primary/40 pl-4 text-sm sm:text-base"
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        Série
      </span>
      <Link
        href={`/blog/${hubSlug}`}
        className="font-display italic text-primary underline decoration-primary/40 underline-offset-[3px] transition-colors hover:decoration-primary"
      >
        {HUB_LABEL[article.cocon]}
      </Link>
      <span className="text-muted-foreground">·</span>
      <Link
        href={coconHref(article.cocon)}
        className="text-muted-foreground underline decoration-white/15 underline-offset-[3px] transition-colors hover:text-foreground hover:decoration-white/40"
      >
        Tous les articles {COCON_LABEL[article.cocon].toLowerCase()}
      </Link>
    </nav>
  );
}

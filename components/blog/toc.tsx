import { slugify } from "@/components/blog/blocks";
import type { BlogBlock } from "@/lib/blog";

type Props = {
  blocks: BlogBlock[];
};

type Heading = {
  level: 2 | 3;
  text: string;
  id: string;
};

/**
 * Sommaire automatique généré à partir des H2/H3 de l'article.
 * Affiché en accordéon fermé par défaut pour ne pas alourdir le haut
 * de page. S'auto-désactive si moins de 3 titres dans le corps.
 */
export function TableOfContents({ blocks }: Props) {
  const headings: Heading[] = blocks
    .filter((b): b is BlogBlock & { type: "h2" | "h3" } => b.type === "h2" || b.type === "h3")
    .map((b) => ({
      level: b.type === "h2" ? 2 : 3,
      text: b.text,
      id: b.id || slugify(b.text),
    }));

  if (headings.length < 3) return null;

  return (
    <details className="mt-12 group rounded-2xl border border-white/10 bg-coal-900/60 transition-colors open:bg-coal-900/80">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 sm:px-7 sm:py-5">
        <span className="flex items-baseline gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
            Sommaire
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {headings.length} sections
          </span>
        </span>
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 transition-transform group-open:rotate-45">
          <span className="block h-3 w-px bg-foreground" />
          <span className="block h-px w-3 -translate-x-3 bg-foreground" />
        </span>
      </summary>
      <nav
        aria-label="Sommaire de l'article"
        className="border-t border-white/10 px-6 py-5 sm:px-7 sm:py-6"
      >
        <ol className="space-y-2.5">
          {headings.map((h, i) => (
            <li
              key={i}
              className={`leading-snug ${h.level === 3 ? "pl-6 sm:pl-8" : ""}`}
            >
              <a
                href={`#${h.id}`}
                className={`group/link inline-flex items-baseline gap-3 text-sm transition-colors hover:text-primary sm:text-base ${
                  h.level === 2 ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {h.level === 2 && (
                  <span className="font-mono text-[10px] tabular-nums text-primary">
                    {String(headings.filter((x, j) => x.level === 2 && j <= i).length).padStart(2, "0")}
                  </span>
                )}
                <span className="underline decoration-transparent underline-offset-[3px] transition-colors group-hover/link:decoration-primary/60">
                  {h.text}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  );
}

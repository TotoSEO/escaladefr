import Image from "next/image";
import { Lightbulb, AlertTriangle, AlertOctagon, Quote as QuoteIcon } from "lucide-react";

import type {
  BlogBlock,
  BlockH2,
  BlockH3,
  BlockP,
  BlockTable,
  BlockImageText,
  BlockList,
  BlockQuote,
  BlockTip,
} from "@/lib/blog";

/* ───────────────── Bloc-router ───────────────── */

export function RenderBlock({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case "h2":
      return <H2 block={block} />;
    case "h3":
      return <H3 block={block} />;
    case "p":
      return <P block={block} />;
    case "table":
      return <TableBlock block={block} />;
    case "image_text":
      return <ImageText block={block} />;
    case "list":
      return <ListBlock block={block} />;
    case "quote":
      return <QuoteBlock block={block} />;
    case "tip":
      return <TipBlock block={block} />;
  }
}

/* ───────────────── Titres ───────────────── */

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function H2({ block }: { block: BlockH2 }) {
  const id = block.id ?? slugify(block.text);
  return (
    <h2
      id={id}
      className="mt-14 scroll-mt-24 font-display font-medium leading-[0.98] tracking-[-0.02em] text-balance text-foreground first:mt-0"
      style={{ fontSize: "clamp(1.6rem, 3.4vw, 2.4rem)" }}
    >
      {block.text}
    </h2>
  );
}

function H3({ block }: { block: BlockH3 }) {
  const id = block.id ?? slugify(block.text);
  return (
    <h3
      id={id}
      className="mt-10 scroll-mt-24 font-display font-medium tracking-[-0.01em] text-foreground"
      style={{ fontSize: "clamp(1.25rem, 2.4vw, 1.65rem)" }}
    >
      {block.text}
    </h3>
  );
}

/* ───────────────── Paragraphe ───────────────── */

function P({ block }: { block: BlockP }) {
  return (
    <p
      className="mt-5 text-base leading-[1.75] text-foreground/85 [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_a]:decoration-primary/40 [&_a]:underline-offset-[3px] [&_a:hover]:decoration-primary [&_strong]:font-semibold [&_strong]:text-foreground [&_em]:italic sm:text-[17px]"
      dangerouslySetInnerHTML={{ __html: block.html }}
    />
  );
}

/* ───────────────── Tableau responsive ───────────────── */

function TableBlock({ block }: { block: BlockTable }) {
  return (
    <figure className="mt-12">
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-coal-900/60">
        <table className="w-full min-w-[420px] text-left text-sm sm:text-base">
          <thead>
            <tr className="border-b border-white/10 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {block.headers.map((h, i) => (
                <th key={i} className="px-4 py-3 sm:px-5 sm:py-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, r) => (
              <tr
                key={r}
                className={`border-b border-white/5 tabular-nums last:border-b-0 ${
                  r % 2 === 0 ? "bg-white/[0.015]" : ""
                }`}
              >
                {row.map((cell, c) => (
                  <td
                    key={c}
                    className={`px-4 py-3 sm:px-5 sm:py-4 ${
                      c === 0 ? "font-semibold text-primary" : "text-foreground/85"
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {block.caption && (
        <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}

/* ───────────────── Image + texte ───────────────── */

function ImageText({ block }: { block: BlockImageText }) {
  const reverse = block.position === "right";
  return (
    <figure
      className={`mt-12 grid gap-6 overflow-hidden rounded-2xl border border-white/10 bg-coal-900/60 sm:gap-0 lg:grid-cols-2 ${
        reverse ? "lg:[&>div:first-child]:order-2" : ""
      }`}
    >
      <div className="relative aspect-[4/3] sm:aspect-[3/2] lg:aspect-auto lg:min-h-[280px]">
        <Image
          src={block.image}
          alt={block.alt}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
        <p className="text-base leading-[1.75] text-foreground/85 sm:text-[17px]">
          {block.text}
        </p>
        {block.caption && (
          <figcaption className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {block.caption}
          </figcaption>
        )}
      </div>
    </figure>
  );
}

/* ───────────────── Liste design (numbered / bullets / cards) ───────────────── */

function ListBlock({ block }: { block: BlockList }) {
  if (block.variant === "cards") {
    return (
      <div className="mt-12">
        {block.title && (
          <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.28em] text-primary">
            {block.title}
          </p>
        )}
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {block.items.map((item, i) => (
            <li
              key={i}
              className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-coal-900 p-5 transition-colors hover:border-primary/40 sm:p-6"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
              {item.title && (
                <h4 className="font-display text-lg font-medium tracking-[-0.01em] text-foreground sm:text-xl">
                  {item.title}
                </h4>
              )}
              <p className="text-sm leading-relaxed text-foreground/80 sm:text-base">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (block.variant === "numbered") {
    return (
      <ol className="mt-12 space-y-4">
        {block.title && (
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.28em] text-primary">
            {block.title}
          </p>
        )}
        {block.items.map((item, i) => (
          <li
            key={i}
            className="grid grid-cols-[auto_1fr] gap-x-5 rounded-2xl border border-white/10 bg-coal-900/60 p-5 sm:p-6"
          >
            <span
              className="font-display font-medium italic leading-none text-primary"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              {item.title && (
                <h4 className="font-display text-lg font-medium tracking-[-0.01em] text-foreground sm:text-xl">
                  {item.title}
                </h4>
              )}
              <p className="mt-2 text-sm leading-relaxed text-foreground/80 sm:text-base">
                {item.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div className="mt-10">
      {block.title && (
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-primary">
          {block.title}
        </p>
      )}
      <ul className="space-y-3">
        {block.items.map((item, i) => (
          <li
            key={i}
            className="flex gap-3 text-base leading-[1.7] text-foreground/85 sm:text-[17px]"
          >
            <span className="mt-[10px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>
              {item.title && (
                <strong className="font-semibold text-foreground">
                  {item.title}.{" "}
                </strong>
              )}
              {item.body}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ───────────────── Citation ───────────────── */

function QuoteBlock({ block }: { block: BlockQuote }) {
  return (
    <blockquote className="relative mt-14 rounded-3xl border-l-4 border-primary bg-coal-900/60 px-6 py-7 sm:px-10 sm:py-9">
      <QuoteIcon
        aria-hidden
        className="absolute -top-4 left-6 h-8 w-8 rounded-full bg-primary p-1.5 text-primary-foreground sm:left-10"
      />
      <p
        className="font-display italic leading-snug tracking-[-0.02em] text-foreground text-balance"
        style={{ fontSize: "clamp(1.2rem, 2.6vw, 1.75rem)" }}
      >
        « {block.text} »
      </p>
      {(block.author || block.role) && (
        <footer className="mt-5 flex flex-wrap items-baseline gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {block.author && (
            <span className="text-foreground/85">— {block.author}</span>
          )}
          {block.role && <span>· {block.role}</span>}
        </footer>
      )}
    </blockquote>
  );
}

/* ───────────────── Bloc astuce / attention / erreur ───────────────── */

function TipBlock({ block }: { block: BlockTip }) {
  const tone = block.tone ?? "astuce";
  const styles =
    tone === "attention"
      ? { border: "border-accent/40", bg: "bg-accent/[0.07]", text: "text-accent", label: "Attention", Icon: AlertTriangle }
      : tone === "erreur"
      ? { border: "border-red-500/45", bg: "bg-red-500/[0.07]", text: "text-red-300", label: "À éviter", Icon: AlertOctagon }
      : { border: "border-primary/40", bg: "bg-primary/[0.07]", text: "text-primary", label: "Astuce", Icon: Lightbulb };

  const { Icon } = styles;

  return (
    <aside
      className={`mt-12 flex gap-5 rounded-2xl border ${styles.border} ${styles.bg} p-5 sm:p-7`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${styles.border} bg-coal-900/60 ${styles.text}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <span
          className={`font-mono text-[10px] uppercase tracking-[0.22em] ${styles.text}`}
        >
          {styles.label} · {block.title}
        </span>
        <p className="mt-2 text-sm leading-relaxed text-foreground/90 sm:text-base">
          {block.body}
        </p>
      </div>
    </aside>
  );
}

/* ───────────────── Encart "Les informations principales" ───────────────── */

export function KeyTakeaways({ items }: { items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <aside className="mt-12 rounded-3xl border border-primary/30 bg-coal-900/80 p-6 sm:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
        Les informations principales
      </p>
      <ul className="mt-5 space-y-3">
        {items.map((t, i) => (
          <li
            key={i}
            className="grid grid-cols-[auto_1fr] gap-x-4 text-sm leading-relaxed text-foreground/90 sm:text-base"
          >
            <span className="mt-[3px] font-mono text-[10px] uppercase tracking-[0.22em] text-primary tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

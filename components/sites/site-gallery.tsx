import Image from "next/image";

import type { SiteImage } from "@/lib/sites";

type Props = {
  images: SiteImage[];
  siteNom: string;
};

/**
 * Galerie d'images d'un site naturel. La première image sert de hero
 * full-bleed, les suivantes en grille. Chaque image affiche son
 * attribution (auteur + licence) en bas, comme l'exigent les licences
 * Creative Commons et la licence Wikimedia Commons.
 */
export function SiteGallery({ images, siteNom }: Props) {
  if (images.length === 0) return null;
  const [hero, ...rest] = images;

  return (
    <section className="relative surface-0 text-foreground">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <SiteHero hero={hero} siteNom={siteNom} />
        {rest.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-5 sm:grid-cols-3 sm:gap-4">
            {rest.map((img) => (
              <Thumb key={img.id} img={img} siteNom={siteNom} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function SiteHero({ hero, siteNom }: { hero: SiteImage; siteNom: string }) {
  const src = hero.thumbnail_url || hero.url;
  return (
    <figure className="relative overflow-hidden rounded-2xl border border-white/10">
      <div className="relative aspect-[16/9] w-full bg-coal-900 sm:aspect-[21/9]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={hero.titre || `${siteNom} — escalade`}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-coal-900/80 via-transparent to-transparent" />
      </div>
      <Attribution img={hero} />
    </figure>
  );
}

function Thumb({ img, siteNom }: { img: SiteImage; siteNom: string }) {
  const src = img.thumbnail_url || img.url;
  return (
    <figure className="group relative overflow-hidden rounded-xl border border-white/10">
      <div className="relative aspect-[4/3] w-full bg-coal-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={img.titre || `${siteNom} — vue ${img.position + 1}`}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <Attribution img={img} compact />
    </figure>
  );
}

function Attribution({ img, compact = false }: { img: SiteImage; compact?: boolean }) {
  const auteur = (img.auteur || "Inconnu").replace(/\s+/g, " ").slice(0, 80);
  const licence = (img.licence || "Licence libre").slice(0, 60);
  const sizeCls = compact
    ? "px-3 py-1.5 text-[9px]"
    : "px-4 py-2 text-[10px] sm:text-[11px]";
  return (
    <figcaption
      className={`flex flex-wrap items-center justify-between gap-2 bg-coal-900/90 font-mono uppercase tracking-[0.18em] text-muted-foreground backdrop-blur ${sizeCls}`}
    >
      <span className="truncate">
        © {auteur}
      </span>
      <span className="flex items-center gap-2">
        {img.licence_url ? (
          <a
            href={img.licence_url}
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:text-foreground"
          >
            {licence}
          </a>
        ) : (
          <span>{licence}</span>
        )}
        {img.source_url && (
          <a
            href={img.source_url}
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:text-foreground"
            aria-label="Voir la source de la photo"
          >
            ↗
          </a>
        )}
      </span>
    </figcaption>
  );
}

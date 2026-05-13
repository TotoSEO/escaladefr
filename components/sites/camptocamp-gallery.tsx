import Image from "next/image";

import { camptocampImageUrl, type CamptocampImage } from "@/lib/sites";

type Props = {
  images: CamptocampImage[];
  siteNom: string;
};

export function CamptocampGallery({ images, siteNom }: Props) {
  if (images.length === 0) return null;

  return (
    <section className="relative surface-1 text-foreground">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="mb-8 sm:mb-10">
          <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
            § Galerie
          </span>
          <h2
            className="mt-3 font-display font-medium leading-[0.96] tracking-[-0.02em] text-balance"
            style={{ fontSize: "clamp(1.6rem, 3.6vw, 2.6rem)" }}
          >
            Images du site —{" "}
            <span className="italic text-primary glow-ice-text">{siteNom}</span>
            .
          </h2>
        </div>

        <ul
          className={`grid gap-3 sm:gap-4 ${
            images.length === 1
              ? "grid-cols-1"
              : images.length === 2
              ? "grid-cols-2"
              : "grid-cols-2 sm:grid-cols-3"
          }`}
        >
          {images.map((img, i) => {
            const isLandscape =
              typeof img.width === "number" && typeof img.height === "number"
                ? img.width >= img.height
                : true;
            return (
              <li
                key={img.document_id}
                className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-coal-900 ${
                  i === 0 && images.length >= 4
                    ? "col-span-2 row-span-1 sm:row-span-2"
                    : ""
                }`}
                style={{ aspectRatio: isLandscape ? "3 / 2" : "2 / 3" }}
              >
                <Image
                  src={camptocampImageUrl(img.filename)}
                  alt={img.title || `Vue de ${siteNom}`}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  unoptimized
                />
                {(img.title || img.author) && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-3 py-3">
                    {img.title && (
                      <p className="text-sm font-medium leading-tight text-white">
                        {img.title}
                      </p>
                    )}
                    {img.author && (
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/70">
                        © {img.author}
                      </p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        <p className="mt-6 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          Photos publiées par des contributeurs externes sous licence CC-BY-SA
          4.0, affichées ici avec attribution conformément aux conditions de
          la licence.
        </p>
      </div>
    </section>
  );
}

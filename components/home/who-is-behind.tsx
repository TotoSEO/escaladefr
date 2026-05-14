import Image from "next/image";

/**
 * Section "Qui est derrière escalade-france.fr ?" sur la home.
 * Présente Antoine, le grimpeur derrière la rédaction et le projet.
 * Sert le E-E-A-T Google (auteur identifié, expérience démontrée) et
 * la crédibilité côté lecteur.
 */
export function WhoIsBehind() {
  return (
    <section className="relative overflow-hidden surface-1 text-foreground">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/3 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-primary/[0.08] blur-[140px]"
      />

      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-36">
        <div className="grid grid-cols-12 gap-y-12 sm:gap-x-12">
          <div className="col-span-12 sm:col-span-4 lg:col-span-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
              § 04 / Qui écrit
            </span>
            <h2
              className="mt-4 font-display font-medium leading-[0.96] tracking-[-0.02em] text-balance"
              style={{ fontSize: "clamp(1.6rem, 3.8vw, 2.8rem)" }}
            >
              Qui est{" "}
              <span className="italic text-primary glow-ice-text">derrière</span>
              {" "}escalade-france.fr&nbsp;?
            </h2>
          </div>

          <div className="col-span-12 sm:col-span-8 lg:col-span-9">
            <article className="grid grid-cols-1 gap-8 rounded-3xl border border-white/10 bg-coal-900/60 p-7 sm:p-10 lg:grid-cols-[auto_1fr] lg:gap-12 lg:p-12">
              {/* Photo d'Antoine */}
              <div className="relative h-32 w-32 shrink-0 self-start overflow-hidden rounded-3xl ring-1 ring-white/10 sm:h-40 sm:w-40">
                <Image
                  src="/blog/antoine-escalade-france.webp"
                  alt="Antoine, rédacteur d'escalade-france.fr, en train de grimper en salle"
                  fill
                  sizes="(min-width: 640px) 160px, 128px"
                  className="object-cover"
                  priority={false}
                />
              </div>

              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                  Antoine · grimpeur depuis 2013
                </p>
                <h3
                  className="mt-3 font-display font-medium tracking-[-0.02em] text-foreground"
                  style={{ fontSize: "clamp(1.4rem, 3vw, 2.2rem)" }}
                >
                  Treize ans de grimpe, du lycée Camille Sée aux falaises de
                  France.
                </h3>

                <div className="mt-6 space-y-4 text-base leading-relaxed text-foreground/85 sm:text-[17px]">
                  <p>
                    Premiers blocs au mur du lycée Camille Sée de Colmar en
                    2013, premières sorties en falaise sur les contreforts
                    vosgiens l&apos;année suivante. Compétitions départementales
                    puis nationales jeunes en 2012-2014, classé dans le top 200
                    FFME de ma catégorie d&apos;âge. Depuis 2018, j&apos;ouvre
                    des voies dans le Jura et les Vosges sur des secteurs encore
                    discrets, et je sillonne la France pour tester, comparer et
                    documenter les meilleurs spots.
                  </p>
                  <p>
                    Niveau actuel <strong>8a en falaise sport</strong>,{" "}
                    <strong>7b en bloc</strong>. Tout ce que tu lis sur ce site
                    sort de ma rédaction, jamais d&apos;un générateur. Les sites
                    naturels sont vérifiés un par un, le matériel est testé sur
                    le terrain, les avis sont les miens.
                  </p>
                </div>

                <ul className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                  <li className="rounded-2xl border border-white/10 bg-coal-900 px-5 py-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                      Pratique
                    </p>
                    <p className="mt-1 font-display text-lg font-medium tracking-[-0.01em]">
                      13 ans
                    </p>
                  </li>
                  <li className="rounded-2xl border border-white/10 bg-coal-900 px-5 py-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                      Sport · bloc
                    </p>
                    <p className="mt-1 font-display text-lg font-medium tracking-[-0.01em] tabular-nums">
                      8a · 7b
                    </p>
                  </li>
                  <li className="rounded-2xl border border-white/10 bg-coal-900 px-5 py-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                      Voies ouvertes
                    </p>
                    <p className="mt-1 font-display text-lg font-medium tracking-[-0.01em]">
                      Jura · Vosges
                    </p>
                  </li>
                </ul>

                <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  Aucun contenu généré · Aucune affiliation cachée ·
                  Relectures avant publication
                </p>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

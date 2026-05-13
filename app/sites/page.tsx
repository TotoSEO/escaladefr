import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Mountain, MapPin, Sparkles } from "lucide-react";

import { PageShell, PageHeader } from "@/components/page-shell";
import { getSupabase } from "@/lib/supabase";

export const revalidate = 3600;

async function getCount(): Promise<number | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { count } = await supabase
    .from("sites_naturels")
    .select("*", { count: "exact", head: true });
  return count ?? null;
}

export async function generateMetadata(): Promise<Metadata> {
  const count = await getCount();
  const c = count?.toLocaleString("fr-FR") ?? "3 500";
  return {
    title: `${c} sites d'escalade naturels en France · Carte interactive`,
    description: `La carte interactive des ${c} sites d'escalade naturels recensés en France. Cotations, accès, périodes favorables, coordonnées GPS. Filtrable par département, massif, niveau.`,
  };
}

const MASSIFS = [
  {
    nom: "Verdon",
    region: "Provence",
    type: "Calcaire vertical",
    voies: "1 500 voies",
  },
  {
    nom: "Fontainebleau",
    region: "Île-de-France",
    type: "Grès, bloc",
    voies: "Mythe mondial",
  },
  {
    nom: "Céüse",
    region: "Hautes-Alpes",
    type: "Calcaire technique",
    voies: "Référence sport",
  },
  {
    nom: "Buoux",
    region: "Vaucluse",
    type: "Calcaire dévers",
    voies: "Berceau du sport",
  },
  {
    nom: "Calanques",
    region: "Bouches-du-Rhône",
    type: "Calcaire maritime",
    voies: "Grandes voies",
  },
  {
    nom: "Annot",
    region: "Alpes-de-Haute-Provence",
    type: "Grès original",
    voies: "Bloc à ciel ouvert",
  },
  {
    nom: "Présles",
    region: "Vercors",
    type: "Calcaire de paroi",
    voies: "Grandes voies",
  },
  {
    nom: "Pays Basque",
    region: "Pyrénées-Atlantiques",
    type: "Calcaire et conglomérat",
    voies: "Spots variés",
  },
];

const FAQ = [
  {
    q: "Comment cette carte a-t-elle été constituée ?",
    a: "On part des fiches publiques officielles qui recensent les sites naturels d'escalade en France. Ce travail couvre les sites identifiés par les comités départementaux et nationaux. On les a tous rapatriés dans une seule base, qu'on enrichit ensuite à la main avec les informations utiles pour planifier une sortie. C'est mis à jour mensuellement.",
  },
  {
    q: "Est-ce que tous les spots d'escalade y sont ?",
    a: "Non, et c'est important de le dire. La carte recense les sites officiellement répertoriés. Les spots confidentiels, les ouvertures récentes non encore documentées, ou ceux qui relèvent d'accords privés entre clubs n'y figurent pas forcément. Pour les pratiques en terrain d'aventure ou les voies de grande course alpines, complète toujours avec les topos locaux.",
  },
  {
    q: "Pourquoi certains sites n'ont pas de coordonnées GPS ?",
    a: "Plusieurs raisons. Soit la fiche officielle ne les indique pas, soit l'accès est volontairement gardé discret pour préserver le rocher ou éviter les conflits avec les propriétaires fonciers. Quand on a la position, on l'affiche. Quand on ne l'a pas, le site reste listé mais sans point précis sur la carte.",
  },
  {
    q: "Les cotations sont-elles fiables ?",
    a: "Elles sont issues des fiches officielles publiques. La cotation reste subjective par nature, et elle évolue avec les rééquipements ou les usures de prises. Vois-les comme un repère, pas une vérité absolue. Pour les voies engageantes, croise toujours avec un topo papier récent ou un retour de grimpeur local.",
  },
  {
    q: "Comment trouver un site adapté à mon niveau ?",
    a: "Sur chaque fiche, on affiche la cotation minimum et maximum du site. Tu peux filtrer la carte par fourchette de niveau pour ne voir que les spots qui correspondent à ce que tu cherches. Pour débuter, regarde plutôt les sites avec une cotation min en 4 ou 5, et un nombre de voies suffisant pour avoir le choix sur place.",
  },
  {
    q: "Vous indiquez les périodes favorables, comment c'est calculé ?",
    a: "Ce n'est pas un calcul automatique. C'est l'info donnée dans le recensement officiel, basée sur l'expérience des équipeurs et des grimpeurs réguliers du site. Ça prend en compte l'orientation des voies, l'altitude, l'ombre, et les contraintes locales comme les nidifications de rapaces qui ferment certains secteurs au printemps.",
  },
];

export default async function SitesPage() {
  const count = await getCount();
  const totalLabel = count?.toLocaleString("fr-FR") ?? "3 500";

  return (
    <PageShell>
      <PageHeader
        section="§ Pilier 01 / Outdoor"
        status="live"
        surface="cool"
        title={
          <>
            {totalLabel} sites
            <br />
            d&apos;escalade{" "}
            <span className="italic text-primary glow-ice-text">naturels</span>,
            <br />
            tous sur une carte.
          </>
        }
        subtitle="Le recensement officiel reconstruit en base navigable. Filtre par département, par cotation, par massif. Coordonnées GPS, accès routier, approche, période favorable : tout est là."
      />

      {/* Placeholder de carte sur surface 1 */}
      <section className="relative overflow-hidden surface-1 text-foreground">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 sm:aspect-[16/10] noise">
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(125,222,255,0.18),transparent_55%),radial-gradient(circle_at_70%_70%,rgba(255,122,38,0.10),transparent_55%),#0a0d11]"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-5 text-center sm:gap-5">
              <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary sm:text-[11px]">
                Carte interactive
              </span>
              <p
                className="max-w-md font-display font-medium leading-tight tracking-[-0.02em]"
                style={{ fontSize: "clamp(1.6rem, 4vw, 3rem)" }}
              >
                On finalise l&apos;import des données.
              </p>
              <p className="max-w-md text-sm text-muted-foreground">
                La carte sera en ligne dès que tous les sites sont importés.
                En attendant, tu peux déjà parcourir la liste par département
                depuis la page d&apos;accueil.
              </p>
              <Link
                href="/"
                className="mt-2 inline-flex h-11 items-center gap-2 rounded-full border border-white/15 px-5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors hover:border-primary hover:text-primary"
              >
                Voir le top des départements
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>

            {[
              { top: "20%", left: "30%" },
              { top: "55%", left: "65%" },
              { top: "70%", left: "25%" },
              { top: "30%", left: "75%" },
              { top: "45%", left: "45%" },
            ].map((p, i) => (
              <span
                key={i}
                className="pointer-events-none absolute h-2 w-2 rounded-full bg-primary pulse-ice"
                style={{ top: p.top, left: p.left }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pourquoi cette carte — surface chaude */}
      <section className="relative surface-mesh-warm text-foreground">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="grid grid-cols-12 gap-y-10 sm:gap-x-12">
            <div className="col-span-12 sm:col-span-4 lg:col-span-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                § Pourquoi
              </span>
              <span className="mt-3 block h-px w-12 bg-foreground/40" />
            </div>
            <div className="col-span-12 sm:col-span-8 lg:col-span-9">
              <h2
                className="font-display font-medium leading-[0.96] tracking-[-0.02em] text-balance"
                style={{ fontSize: "clamp(1.85rem, 4.6vw, 4rem)" }}
              >
                Une carte qui répond aux{" "}
                <span className="italic text-primary glow-ice-text">
                  bonnes questions
                </span>
                .
              </h2>
              <div className="mt-10 grid gap-8 sm:grid-cols-2 sm:gap-10">
                <Bullet
                  icon={Mountain}
                  title="Tout le territoire"
                  body="Verdon, Buoux, Céüse, on connaît. Mais il y a aussi des centaines de sites moins courus, parfaits pour éviter la foule. La carte les montre tous, sans hiérarchie commerciale."
                />
                <Bullet
                  icon={MapPin}
                  title="Les vraies infos pratiques"
                  body="Pas seulement des points sur une carte. Pour chaque site : où se gare-t-on, combien de temps d'approche, quelle exposition, quel niveau, quelle période. Ce qu'il faut pour décider si on y va."
                />
                <Bullet
                  icon={Sparkles}
                  title="Mis à jour, pas figé"
                  body="On synchronise tous les mois avec les sources officielles pour intégrer les nouveaux sites, les rééquipements, les fermetures temporaires. Si une info bouge, elle bouge ici."
                />
                <Bullet
                  icon={ArrowUpRight}
                  title="Lié à toute la plateforme"
                  body="Chaque fiche te mène vers la carte, la liste du département, et bientôt les salles du coin pour s'entraîner avant la sortie. Tout est connecté."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Massifs — surface noire dense */}
      <section className="relative overflow-hidden surface-0 text-foreground">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="grid grid-cols-12 gap-y-8 sm:gap-x-12">
            <div className="col-span-12 sm:col-span-4 lg:col-span-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                § Incontournables
              </span>
            </div>
            <h2
              className="col-span-12 font-display font-medium leading-[0.96] tracking-[-0.02em] text-balance sm:col-span-8 lg:col-span-9"
              style={{ fontSize: "clamp(1.85rem, 4.6vw, 4rem)" }}
            >
              Les massifs qu&apos;on{" "}
              <span className="italic text-primary glow-ice-text">conseille</span>{" "}
              à tout le monde.
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl bg-white/10 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4">
            {MASSIFS.map((m) => (
              <article
                key={m.nom}
                className="group relative flex flex-col gap-2 bg-coal-800 p-6 transition-colors hover:bg-coal-700"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
                  {m.region}
                </span>
                <h3
                  className="font-display font-medium tracking-[-0.02em]"
                  style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.875rem)" }}
                >
                  {m.nom}
                </h3>
                <p className="text-sm text-muted-foreground">{m.type}</p>
                <p className="mt-auto pt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/70">
                  {m.voies}
                </p>
                <ArrowUpRight className="absolute right-4 top-4 h-4 w-4 text-foreground/40 transition-colors group-hover:text-primary" />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — surface 1 pour respirer */}
      <section className="relative surface-1 text-foreground">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
        <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="mb-10 sm:mb-14">
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
              § FAQ
            </span>
            <h2
              className="mt-4 font-display font-medium leading-[0.96] tracking-[-0.02em] text-balance"
              style={{ fontSize: "clamp(1.85rem, 5vw, 4.4rem)" }}
            >
              Les questions{" "}
              <span className="italic text-primary glow-ice-text">
                qu&apos;on nous pose
              </span>
              .
            </h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-coal-800/40">
            {FAQ.map((item, i) => (
              <details
                key={i}
                className="group border-b border-white/10 px-5 py-5 transition-colors last:border-b-0 open:bg-white/[0.03] sm:px-7 sm:py-7"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                  <span className="flex flex-1 items-baseline gap-3 font-display font-medium tracking-[-0.01em] sm:gap-4">
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span style={{ fontSize: "clamp(1.1rem, 2.2vw, 1.6rem)" }}>
                      {item.q}
                    </span>
                  </span>
                  <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 transition-transform group-open:rotate-45">
                    <span className="block h-3 w-px bg-foreground" />
                    <span className="block h-px w-3 -translate-x-3 bg-foreground" />
                  </span>
                </summary>
                <p className="mt-4 max-w-3xl pl-8 pr-1 text-sm leading-relaxed text-muted-foreground sm:pl-12 sm:text-base">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Bullet({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div>
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <h3
        className="mt-5 font-display font-medium tracking-[-0.01em]"
        style={{ fontSize: "clamp(1.3rem, 2.4vw, 1.875rem)" }}
      >
        {title}
      </h3>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">
        {body}
      </p>
    </div>
  );
}

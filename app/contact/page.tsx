import type { Metadata } from "next";
import { Mail, MapPin, Building2, FileWarning, Handshake, Megaphone } from "lucide-react";

import { PageShell, PageHeader } from "@/components/page-shell";

const EMAIL = "contact@escalade-france.fr";

export const metadata: Metadata = {
  title: "Contact · escalade-france.fr",
  description:
    "Contacter escalade-france.fr : signaler une erreur, proposer un site, demander une vérification de fiche salle, partenariat ou question presse.",
  alternates: { canonical: "/contact" },
};

type Reason = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  subject: string;
  accent?: boolean;
};

const REASONS: Reason[] = [
  {
    icon: FileWarning,
    title: "Signaler une erreur",
    body: "Cotation incorrecte, accès qui a changé, fermeture saisonnière non mentionnée, coordonnées GPS imprécises. Toutes les corrections sont les bienvenues, on les traite en priorité.",
    subject: "Correction d'une fiche",
  },
  {
    icon: MapPin,
    title: "Proposer un site",
    body: "Un site qui mériterait d'apparaître dans notre annuaire ? Décris-le brièvement avec ses coordonnées, son type de roche, et une cotation indicative. On vérifie et on intègre.",
    subject: "Proposer un nouveau site",
  },
  {
    icon: Building2,
    title: "Gérer une salle d'escalade",
    body: "Tu gères une salle indoor référencée chez nous (ou pas encore) ? On prépare un accès dédié pour que tu valides toi-même les infos qui te concernent. Écris-nous pour rejoindre l'avant-garde.",
    subject: "Gérant de salle d'escalade",
  },
  {
    icon: Handshake,
    title: "Partenariat & affiliation",
    body: "Marque d'équipement, fabricant français, club ou commune cherchant à valoriser ses sites. On étudie les partenariats qui apportent une vraie valeur aux grimpeurs.",
    subject: "Proposition de partenariat",
  },
  {
    icon: Megaphone,
    title: "Presse, média, contenu",
    body: "Journaliste, blogueur ou photographe sur l'escalade ? On répond aux demandes d'interview, d'illustration ou de contenus sourcés.",
    subject: "Demande presse",
  },
  {
    icon: Mail,
    title: "Toute autre question",
    body: "Une suggestion sur le site, un bug technique, une remarque sur le ton éditorial ou simplement un mot. La porte reste ouverte.",
    subject: "Question générale",
  },
];

export default function ContactPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": "https://escalade-france.fr/contact",
        url: "https://escalade-france.fr/contact",
        name: "Contact escalade-france.fr",
        description:
          "Page de contact d'escalade-france.fr. Email contact@escalade-france.fr.",
        isPartOf: { "@id": "https://escalade-france.fr/#website" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: "https://escalade-france.fr" },
          { "@type": "ListItem", position: 2, name: "Contact", item: "https://escalade-france.fr/contact" },
        ],
      },
      {
        "@type": "Organization",
        "@id": "https://escalade-france.fr/#organization",
        name: "escalade-france.fr",
        url: "https://escalade-france.fr",
        contactPoint: {
          "@type": "ContactPoint",
          email: EMAIL,
          contactType: "Customer support",
          availableLanguage: ["French"],
        },
      },
    ],
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader
        section="§ Contact"
        status="live"
        surface="cool"
        title={
          <>
            Une question, une erreur,
            <br />
            une{" "}
            <span className="italic text-primary glow-ice-text">
              bonne idée
            </span>{" "}
            ?
          </>
        }
        subtitle="On lit tous les messages. Pour aller au plus vite, choisis la rubrique qui correspond à ta demande, le sujet de ton mail sera pré-rempli."
      />

      {/* Email principal en vedette */}
      <section className="relative surface-1 text-foreground">
        <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
          <article className="relative overflow-hidden rounded-3xl border border-primary/30 bg-coal-900 p-8 sm:p-12 lg:p-16">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(125,222,255,0.15),transparent_55%)]"
            />
            <div className="relative grid grid-cols-12 items-center gap-y-8 sm:gap-x-12">
              <div className="col-span-12 sm:col-span-7">
                <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                  Email direct
                </span>
                <a
                  href={`mailto:${EMAIL}`}
                  className="mt-5 block break-words font-display font-medium leading-[0.96] tracking-[-0.025em] text-foreground transition-colors hover:text-primary"
                  style={{ fontSize: "clamp(1.6rem, 4.6vw, 3.8rem)" }}
                >
                  {EMAIL}
                </a>
                <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Réponse sous 48 à 72 heures les jours ouvrés. Sois précis, on
                  gagne tous du temps.
                </p>
              </div>
              <div className="col-span-12 flex sm:col-span-5 sm:justify-end">
                <a
                  href={`mailto:${EMAIL}`}
                  className="inline-flex h-14 items-center gap-3 rounded-full bg-primary px-7 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-transform hover:scale-[1.02] sm:h-16 sm:px-9 sm:text-sm"
                >
                  Ouvrir mon mail
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-coal-900 text-primary">
                    <Mail className="h-4 w-4" />
                  </span>
                </a>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* Rubriques par usage */}
      <section className="relative surface-2 text-foreground">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          <div className="mb-10 flex items-center gap-3 sm:mb-14">
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
              § Six raisons d&apos;écrire
            </span>
          </div>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {REASONS.map((r) => (
              <ReasonCard key={r.title} {...r} />
            ))}
          </div>
        </div>
      </section>

      {/* Bonnes pratiques */}
      <section className="relative surface-1 text-foreground">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px divider-glow" />
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          <div className="grid grid-cols-12 gap-y-8 sm:gap-x-12">
            <div className="col-span-12 sm:col-span-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
                § Pour un échange rapide
              </span>
            </div>
            <div className="col-span-12 sm:col-span-8">
              <h2
                className="font-display font-medium leading-[0.96] tracking-[-0.02em] text-balance"
                style={{ fontSize: "clamp(1.5rem, 3.8vw, 2.8rem)" }}
              >
                Quelques infos qui nous{" "}
                <span className="italic text-primary glow-ice-text">font gagner</span>{" "}
                du temps.
              </h2>
              <ul className="mt-8 space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                <li className="flex gap-3">
                  <span className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-primary" />
                  <span>
                    Pour une correction sur une fiche : précise l&apos;URL du
                    site concerné et la donnée à modifier.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-primary" />
                  <span>
                    Pour un site à ajouter : nom, commune, type de roche,
                    cotation min et max, coordonnées GPS si tu les as.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-primary" />
                  <span>
                    Pour les gérants de salle : nom de l&apos;établissement,
                    adresse, type de pratique (bloc, voie, mixte), URL du site
                    officiel.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-primary" />
                  <span>
                    Pour la presse ou les partenariats : indique ton média ou
                    ta marque, et le périmètre envisagé. On revient vers toi
                    avec un cadre clair.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function ReasonCard({
  icon: Icon,
  title,
  body,
  subject,
}: Reason) {
  const href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`;
  return (
    <a
      href={href}
      className="group relative flex flex-col gap-4 bg-coal-900 p-6 transition-colors hover:bg-[#1a1a1a] sm:p-8"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary transition-colors group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="h-4 w-4" />
      </span>
      <h3
        className="font-display font-medium tracking-[-0.02em]"
        style={{ fontSize: "clamp(1.2rem, 2.4vw, 1.6rem)" }}
      >
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
        {body}
      </p>
      <span className="mt-auto pt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-primary">
        Écrire à ce sujet →
      </span>
    </a>
  );
}

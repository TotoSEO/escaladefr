import type { Metadata } from "next";
import Link from "next/link";

import { PageShell, PageHeader } from "@/components/page-shell";

const EMAIL = "contact@escalade-france.fr";

export const metadata: Metadata = {
  title: "Mentions légales · escalade-france.fr",
  description:
    "Mentions légales d'escalade-france.fr : éditeur, hébergement, propriété intellectuelle, données personnelles, cookies et droit applicable.",
  alternates: { canonical: "/mentions-legales" },
};

export default function MentionsLegalesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://escalade-france.fr/mentions-legales",
    url: "https://escalade-france.fr/mentions-legales",
    name: "Mentions légales",
    description:
      "Mentions légales du site escalade-france.fr conformes à la LCEN.",
    isPartOf: { "@id": "https://escalade-france.fr/#website" },
  };

  return (
    <PageShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader
        section="§ Légal"
        status="live"
        surface="warm"
        title={
          <>
            Mentions
            <br />
            <span className="italic text-primary glow-ice-text">
              légales
            </span>
            .
          </>
        }
        subtitle="Informations obligatoires sur l'éditeur, l'hébergement, la propriété intellectuelle et le traitement des données personnelles, conformément à la loi française."
      />

      <section className="relative surface-1 text-foreground">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12">
          <article className="space-y-14 text-base leading-relaxed text-foreground/90 sm:text-lg">
            <Section number="01" title="Éditeur du site">
              <p>
                Le site <strong>escalade-france.fr</strong> est édité par{" "}
                <strong>T.O</strong>, personne morale ayant pour activité la
                publication d&apos;un annuaire indépendant des sites naturels
                d&apos;escalade et des salles d&apos;escalade en France.
              </p>
              <Kv label="Contact éditorial" value={EMAIL} link={`mailto:${EMAIL}`} />
              <Kv label="Site" value="escalade-france.fr" />
              <Kv label="Langue de publication" value="Français (fr-FR)" />
            </Section>

            <Section number="02" title="Directeur de la publication">
              <p>
                Le directeur de la publication est T.O, joignable à
                l&apos;adresse{" "}
                <a
                  href={`mailto:${EMAIL}`}
                  className="text-primary underline underline-offset-4 hover:text-foreground"
                >
                  {EMAIL}
                </a>
                .
              </p>
            </Section>

            <Section number="03" title="Hébergement du site (front-end)">
              <p>
                Le site est hébergé et distribué via le réseau de diffusion de
                contenu de Vercel Inc., qui assure l&apos;exécution du
                front-end Next.js.
              </p>
              <Kv label="Société" value="Vercel Inc." />
              <Kv
                label="Adresse"
                value="340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis"
              />
              <Kv label="Téléphone" value="+1 (559) 288-7060" />
              <Kv
                label="Site"
                value="vercel.com"
                link="https://vercel.com"
              />
            </Section>

            <Section number="04" title="Hébergement de la base de données">
              <p>
                Les données fonctionnelles du site (catalogue des sites
                naturels d&apos;escalade, annuaire des salles indoor) sont
                stockées dans une base PostgreSQL gérée par{" "}
                <strong>Supabase</strong>, dont les serveurs sont hébergés en
                Europe, dans la région AWS Paris (eu-west-3). Aucune donnée
                personnelle d&apos;utilisateur n&apos;y est stockée à ce jour.
              </p>
              <Kv label="Société" value="Supabase Inc." />
              <Kv
                label="Région d'hébergement"
                value="Paris, France (AWS eu-west-3)"
              />
              <Kv
                label="Site"
                value="supabase.com"
                link="https://supabase.com"
              />
            </Section>

            <Section number="05" title="Propriété intellectuelle">
              <p>
                L&apos;ensemble des éléments éditoriaux du site (mises en page,
                textes rédactionnels, illustrations, charte graphique,
                identité visuelle, organisation des données, programmation,
                code source) sont la propriété exclusive de l&apos;éditeur ou
                font l&apos;objet d&apos;une autorisation d&apos;utilisation
                pour les éléments tiers.
              </p>
              <p>
                Les données factuelles (coordonnées GPS, cotations, accès) sont
                issues de sources publiques officielles auxquelles il est fait
                référence sur les pages concernées. Les contenus rédactionnels
                qui accompagnent ces données (présentations, conseils, analyses
                par département) sont des productions originales de la
                rédaction d&apos;escalade-france.fr.
              </p>
              <p>
                Les données concernant les salles d&apos;escalade indoor sont
                issues d&apos;OpenStreetMap et restent soumises à la licence{" "}
                <a
                  href="https://opendatacommons.org/licenses/odbl/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline underline-offset-4 hover:text-foreground"
                >
                  ODbL
                </a>{" "}
                (Open Database License). L&apos;attribution «{" "}
                <em>© OpenStreetMap contributors</em> » est affichée sur les
                cartes les utilisant.
              </p>
              <p>
                Toute reproduction, représentation, modification, publication
                ou adaptation de tout ou partie des éléments du site, quel que
                soit le moyen ou le procédé utilisé, est interdite sans
                l&apos;autorisation écrite préalable de l&apos;éditeur, sauf
                exceptions prévues par la loi.
              </p>
            </Section>

            <Section number="06" title="Données personnelles et RGPD">
              <p>
                À ce jour, le site escalade-france.fr ne collecte aucune donnée
                personnelle de ses visiteurs. Il n&apos;y a pas de compte
                utilisateur, pas de formulaire de contact stocké en base, pas
                de système de commentaires.
              </p>
              <p>
                La prise de contact se fait exclusivement par email à
                l&apos;adresse{" "}
                <a
                  href={`mailto:${EMAIL}`}
                  className="text-primary underline underline-offset-4 hover:text-foreground"
                >
                  {EMAIL}
                </a>
                . Les emails reçus ne sont utilisés que pour répondre à la
                demande de l&apos;expéditeur et ne sont pas exploités à des
                fins commerciales. Conformément au Règlement Général sur la
                Protection des Données (RGPD) et à la loi Informatique et
                Libertés, tout utilisateur qui nous a écrit dispose d&apos;un
                droit d&apos;accès, de rectification et de suppression de ses
                données. Pour exercer ce droit, il suffit d&apos;envoyer une
                demande à la même adresse.
              </p>
              <p>
                Si des fonctionnalités nécessitant une collecte de données sont
                ajoutées au site (formulaire de contact stocké, compte
                utilisateur, newsletter), la présente politique sera mise à
                jour et un consentement explicite sera demandé.
              </p>
            </Section>

            <Section number="07" title="Cookies et traceurs">
              <p>
                Le site n&apos;utilise aucun cookie publicitaire et aucun
                traceur tiers à des fins commerciales. Les seuls cookies
                techniques susceptibles d&apos;être déposés concernent le bon
                fonctionnement du site (préférences d&apos;affichage,
                identifiant de session anonyme côté hébergeur). Aucune donnée
                permettant d&apos;identifier l&apos;utilisateur n&apos;est
                stockée.
              </p>
              <p>
                Si des outils d&apos;analyse d&apos;audience sont ajoutés à
                l&apos;avenir, ils seront configurés en mode respectueux de la
                vie privée (anonymisation IP, exclusion des données
                personnelles) ou soumis à un consentement explicite via une
                bannière dédiée.
              </p>
            </Section>

            <Section number="08" title="Sources des données">
              <p>
                Les fiches des sites naturels d&apos;escalade reprennent des
                données issues du recensement public officiel des sites
                naturels d&apos;escalade en France. Ces données factuelles
                (coordonnées GPS, cotations, accès, périodes favorables) sont
                affichées telles quelles. Les contenus rédactionnels qui
                accompagnent ou augmentent ces données sont des productions
                originales de la rédaction.
              </p>
              <p>
                Les fiches des salles d&apos;escalade indoor sont compilées à
                partir d&apos;OpenStreetMap (© OpenStreetMap contributors,
                ODbL), enrichies par les sites officiels des établissements.
              </p>
              <p>
                Les fonds de carte interactive utilisent les tuiles vectorielles
                Dark Matter de CARTO, basées sur les données OpenStreetMap.
                L&apos;attribution complète est visible sur chaque carte.
              </p>
            </Section>

            <Section number="09" title="Limitation de responsabilité">
              <p>
                Le site fournit des informations à caractère général sur
                l&apos;escalade en France. Ces informations ne se substituent
                en aucun cas à l&apos;expertise d&apos;un guide de haute
                montagne, d&apos;un moniteur diplômé, d&apos;un topo papier
                récent ou de l&apos;expérience personnelle nécessaire à la
                pratique de l&apos;escalade en sécurité.
              </p>
              <p>
                L&apos;escalade est une activité comportant des risques
                inhérents. L&apos;utilisateur reste seul responsable de
                l&apos;évaluation de ces risques, du choix de son matériel, de
                sa préparation physique et technique, et du respect des
                réglementations locales (arrêtés municipaux, restrictions
                saisonnières, accords avec les propriétaires fonciers,
                protection de la faune et de la flore).
              </p>
              <p>
                L&apos;éditeur ne saurait être tenu responsable d&apos;un
                quelconque dommage résultant de l&apos;utilisation des
                informations diffusées sur le site.
              </p>
            </Section>

            <Section number="10" title="Liens externes">
              <p>
                Le site peut contenir des liens vers d&apos;autres sites
                internet. L&apos;éditeur n&apos;exerce aucun contrôle sur ces
                sites tiers et décline toute responsabilité quant à leur
                contenu et à leurs pratiques en matière de protection des
                données personnelles.
              </p>
            </Section>

            <Section number="11" title="Droit applicable">
              <p>
                Les présentes mentions légales sont régies par le droit
                français. En cas de litige, et après tentative de recherche
                d&apos;une solution amiable, les tribunaux français seront
                seuls compétents.
              </p>
            </Section>

            <Section number="12" title="Modification des présentes mentions">
              <p>
                L&apos;éditeur se réserve la possibilité de modifier la présente
                page à tout moment, notamment pour refléter les évolutions
                techniques, légales ou éditoriales du site. La date de dernière
                mise à jour fait foi.
              </p>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                Dernière mise à jour : mai 2026.
              </p>
            </Section>

            <div className="border-t border-white/10 pt-10">
              <Link
                href="/contact"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors hover:border-primary hover:text-primary"
              >
                Une question sur ces mentions ?
              </Link>
            </div>
          </article>
        </div>
      </section>
    </PageShell>
  );
}

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <header className="mb-5 flex items-baseline gap-4">
        <span className="font-mono text-xs tabular-nums text-primary">{number}</span>
        <h2
          className="font-display font-medium tracking-[-0.02em]"
          style={{ fontSize: "clamp(1.3rem, 2.6vw, 1.875rem)" }}
        >
          {title}
        </h2>
      </header>
      <div className="space-y-4 pl-0 sm:pl-12">{children}</div>
    </section>
  );
}

function Kv({
  label,
  value,
  link,
}: {
  label: string;
  value: string;
  link?: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-l-2 border-white/10 pl-4 sm:flex-row sm:items-baseline sm:gap-4">
      <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:w-44">
        {label}
      </span>
      {link ? (
        <a
          href={link}
          className="text-primary underline underline-offset-4 hover:text-foreground"
          target={link.startsWith("http") ? "_blank" : undefined}
          rel={link.startsWith("http") ? "noreferrer" : undefined}
        >
          {value}
        </a>
      ) : (
        <span>{value}</span>
      )}
    </div>
  );
}

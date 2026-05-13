import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://escalade-france.fr"),
  title: {
    default: "escalade-france.fr — Sites naturels & salles d'escalade",
    template: "%s | escalade-france.fr",
  },
  description:
    "Annuaire complet des sites naturels d'escalade et des salles d'escalade en France. Cotations, accès, périodes favorables, cartographie.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "escalade-france.fr",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="antialiased">{children}</body>
    </html>
  );
}

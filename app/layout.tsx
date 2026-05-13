import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import { ThemeProvider } from "next-themes";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://escalade-france.fr"),
  title: {
    default: "escalade-france.fr — Sites naturels et salles d'escalade",
    template: "%s · escalade-france.fr",
  },
  description:
    "Annuaire indépendant des sites naturels d'escalade et des salles d'escalade en France. Cotations, accès, périodes favorables, cartographie.",
  applicationName: "escalade-france.fr",
  keywords: [
    "escalade",
    "falaise",
    "site naturel d'escalade",
    "SNE",
    "salle d'escalade",
    "topo escalade",
    "France",
  ],
  authors: [{ name: "escalade-france.fr" }],
  creator: "escalade-france.fr",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "escalade-france.fr",
    title: "escalade-france.fr — Sites naturels et salles d'escalade",
    description:
      "L'annuaire indépendant de l'escalade en France : outdoor, indoor, équipement.",
  },
  twitter: {
    card: "summary_large_image",
    title: "escalade-france.fr",
    description: "L'annuaire indépendant de l'escalade en France.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#14110d" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${fraunces.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-dvh flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

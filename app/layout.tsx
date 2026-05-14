import type { Metadata, Viewport } from "next";
import { Manrope, Fraunces, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://escalade-france.fr"),
  title: {
    default: "escalade-france.fr · sites naturels et salles d'escalade",
    template: "%s",
  },
  description:
    "Annuaire indépendant de l'escalade en France. 3 500 sites naturels, salles indoor, cartographie, cotations, équipement testé.",
  applicationName: "escalade-france.fr",
  keywords: [
    "escalade",
    "site d'escalade",
    "spot escalade",
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
    title: "escalade-france.fr · sites naturels et salles d'escalade",
    description: "L'annuaire indépendant de l'escalade en France.",
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
  themeColor: "#050505",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${manrope.variable} ${fraunces.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
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

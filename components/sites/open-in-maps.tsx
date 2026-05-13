"use client";

import { Navigation } from "lucide-react";

type Props = {
  latitude: number;
  longitude: number;
  label: string;
};

/**
 * Bouton qui ouvre la localisation dans l'app de cartographie native :
 * - iOS Safari → Plans.app via maps:// scheme
 * - Android → Google Maps via geo: intent
 * - Desktop / autre → Google Maps web
 *
 * On utilise un lien <a> avec href Google Maps universel ; sur iOS on
 * intercepte au clic pour rediriger vers maps:// si possible.
 */
export function OpenInMaps({ latitude, longitude, label }: Props) {
  const lat = latitude.toFixed(6);
  const lon = longitude.toFixed(6);
  // URL universelle Google Maps avec point exact + libellé.
  const gmaps = `https://www.google.com/maps?q=${lat},${lon}(${encodeURIComponent(label)})`;

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (typeof window === "undefined") return;
    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    if (isIOS) {
      e.preventDefault();
      // Schéma natif Apple Plans, fallback Google Maps si non géré.
      const apple = `maps://?q=${encodeURIComponent(label)}&ll=${lat},${lon}`;
      window.location.href = apple;
      // En cas de non-prise en charge, on retombe sur gmaps après 600 ms.
      setTimeout(() => {
        window.location.href = gmaps;
      }, 700);
    }
    // Android / Desktop : on laisse le lien Google Maps standard, qui ouvre
    // l'app Maps Android si installée (intent), sinon le navigateur.
  }

  return (
    <a
      href={gmaps}
      target="_blank"
      rel="noopener"
      onClick={handleClick}
      className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary-foreground transition-transform hover:scale-[1.02] active:scale-95 sm:h-12 sm:px-6"
    >
      <Navigation className="h-4 w-4" />
      Ouvrir dans Maps
    </a>
  );
}

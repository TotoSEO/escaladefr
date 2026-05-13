"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string; tag?: string };

const NAV: NavItem[] = [
  { label: "Sites naturels", href: "/sites" },
  { label: "Salles", href: "/salles", tag: "bientôt" },
  { label: "Blog", href: "/blog", tag: "bientôt" },
  { label: "Outils", href: "/outils", tag: "bientôt" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 w-full transition-all duration-500",
        scrolled
          ? "border-b border-white/10 bg-coal-900/85 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:h-20 sm:px-8 lg:px-12">
        {/* Logo asymétrique */}
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-display text-xl font-medium tracking-[-0.02em] sm:text-2xl">
            escalade
          </span>
          <span className="font-display text-xl font-medium italic tracking-[-0.02em] text-primary glow-ice-text sm:text-2xl">
            .france
          </span>
          <span className="hidden text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:inline">
            .fr
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative inline-flex items-baseline gap-1.5 px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-foreground"
                    : "text-foreground/70 hover:text-foreground"
                )}
              >
                <span>{item.label}</span>
                {item.tag && (
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                    {item.tag}
                  </span>
                )}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* CTA boutique + burger */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/boutique"
            className="group relative hidden h-10 items-center gap-2 overflow-hidden rounded-full bg-accent px-4 text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-6px_rgba(255,122,38,0.6)] sm:inline-flex"
          >
            <ShoppingBag className="h-3.5 w-3.5 transition-transform group-hover:rotate-[-8deg]" />
            <span>Boutique</span>
            <span
              aria-hidden
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 group-hover:translate-x-full"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full pulse-ice opacity-0 group-hover:opacity-100"
              style={{
                animation: "pulse-ice 1.4s ease-out infinite",
                boxShadow: "0 0 0 0 rgba(255,122,38,0.6)",
              }}
            />
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              aria-label="Ouvrir le menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-foreground transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-11 sm:w-11 lg:hidden"
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-full border-l-0 bg-coal-900 p-0 sm:max-w-md"
            >
              <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
              <SheetDescription className="sr-only">
                Navigation principale
              </SheetDescription>

              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                  <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                    Menu
                  </span>
                  <button
                    onClick={() => setOpen(false)}
                    aria-label="Fermer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 transition-colors hover:bg-white/5"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <AnimatePresence>
                  {open && (
                    <motion.nav
                      initial="closed"
                      animate="open"
                      exit="closed"
                      variants={{
                        open: { transition: { staggerChildren: 0.07 } },
                        closed: { transition: { staggerChildren: 0.02 } },
                      }}
                      className="flex flex-1 flex-col gap-1 px-2 py-8"
                    >
                      {NAV.map((item, i) => (
                        <motion.div
                          key={item.href}
                          variants={{
                            open: { opacity: 1, y: 0 },
                            closed: { opacity: 0, y: 24 },
                          }}
                          transition={{
                            duration: 0.35,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        >
                          <Link
                            href={item.href}
                            className={cn(
                              "group flex items-baseline justify-between gap-3 border-b border-white/5 px-4 py-5 font-display text-3xl font-medium tracking-[-0.02em] transition-colors sm:text-4xl",
                              pathname === item.href
                                ? "text-primary"
                                : "text-foreground hover:text-primary"
                            )}
                          >
                            <span className="flex items-baseline gap-3">
                              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                                0{i + 1}
                              </span>
                              {item.label}
                            </span>
                            {item.tag && (
                              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
                                {item.tag}
                              </span>
                            )}
                          </Link>
                        </motion.div>
                      ))}
                    </motion.nav>
                  )}
                </AnimatePresence>

                {/* CTA boutique en bas */}
                <div className="border-t border-white/10 p-6">
                  <Link
                    href="/boutique"
                    className="group relative flex h-14 items-center justify-center gap-3 overflow-hidden rounded-full bg-accent px-6 font-semibold uppercase tracking-[0.2em] text-accent-foreground"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Boutique
                    <span
                      aria-hidden
                      className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full"
                    />
                  </Link>
                  <p className="mt-4 font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] text-muted-foreground">
                    Annuaire indépendant · données FFME · 2026
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

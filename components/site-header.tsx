"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Mountain } from "lucide-react";
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
  { label: "Cartes", href: "/carte" },
  { label: "Salles", href: "/salles", tag: "bientôt" },
  { label: "Guides", href: "/guides", tag: "bientôt" },
  { label: "Boutique", href: "/boutique", tag: "bientôt" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
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
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/85 backdrop-blur-md"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2 font-display text-lg sm:text-xl"
        >
          <span className="relative flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground transition-transform duration-300 group-hover:rotate-[-6deg]">
            <Mountain className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="font-semibold tracking-tight">
            escalade<span className="text-primary">-france</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>{item.label}</span>
                {item.tag && (
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {item.tag}
                  </span>
                )}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile burger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            aria-label="Ouvrir le menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>

          <SheetContent
            side="right"
            className="w-full border-l-0 bg-background p-0 sm:max-w-md"
          >
            <SheetTitle className="sr-only">Menu de navigation</SheetTitle>
            <SheetDescription className="sr-only">
              Navigation principale du site escalade-france.fr
            </SheetDescription>

            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-border/60 px-6 py-5">
                <span className="font-display text-xl font-semibold">
                  Menu
                </span>
              </div>

              <AnimatePresence>
                {open && (
                  <motion.nav
                    initial="closed"
                    animate="open"
                    exit="closed"
                    variants={{
                      open: { transition: { staggerChildren: 0.06 } },
                      closed: { transition: { staggerChildren: 0.02 } },
                    }}
                    className="flex flex-1 flex-col gap-1 px-4 py-6"
                  >
                    {NAV.map((item) => (
                      <motion.div
                        key={item.href}
                        variants={{
                          open: { opacity: 1, x: 0 },
                          closed: { opacity: 0, x: 24 },
                        }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                      >
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-baseline justify-between gap-3 rounded-lg px-4 py-4 font-display text-2xl font-medium transition-colors",
                            pathname === item.href
                              ? "bg-secondary text-foreground"
                              : "text-foreground/90 hover:bg-muted"
                          )}
                        >
                          <span>{item.label}</span>
                          {item.tag && (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-sans uppercase tracking-wide text-muted-foreground">
                              {item.tag}
                            </span>
                          )}
                        </Link>
                      </motion.div>
                    ))}
                  </motion.nav>
                )}
              </AnimatePresence>

              <div className="border-t border-border/60 px-6 py-6 text-sm text-muted-foreground">
                <p className="font-display text-base text-foreground">
                  En altitude depuis 2026
                </p>
                <p className="mt-1">
                  Données issues du recensement FFME.
                </p>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

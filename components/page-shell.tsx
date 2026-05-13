import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return <div className="pt-16 sm:pt-20">{children}</div>;
}

export function PageHeader({
  section,
  title,
  subtitle,
  status,
}: {
  section: string;
  title: ReactNode;
  subtitle?: string;
  status?: "live" | "soon" | "later";
}) {
  return (
    <header className="relative overflow-hidden border-b border-border bg-coal-900 text-foreground">
      <div
        aria-hidden
        className="absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-primary/[0.10] blur-[140px]"
      />
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-12 lg:py-32">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary">
            {section}
          </span>
          {status && <StatusPill status={status} />}
        </div>
        <h1 className="mt-6 max-w-5xl font-display text-[12vw] font-medium leading-[0.9] tracking-[-0.025em] sm:mt-10 sm:text-[7vw] lg:text-[5.4vw]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:mt-8 sm:text-lg">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}

function StatusPill({ status }: { status: "live" | "soon" | "later" }) {
  const label = status === "live" ? "En ligne" : status === "soon" ? "En cours" : "À venir";
  const live = status === "live";
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] ${
        live
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-white/15 bg-white/5 text-muted-foreground"
      }`}
    >
      {live && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
        </span>
      )}
      {label}
    </span>
  );
}

import { cn } from "@/lib/utils";

type LogoMarkProps = {
  className?: string;
  title?: string;
};

export function LogoMark({ className, title = "escalade-france.fr" }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={cn("h-7 w-7 sm:h-8 sm:w-8", className)}
    >
      <title>{title}</title>
      <path d="M4 27 L16 6 L28 27 Z" fill="currentColor" />
      <path
        d="M18 27 L13 21 L17 16 L14 11 L16 6"
        fill="none"
        stroke="#ff7a26"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={16} cy={6} r={2} fill="#ff7a26" />
    </svg>
  );
}

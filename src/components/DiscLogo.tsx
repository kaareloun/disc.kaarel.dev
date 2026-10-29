import { cn } from "~/lib/utils";

export function DiscLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-8", className)}>
      <circle cx="16" cy="16" r="15" className="fill-primary" />
      <circle
        cx="16"
        cy="16"
        r="10.5"
        fill="none"
        strokeWidth="1.5"
        className="stroke-primary-foreground/30"
      />
      <circle cx="16" cy="16" r="3" className="fill-primary-foreground/90" />
      <path
        d="M9 11.5c2.5-2.6 6.4-3.4 9.6-2"
        fill="none"
        strokeWidth="1.6"
        strokeLinecap="round"
        className="stroke-primary-foreground/70"
      />
    </svg>
  );
}

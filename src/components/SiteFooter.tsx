import { cn } from "~/lib/utils";

type Props = {
  updated: string;
  stale: boolean;
  className?: string;
};

export function SiteFooter({ updated, stale, className }: Props) {
  return (
    <footer
      className={cn(
        "flex flex-wrap justify-between gap-2 text-sm text-muted-foreground",
        className,
      )}
    >
      <span>
        Data from{" "}
        <a
          href="https://discgolfmetrix.com"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Disc Golf Metrix
        </a>
      </span>
      <span className="flex flex-wrap items-baseline gap-x-6">
        <span className={cn(stale && "font-semibold text-destructive")}>
          Updated {updated}
        </span>
        <a
          href="https://kaarel.dev/?ref=disc"
          className="text-xs text-muted-foreground/70 transition-colors hover:text-foreground"
        >
          Site by{" "}
          <span className="underline decoration-muted-foreground/30 underline-offset-2">
            kaarel.dev
          </span>
        </a>
      </span>
    </footer>
  );
}

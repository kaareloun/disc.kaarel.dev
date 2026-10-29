import { cn } from "~/lib/utils";
import type { CourseHole } from "~/types";
import { formatAverageDiff } from "~/utils/score";

type Props = {
  holes: CourseHole[];
  activeHole: number | null;
  onActiveHoleChange: (index: number | null) => void;
};

export function HoleStrip({ holes, activeHole, onActiveHoleChange }: Props) {
  const hasStats = holes.some((hole) => hole.birdiePct != null);
  const showLength = holes.every((hole) => hole.lengthM != null);

  return (
    <div className="space-y-2">
      <ol
        className="-mx-1 flex flex-wrap gap-1"
        aria-label="Holes"
        onMouseLeave={() => onActiveHoleChange(null)}
      >
        {holes.map((hole, index) => {
          const averageDiff =
            hole.averageScore != null && hole.par != null ? hole.averageScore - hole.par : null;

          return (
            <li key={index}>
              <button
                type="button"
                onMouseEnter={() => onActiveHoleChange(index)}
                onFocus={() => onActiveHoleChange(index)}
                onClick={() => onActiveHoleChange(activeHole === index ? null : index)}
                aria-pressed={activeHole === index}
                title={
                  hole.averageScore != null
                    ? `Hole ${hole.label}: average ${hole.averageScore}`
                    : `Hole ${hole.label}`
                }
                className={cn(
                  "flex w-11 flex-col items-center gap-1 rounded-lg py-1.5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  activeHole === index ? "bg-primary/10" : "hover:bg-muted",
                )}
              >
                <span
                  className={cn(
                    "text-sm font-semibold leading-none tabular",
                    activeHole === index && "text-primary",
                  )}
                >
                  {hole.label}
                </span>
                <span className="text-[0.7rem] leading-none text-muted-foreground tabular">
                  {hole.par != null ? `P${hole.par}` : "–"}
                </span>
                {hasStats && (
                  <span className="flex h-10 w-2.5 flex-col overflow-hidden rounded-full bg-muted" aria-hidden="true">
                    <span className="bg-destructive/70" style={{ height: `${hole.bogeyPct ?? 0}%` }} />
                    <span className="bg-muted-foreground/25" style={{ height: `${hole.parPct ?? 0}%` }} />
                    <span className="bg-primary" style={{ height: `${hole.birdiePct ?? 0}%` }} />
                  </span>
                )}
                <span className="text-[0.7rem] leading-none text-muted-foreground tabular">
                  {showLength ? `${hole.lengthM}m` : averageDiff != null ? formatAverageDiff(averageDiff) : ""}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {hasStats && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary" />
            Birdie or better
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-muted-foreground/40" />
            Par
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-destructive/70" />
            Bogey or worse
          </span>
        </div>
      )}
    </div>
  );
}

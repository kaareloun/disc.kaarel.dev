import type { CourseUsageMonth } from "~/types";
import { formatMonth } from "~/utils/time";

export function CourseUsage({ usage }: { usage: CourseUsageMonth[] }) {
  const max = Math.max(...usage.map((month) => month.players), 1);
  const first = usage.at(0);
  const last = usage.at(-1);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-xs text-muted-foreground">
        <span>Players per month</span>
        {last && (
          <span>
            <span className="tabular font-semibold text-foreground">
              {last.players}
            </span>{" "}
            in {formatMonth(new Date(last.month), "MMMM")}
          </span>
        )}
      </div>
      <ol
        className="mt-2 flex h-12 items-end gap-1"
        aria-label="Players per month"
      >
        {usage.map((month, index) => (
          <li
            key={month.month}
            title={`${formatMonth(new Date(month.month))}: ${month.players} players, ${month.rounds} rounds`}
            className={
              index === usage.length - 1
                ? "flex-1 rounded-[3px] bg-primary"
                : "flex-1 rounded-[3px] bg-muted-foreground/25"
            }
            style={{ height: `${Math.max((month.players / max) * 100, 4)}%` }}
          >
            <span className="sr-only">
              {formatMonth(new Date(month.month))}: {month.players} players
            </span>
          </li>
        ))}
      </ol>
      {first && last && usage.length > 1 && (
        <div className="mt-1 flex justify-between text-[0.7rem] text-muted-foreground">
          <span>{formatMonth(new Date(first.month))}</span>
          <span>{formatMonth(new Date(last.month))}</span>
        </div>
      )}
    </div>
  );
}

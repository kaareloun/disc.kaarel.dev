import { RADIUS_OPTIONS_KM } from "~/constants";
import type { Filters } from "~/types";

const DAY_TEXT: Record<Filters["day"], string> = {
  all: "in the next 30 days",
  today: "today",
  tomorrow: "tomorrow",
  weekend: "this weekend",
  week: "in the next 7 days",
};

type Props = {
  filters: Filters;
  onChange: (filters: Partial<Filters>) => void;
};

export function EmptyState({ filters, onChange }: Props) {
  const widerRadius = RADIUS_OPTIONS_KM.find((km) => km > filters.radiusKm);
  const buttonClass =
    "pressable h-10 rounded-full bg-foreground px-5 text-sm font-semibold text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

  return (
    <div className="flex flex-col items-start gap-4 rounded-3xl border border-dashed px-6 py-10 sm:px-10">
      <p className="text-lg font-semibold">
        {filters.search
          ? `No rounds match “${filters.search}” ${DAY_TEXT[filters.day]}.`
          : `No rounds within ${filters.radiusKm} km ${DAY_TEXT[filters.day]}.`}
      </p>
      <div className="flex flex-wrap gap-2">
        {filters.search && (
          <button
            type="button"
            className={buttonClass}
            onClick={() => onChange({ search: "" })}
          >
            Clear search
          </button>
        )}
        {!filters.search && filters.location && widerRadius && (
          <button
            type="button"
            className={buttonClass}
            onClick={() => onChange({ radiusKm: widerRadius })}
          >
            Search within {widerRadius} km
          </button>
        )}
        {filters.day !== "all" && (
          <button
            type="button"
            className="pressable h-10 rounded-full border px-5 text-sm font-semibold hover:border-input"
            onClick={() => onChange({ day: "all" })}
          >
            Show all days
          </button>
        )}
      </div>
    </div>
  );
}

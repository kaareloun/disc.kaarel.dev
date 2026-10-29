import { Search, X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { DayFilter, Filters } from "~/types";
import { ChipGroup } from "./ChipGroup";

const DAY_OPTIONS: { value: DayFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "weekend", label: "Weekend" },
  { value: "week", label: "7 days" },
];

type Props = {
  filters: Filters;
  onChange: (filters: Partial<Filters>) => void;
};

export function Toolbar({ filters, onChange }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Day headers stick below the toolbar. They read its height from this variable.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const observer = new ResizeObserver(([entry]) => {
      document.documentElement.style.setProperty(
        "--toolbar-h",
        `${entry?.borderBoxSize[0]?.blockSize ?? root.offsetHeight}px`,
      );
    });
    observer.observe(root);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/" && document.activeElement?.tagName !== "INPUT") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      ref={rootRef}
      className="sticky top-0 z-20 -mx-4 bg-background px-4 py-3 sm:-mx-6 sm:px-6"
    >
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <label className="relative flex h-10 w-full items-center sm:flex-1">
          <Search className="pointer-events-none absolute left-3.5 size-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="search"
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                onChange({ search: "" });
                event.currentTarget.blur();
              }
            }}
            placeholder="Search course, series or town"
            aria-label="Search competitions"
            className="h-full w-full rounded-full border bg-card pl-10 pr-10 text-base outline-none transition-colors placeholder:text-muted-foreground hover:border-input focus:border-primary sm:text-sm [&::-webkit-search-cancel-button]:hidden"
          />
          {filters.search ? (
            <button
              type="button"
              onClick={() => {
                onChange({ search: "" });
                inputRef.current?.focus();
              }}
              aria-label="Clear search"
              className="absolute right-2 grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          ) : (
            <kbd className="pointer-events-none absolute right-3.5 hidden rounded border px-1.5 text-xs text-muted-foreground sm:block">
              /
            </kbd>
          )}
        </label>
        <div className="no-scrollbar -mx-4 flex overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ChipGroup
            label="Day"
            value={filters.day}
            options={DAY_OPTIONS}
            onChange={(day) => onChange({ day })}
          />
        </div>
      </div>
    </div>
  );
}

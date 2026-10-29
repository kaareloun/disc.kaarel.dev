import { ChevronDown, LocateFixed, MapPin } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { PLACES, RADIUS_OPTIONS_KM } from "~/constants";
import { cn } from "~/lib/utils";
import type { UserLocation } from "~/types";
import { locationLabel } from "~/utils/places";
import { ChipGroup } from "./ChipGroup";

const RADIUS_OPTIONS = RADIUS_OPTIONS_KM.map((km) => ({
  value: km as number,
  label: `${km} km`,
}));

type Props = {
  location: UserLocation | null;
  locating: boolean;
  onLocate: () => void;
  onPick: (location: UserLocation) => void;
  radiusKm: number;
  onRadiusChange: (radiusKm: number) => void;
};

export function LocationPicker({
  location,
  locating,
  onLocate,
  onPick,
  radiusKm,
  onRadiusChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const label = locating && !location ? "Locating…" : (locationLabel(location) ?? "Set location");

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="pressable flex h-10 items-center gap-2 rounded-full border bg-card pl-3 pr-2.5 text-sm font-medium transition-colors hover:border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <MapPin className={cn("size-4 text-primary", locating && "animate-pulse")} />
        <span className="max-w-[8rem] truncate">{label}</span>
        {location && (
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground tabular">
            {radiusKm} km
          </span>
        )}
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-200 ease-out",
            open && "rotate-180",
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12 } }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            style={{ transformOrigin: "top right" }}
            className="absolute right-0 top-12 z-30 w-[19.5rem] overflow-hidden rounded-2xl border bg-popover p-1.5 shadow-xl shadow-black/10"
          >
            {location && (
              <div className="px-1.5 pb-2 pt-1.5">
                <p className="px-1.5 pb-2 text-xs font-medium text-muted-foreground">
                  Show rounds within
                </p>
                <ChipGroup
                  label="Distance"
                  value={radiusKm}
                  options={RADIUS_OPTIONS}
                  onChange={onRadiusChange}
                  className="w-full [&>button]:flex-1 [&>button]:px-0"
                />
              </div>
            )}
            {location && <div className="my-1 h-px bg-border" />}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onLocate();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-primary hover:bg-muted"
            >
              <LocateFixed className="size-4" />
              Use my location
            </button>
            <div className="my-1 h-px bg-border" />
            <div className="max-h-72 overflow-y-auto">
              {PLACES.map((place) => (
                <button
                  key={place.name}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onPick({ lat: place.lat, lon: place.lon, placeName: place.name });
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center rounded-xl px-3 py-2 text-left text-sm hover:bg-muted",
                    location?.placeName === place.name && "font-semibold",
                  )}
                >
                  {place.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

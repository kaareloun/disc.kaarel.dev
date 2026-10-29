import { LocateFixed } from "lucide-react";
import { PLACES } from "~/constants";
import type { UserLocation } from "~/types";

type Props = {
  locating: boolean;
  onLocate: () => void;
  onPick: (location: UserLocation) => void;
};

export function LocationPrompt({ locating, onLocate, onPick }: Props) {
  return (
    <section className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
      <h2 className="text-[1.6rem] font-bold leading-tight tracking-tight sm:text-3xl">
        {locating ? "Finding rounds near you…" : "Where do you play?"}
      </h2>
      <p className="mt-2 max-w-md text-[0.95rem] text-muted-foreground">
        {locating
          ? "Allow location access in your browser to see distances."
          : "Share your location or pick a town. The list then shows rounds close to it."}
      </p>
      <button
        type="button"
        onClick={onLocate}
        disabled={locating}
        className="pressable mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background disabled:opacity-60"
      >
        <LocateFixed className={locating ? "size-4 animate-spin" : "size-4"} />
        Use my location
      </button>
      <div className="mt-5 flex flex-wrap gap-1.5">
        {PLACES.map((place) => (
          <button
            key={place.name}
            type="button"
            onClick={() =>
              onPick({ lat: place.lat, lon: place.lon, placeName: place.name })
            }
            className="pressable h-9 rounded-full border px-3.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            {place.name}
          </button>
        ))}
      </div>
    </section>
  );
}

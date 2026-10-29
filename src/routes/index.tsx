import { createFileRoute } from "@tanstack/react-router";
import Cookies from "js-cookie";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CompetitionList } from "~/components/CompetitionList";
import { EmptyState } from "~/components/EmptyState";
import { LocationPrompt } from "~/components/LocationPrompt";
import { NextUp } from "~/components/NextUp";
import { Notice } from "~/components/Notice";
import { SiteHeader } from "~/components/SiteHeader";
import { Toolbar } from "~/components/Toolbar";
import {
  FETCH_INTERVAL_IN_HOURS,
  LOCATION_COOKIE,
  RADIUS_COOKIE,
} from "~/constants";
import { useNow } from "~/hooks/useNow";
import { cn } from "~/lib/utils";
import { getCompetitions } from "~/serverFunctions/getCompetitions";
import { getLastUpdate } from "~/serverFunctions/getLastUpdate";
import { getPreferences } from "~/serverFunctions/getPreferences";
import type { Filters, UserLocation } from "~/types";
import { filterCompetitions } from "~/utils/filterCompetitions";

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => {
    const [result, preferences] = await Promise.all([
      getCompetitions(),
      getPreferences(),
    ]);

    const lastUpdate = await getLastUpdate();

    return {
      competitions: result.competitions,
      fetchError: result.fetchError,
      source: result.source,
      lastUpdate,
      preferences,
      serverNow: Date.now(),
    };
  },
});

const COOKIE_OPTIONS = { path: "/", expires: 365 };

function Home() {
  const {
    competitions,
    fetchError,
    source,
    lastUpdate,
    preferences,
    serverNow,
  } = Route.useLoaderData();

  const now = useNow(serverNow);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    day: "all",
    radiusKm: preferences.radiusKm,
    location: preferences.location,
  });
  const [locating, setLocating] = useState(!preferences.location?.placeName);
  const [notice, setNotice] = useState<string | null>(null);
  const locationRef = useRef(filters.location);
  locationRef.current = filters.location;

  const updateFilters = useCallback((changes: Partial<Filters>) => {
    setFilters((current) => ({ ...current, ...changes }));
    if (changes.radiusKm) {
      Cookies.set(RADIUS_COOKIE, String(changes.radiusKm), COOKIE_OPTIONS);
    }
  }, []);

  const saveLocation = useCallback(
    (location: UserLocation) => {
      Cookies.set(LOCATION_COOKIE, JSON.stringify(location), COOKIE_OPTIONS);
      updateFilters({ location });
      setNotice(null);
    },
    [updateFilters],
  );

  const locate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setLocating(false);
      setNotice("This browser cannot share a location. Pick a town instead.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        saveLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => {
        setLocating(false);
        setNotice(
          locationRef.current
            ? "Your location did not refresh. Distances use the last saved location."
            : "Your browser did not share a location. Pick a town instead.",
        );
      },
      { maximumAge: 10 * 60 * 1000, timeout: 15_000 },
    );
  }, [saveLocation]);

  useEffect(() => {
    // A town picked by hand stays until the user changes it.
    if (!preferences.location?.placeName) {
      locate();
    }
  }, []);

  const visible = useMemo(
    () => filterCompetitions(competitions, filters, now),
    [competitions, filters, now],
  );
  const nextUp = visible[0];
  const stale = lastUpdate.diffInHours > FETCH_INTERVAL_IN_HOURS * 3;

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 pb-16 sm:px-6">
      <SiteHeader
        location={filters.location}
        locating={locating}
        onLocate={locate}
        onPick={saveLocation}
        radiusKm={filters.radiusKm}
        onRadiusChange={(radiusKm) => updateFilters({ radiusKm })}
      />

      <div className="space-y-3">
        {notice && filters.location && <Notice>{notice}</Notice>}
        {fetchError && (
          <Notice tone="error">
            Fresh data did not load ({fetchError}).{" "}
            {source === "cache" && competitions.length > 0
              ? "The list shows the last saved data."
              : null}
          </Notice>
        )}
      </div>

      {filters.location ? (
        <>
          <div className="mt-2">
            {nextUp && <NextUp competition={nextUp} now={now} />}
          </div>
          <div className="mt-4" />
          <Toolbar filters={filters} onChange={updateFilters} />
          <main className="mt-2">
            {visible.length > 0 ? (
              <CompetitionList competitions={visible} now={now} />
            ) : (
              <EmptyState filters={filters} onChange={updateFilters} />
            )}
          </main>
        </>
      ) : (
        <div className="mt-2">
          <LocationPrompt
            locating={locating}
            onLocate={locate}
            onPick={saveLocation}
          />
        </div>
      )}

      <footer className="mt-16 flex flex-wrap justify-between gap-2 border-t pt-6 text-sm text-muted-foreground">
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
        <span className={cn(stale && "font-semibold text-destructive")}>
          Updated {lastUpdate.distance}
        </span>
      </footer>
    </div>
  );
}

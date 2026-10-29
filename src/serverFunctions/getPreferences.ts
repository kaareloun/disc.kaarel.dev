import { createServerFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import {
  DEFAULT_RADIUS_KM,
  LOCATION_COOKIE,
  RADIUS_COOKIE,
  RADIUS_OPTIONS_KM,
} from "~/constants";
import type { UserLocation } from "~/types";
import { z } from "zod";

export const getPreferences = createServerFn().handler(async () => {
  return {
    location: readLocation(getCookie(LOCATION_COOKIE)),
    radiusKm: readRadius(getCookie(RADIUS_COOKIE)),
  };
});

const locationCookie = z.object({
  lat: z.number().finite(),
  lon: z.number().finite(),
  placeName: z.string().optional(),
});

function readLocation(value: string | undefined): UserLocation | null {
  if (!value) {
    return null;
  }

  try {
    return locationCookie.parse(JSON.parse(value));
  } catch {
    // A broken cookie means no saved location.
    return null;
  }
}

function readRadius(value: string | undefined) {
  const radius = Number(value);

  return (RADIUS_OPTIONS_KM as readonly number[]).includes(radius)
    ? radius
    : DEFAULT_RADIUS_KM;
}

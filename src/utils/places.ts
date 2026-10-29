import { getDistance } from "geolib";
import { PLACES } from "~/constants";
import type { UserLocation } from "~/types";

const NEAR_PLACE_METERS = 40_000;

export function locationLabel(location: UserLocation | null) {
  if (!location) {
    return null;
  }
  if (location.placeName) {
    return location.placeName;
  }

  const nearest = PLACES.map((place) => ({
    name: place.name,
    distance: getDistance(
      { latitude: location.lat, longitude: location.lon },
      { latitude: place.lat, longitude: place.lon },
    ),
  })).sort((a, b) => a.distance - b.distance)[0];

  return nearest && nearest.distance < NEAR_PLACE_METERS
    ? `Near ${nearest.name}`
    : "Your location";
}

export const directionsUrl = (lat: number, lon: number) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;

export const metrixUrl = (id: string) => `https://discgolfmetrix.com/${id}`;

export const courseUrl = (courseId: string) =>
  `https://discgolfmetrix.com/course/${courseId}`;

import { getDistance } from "geolib";
import type { CompetitionWithDistance, Filters } from "~/types";
import type { ParsedCompetition } from "./parseData";
import { matchesDay, roundStatus } from "./time";

export function filterCompetitions(
  competitions: ParsedCompetition[],
  filters: Filters,
  now: number,
): CompetitionWithDistance[] {
  const search = filters.search.trim().toLowerCase();

  return competitions
    .map((competition) => ({
      ...competition,
      distance: filters.location
        ? getDistance(
            { latitude: filters.location.lat, longitude: filters.location.lon },
            { latitude: competition.lat, longitude: competition.lon },
          )
        : null,
    }))
    .filter((competition) => {
      if (roundStatus(competition.startsAt, now) === "finished") {
        return false;
      }

      if (
        competition.distance != null &&
        competition.distance > filters.radiusKm * 1000
      ) {
        return false;
      }

      if (!matchesDay(competition.startsAt, now, filters.day)) {
        return false;
      }

      if (!search) {
        return true;
      }

      return [
        competition.name,
        competition.courseName,
        competition.layoutName ?? "",
        competition.description,
      ].some((field) => field.toLowerCase().includes(search));
    });
}

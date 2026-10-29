import type { ParsedCompetition } from "./utils/parseData";

export type CompetitionWithDistance = ParsedCompetition & {
  distance: number | null;
};

export type UserLocation = {
  lat: number;
  lon: number;
  // Set when the user picked a place by hand. Geolocation does not override it.
  placeName?: string;
};

export type DayFilter = "all" | "today" | "tomorrow" | "weekend" | "week";

export type Filters = {
  search: string;
  day: DayFilter;
  radiusKm: number;
  location: UserLocation | null;
};

export type CompetitionDetails = {
  players: number;
  divisions: { name: string; count: number }[];
  holes: number;
  par: number | null;
  comment: string;
  courseId: string | null;
};

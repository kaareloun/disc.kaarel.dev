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
  leaders: Leader[];
  course: Course | null;
};

export type Leader = {
  name: string;
  place: number;
  diff: number;
  holesPlayed: number;
};

export type CourseRecord = {
  player: string;
  score: number;
  diff: number;
  date: string | null;
  competitionId: string | null;
};

export type CourseUsageMonth = {
  month: string;
  players: number;
  rounds: number;
};

export type Course = {
  id: string;
  name: string;
  location: string | null;
  baskets: number | null;
  par: number | null;
  lengthM: number | null;
  parRating: number | null;
  record: CourseRecord | null;
  usage: CourseUsageMonth[];
  fetchedAt: string;
};

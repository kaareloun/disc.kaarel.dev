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

// Map coordinates are metres from the course centre. x points east, y points south.
export type Point = [number, number];

export type CourseHole = {
  label: string;
  par: number | null;
  lengthM: number | null;
  averageScore: number | null;
  birdiePct: number | null;
  parPct: number | null;
  bogeyPct: number | null;
  tee: Point | null;
  basket: Point | null;
  path: Point[];
  fairway: Point[];
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
  layoutName: string | null;
  location: string | null;
  baskets: number | null;
  par: number | null;
  lengthM: number | null;
  parRating: number | null;
  holes: CourseHole[];
  outOfBounds: Point[][];
  images: string[];
  record: CourseRecord | null;
  usage: CourseUsageMonth[];
  fetchedAt: string;
};

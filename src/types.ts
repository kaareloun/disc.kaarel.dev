import type { ParsedCompetition } from "./utils/parseData";

export type CompetitionWithDistance = ParsedCompetition & {
  distance: number;
};

export type Filters = {
  search: string;
  location: {
    lat: number;
    lon: number;
  } | null;
};

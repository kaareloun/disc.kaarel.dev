import type { parseData } from "./utils/parseData";

export type CompetitionWithDistance = ReturnType<typeof parseData>[number] & {
  distance: number;
};

export type Filters = {
  search: string;
  location: {
    lat: number;
    lon: number;
  } | null;
};

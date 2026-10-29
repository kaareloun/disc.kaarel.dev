export const LAST_FETCH_FILE = "src/data/lastFetch.txt";
export const DATA_FILE = "src/data/data.json";
export const COURSES_DIR = "src/data/courses";
export const COMPETITION_COURSES_FILE = "src/data/competitionCourses.json";

export const LOCATION_COOKIE = "location";
export const RADIUS_COOKIE = "radius";

export const RADIUS_OPTIONS_KM = [10, 25, 50, 100, 200] as const;
export const DEFAULT_RADIUS_KM = 50;

export const TIMEZONE = "Europe/Tallinn";

export const FETCH_INTERVAL_IN_HOURS = 1;

// Metrix has no end time. Most rounds finish within this window.
export const ROUND_DURATION_IN_HOURS = 3;

export const DETAILS_CACHE_TTL_MS = 15 * 60 * 1000;
export const LIVE_DETAILS_CACHE_TTL_MS = 60 * 1000;

// Course stats change slowly. The sync refreshes a course once a day.
export const COURSE_TTL_IN_HOURS = 24;
export const SYNC_CONCURRENCY = 4;
export const METRIX_URL = "https://discgolfmetrix.com";

export const PLACES = [
  { name: "Tallinn", lat: 59.437, lon: 24.7536 },
  { name: "Tartu", lat: 58.378, lon: 26.729 },
  { name: "Pärnu", lat: 58.3859, lon: 24.4971 },
  { name: "Narva", lat: 59.3797, lon: 28.1791 },
  { name: "Viljandi", lat: 58.3639, lon: 25.59 },
  { name: "Rakvere", lat: 59.3464, lon: 26.3558 },
  { name: "Kuressaare", lat: 58.2481, lon: 22.5039 },
  { name: "Haapsalu", lat: 58.943, lon: 23.5414 },
  { name: "Võru", lat: 57.8339, lon: 27.0194 },
  { name: "Paide", lat: 58.8856, lon: 25.5572 },
  { name: "Jõhvi", lat: 59.3592, lon: 27.4211 },
  { name: "Helsinki", lat: 60.1699, lon: 24.9384 },
  { name: "Riga", lat: 56.9496, lon: 24.1052 },
] as const;

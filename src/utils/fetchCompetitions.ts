import {
  LAST_FETCH_FILE,
  DATA_FILE,
  TIMEZONE,
  FETCH_INTERVAL_IN_HOURS,
} from "~/constants";
import fs from "node:fs";
import { add, differenceInHours } from "date-fns";
import { parseData } from "./parseData";
import { syncCourses } from "./syncCourses";
import { TZDate } from "@date-fns/tz";

import type { ParsedCompetition, ParseResult } from "./parseData";

export type CompetitionsResult = {
  competitions: ParsedCompetition[];
  skipped: number;
  fetchError: string | null;
  source: "live" | "cache";
};

export async function fetchCompetitions(): Promise<CompetitionsResult> {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]");
  }

  if (!fs.existsSync(LAST_FETCH_FILE)) {
    fs.writeFileSync(LAST_FETCH_FILE, "2000-01-01T00:00:00.000Z");
  }

  const lastFetchDate = fs.readFileSync(LAST_FETCH_FILE, "utf-8").trim();

  if (
    lastFetchDate &&
    differenceInHours(new Date(), new Date(lastFetchDate)) <=
      FETCH_INTERVAL_IN_HOURS
  ) {
    return readCache(null);
  }

  const today = new TZDate(new Date(), TIMEZONE);
  const rawData: unknown[] = [];
  const chunkErrors: string[] = [];

  for (let i = 0; i < 3; i++) {
    const startDate = add(today, { days: i * 10 })
      .toISOString()
      .split("T")[0];
    const endDate = add(today, { days: i * 10 + 10 })
      .toISOString()
      .split("T")[0];

    const params = new URLSearchParams({
      view: "3",
      date1: startDate,
      date2: endDate,
      sort_name: "date",
      sort_order: "desc",
      page: "all",
    });

    try {
      const res = await fetch(
        `https://discgolfmetrix.com/competitions_map_server.php?${params}`,
      );

      if (!res.ok) {
        throw new Error(`Upstream HTTP ${res.status}`);
      }

      const chunkData: unknown = await res.json();

      if (Array.isArray(chunkData)) {
        rawData.push(...chunkData);
      } else {
        throw new Error("Upstream returned non-array payload");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      chunkErrors.push(`Chunk ${i}: ${message}`);
    }
  }

  if (rawData.length === 0) {
    const message = chunkErrors.join("; ") || "Upstream returned no data";
    console.error("fetchCompetitions: all chunks failed:", message);
    return readCache(message);
  }

  let parsed: ParseResult;
  try {
    parsed = parseData(rawData);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("fetchCompetitions: parse failed:", message);
    return readCache(message);
  }

  if (parsed.competitions.length === 0) {
    const message =
      parsed.firstError ?? chunkErrors.join("; ") ?? "No valid competitions";
    console.error("fetchCompetitions: zero valid rows:", message);
    return readCache(message);
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(rawData, null, 2));
  fs.writeFileSync(LAST_FETCH_FILE, new Date().toISOString());

  // Runs in the background. The page does not wait for course data.
  void syncCourses(parsed.competitions.map((competition) => competition.id));

  const fetchError =
    chunkErrors.length > 0 || parsed.skipped > 0
      ? [
          ...chunkErrors,
          parsed.skipped > 0
            ? `${parsed.skipped} row(s) skipped (${parsed.firstError ?? "invalid"})`
            : null,
        ]
          .filter(Boolean)
          .join("; ")
      : null;

  return {
    competitions: parsed.competitions,
    skipped: parsed.skipped,
    fetchError,
    source: "live",
  };
}

function readCache(fetchError: string | null): CompetitionsResult {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    const parsed = parseData(data);
    return {
      competitions: parsed.competitions,
      skipped: parsed.skipped,
      fetchError:
        fetchError ??
        (parsed.skipped > 0
          ? `${parsed.skipped} row(s) skipped (${parsed.firstError ?? "invalid"})`
          : null),
      source: "cache",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Error fetching or parsing data:", fetchError ?? message);
    return {
      competitions: [],
      skipped: 0,
      fetchError: fetchError ?? message,
      source: "cache",
    };
  }
}

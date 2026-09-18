import {
  validateDGMetrixCompetitionsData,
  validateDGMetrixRow,
} from "./validation";
import { TZDate } from "@date-fns/tz";
import { add } from "date-fns";
import { TIMEZONE } from "~/constants";

export type ParsedCompetition = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  startsAt: Date;
  competitionType: string;
  courseName: string;
  layoutName: string | null;
  description: string;
};

export type ParseResult = {
  competitions: ParsedCompetition[];
  skipped: number;
  firstError: string | null;
};

export function parseData(data: unknown): ParseResult {
  const outer = validateDGMetrixCompetitionsData.safeParse(data);
  if (!outer.success) {
    throw new Error("Invalid data: expected an array");
  }

  const parsedData: ParsedCompetition[] = [];
  let skipped = 0;
  let firstError: string | null = null;
  const noteSkipped = (reason: string) => {
    skipped += 1;
    if (firstError == null) {
      firstError = reason;
    }
  };

  outer.data.forEach((row, index) => {
    const parsed = validateDGMetrixRow.safeParse(row);
    if (!parsed.success) {
      noteSkipped(
        `Row ${index} failed validation: ${parsed.error.errors.at(0)?.message ?? "unknown"}`,
      );
      return;
    }

    const [
      id,
      name,
      lat,
      lon,
      date,
      time,
      competitionType,
      courseAndLayout,
      description,
    ] = parsed.data;

    const startsAt = parseStartsAt(date, time);
    if (startsAt == null) {
      noteSkipped(`Row ${index} has unparseable date: "${date}"`);
      return;
    }

    const [courseName, layoutName] = courseAndLayout.split(" &rarr; ");

    parsedData.push({
      id: id || `unknown-${index}`,
      name: removeHtml(name),
      lat,
      lon,
      startsAt,
      competitionType,
      courseName: removeHtml(courseName ?? "") || "Unknown course",
      layoutName: layoutName ? removeHtml(layoutName) : null,
      description: removeHtml(description),
    });
  });

  if (skipped > 0) {
    console.warn(
      `parseData: skipped ${skipped} invalid row(s). First: ${firstError}`,
    );
  }

  const competitions = parsedData.sort((a, b) => {
    if (a.startsAt > b.startsAt) {
      return 1;
    }

    if (a.startsAt < b.startsAt) {
      return -1;
    }

    return 0;
  });

  return { competitions, skipped, firstError };
}

function parseStartsAt(date: string, time: string): Date | null {
  const dateMatch = date.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (!dateMatch) {
    return null;
  }

  const month = Number(dateMatch[1]);
  const day = Number(dateMatch[2]);
  const rawYear = Number(dateMatch[3]);
  const fullYear = rawYear < 100 ? 2000 + rawYear : rawYear;

  const timeMatch = time.trim().match(/^(\d{1,2}):(\d{2})$/);
  const hours = timeMatch ? Number(timeMatch[1]) : 0;
  const minutes = timeMatch ? Number(timeMatch[2]) : 0;
  if (
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes)
  ) {
    return null;
  }

  const startsAt = add(new TZDate(fullYear, month - 1, day, TIMEZONE), {
    hours,
    minutes,
  });

  return Number.isNaN(startsAt.getTime()) ? null : startsAt;
}

function removeHtml(str: string) {
  return str.replace(/<[^>]*>/g, "");
}

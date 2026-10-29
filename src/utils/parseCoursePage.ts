import { z } from "zod";
import type { CourseRecord, CourseUsageMonth } from "~/types";
import { toPlainText } from "./decodeHtml";

export type CoursePage = {
  name: string;
  location: string | null;
  baskets: number | null;
  par: number | null;
  lengthM: number | null;
  parRating: number | null;
  record: CourseRecord | null;
  usage: CourseUsageMonth[];
};

const USAGE_MONTHS = 12;

const usageSeries = z.array(z.tuple([z.number(), z.number()])).nullish();
const usageSchema = z
  .object({
    Unique: usageSeries,
    Training: usageSeries,
    Competition: usageSeries,
  })
  .passthrough();

// Reads the public course page. The Metrix course API needs a personal key, so the page is the only open source.
export function parseCoursePage(html: string): CoursePage {
  const header = between(html, 'class="main-header-meta"', "</header>") ?? "";
  const headerText = toPlainText(header.replace(/<\/li>/g, "\n"));

  return {
    name: toPlainText(
      html.match(/<h1><a href="\/course\/\d+">(.*?)<\/a>/)?.[1] ?? "",
    ),
    location: headerText.match(/Location:\s*([^\n]+)/)?.[1]?.trim() || null,
    baskets: matchNumber(headerText, /Baskets:\s*(\d+)/),
    par: matchNumber(headerText, /Par:\s*(\d+)/),
    lengthM: matchNumber(headerText, /Length:\s*(\d+)\s*m/),
    parRating: matchNumber(headerText, /PAR rating:\s*(\d+)/),
    record: parseRecord(html),
    usage: parseUsage(html),
  };
}

function parseUsage(html: string): CourseUsageMonth[] {
  const parsed = usageSchema.safeParse(readJsVariable(html, "chartData"));
  if (!parsed.success) {
    return [];
  }

  const months = new Map<string, CourseUsageMonth>();
  const month = (timestamp: number) => {
    const key = monthKey(timestamp);
    let entry = months.get(key);
    if (!entry) {
      entry = { month: `${key}-01`, players: 0, rounds: 0 };
      months.set(key, entry);
    }
    return entry;
  };

  for (const [timestamp, count] of parsed.data.Unique ?? []) {
    month(timestamp).players = count;
  }
  for (const [timestamp, count] of [
    ...(parsed.data.Training ?? []),
    ...(parsed.data.Competition ?? []),
  ]) {
    month(timestamp).rounds += count;
  }

  const latest = [...months.keys()].sort().at(-1);
  if (!latest) {
    return [];
  }

  // Metrix leaves out empty months. Fills them with zero, so each bar is one calendar month.
  const [year, monthNumber] = latest.split("-").map(Number);
  return Array.from({ length: USAGE_MONTHS }, (_, index) => {
    const key = monthKey(
      Date.UTC(year!, monthNumber! - USAGE_MONTHS + index, 15),
    );
    return months.get(key) ?? { month: `${key}-01`, players: 0, rounds: 0 };
  });
}

// Metrix stamps each month at local midnight on the 1st. Noon on that day is in the same UTC month.
const monthKey = (timestamp: number) =>
  new Date(timestamp + 12 * 60 * 60 * 1000).toISOString().slice(0, 7);

// The first row under "Top results" is the best competition round on this layout.
function parseRecord(html: string): CourseRecord | null {
  const table = between(html, "<h2>Top results</h2>", "</table>");
  const row = table
    ?.split(/<tr[^>]*>/)
    .slice(1)
    .find((tr) => /<A href="\/\d+">/i.test(tr));
  if (!row) {
    return null;
  }

  const cells = [...row.matchAll(/<td[^>]*>(.*?)<\/td>/gs)].map(
    (cell) => cell[1] ?? "",
  );
  const player = toPlainText(cells[1] ?? "");
  const link = cells[2]?.match(/href="\/(\d+)">([^<]*)</i);
  const diff = Number(toPlainText(cells.at(-2) ?? ""));
  const score = Number(toPlainText(cells.at(-1) ?? ""));
  if (!player || !Number.isFinite(score) || !Number.isFinite(diff)) {
    return null;
  }

  return {
    player,
    score,
    diff,
    date: parseUsDate(link?.[2] ?? ""),
    competitionId: link?.[1] ?? null,
  };
}

function readJsVariable(html: string, name: string): unknown {
  const raw = html.match(
    new RegExp(`var ${name} = JSON\\.parse\\('(.*?)'\\);`),
  )?.[1];
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw.replace(/\\'/g, "'"));
  } catch {
    return null;
  }
}

function parseUsDate(value: string): string | null {
  const match = value.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})/);
  if (!match) {
    return null;
  }

  const [, month, day, year] = match;
  return `20${year}-${month!.padStart(2, "0")}-${day!.padStart(2, "0")}`;
}

function between(text: string, start: string, end: string) {
  const from = text.indexOf(start);
  if (from === -1) {
    return null;
  }
  const to = text.indexOf(end, from + start.length);

  return text.slice(from + start.length, to === -1 ? undefined : to);
}

function matchNumber(text: string, pattern: RegExp) {
  const value = Number(text.match(pattern)?.[1]);
  return Number.isFinite(value) && value > 0 ? value : null;
}

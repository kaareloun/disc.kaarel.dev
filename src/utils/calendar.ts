import { ROUND_DURATION_IN_HOURS } from "~/constants";
import type { ParsedCompetition } from "./parseData";

const toIcsDate = (date: Date) =>
  date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

const escapeIcs = (text: string) =>
  text.replace(/[\\;,]/g, (char) => `\\${char}`).replace(/\n/g, "\\n");

export function downloadCalendarEvent(competition: ParsedCompetition) {
  const end = new Date(
    competition.startsAt.getTime() + ROUND_DURATION_IN_HOURS * 3_600_000,
  );
  const url = `https://discgolfmetrix.com/${competition.id}`;
  const location = [competition.courseName, competition.layoutName]
    .filter(Boolean)
    .join(", ");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//disc.kaarel.dev//EN",
    "BEGIN:VEVENT",
    `UID:${competition.id}@disc.kaarel.dev`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(competition.startsAt)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${escapeIcs(competition.name)}`,
    `LOCATION:${escapeIcs(location)}`,
    `GEO:${competition.lat};${competition.lon}`,
    `URL:${url}`,
    `DESCRIPTION:${escapeIcs(`${competition.description}\n\n${url}`.trim())}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  link.download = `${competition.eventName.replace(/[^\p{L}\p{N}]+/gu, "-")}.ics`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

import { TZDate } from "@date-fns/tz";
import {
  addDays,
  differenceInCalendarDays,
  differenceInMinutes,
  format,
} from "date-fns";
import { ROUND_DURATION_IN_HOURS, TIMEZONE } from "~/constants";

// All dates format in the Tallinn zone. Server and browser then render the same text.
const inZone = (date: Date | number) => new TZDate(+date, TIMEZONE);

export const formatTime = (date: Date) => format(inZone(date), "HH:mm");

export const dayKey = (date: Date | number) =>
  format(inZone(date), "yyyy-MM-dd");

export function dayLabel(date: Date, now: number) {
  const diff = differenceInCalendarDays(inZone(date), inZone(now));

  if (diff === 0) {
    return "Today";
  }
  if (diff === 1) {
    return "Tomorrow";
  }

  return format(inZone(date), "EEEE");
}

export const dayDate = (date: Date) => format(inZone(date), "d MMMM");

export type RoundStatus = "upcoming" | "live" | "finished";

export function roundStatus(startsAt: Date, now: number): RoundStatus {
  const start = startsAt.getTime();

  if (now < start) {
    return "upcoming";
  }

  return now < start + ROUND_DURATION_IN_HOURS * 3_600_000
    ? "live"
    : "finished";
}

export function startsIn(startsAt: Date, now: number) {
  const minutes = differenceInMinutes(startsAt, now);

  if (minutes < 1) {
    return "starting now";
  }
  if (minutes < 60) {
    return `in ${minutes} min`;
  }
  if (minutes < 12 * 60) {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest ? `in ${hours} h ${rest} min` : `in ${hours} h`;
  }

  const days = differenceInCalendarDays(inZone(startsAt), inZone(now));
  if (days === 0) {
    return `today at ${formatTime(startsAt)}`;
  }
  if (days === 1) {
    return `tomorrow at ${formatTime(startsAt)}`;
  }

  return `in ${days} days`;
}

export function matchesDay(
  startsAt: Date,
  now: number,
  day: "all" | "today" | "tomorrow" | "weekend" | "week",
) {
  const diff = differenceInCalendarDays(inZone(startsAt), inZone(now));

  switch (day) {
    case "all":
      return true;
    case "today":
      return diff === 0;
    case "tomorrow":
      return diff === 1;
    case "week":
      return diff >= 0 && diff < 7;
    case "weekend": {
      // On Sunday the coming weekend is today only.
      const weekday = inZone(now).getDay();
      const toSaturday = weekday === 0 ? -1 : 6 - weekday;
      const saturday = dayKey(addDays(inZone(now), toSaturday));
      const sunday = dayKey(addDays(inZone(now), toSaturday + 1));
      const key = dayKey(startsAt);
      return diff >= 0 && (key === saturday || key === sunday);
    }
  }
}

export function formatDistance(meters: number | null) {
  if (meters == null) {
    return null;
  }

  return meters < 1000
    ? `${Math.round(meters / 50) * 50} m`
    : `${Math.round(meters / 1000)} km`;
}

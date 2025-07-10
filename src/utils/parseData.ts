import { validateDGMetrixCompetitionsData } from "./validation";
import { TZDate } from "@date-fns/tz";
import { add } from "date-fns";
import { TIMEZONE } from "~/constants";

export function parseData(data: unknown) {
  const validatedData = validateDGMetrixCompetitionsData.parse(data);

  const parsedData = [];

  for (const row of validatedData) {
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
    ] = row;

    const [month, day, year] = date.split("\/").map(Number);
    const [hours, minutes] = time.split(":").map(Number);
    const startsAt = add(
      new TZDate(Number(`20${year}`), (month ?? 0) - 1, day ?? 0, TIMEZONE),
      { hours, minutes },
    );

    const [courseName, layoutName] = courseAndLayout.split(" &rarr; ");

    parsedData.push({
      id,
      name: removeHtml(name),
      lat,
      lon,
      startsAt,
      competitionType,
      courseName: removeHtml(courseName),
      layoutName: layoutName ? removeHtml(layoutName) : null,
      description: removeHtml(description),
    });
  }

  return parsedData.sort((a, b) => {
    if (a.startsAt > b.startsAt) {
      return 1;
    }

    if (a.startsAt < b.startsAt) {
      return -1;
    }

    return 0;
  });
}

function removeHtml(str: string) {
  return str.replace(/<[^>]*>/g, "");
}

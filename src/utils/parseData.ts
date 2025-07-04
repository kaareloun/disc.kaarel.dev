import { validateDGMetrixCompetitionsData } from "./validation";

export function parseData(data: unknown) {
  const parsedData = validateDGMetrixCompetitionsData.parse(data);

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

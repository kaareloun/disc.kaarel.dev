import { z } from "zod";
import { TZDate } from "@date-fns/tz";
import { add } from "date-fns";

export const validateDGMetrixCompetitionsData = z
  .array(
    z.tuple([
      z.string().min(1),
      z.string().min(1),
      z.number(),
      z.number(),
      z.string().regex(/^\d{2}\/\d{2}\/\d{2}$/),
      z.string().regex(/^\d{2}:\d{2}$/),
      z.string().min(1),
      z.string().min(1),
      z.string(),
    ]),
  )
  .transform((data) => {
    const res = [];

    for (const row of data) {
      const [
        id,
        name,
        lat,
        lon,
        date,
        time,
        competitionType,
        courseName,
        description,
      ] = row;

      const [month, day, year] = date.split("\/").map(Number);
      const [hours, minutes] = time.split(":").map(Number);
      const startsAt = add(
        new TZDate(Number(`20${year}`), month - 1, day, "Europe/Tallinn"),
        { hours, minutes },
      );

      res.push({
        id,
        name,
        lat,
        lon,
        startsAt,
        competitionType,
        courseName,
        description,
      });
    }

    return res;
  });

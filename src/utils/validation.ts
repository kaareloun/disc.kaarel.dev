import { z } from "zod";

export const validateDGMetrixCompetitionsData = z.array(
  z.tuple([
    z.string().min(1), // id
    z.string(), // name
    z.number(), // lat
    z.number(), // lon
    z.string().regex(/^\d{2}\/\d{2}\/\d{2}$/), // date
    z.string().regex(/^\d{2}:\d{2}$/), // time
    z.string().min(1), // competitionType
    z.string().min(1), // courseAndLayout
    z.string(), // description
  ]),
);

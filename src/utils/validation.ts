import { z } from "zod";

export const validateDGMetrixCompetitionsData = z.array(
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
);

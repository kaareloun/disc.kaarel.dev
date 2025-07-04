import { z } from "zod";
import { validateDGMetrixCompetitionsData } from "./utils/validation";

export type CompetitionWithDistance = z.infer<
  typeof validateDGMetrixCompetitionsData
>[number] & {
  distance: number;
};

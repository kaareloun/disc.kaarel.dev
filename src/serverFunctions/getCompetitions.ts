import { createServerFn } from "@tanstack/react-start";
import { fetchCompetitions } from "~/utils/fetchCompetitions";

export const getCompetitions = createServerFn().handler(async () => {
  return await fetchCompetitions();
});

import { fetchCompetitions } from "~/utils/fetchCompetitions";
import { syncCourses } from "~/utils/syncCourses";

const { competitions } = await fetchCompetitions();
await syncCourses(competitions.map((competition) => competition.id));
console.log("Done");

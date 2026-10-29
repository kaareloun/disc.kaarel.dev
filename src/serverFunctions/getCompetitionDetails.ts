import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { DETAILS_CACHE_TTL_MS, LIVE_DETAILS_CACHE_TTL_MS } from "~/constants";
import type { CompetitionDetails, Leader } from "~/types";
import { loadCourse } from "~/utils/courseStore";
import { toPlainText } from "~/utils/decodeHtml";
import { metrixFetch } from "~/utils/metrixFetch";

const LEADER_COUNT = 5;
const COURSE_WAIT_MS = 8_000;

const detailsResponse = z.object({
  Competition: z.object({
    Comment: z.string().nullish(),
    CourseID: z.union([z.string(), z.number()]).nullish(),
    Results: z
      .array(
        z
          .object({
            Name: z.string().nullish(),
            ClassName: z.string().nullish(),
            Diff: z.number().nullish(),
            PlayerResults: z.array(z.unknown()).nullish(),
          })
          .passthrough(),
      )
      .nullish(),
    Tracks: z
      .array(z.object({ Par: z.union([z.string(), z.number()]).nullish() }))
      .nullish(),
  }),
});

const playedHole = z.object({ Result: z.string().min(1) }).passthrough();

const cache = new Map<
  string,
  { at: number; ttl: number; details: CompetitionDetails }
>();

export const getCompetitionDetails = createServerFn({ method: "GET" })
  .validator((id: unknown) => z.string().regex(/^\d+$/).parse(id))
  .handler(async ({ data: id }) => {
    const cached = cache.get(id);
    if (cached && Date.now() - cached.at < cached.ttl) {
      return cached.details;
    }

    const res = await metrixFetch(`/api.php?content=result&id=${id}`);
    const { Competition } = detailsResponse.parse(await res.json());
    const results = Competition.Results ?? [];
    const tracks = Competition.Tracks ?? [];

    const divisionCounts = new Map<string, number>();
    for (const result of results) {
      const name = toPlainText(result.ClassName ?? "");
      if (name) {
        divisionCounts.set(name, (divisionCounts.get(name) ?? 0) + 1);
      }
    }

    // Metrix places players inside each division. The panel ranks everyone by score to par.
    const scored = results
      .map((result) => ({
        name: toPlainText(result.Name ?? ""),
        diff: result.Diff ?? 0,
        holesPlayed: (result.PlayerResults ?? []).filter(
          (hole) => playedHole.safeParse(hole).success,
        ).length,
      }))
      .filter((player) => player.name && player.holesPlayed > 0)
      .sort((a, b) => a.diff - b.diff || b.holesPlayed - a.holesPlayed);
    const leaders: Leader[] = scored.slice(0, LEADER_COUNT).map((player) => ({
      ...player,
      place: scored.findIndex((other) => other.diff === player.diff) + 1,
    }));

    const courseId = Competition.CourseID ? String(Competition.CourseID) : null;
    // The sync saves most courses ahead of time. A course it missed can take a minute to load.
    // The panel shows without it, and the load goes on and saves the course for the next open.
    const course = courseId
      ? await Promise.race([
          loadCourse(courseId).catch((error: unknown) => {
            console.error(`Course ${courseId} did not load:`, error);
            return null;
          }),
          new Promise<null>((resolve) =>
            setTimeout(() => resolve(null), COURSE_WAIT_MS),
          ),
        ])
      : null;

    const pars = tracks.map((track) => Number(track.Par));
    const details: CompetitionDetails = {
      players: results.length,
      divisions: [...divisionCounts]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      holes: tracks.length,
      par:
        pars.length && pars.every(Number.isFinite)
          ? pars.reduce((sum, par) => sum + par, 0)
          : null,
      comment: toPlainText(Competition.Comment ?? ""),
      courseId,
      leaders,
      course,
    };

    // Scores change during a round, and a missing course may arrive soon. Both get a short cache.
    const ttl =
      leaders.length > 0 || (courseId && !course)
        ? LIVE_DETAILS_CACHE_TTL_MS
        : DETAILS_CACHE_TTL_MS;
    cache.set(id, { at: Date.now(), ttl, details });

    return details;
  });

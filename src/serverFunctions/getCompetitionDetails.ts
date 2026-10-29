import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { DETAILS_CACHE_TTL_MS } from "~/constants";
import type { CompetitionDetails } from "~/types";
import { toPlainText } from "~/utils/decodeHtml";

const detailsResponse = z.object({
  Competition: z.object({
    Comment: z.string().nullish(),
    CourseID: z.union([z.string(), z.number()]).nullish(),
    Results: z
      .array(z.object({ ClassName: z.string().nullish() }).passthrough())
      .nullish(),
    Tracks: z
      .array(z.object({ Par: z.union([z.string(), z.number()]).nullish() }))
      .nullish(),
  }),
});

const cache = new Map<string, { at: number; details: CompetitionDetails }>();

export const getCompetitionDetails = createServerFn({ method: "GET" })
  .validator((id: unknown) => z.string().regex(/^\d+$/).parse(id))
  .handler(async ({ data: id }) => {
    const cached = cache.get(id);
    if (cached && Date.now() - cached.at < DETAILS_CACHE_TTL_MS) {
      return cached.details;
    }

    const res = await fetch(
      `https://discgolfmetrix.com/api.php?content=result&id=${id}`,
      { signal: AbortSignal.timeout(10_000) },
    );
    if (!res.ok) {
      throw new Error(`Metrix answered with HTTP ${res.status}`);
    }

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

    const pars = tracks.map((track) => Number(track.Par));
    const details: CompetitionDetails = {
      players: results.length,
      divisions: [...divisionCounts]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      holes: tracks.length,
      par: pars.length && pars.every(Number.isFinite)
        ? pars.reduce((sum, par) => sum + par, 0)
        : null,
      comment: toPlainText(Competition.Comment ?? ""),
      courseId: Competition.CourseID ? String(Competition.CourseID) : null,
    };

    cache.set(id, { at: Date.now(), details });

    return details;
  });

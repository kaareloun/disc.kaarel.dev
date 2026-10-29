import fs from "node:fs";
import { z } from "zod";
import { COMPETITION_COURSES_FILE, SYNC_CONCURRENCY } from "~/constants";
import { isFresh, loadCourse, readCourse, writeJson } from "./courseStore";
import { metrixFetch } from "./metrixFetch";

const courseIdResponse = z.object({
  Competition: z
    .object({ CourseID: z.union([z.string(), z.number()]).nullish() })
    .nullish(),
});

let running: Promise<void> | null = null;

// Saves course data for every listed competition, so the details panel opens without a Metrix call.
// Runs after each competition fetch. Only new competitions and stale courses cost a request.
export function syncCourses(competitionIds: string[]) {
  running ??= sync(competitionIds)
    .catch((error) => console.error("syncCourses failed:", error))
    .finally(() => {
      running = null;
    });

  return running;
}

async function sync(competitionIds: string[]) {
  const ids = [...new Set(competitionIds)].filter((id) => /^\d+$/.test(id));
  const known = readCourseIds();
  const courseIds: Record<string, string | null> = {};
  for (const id of ids) {
    if (id in known) {
      courseIds[id] = known[id] ?? null;
    }
  }

  const unknown = ids.filter((id) => !(id in courseIds));
  let failedLookups = 0;
  await pool(unknown, async (id) => {
    try {
      const res = await metrixFetch(`/api.php?content=result&id=${id}`);
      const { Competition } = courseIdResponse.parse(await res.json());
      courseIds[id] = Competition?.CourseID
        ? String(Competition.CourseID)
        : null;
    } catch {
      failedLookups += 1;
    }
  });
  // Old competitions drop out, so the file stays the size of the current list.
  writeJson(COMPETITION_COURSES_FILE, courseIds);

  const stale = [...new Set(Object.values(courseIds))]
    .filter((courseId) => courseId != null)
    .filter((courseId) => !isFresh(readCourse(courseId)));
  let failedCourses = 0;
  await pool(stale, (courseId) =>
    loadCourse(courseId).then(
      () => undefined,
      () => {
        failedCourses += 1;
      },
    ),
  );

  console.log(
    `syncCourses: ${unknown.length - failedLookups}/${unknown.length} new competitions, ` +
      `${stale.length - failedCourses}/${stale.length} courses refreshed`,
  );
}

function readCourseIds(): Record<string, string | null> {
  try {
    return z
      .record(z.string(), z.string().nullable())
      .parse(JSON.parse(fs.readFileSync(COMPETITION_COURSES_FILE, "utf-8")));
  } catch {
    return {};
  }
}

async function pool<T>(items: T[], worker: (item: T) => Promise<void>) {
  const queue = [...items];
  await Promise.all(
    Array.from(
      { length: Math.min(SYNC_CONCURRENCY, queue.length) },
      async () => {
        for (
          let item = queue.shift();
          item !== undefined;
          item = queue.shift()
        ) {
          await worker(item);
        }
      },
    ),
  );
}

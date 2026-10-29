import fs from "node:fs";
import path from "node:path";
import { differenceInHours } from "date-fns";
import { COURSES_DIR, COURSE_TTL_IN_HOURS } from "~/constants";
import type { Course } from "~/types";
import { metrixFetch } from "./metrixFetch";
import { parseCoursePage } from "./parseCoursePage";

// Metrix builds the page from all past rounds. Busy courses take over a minute.
const COURSE_PAGE_TIMEOUT_MS = 90_000;

const inFlight = new Map<string, Promise<Course>>();

export function readCourse(courseId: string): Course | null {
  try {
    return JSON.parse(fs.readFileSync(coursePath(courseId), "utf-8")) as Course;
  } catch {
    return null;
  }
}

export function isFresh(course: Course | null): course is Course {
  return (
    course != null &&
    differenceInHours(new Date(), new Date(course.fetchedAt)) <
      COURSE_TTL_IN_HOURS
  );
}

// Returns the saved course. Fetches it again when it is missing or old.
// A failed refresh returns the old copy, so a Metrix outage does not hide known data.
export async function loadCourse(courseId: string): Promise<Course> {
  const saved = readCourse(courseId);
  if (isFresh(saved)) {
    return saved;
  }

  let request = inFlight.get(courseId);
  if (!request) {
    request = fetchCourse(courseId)
      .then((course) => {
        writeJson(coursePath(courseId), course);
        return course;
      })
      .finally(() => inFlight.delete(courseId));
    inFlight.set(courseId, request);
  }

  try {
    return await request;
  } catch (error) {
    if (saved) {
      return saved;
    }
    throw error;
  }
}

async function fetchCourse(courseId: string): Promise<Course> {
  const res = await metrixFetch(`/course/${courseId}`, COURSE_PAGE_TIMEOUT_MS);
  const page = parseCoursePage(await res.text());

  return {
    id: courseId,
    name: page.name,
    location: page.location,
    baskets: page.baskets,
    par: page.par,
    lengthM: page.lengthM,
    parRating: page.parRating,
    images: page.images,
    record: page.record,
    usage: page.usage,
    fetchedAt: new Date().toISOString(),
  };
}

const coursePath = (courseId: string) =>
  path.join(COURSES_DIR, `${courseId}.json`);

// Writes through a temp file, so a reader never sees half a file.
export function writeJson(file: string, data: unknown) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(data));
  fs.renameSync(temp, file);
}

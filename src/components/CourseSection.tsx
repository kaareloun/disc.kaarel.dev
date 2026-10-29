import type { Course } from "~/types";
import { courseUrl, metrixUrl } from "~/utils/places";
import { formatDiff } from "~/utils/score";
import { formatMonth } from "~/utils/time";
import { CourseUsage } from "./CourseUsage";
import { DetailStat } from "./DetailStat";

export function CourseSection({ course }: { course: Course }) {
  return (
    <section className="space-y-4 border-t pt-4" aria-label="Course">
      <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {course.lengthM != null && (
          <DetailStat label="Length" value={`${course.lengthM} m`} />
        )}
        {course.parRating != null && (
          <DetailStat label="PAR rating" value={course.parRating} />
        )}
        {course.record && (
          <DetailStat
            label="Record"
            value={`${formatDiff(course.record.diff)} (${course.record.score})`}
          />
        )}
      </dl>

      {course.record && (
        <p className="-mt-2 text-xs text-muted-foreground">
          Record by {course.record.player}
          {course.record.date && (
            <> in {formatMonth(new Date(course.record.date), "MMMM yyyy")}</>
          )}
          {course.record.competitionId && (
            <>
              {" · "}
              <a
                href={metrixUrl(course.record.competitionId)}
                target="_blank"
                rel="noreferrer"
                className="underline-offset-4 hover:text-foreground hover:underline"
              >
                scorecard
              </a>
            </>
          )}
        </p>
      )}

      {course.usage.filter((month) => month.players > 0).length > 1 && (
        <CourseUsage usage={course.usage} />
      )}

      <a
        href={courseUrl(course.id)}
        target="_blank"
        rel="noreferrer"
        className="inline-block text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Course page on Metrix
      </a>
    </section>
  );
}

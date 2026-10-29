import { useMemo } from "react";
import { cn } from "~/lib/utils";
import type { Course, Point } from "~/types";

type Props = {
  course: Course;
  activeHole: number | null;
  onActiveHoleChange: (index: number | null) => void;
};

const PADDING_M = 18;
const SCALE_STEPS_M = [10, 20, 25, 50, 100, 200, 250, 500];

const toPoints = (points: Point[]) => points.map(([x, y]) => `${x},${y}`).join(" ");

export function CourseMap({ course, activeHole, onActiveHoleChange }: Props) {
  const view = useMemo(() => {
    const points = [
      ...course.holes.flatMap((hole) => [
        ...(hole.tee ? [hole.tee] : []),
        ...(hole.basket ? [hole.basket] : []),
        ...hole.path,
      ]),
      ...course.outOfBounds.flat(),
    ];
    const xs = points.map(([x]) => x);
    const ys = points.map(([, y]) => y);
    const minX = Math.min(...xs) - PADDING_M;
    const minY = Math.min(...ys) - PADDING_M;
    const width = Math.max(...xs) + PADDING_M - minX;
    const height = Math.max(...ys) + PADDING_M - minY;
    const span = Math.max(width, height);
    const scaleM = [...SCALE_STEPS_M].reverse().find((step) => step <= width / 4) ?? SCALE_STEPS_M[0]!;

    return { minX, minY, width, height, span, scaleM };
  }, [course]);

  const marker = view.span / 110;
  const label = view.span / 38;

  return (
    <figure className="overflow-hidden rounded-xl border bg-muted/40">
      <svg
        viewBox={`${view.minX} ${view.minY} ${view.width} ${view.height}`}
        className="block max-h-[26rem] w-full"
        role="img"
        aria-label={`Map of ${course.layoutName ?? course.name}`}
        onMouseLeave={() => onActiveHoleChange(null)}
      >
        {course.holes.map(
          (hole, index) =>
            hole.fairway.length > 2 && (
              <polygon
                key={`fairway-${index}`}
                points={toPoints(hole.fairway)}
                className={cn(
                  "fill-primary/10 transition-opacity duration-200",
                  activeHole != null && activeHole !== index && "opacity-40",
                )}
              />
            ),
        )}

        {course.outOfBounds.map((line, index) => (
          <polyline
            key={`ob-${index}`}
            points={toPoints(line)}
            fill="none"
            strokeWidth="1.5"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            className="stroke-destructive/70"
          />
        ))}

        {course.holes.map((hole, index) => {
          const active = activeHole === index;
          const dimmed = activeHole != null && !active;
          const path = hole.path.length > 1 ? hole.path : hole.tee && hole.basket ? [hole.tee, hole.basket] : [];

          return (
            <g
              key={`hole-${index}`}
              onMouseEnter={() => onActiveHoleChange(index)}
              className={cn("cursor-pointer transition-opacity duration-200", dimmed && "opacity-35")}
            >
              {path.length > 1 && (
                <>
                  <polyline points={toPoints(path)} fill="none" stroke="transparent" strokeWidth={marker * 3} />
                  <polyline
                    points={toPoints(path)}
                    fill="none"
                    strokeWidth={active ? 3 : 1.75}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    className={active ? "stroke-primary" : "stroke-foreground/45"}
                  />
                </>
              )}
              {hole.basket && (
                <circle
                  cx={hole.basket[0]}
                  cy={hole.basket[1]}
                  r={marker}
                  className={active ? "fill-primary" : "fill-foreground/70"}
                />
              )}
              {hole.tee && (
                <g transform={`translate(${hole.tee[0]} ${hole.tee[1]})`}>
                  <circle r={label * 0.72} className={active ? "fill-primary" : "fill-foreground"} />
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={label * (hole.label.length > 2 ? 0.62 : 0.8)}
                    fontWeight={700}
                    className={active ? "fill-primary-foreground" : "fill-background"}
                  >
                    {hole.label}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        <g
          transform={`translate(${view.minX + view.width - view.scaleM - label} ${view.minY + view.height - label})`}
          className="text-muted-foreground"
        >
          <path
            d={`M 0 ${-label * 0.3} V 0 H ${view.scaleM} V ${-label * 0.3}`}
            fill="none"
            strokeWidth="1.25"
            vectorEffect="non-scaling-stroke"
            className="stroke-current"
          />
          <text x={view.scaleM / 2} y={-label * 0.45} textAnchor="middle" fontSize={label * 0.7} className="fill-current">
            {view.scaleM} m
          </text>
        </g>
      </svg>
    </figure>
  );
}

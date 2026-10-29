import { z } from "zod";
import type { Point } from "~/types";

export type MapHole = {
  label: string;
  par: number | null;
  lengthM: number | null;
  tee: Point | null;
  basket: Point | null;
  path: Point[];
  fairway: Point[];
};

export type CourseMap = {
  layoutName: string | null;
  holes: MapHole[];
  outOfBounds: Point[][];
};

const METERS_PER_DEGREE_LAT = 111_320;

const latLon = z.string().nullish();
const latLonList = z.array(z.string()).nullish();
const optionalNumber = z
  .union([z.number(), z.string()])
  .nullish()
  .transform((value) => {
    const number = Number(value);
    return value == null || value === "" || !Number.isFinite(number) ? null : number;
  });

const mapSchema = z.object({
  Name: z.string().nullish(),
  CenterCoordinates: latLon,
  Tracks: z
    .array(
      z
        .object({
          Name: z.union([z.string(), z.number()]).nullish(),
          NameAlt: z.union([z.string(), z.number()]).nullish(),
          Par: optionalNumber,
          Length: optionalNumber,
          Tee: latLon,
          Basket: latLon,
          Line: latLonList,
          LineSmooth: latLonList,
          Fairway: latLonList,
        })
        .passthrough(),
    )
    .nullish(),
  Obs: z.array(z.object({ Points: latLonList }).passthrough()).nullish(),
});

export function parseCourseMap(data: unknown): CourseMap {
  const map = mapSchema.parse(data);
  const tracks = map.Tracks ?? [];

  const origin =
    readLatLon(map.CenterCoordinates) ??
    tracks.map((track) => readLatLon(track.Tee)).find((point) => point != null) ??
    null;
  const project = (value: string | null | undefined): Point | null => {
    const point = readLatLon(value);
    if (!point || !origin) {
      return null;
    }

    const metersPerDegreeLon = METERS_PER_DEGREE_LAT * Math.cos((origin[0] * Math.PI) / 180);
    return [
      round((point[1] - origin[1]) * metersPerDegreeLon),
      round((origin[0] - point[0]) * METERS_PER_DEGREE_LAT),
    ];
  };
  const projectAll = (values: string[] | null | undefined) =>
    (values ?? []).map(project).filter((point) => point != null);

  return {
    layoutName: map.Name?.trim() || null,
    holes: tracks.map((track, index) => ({
      label: String(track.NameAlt || track.Name || index + 1),
      par: track.Par,
      lengthM: track.Length,
      tee: project(track.Tee),
      basket: project(track.Basket),
      path: projectAll(track.LineSmooth?.length ? track.LineSmooth : track.Line),
      fairway: projectAll(track.Fairway),
    })),
    outOfBounds: (map.Obs ?? [])
      .map((ob) => projectAll(ob.Points))
      .filter((line) => line.length > 1),
  };
}

function readLatLon(value: string | null | undefined): Point | null {
  const [lat, lon] = (value ?? "").split(",").map(Number);
  return Number.isFinite(lat) && Number.isFinite(lon) && (lat !== 0 || lon !== 0)
    ? [lat!, lon!]
    : null;
}

const round = (value: number) => Math.round(value * 10) / 10;

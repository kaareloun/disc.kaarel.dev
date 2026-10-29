import { ExternalLink, Navigation } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCompetitionDetails } from "~/hooks/useCompetitionDetails";
import type { CompetitionWithDistance } from "~/types";
import { directionsUrl, metrixUrl } from "~/utils/places";
import {
  formatDistance,
  formatTime,
  roundStatus,
  startsIn,
} from "~/utils/time";
import { FlightPath } from "./FlightPath";

type Props = {
  competition: CompetitionWithDistance;
  now: number;
};

export function NextUp({ competition, now }: Props) {
  const status = roundStatus(competition.startsAt, now);
  const distance = formatDistance(competition.distance);
  const details = useCompetitionDetails(competition.id);
  const players = details.status === "done" ? details.details.players : 0;
  const when =
    status === "live"
      ? `Playing now, started ${formatTime(competition.startsAt)}`
      : `Starts ${startsIn(competition.startsAt, now)}`;

  return (
    <section
      aria-label="Next up"
      className="relative overflow-hidden rounded-3xl border bg-card p-5 shadow-sm sm:p-7"
    >
      <div className="flex items-center gap-2 text-sm font-semibold">
        {status === "live" && (
          <span className="live-dot relative size-2.5 rounded-full bg-live" />
        )}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={when}
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.25 }}
          >
            {when}
          </motion.span>
        </AnimatePresence>
        {players > 0 && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-auto whitespace-nowrap font-medium text-muted-foreground"
          >
            {players} {status === "upcoming" ? "registered" : "playing"}
          </motion.span>
        )}
      </div>

      <div className="mt-4 sm:mt-6">
        {competition.seriesName && (
          <p className="line-clamp-1 text-sm text-muted-foreground">
            {competition.seriesName}
          </p>
        )}
        <h2 className="text-balance text-[1.6rem] font-bold leading-tight tracking-tight sm:text-[2.25rem]">
          {competition.eventName}
        </h2>
        <p className="mt-1.5 text-[0.95rem] text-muted-foreground">
          {competition.courseName}
          {competition.layoutName && (
            <span className="opacity-70"> / {competition.layoutName}</span>
          )}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto] items-end gap-4 sm:mt-1">
        <div className="max-w-md">
          {distance && (
            <FlightPath key={competition.id} label={`${distance} away`} />
          )}
        </div>
        {distance && (
          <p className="font-semi-condensed tabular text-right text-4xl font-semibold leading-none tracking-tight sm:text-5xl">
            {distance}
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <a
          href={directionsUrl(competition.lat, competition.lon)}
          target="_blank"
          rel="noreferrer"
          className="pressable inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <Navigation className="size-4" />
          Directions
        </a>
        <a
          href={metrixUrl(competition.id)}
          target="_blank"
          rel="noreferrer"
          className="pressable inline-flex h-11 items-center gap-2 rounded-full border px-5 text-sm font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ExternalLink className="size-4" />
          Open in Metrix
        </a>
      </div>
    </section>
  );
}

import { CalendarPlus, ExternalLink, Navigation } from "lucide-react";
import { motion } from "motion/react";
import { useCompetitionDetails } from "~/hooks/useCompetitionDetails";
import type { CompetitionWithDistance } from "~/types";
import { downloadCalendarEvent } from "~/utils/calendar";
import { courseUrl, directionsUrl, metrixUrl } from "~/utils/places";
import { DetailStat } from "./DetailStat";
import { LinkifiedText } from "./LinkifiedText";

const actionClass =
  "pressable inline-flex h-10 items-center gap-2 rounded-full border bg-background px-4 text-sm font-semibold transition-colors hover:border-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

type Props = {
  competition: CompetitionWithDistance;
  upcoming: boolean;
};

export function CompetitionDetails({ competition, upcoming }: Props) {
  const state = useCompetitionDetails(competition.id);
  const details = state.status === "done" ? state.details : null;
  // The details API has the full text. The list feed drops some numbers from it.
  const description = details?.comment || competition.description;

  return (
    <div className="space-y-4 pb-5 pl-[5.5rem] pr-4 sm:pl-[7.25rem]">
      <dl className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {state.status === "loading" &&
          [0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-9 w-20 rounded-lg" />
          ))}
        {details && (
          <>
            <DetailStat label={upcoming ? "Registered" : "Playing"} value={details.players || "–"} />
            {details.holes > 0 && <DetailStat label="Holes" value={details.holes} />}
            {details.par != null && <DetailStat label="Par" value={details.par} />}
          </>
        )}
        {state.status === "error" && (
          <p className="text-muted-foreground">
            Metrix did not send the player list. Open the round in Metrix to see it.
          </p>
        )}
      </dl>

      {details && details.divisions.length > 0 && (
        <motion.ul
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="flex flex-wrap gap-1.5"
          aria-label="Divisions"
        >
          {details.divisions.map((division) => (
            <li
              key={division.name}
              className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium"
            >
              {division.name}
              <span className="ml-1.5 text-muted-foreground tabular">{division.count}</span>
            </li>
          ))}
        </motion.ul>
      )}

      {description && (
        <p className="max-w-prose whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          <LinkifiedText text={description.replace(/\s*\|\s*/g, "\n")} />
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <a href={metrixUrl(competition.id)} target="_blank" rel="noreferrer" className={actionClass}>
          <ExternalLink className="size-4" />
          {upcoming ? "Register in Metrix" : "Live scores"}
        </a>
        <a
          href={directionsUrl(competition.lat, competition.lon)}
          target="_blank"
          rel="noreferrer"
          className={actionClass}
        >
          <Navigation className="size-4" />
          Directions
        </a>
        {upcoming && (
          <button type="button" onClick={() => downloadCalendarEvent(competition)} className={actionClass}>
            <CalendarPlus className="size-4" />
            Add to calendar
          </button>
        )}
        {details?.courseId && (
          <a
            href={courseUrl(details.courseId)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center px-2 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Course map
          </a>
        )}
      </div>
    </div>
  );
}

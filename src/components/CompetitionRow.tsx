import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useId } from "react";
import { cn } from "~/lib/utils";
import type { CompetitionWithDistance } from "~/types";
import { formatDistance, formatTime, roundStatus } from "~/utils/time";
import { CompetitionDetails } from "./CompetitionDetails";

type Props = {
  competition: CompetitionWithDistance;
  now: number;
  expanded: boolean;
  onToggle: () => void;
};

export function CompetitionRow({ competition, now, expanded, onToggle }: Props) {
  const panelId = useId();
  const status = roundStatus(competition.startsAt, now);
  const distance = formatDistance(competition.distance);

  return (
    <div
      className={cn(
        "rounded-2xl transition-colors duration-200",
        expanded ? "bg-card shadow-sm ring-1 ring-border" : "hover:bg-card/70",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
        className="grid w-full grid-cols-[4rem_1fr_auto] items-start gap-3 rounded-2xl px-3 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[5.25rem_1fr_auto] sm:gap-4 sm:px-4"
      >
        <span className="flex flex-col">
          <span
            className={cn(
              "font-semi-condensed text-xl font-semibold leading-tight tabular sm:text-2xl",
              status === "live" && "text-live",
            )}
          >
            {formatTime(competition.startsAt)}
          </span>
          {status === "live" && (
            <span className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-live">
              <span className="live-dot relative size-1.5 rounded-full bg-live" />
              Playing
            </span>
          )}
        </span>

        <span className="min-w-0">
          {competition.seriesName && (
            <span className="block truncate text-xs font-medium text-muted-foreground">
              {competition.seriesName}
            </span>
          )}
          <span className="block text-[1.05rem] font-semibold leading-snug">
            {competition.eventName}
          </span>
          <span className="mt-0.5 block truncate text-sm text-muted-foreground">
            {competition.courseName}
            {competition.layoutName && <span className="opacity-70"> / {competition.layoutName}</span>}
          </span>
        </span>

        <span className="flex items-center gap-1.5 pt-0.5">
          {distance && (
            <span className="whitespace-nowrap text-sm text-muted-foreground tabular">
              {distance}
            </span>
          )}
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform duration-200 ease-out",
              expanded && "rotate-180",
            )}
          />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id={panelId}
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.18, ease: [0.23, 1, 0.32, 1] } }}
            transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <CompetitionDetails competition={competition} upcoming={status === "upcoming"} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

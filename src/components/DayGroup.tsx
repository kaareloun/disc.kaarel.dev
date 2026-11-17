import { AnimatePresence, motion } from "motion/react";
import type { CompetitionWithDistance } from "~/types";
import { dayDate, dayLabel } from "~/utils/time";
import { CompetitionRow } from "./CompetitionRow";

type Props = {
  competitions: CompetitionWithDistance[];
  now: number;
  expandedId: string | null;
  onToggle: (id: string) => void;
};

export function DayGroup({ competitions, now, expandedId, onToggle }: Props) {
  const first = competitions[0];
  if (!first) {
    return null;
  }

  return (
    <section
      aria-label={`${dayLabel(first.startsAt, now)}, ${dayDate(first.startsAt)}`}
    >
      <h3 className="sticky top-0 z-10 -mx-4 flex items-baseline gap-2.5 bg-background px-4 py-2 sm:top-[var(--toolbar-h,7.5rem)] sm:-mx-6 sm:px-6">
        <span className="text-base font-semibold">
          {dayLabel(first.startsAt, now)}
        </span>
        <span className="text-sm text-muted-foreground">
          {dayDate(first.startsAt)}
        </span>
        <span className="tabular ml-auto text-sm text-muted-foreground">
          {competitions.length} {competitions.length === 1 ? "round" : "rounds"}
        </span>
      </h3>
      <ul className="-mx-3 mt-1 sm:-mx-4">
        <AnimatePresence initial={false}>
          {competitions.map((competition) => (
            <motion.li
              key={competition.id}
              layout="position"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            >
              <CompetitionRow
                competition={competition}
                now={now}
                expanded={expandedId === competition.id}
                onToggle={() => onToggle(competition.id)}
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  );
}

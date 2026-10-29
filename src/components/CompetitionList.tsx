import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { CompetitionWithDistance } from "~/types";
import { dayKey } from "~/utils/time";
import { DayGroup } from "./DayGroup";

type Props = {
  competitions: CompetitionWithDistance[];
  now: number;
};

export function CompetitionList({ competitions, now }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const days = useMemo(() => {
    const groups = new Map<string, CompetitionWithDistance[]>();
    for (const competition of competitions) {
      const key = dayKey(competition.startsAt);
      groups.set(key, [...(groups.get(key) ?? []), competition]);
    }

    return [...groups];
  }, [competitions]);

  return (
    <div className="space-y-6">
      <AnimatePresence initial={false} mode="popLayout">
        {days.map(([key, dayCompetitions]) => (
          <motion.div
            key={key}
            layout="position"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          >
            <DayGroup
              competitions={dayCompetitions}
              now={now}
              expandedId={expandedId}
              onToggle={(id) => setExpandedId((current) => (current === id ? null : id))}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

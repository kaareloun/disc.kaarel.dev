import type { Leader } from "~/types";
import { formatDiff } from "~/utils/score";

type Props = {
  leaders: Leader[];
  holes: number;
};

export function Leaderboard({ leaders, holes }: Props) {
  return (
    <div>
      <h3 className="text-xs text-muted-foreground">Leaderboard</h3>
      <ol className="mt-1.5 divide-y">
        {leaders.map((leader) => (
          <li
            key={`${leader.place}-${leader.name}`}
            className="flex items-center gap-3 py-1.5 text-sm"
          >
            <span className="tabular w-5 text-right text-muted-foreground">
              {leader.place}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium">
              {leader.name}
            </span>
            <span className="tabular text-xs text-muted-foreground">
              {holes > 0 && leader.holesPlayed >= holes
                ? "F"
                : `thru ${leader.holesPlayed}`}
            </span>
            <span className="tabular w-9 text-right font-semibold">
              {formatDiff(leader.diff)}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

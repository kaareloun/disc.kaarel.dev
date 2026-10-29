import { useEffect, useState } from "react";
import { getCompetitionDetails } from "~/serverFunctions/getCompetitionDetails";
import type { CompetitionDetails } from "~/types";

type State =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "done"; details: CompetitionDetails };

const requests = new Map<string, Promise<CompetitionDetails>>();

function load(id: string) {
  let request = requests.get(id);
  if (!request) {
    request = getCompetitionDetails({ data: id });
    // A failed request is not cached, so the next open retries.
    request.catch(() => requests.delete(id));
    requests.set(id, request);
  }

  return request;
}

// With refreshMs set, reloads in the background and keeps the last good result on screen.
export function useCompetitionDetails(
  id: string,
  enabled = true,
  refreshMs?: number,
): State {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    if (!enabled || !/^\d+$/.test(id)) {
      return;
    }

    let active = true;
    setState({ status: "loading" });
    load(id).then(
      (details) => active && setState({ status: "done", details }),
      (error: unknown) =>
        active &&
        setState({
          status: "error",
          error: error instanceof Error ? error.message : String(error),
        }),
    );

    const timer = refreshMs
      ? setInterval(() => {
          requests.delete(id);
          load(id).then(
            (details) => active && setState({ status: "done", details }),
            () => undefined,
          );
        }, refreshMs)
      : undefined;

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [id, enabled, refreshMs]);

  return state;
}

import { METRIX_URL } from "~/constants";

const DEFAULT_TIMEOUT_MS = 15_000;

// Asks for English so the course page labels match the parser.
export async function metrixFetch(path: string, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const res = await fetch(`${METRIX_URL}${path}`, {
    headers: { "Accept-Language": "en", "User-Agent": "disc.kaarel.dev" },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    throw new Error(`Metrix answered with HTTP ${res.status}`);
  }

  return res;
}

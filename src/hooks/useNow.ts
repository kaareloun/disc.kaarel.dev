import { useEffect, useState } from "react";

// Starts from the server time so the first client render matches the server HTML.
export function useNow(initialNow: number, intervalMs = 30_000) {
  const [now, setNow] = useState(initialNow);

  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}

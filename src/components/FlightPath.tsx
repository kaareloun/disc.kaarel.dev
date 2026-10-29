import { motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";

const PATH = "M 14 50 C 80 6, 190 -2, 268 34";
const END = { x: 268, y: 34 };
const DURATION_S = 1.2;
const DELAY_S = 0.25;
const EASE = [0.23, 1, 0.32, 1] as const;

// Draws a disc flying from the user to the basket. Plays once per mount.
export function FlightPath({ label }: { label: string }) {
  // Read after mount. The server cannot know the preference, and both first renders must match.
  const [reduceMotion, setReduceMotion] = useState(false);
  const maskId = useId();
  const flightRef = useRef<SVGAnimateMotionElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduceMotion(true);
      return;
    }
    const timer = setTimeout(
      () => flightRef.current?.beginElement(),
      DELAY_S * 1000,
    );

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative">
      <svg
        viewBox="0 0 300 64"
        className="h-auto w-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <mask id={maskId}>
            <motion.path
              key={String(reduceMotion)}
              d={PATH}
              fill="none"
              stroke="white"
              strokeWidth="6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: DURATION_S, delay: DELAY_S, ease: EASE }
              }
            />
          </mask>
        </defs>
        <path
          d={PATH}
          fill="none"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray="0.1 7"
          mask={`url(#${maskId})`}
          className="stroke-muted-foreground/70"
        />
        <circle cx="14" cy="50" r="4.5" className="fill-foreground" />
        <circle
          cx="14"
          cy="50"
          r="9"
          fill="none"
          strokeWidth="1.5"
          className="stroke-foreground/20"
        />

        <g
          transform={`translate(${END.x + 14} ${END.y - 10})`}
          className="text-foreground/80"
        >
          <path d="M -9 0 h 18 l -2 7 h -14 z" className="fill-current" />
          <path
            d="M -7 7 L -3 22 M 0 7 L 0 22 M 7 7 L 3 22 M -4 7 L -6 22 M 4 7 L 6 22"
            strokeWidth="1"
            className="stroke-current opacity-60"
          />
          <rect
            x="-10"
            y="21"
            width="20"
            height="5"
            rx="1.5"
            className="fill-current"
          />
          <rect x="-1" y="26" width="2" height="12" className="fill-current" />
        </g>

        <motion.g
          key={String(reduceMotion)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={
            reduceMotion ? { duration: 0 } : { duration: 0.15, delay: DELAY_S }
          }
          transform={reduceMotion ? `translate(${END.x} ${END.y})` : undefined}
        >
          {!reduceMotion && (
            <animateMotion
              ref={flightRef}
              path={PATH}
              dur={`${DURATION_S}s`}
              begin="indefinite"
              fill="freeze"
              calcMode="spline"
              keyTimes="0;1"
              keyPoints="0;1"
              keySplines={EASE.join(" ")}
            />
          )}
          <ellipse rx="9" ry="4.2" className="fill-primary" />
          <ellipse
            rx="5.5"
            ry="2.4"
            fill="none"
            strokeWidth="1"
            className="stroke-primary-foreground/50"
          />
        </motion.g>
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}

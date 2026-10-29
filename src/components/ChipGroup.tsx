import { motion } from "motion/react";
import { useId } from "react";
import { cn } from "~/lib/utils";

type Props<T extends string | number> = {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  className?: string;
};

export function ChipGroup<T extends string | number>({
  label,
  value,
  options,
  onChange,
  className,
}: Props<T>) {
  const groupId = useId();

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "flex shrink-0 items-center gap-0.5 rounded-full border bg-card p-1",
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "pressable relative h-8 whitespace-nowrap rounded-full px-3 text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "text-background"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {selected && (
              <motion.span
                layoutId={`chip-${groupId}`}
                className="absolute inset-0 rounded-full bg-foreground"
                transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
              />
            )}
            <span className="relative">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

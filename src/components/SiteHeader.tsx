import type { ComponentProps } from "react";
import { DiscLogo } from "./DiscLogo";
import { LocationPicker } from "./LocationPicker";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader(props: ComponentProps<typeof LocationPicker>) {
  return (
    <header className="flex items-center justify-between gap-3 py-4">
      <a
        href="/"
        className="flex items-center gap-2.5"
        aria-label="disc.kaarel.dev home"
      >
        <DiscLogo />
        <span className="text-lg font-bold tracking-tight">
          disc
          <span className="hidden text-muted-foreground sm:inline">
            .kaarel.dev
          </span>
        </span>
      </a>
      <div className="flex items-center gap-1.5">
        <LocationPicker {...props} />
        <ThemeToggle />
      </div>
    </header>
  );
}

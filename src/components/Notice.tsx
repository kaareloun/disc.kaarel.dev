import { cn } from "~/lib/utils";

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "error";
  children: React.ReactNode;
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-2xl px-4 py-3 text-sm font-medium",
        tone === "error"
          ? "bg-destructive/10 text-destructive"
          : "bg-muted text-muted-foreground",
      )}
    >
      {children}
    </p>
  );
}

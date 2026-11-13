import { INTERESTS } from "@/lib/campus-options";
import { cn } from "@/lib/utils";

export function InterestsStep({
  value,
  onToggle,
}: {
  value: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2" role="group" aria-label="Interests">
      {INTERESTS.map(({ id, label, icon: Icon }) => {
        const selected = value.includes(id);
        return (
          <button
            key={id}
            type="button"
            aria-pressed={selected}
            onClick={() => onToggle(id)}
            className={cn(
              "flex items-center gap-3 rounded-xl border bg-card px-3.5 py-3 text-left text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "border-primary bg-primary-soft font-medium text-foreground"
                : "border-border text-foreground/85 hover:border-foreground/20",
            )}
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              <Icon className="size-4" />
            </span>
            {label}
          </button>
        );
      })}
    </div>
  );
}

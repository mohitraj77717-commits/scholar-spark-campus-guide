import { cn } from "@/lib/utils";

export function StepProgress({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-3" aria-label={`Step ${step + 1} of ${total}`}>
      <div className="flex flex-1 gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i <= step ? "bg-primary" : "bg-border",
            )}
          />
        ))}
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">
        {step + 1}/{total}
      </span>
    </div>
  );
}

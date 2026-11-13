import { FlaskConical } from "lucide-react";

import { cn } from "@/lib/utils";

export function DemoBadge({ className, label = "Demo data" }: { className?: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-demo px-2 py-0.5 text-[11px] font-medium text-demo-foreground",
        className,
      )}
    >
      <FlaskConical className="size-3" aria-hidden="true" />
      {label}
    </span>
  );
}

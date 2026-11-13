import { GraduationCap } from "lucide-react";

import { cn } from "@/lib/utils";

export function CampusMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground",
        className,
      )}
      aria-hidden="true"
    >
      <GraduationCap className="size-[60%]" strokeWidth={2} />
    </span>
  );
}

export function CampusLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <CampusMark />
      <span className="text-[15px] font-semibold tracking-tight text-foreground">Campus AI</span>
    </span>
  );
}

import { Check } from "lucide-react";

import { COURSES } from "@/lib/campus-options";
import { cn } from "@/lib/utils";
import type { CourseId } from "@/types/campus";

export function CourseStep({
  value,
  onChange,
}: {
  value: CourseId | null;
  onChange: (id: CourseId) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Course" className="grid gap-3">
      {COURSES.map((course) => {
        const selected = value === course.id;
        return (
          <button
            key={course.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(course.id)}
            className={cn(
              "group flex items-start gap-4 rounded-xl border bg-card p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              selected
                ? "border-primary bg-primary-soft shadow-soft"
                : "border-border hover:border-foreground/20",
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                selected ? "border-primary bg-primary text-primary-foreground" : "border-input",
              )}
            >
              {selected && <Check className="size-3" strokeWidth={3} />}
            </span>
            <span className="grid gap-1">
              <span className="font-medium text-foreground">{course.label}</span>
              <span className="text-sm leading-snug text-muted-foreground">{course.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

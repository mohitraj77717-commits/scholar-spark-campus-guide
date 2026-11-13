import { BookOpen, CalendarDays } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { ACADEMIC_NOTIFICATION_TOPICS, EVENT_NOTIFICATION_TOPICS } from "@/lib/campus-options";
import { cn } from "@/lib/utils";

function PreferenceRow({
  id,
  icon: Icon,
  title,
  topics,
  checked,
  onChange,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  topics: string[];
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className={cn(
        "flex gap-4 rounded-xl border bg-card p-4 transition-colors",
        checked ? "border-primary/40" : "border-border",
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
          checked ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor={id} className="cursor-pointer font-medium text-foreground">
            {title}
          </label>
          <Switch id={id} checked={checked} onCheckedChange={onChange} />
        </div>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {topics.map((t) => (
            <li key={t} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function NotificationsStep({
  events,
  academic,
  onEventsChange,
  onAcademicChange,
}: {
  events: boolean;
  academic: boolean;
  onEventsChange: (v: boolean) => void;
  onAcademicChange: (v: boolean) => void;
}) {
  return (
    <div className="grid gap-3">
      <PreferenceRow
        id="event-notifications"
        icon={CalendarDays}
        title="Event notifications"
        topics={EVENT_NOTIFICATION_TOPICS}
        checked={events}
        onChange={onEventsChange}
      />
      <PreferenceRow
        id="academic-notifications"
        icon={BookOpen}
        title="Academic notifications"
        topics={ACADEMIC_NOTIFICATION_TOPICS}
        checked={academic}
        onChange={onAcademicChange}
      />
      <p className="text-xs text-muted-foreground">You can change these at any time.</p>
    </div>
  );
}

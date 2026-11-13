import { Bell, BookOpen, CalendarDays, Server } from "lucide-react";

import { DemoBadge } from "@/components/campus/DemoBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { courseLabel, interestLabel } from "@/lib/campus-options";
import type { StudentProfile } from "@/types/campus";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5 border-b py-3 last:border-b-0">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

export function SettingsDialog({
  open,
  onOpenChange,
  profile,
  mockMode,
  apiBaseUrl,
  onEditPreferences,
  onReset,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: StudentProfile;
  mockMode: boolean;
  apiBaseUrl: string;
  onEditPreferences: () => void;
  onReset: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profile & settings</DialogTitle>
          <DialogDescription>Your onboarding answers, used to personalise replies.</DialogDescription>
        </DialogHeader>

        <div>
          <Row label="Course">
            {courseLabel(profile.course)} · Year {profile.year}
          </Row>
          <Row label="Interests">
            <div className="flex flex-wrap gap-1.5">
              {profile.interests.map((id) => (
                <span key={id} className="rounded-md bg-muted px-2 py-0.5 text-xs">
                  {interestLabel(id)}
                </span>
              ))}
            </div>
          </Row>
          <Row label="Notifications">
            <ul className="grid gap-1.5">
              <li className="flex items-center gap-2">
                <CalendarDays className="size-4 text-muted-foreground" /> Event notifications
                <span className="ml-auto text-xs text-muted-foreground">
                  {profile.event_notifications ? "On" : "Off"}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <BookOpen className="size-4 text-muted-foreground" /> Academic notifications
                <span className="ml-auto text-xs text-muted-foreground">
                  {profile.academic_notifications ? "On" : "Off"}
                </span>
              </li>
            </ul>
          </Row>
          <Row label="Backend">
            <div className="flex items-center gap-2">
              <Server className="size-4 text-muted-foreground" />
              {mockMode ? (
                <>
                  Not connected <DemoBadge label="Mock responses" />
                </>
              ) : (
                <span className="truncate font-mono text-xs">{apiBaseUrl}</span>
              )}
            </div>
          </Row>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button variant="ghost" className="text-muted-foreground" onClick={onReset}>
            Start over
          </Button>
          <Button variant="outline" onClick={onEditPreferences}>
            <Bell /> Edit preferences
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

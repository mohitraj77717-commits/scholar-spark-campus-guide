import { ChevronsUpDown, SquarePen } from "lucide-react";

import { CampusLogo } from "@/components/campus/CampusLogo";
import { Button } from "@/components/ui/button";
import { courseLabel } from "@/lib/campus-options";
import type { ConversationSummary, StudentProfile } from "@/types/campus";
import { ConversationList } from "./ConversationList";

export interface ChatSidebarProps {
  conversations: ConversationSummary[];
  listStatus: "loading" | "ready" | "error";
  listError?: string | undefined;
  activeId: string | null;
  profile: StudentProfile;
  mockMode: boolean;
  onNewChat: () => void;
  onSelect: (id: string) => void;
  onRename: (c: ConversationSummary) => void;
  onDelete: (c: ConversationSummary) => void;
  onReload: () => void;
  onOpenSettings: () => void;
}

export function ChatSidebar(props: ChatSidebarProps) {
  const { profile, mockMode } = props;
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <CampusLogo />
      </div>

      <div className="px-3 pb-3">
        <Button
          variant="outline"
          className="h-9 w-full justify-start gap-2 bg-background shadow-none"
          onClick={props.onNewChat}
        >
          <SquarePen /> New chat
        </Button>
      </div>

      <div className="scrollbar-thin min-h-0 flex-1 overflow-y-auto pt-1">
        <ConversationList
          conversations={props.conversations}
          status={props.listStatus}
          error={props.listError}
          activeId={props.activeId}
          onSelect={props.onSelect}
          onRename={props.onRename}
          onDelete={props.onDelete}
          onReload={props.onReload}
        />
      </div>

      <div className="border-t border-sidebar-border p-3">
        {mockMode && (
          <p className="mb-2 rounded-lg bg-demo px-2.5 py-2 text-[11px] leading-snug text-demo-foreground">
            Demo mode: sample conversations, not saved. Chats reset when you reload.
          </p>
        )}
        <button
          type="button"
          onClick={props.onOpenSettings}
          className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
            1Y
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">First-year student</span>
            <span className="block truncate text-xs text-muted-foreground">
              {courseLabel(profile.course)} · Settings
            </span>
          </span>
          <ChevronsUpDown className="size-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

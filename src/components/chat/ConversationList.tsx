import { isToday, isYesterday, differenceInCalendarDays } from "date-fns";
import { MessageSquare, MoreHorizontal, Pencil, RotateCw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ConversationSummary } from "@/types/campus";

function groupLabel(iso: string) {
  const d = new Date(iso);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  if (differenceInCalendarDays(new Date(), d) < 7) return "Previous 7 days";
  return "Older";
}

function groupConversations(list: ConversationSummary[]) {
  const groups: { label: string; items: ConversationSummary[] }[] = [];
  for (const c of list) {
    const label = groupLabel(c.updated_at);
    const g = groups.find((x) => x.label === label);
    if (g) g.items.push(c);
    else groups.push({ label, items: [c] });
  }
  return groups;
}

export function ConversationList({
  conversations,
  status,
  error,
  activeId,
  onSelect,
  onRename,
  onDelete,
  onReload,
}: {
  conversations: ConversationSummary[];
  status: "loading" | "ready" | "error";
  error?: string | undefined;
  activeId: string | null;
  onSelect: (id: string) => void;
  onRename: (c: ConversationSummary) => void;
  onDelete: (c: ConversationSummary) => void;
  onReload: () => void;
}) {
  if (status === "loading" && conversations.length === 0) {
    return (
      <div className="space-y-2 px-3 py-2" aria-label="Loading conversations">
        {[70, 85, 60, 75].map((w) => (
          <Skeleton key={w} className="h-7 bg-sidebar-accent" style={{ width: `${w}%` }} />
        ))}
      </div>
    );
  }

  if (status === "error" && conversations.length === 0) {
    return (
      <div className="mx-3 my-2 rounded-lg border border-destructive/25 bg-destructive/5 p-3 text-xs text-destructive">
        <p>{error ?? "Couldn't load your conversations."}</p>
        <Button variant="ghost" size="sm" className="mt-2 h-7 px-2 text-destructive" onClick={onReload}>
          <RotateCw /> Try again
        </Button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-10 text-center text-sm text-muted-foreground">
        <MessageSquare className="size-5" />
        <p>No conversations yet.</p>
        <p className="text-xs">Start a new chat and it will appear here.</p>
      </div>
    );
  }

  return (
    <nav aria-label="Conversation history" className="space-y-4 px-2 pb-4">
      {groupConversations(conversations).map((group) => (
        <div key={group.label}>
          <p className="px-2.5 pb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((c) => {
              const active = c.id === activeId;
              return (
                <li key={c.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "w-full truncate rounded-lg py-2 pl-2.5 pr-9 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                      active
                        ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
                    )}
                    title={c.title}
                  >
                    {c.title}
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label={`Options for ${c.title}`}
                        className={cn(
                          "absolute right-1 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-opacity hover:bg-background hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none data-[state=open]:opacity-100",
                          active ? "opacity-100" : "md:opacity-0 md:group-hover:opacity-100",
                        )}
                      >
                        <MoreHorizontal className="size-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-40">
                      <DropdownMenuItem onSelect={() => onRename(c)}>
                        <Pencil /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => onDelete(c)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

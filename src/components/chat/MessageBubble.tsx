import { format } from "date-fns";
import { AlertCircle, FileText } from "lucide-react";

import { CampusMark } from "@/components/campus/CampusLogo";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types/campus";

function Time({ iso, className }: { iso: string; className?: string }) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return (
    <time dateTime={iso} className={cn("text-[11px] text-muted-foreground", className)}>
      {format(d, "h:mm a")}
    </time>
  );
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    const failed = message.status === "failed";
    return (
      <div className="flex animate-fade-up flex-col items-end gap-1">
        <div
          className={cn(
            "max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-bubble-user px-4 py-2.5 text-[15px] leading-relaxed text-foreground",
            failed && "opacity-70",
          )}
        >
          {message.content}
        </div>
        <div className="flex items-center gap-2 pr-1">
          {failed && (
            <span className="inline-flex items-center gap-1 text-[11px] text-destructive">
              <AlertCircle className="size-3" /> Not sent
            </span>
          )}
          <Time iso={message.created_at} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex animate-fade-up gap-3">
      <CampusMark className="mt-0.5 size-7 rounded-md" />
      <div className="min-w-0 flex-1">
        <div className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-foreground">
          {message.content}
        </div>
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3">
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Sources
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {message.sources.map((s, i) => (
                <li key={`${s.title}-${i}`}>
                  {s.url ? (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border bg-card px-2 py-1 text-xs text-foreground/80 transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                      <FileText className="size-3" /> {s.title}
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-md border bg-card px-2 py-1 text-xs text-muted-foreground">
                      <FileText className="size-3" /> {s.title}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        <Time iso={message.created_at} className="mt-2 block" />
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex animate-fade-up gap-3" role="status" aria-live="polite">
      <CampusMark className="mt-0.5 size-7 rounded-md" />
      <div className="flex h-7 items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="typing-dot size-1.5 rounded-full bg-muted-foreground"
            style={{ animationDelay: `${i * 0.16}s` }}
          />
        ))}
        <span className="sr-only">Campus AI is responding…</span>
      </div>
    </div>
  );
}

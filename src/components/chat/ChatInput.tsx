import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

import { cn } from "@/lib/utils";

const MAX_HEIGHT = 200;

export function ChatInput({
  onSend,
  disabled,
  autoFocusKey,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
  /** Change this value to re-focus the input (e.g. when switching conversations). */
  autoFocusKey?: string;
}) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  };

  useEffect(resize, [value]);
  useEffect(() => {
    ref.current?.focus();
  }, [autoFocusKey]);

  const canSend = value.trim().length > 0 && !disabled;

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (!canSend) return;
    onSend(value);
    setValue("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form
      onSubmit={submit}
      className="flex items-end gap-2 rounded-2xl border border-input bg-card p-2 pl-4 shadow-input transition-colors focus-within:border-foreground/25"
    >
      <label htmlFor="chat-input" className="sr-only">
        Message Campus AI
      </label>
      <textarea
        id="chat-input"
        ref={ref}
        rows={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask about events, workshops or academics…"
        className="scrollbar-thin max-h-[200px] min-h-[24px] flex-1 resize-none bg-transparent py-1.5 text-[15px] leading-6 text-foreground outline-none placeholder:text-muted-foreground"
      />
      <button
        type="submit"
        disabled={!canSend}
        aria-label="Send message"
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          canSend
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "cursor-not-allowed bg-muted text-muted-foreground",
        )}
      >
        <ArrowUp className="size-4" strokeWidth={2.5} />
      </button>
    </form>
  );
}

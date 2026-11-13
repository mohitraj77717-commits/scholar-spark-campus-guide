import { AlertCircle, RotateCw, X } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ErrorNotice({
  message,
  onRetry,
  onDismiss,
}: {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex animate-fade-up items-start gap-3 rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3 text-sm text-destructive"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <p className="flex-1 leading-relaxed">{message}</p>
      <div className="flex shrink-0 items-center gap-1">
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onRetry}
          >
            <RotateCw /> Retry
          </Button>
        )}
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Dismiss error"
            className="size-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={onDismiss}
          >
            <X />
          </Button>
        )}
      </div>
    </div>
  );
}

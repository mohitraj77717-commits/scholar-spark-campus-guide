import { useEffect, useState, type FormEvent } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import type { ConversationSummary } from "@/types/campus";

export function RenameDialog({
  conversation,
  onClose,
  onSave,
}: {
  conversation: ConversationSummary | null;
  onClose: () => void;
  onSave: (id: string, title: string) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (conversation) setTitle(conversation.title);
  }, [conversation]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!conversation || !title.trim()) return;
    setSaving(true);
    try {
      await onSave(conversation.id, title);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!conversation} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Rename conversation</DialogTitle>
            <DialogDescription>Give this chat a name you'll recognise later.</DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={title}
            maxLength={80}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Conversation title"
          />
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !title.trim()}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteDialog({
  conversation,
  onClose,
  onConfirm,
}: {
  conversation: ConversationSummary | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);

  const confirm = async () => {
    if (!conversation) return;
    setDeleting(true);
    try {
      await onConfirm(conversation.id);
      onClose();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AlertDialog open={!!conversation} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
          <AlertDialogDescription>
            “{conversation?.title}” will be removed from your history. This can't be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={buttonVariants({ variant: "destructive" })}
            disabled={deleting}
            onClick={(e) => {
              e.preventDefault();
              void confirm();
            }}
          >
            {deleting ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

import { ClientOnly, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Menu, SquarePen } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { CampusMark } from "@/components/campus/CampusLogo";
import { DemoBadge } from "@/components/campus/DemoBadge";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { DeleteDialog, RenameDialog } from "@/components/chat/ConversationDialogs";
import { ErrorNotice } from "@/components/chat/ErrorNotice";
import { MessageBubble, TypingIndicator } from "@/components/chat/MessageBubble";
import { SettingsDialog } from "@/components/chat/SettingsDialog";
import { WelcomeScreen } from "@/components/chat/WelcomeScreen";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useChat } from "@/hooks/use-chat";
import { clearProfile, useProfile } from "@/lib/profile-store";
import { apiBaseUrl, getErrorMessage, isMockMode } from "@/services/api";
import type { ConversationSummary, StudentProfile } from "@/types/campus";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat — Campus AI" },
      {
        name: "description",
        content: "Ask Campus AI about hackathons, workshops, college events and academic announcements.",
      },
      { property: "og:title", content: "Chat — Campus AI" },
      {
        property: "og:description",
        content: "Your personal university assistant for events, workshops and academics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ChatRoute,
});

function ChatRoute() {
  return (
    <ClientOnly fallback={<ChatShellSkeleton />}>
      <ChatGate />
    </ClientOnly>
  );
}

function ChatShellSkeleton() {
  return (
    <div className="flex h-dvh bg-background">
      <div className="hidden w-72 shrink-0 border-r bg-sidebar p-4 md:block">
        <Skeleton className="h-8 w-32 bg-sidebar-accent" />
        <Skeleton className="mt-4 h-9 w-full bg-sidebar-accent" />
      </div>
      <div className="flex-1" />
    </div>
  );
}

function ChatGate() {
  const profile = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!profile) void navigate({ to: "/", replace: true });
  }, [profile, navigate]);

  if (!profile) return <ChatShellSkeleton />;
  return <ChatApp profile={profile} />;
}

function ChatApp({ profile }: { profile: StudentProfile }) {
  const chat = useChat();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [renaming, setRenaming] = useState<ConversationSummary | null>(null);
  const [deleting, setDeleting] = useState<ConversationSummary | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const showWelcome = !chat.activeId && chat.messages.length === 0;
  const threadLoading = chat.threadState?.status === "loading" && chat.messages.length === 0;
  const threadError = chat.threadState?.status === "error" ? chat.threadState.error : undefined;

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [chat.messages.length, chat.isSending, chat.sendError, chat.activeId]);

  const closeMobile = () => setMobileOpen(false);

  const sidebar = (
    <ChatSidebar
      conversations={chat.conversations}
      listStatus={chat.listState.status}
      listError={chat.listState.error}
      activeId={chat.activeId}
      profile={profile}
      mockMode={isMockMode}
      onNewChat={() => {
        chat.startNewChat();
        closeMobile();
      }}
      onSelect={(id) => {
        chat.selectConversation(id);
        closeMobile();
      }}
      onRename={setRenaming}
      onDelete={setDeleting}
      onReload={() => void chat.reloadConversations()}
      onOpenSettings={() => {
        closeMobile();
        setSettingsOpen(true);
      }}
    />
  );

  const title = chat.activeConversation?.title ?? "New chat";

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <aside className="hidden w-72 shrink-0 border-r border-sidebar-border md:block">{sidebar}</aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[85%] max-w-xs border-sidebar-border p-0 [&>button]:hidden">
          <SheetTitle className="sr-only">Campus AI navigation</SheetTitle>
          <SheetDescription className="sr-only">Conversations and settings</SheetDescription>
          {sidebar}
        </SheetContent>
      </Sheet>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-3 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <Menu />
          </Button>
          <CampusMark className="size-6 rounded-md md:hidden" />
          <h2 className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{title}</h2>
          {isMockMode && <DemoBadge className="hidden sm:inline-flex" />}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="New chat"
            onClick={chat.startNewChat}
          >
            <SquarePen />
          </Button>
        </header>

        <div ref={scrollRef} className="scrollbar-thin flex min-h-0 flex-1 flex-col overflow-y-auto">
          {showWelcome ? (
            <WelcomeScreen
              profile={profile}
              disabled={chat.isBusy}
              onPrompt={(p) => void chat.sendMessage(p)}
            />
          ) : (
            <div className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-6 md:px-6 md:py-8">
              {threadLoading && (
                <div className="space-y-6" aria-label="Loading messages">
                  <Skeleton className="ml-auto h-10 w-2/5 rounded-2xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-3/5" />
                  </div>
                </div>
              )}
              {threadError && (
                <ErrorNotice message={threadError} onRetry={() => void chat.reloadMessages()} />
              )}
              {chat.messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
              {chat.isSending && <TypingIndicator />}
              {chat.sendError && (
                <ErrorNotice
                  message={chat.sendError.message}
                  onRetry={chat.retry}
                  onDismiss={chat.dismissError}
                />
              )}
            </div>
          )}
        </div>

        <div className="shrink-0 px-3 pb-3 pt-2 md:px-6 md:pb-5">
          <div className="mx-auto w-full max-w-3xl">
            <ChatInput
              onSend={(t) => void chat.sendMessage(t)}
              disabled={chat.isBusy}
              autoFocusKey={chat.activeId ?? "new"}
            />
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              {isMockMode
                ? "Demo mode — replies are placeholder data, not real university information. Type /error to preview an error."
                : "Campus AI can make mistakes. Check important dates with official notices."}
            </p>
          </div>
        </div>
      </main>

      <RenameDialog
        conversation={renaming}
        onClose={() => setRenaming(null)}
        onSave={async (id, t) => {
          try {
            await chat.renameConversation(id, t);
            toast.success("Conversation renamed");
          } catch (e) {
            toast.error(getErrorMessage(e));
            throw e;
          }
        }}
      />
      <DeleteDialog
        conversation={deleting}
        onClose={() => setDeleting(null)}
        onConfirm={async (id) => {
          try {
            await chat.deleteConversation(id);
            toast.success("Conversation deleted");
          } catch (e) {
            toast.error(getErrorMessage(e));
            throw e;
          }
        }}
      />
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        profile={profile}
        mockMode={isMockMode}
        apiBaseUrl={apiBaseUrl}
        onEditPreferences={() => {
          setSettingsOpen(false);
          void navigate({ to: "/", search: { edit: true } });
        }}
        onReset={() => {
          setSettingsOpen(false);
          clearProfile();
        }}
      />
    </div>
  );
}

/**
 * Chat state for the Campus AI interface. Holds conversations in memory and talks to
 * the backend only through the ApiClient (src/services/api.ts).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { api, getErrorMessage } from "@/services/api";
import { deriveTitle } from "@/services/mock/mockApi";
import type { ApiClient, ChatMessage, ConversationSummary } from "@/types/campus";

const NEW_KEY = "__new__";

type LoadState = { status: "loading" | "ready" | "error"; error?: string };
type SendError = { key: string; message: string; text: string; messageId: string };

let tempCounter = 0;
const tempId = () => `local-${Date.now().toString(36)}-${tempCounter++}`;

export function useChat(client: ApiClient = api) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [listState, setListState] = useState<LoadState>({ status: "loading" });
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const activeRef = useRef<string | null>(null);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const [threadState, setThreadState] = useState<Record<string, LoadState>>({});
  const [sendingKey, setSendingKey] = useState<string | null>(null);
  const sendingRef = useRef<string | null>(null);
  const [sendError, setSendError] = useState<SendError | null>(null);

  const setActiveId = (id: string | null) => {
    activeRef.current = id;
    setActiveIdState(id);
  };

  const loadConversations = useCallback(async () => {
    setListState({ status: "loading" });
    try {
      const list = await client.listConversations();
      setConversations(list);
      setListState({ status: "ready" });
    } catch (e) {
      setListState({ status: "error", error: getErrorMessage(e) });
    }
  }, [client]);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  const loadMessages = useCallback(
    async (id: string) => {
      setThreadState((s) => ({ ...s, [id]: { status: "loading" } }));
      try {
        const list = await client.getMessages(id);
        setMessages((s) => ({ ...s, [id]: list }));
        setThreadState((s) => ({ ...s, [id]: { status: "ready" } }));
      } catch (e) {
        setThreadState((s) => ({ ...s, [id]: { status: "error", error: getErrorMessage(e) } }));
      }
    },
    [client],
  );

  const selectConversation = useCallback(
    (id: string) => {
      setActiveId(id);
      if (!messagesRef.current[id]) void loadMessages(id);
    },
    [loadMessages],
  );

  const startNewChat = useCallback(() => {
    setActiveId(null);
    if (sendingRef.current !== NEW_KEY) {
      setMessages((s) => ({ ...s, [NEW_KEY]: [] }));
      setSendError((e) => (e?.key === NEW_KEY ? null : e));
    }
  }, []);

  const sendMessage = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || sendingRef.current) return;

      const conversationId = activeRef.current;
      const key = conversationId ?? NEW_KEY;
      const userMsg: ChatMessage = {
        id: tempId(),
        role: "user",
        content: text,
        created_at: new Date().toISOString(),
        status: "sent",
      };

      setMessages((s) => ({ ...s, [key]: [...(s[key] ?? []), userMsg] }));
      sendingRef.current = key;
      setSendingKey(key);
      setSendError(null);

      try {
        const res = await client.sendMessage({ conversation_id: conversationId, message: text });
        const realId = res.conversation_id;
        const assistant: ChatMessage = {
          id: tempId(),
          role: "assistant",
          content: res.reply,
          created_at: new Date().toISOString(),
          sources: res.sources,
        };

        setMessages((s) => {
          const next = { ...s };
          const prev = next[key] ?? [];
          if (key === NEW_KEY) delete next[NEW_KEY];
          next[realId] = [...prev, assistant];
          return next;
        });
        setThreadState((s) => ({ ...s, [realId]: { status: "ready" } }));
        setConversations((list) => {
          const existing = list.find((c) => c.id === realId);
          const updated: ConversationSummary = existing
            ? { ...existing, updated_at: assistant.created_at }
            : { id: realId, title: deriveTitle(text), updated_at: assistant.created_at };
          return [updated, ...list.filter((c) => c.id !== realId)];
        });
        if (key === NEW_KEY && activeRef.current === null) setActiveId(realId);
      } catch (e) {
        setMessages((s) => ({
          ...s,
          [key]: (s[key] ?? []).map((m) => (m.id === userMsg.id ? { ...m, status: "failed" } : m)),
        }));
        setSendError({ key, message: getErrorMessage(e), text, messageId: userMsg.id });
      } finally {
        sendingRef.current = null;
        setSendingKey(null);
      }
    },
    [client],
  );

  const retry = useCallback(() => {
    if (!sendError) return;
    const { key, messageId, text } = sendError;
    setMessages((s) => ({ ...s, [key]: (s[key] ?? []).filter((m) => m.id !== messageId) }));
    void sendMessage(text);
  }, [sendError, sendMessage]);

  const dismissError = useCallback(() => setSendError(null), []);

  const deleteConversation = useCallback(
    async (id: string) => {
      await client.deleteConversation(id);
      setConversations((list) => list.filter((c) => c.id !== id));
      setMessages((s) => {
        const next = { ...s };
        delete next[id];
        return next;
      });
      if (activeRef.current === id) startNewChat();
    },
    [client, startNewChat],
  );

  const renameConversation = useCallback(
    async (id: string, title: string) => {
      const clean = title.trim();
      if (!clean) return;
      const updated = await client.renameConversation(id, clean);
      setConversations((list) =>
        list.map((c) => (c.id === id ? { ...c, title: updated.title || clean } : c)),
      );
    },
    [client],
  );

  const key = activeId ?? NEW_KEY;
  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId],
  );

  return {
    conversations,
    listState,
    reloadConversations: loadConversations,
    activeId,
    activeConversation,
    messages: messages[key] ?? [],
    threadState: activeId ? threadState[activeId] : undefined,
    reloadMessages: () => activeId && loadMessages(activeId),
    isSending: sendingKey === key,
    isBusy: sendingKey !== null,
    sendError: sendError?.key === key ? sendError : null,
    sendMessage,
    retry,
    dismissError,
    selectConversation,
    startNewChat,
    deleteConversation,
    renameConversation,
  };
}

export type ChatController = ReturnType<typeof useChat>;

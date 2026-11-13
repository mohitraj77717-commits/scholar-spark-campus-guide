/**
 * MOCK API — demonstration responses used until the Flask backend is connected.
 *
 * Data lives in memory only and resets when the page reloads. Nothing here is real
 * university information. Type "/error" in the chat to preview the error state.
 */
import type { ApiClient, ChatMessage, ConversationSummary } from "@/types/campus";
import { buildMockReply, createSeedConversations, type MockConversation } from "./mockData";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const jitter = (min: number, max: number) => min + Math.random() * (max - min);

let conversations: MockConversation[] = createSeedConversations();
let counter = 0;

const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}`;

export function deriveTitle(message: string): string {
  const clean = message.replace(/\s+/g, " ").trim();
  if (clean.length <= 42) return clean || "New conversation";
  return `${clean.slice(0, 40).trimEnd()}…`;
}

function summary(c: MockConversation): ConversationSummary {
  return { id: c.id, title: c.title, updated_at: c.updated_at };
}

function notFound(): never {
  throw Object.assign(new Error("That conversation could not be found."), { name: "ApiError", status: 404 });
}

/** Resets demo data (used by tests). */
export function resetMockData() {
  conversations = createSeedConversations();
}

export const mockApi: ApiClient = {
  async createStudent() {
    await wait(jitter(400, 700));
    return { student_id: nextId("demo-student") };
  },

  async sendMessage({ conversation_id, message }) {
    await wait(jitter(700, 1300));

    if (message.trim().toLowerCase() === "/error") {
      throw Object.assign(
        new Error("Demo: the assistant couldn't respond (simulated error). Try sending again."),
        { name: "ApiError", status: 503 },
      );
    }

    const now = new Date().toISOString();
    let convo = conversation_id ? conversations.find((c) => c.id === conversation_id) : undefined;
    if (conversation_id && !convo) notFound();
    if (!convo) {
      convo = { id: nextId("demo-chat"), title: deriveTitle(message), updated_at: now, messages: [] };
      conversations = [convo, ...conversations];
    }

    const { reply, sources } = buildMockReply(message);
    const userMsg: ChatMessage = { id: nextId("m"), role: "user", content: message, created_at: now };
    const botMsg: ChatMessage = {
      id: nextId("m"),
      role: "assistant",
      content: reply,
      created_at: new Date().toISOString(),
      sources,
    };
    convo.messages.push(userMsg, botMsg);
    convo.updated_at = botMsg.created_at;

    return { conversation_id: convo.id, reply, sources };
  },

  async listConversations() {
    await wait(jitter(300, 600));
    return [...conversations]
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
      .map(summary);
  },

  async getMessages(conversationId) {
    await wait(jitter(250, 500));
    const convo = conversations.find((c) => c.id === conversationId);
    if (!convo) notFound();
    return convo.messages.map((m) => ({ ...m }));
  },

  async deleteConversation(conversationId) {
    await wait(jitter(200, 400));
    conversations = conversations.filter((c) => c.id !== conversationId);
  },

  async renameConversation(conversationId, title) {
    await wait(jitter(150, 300));
    const convo = conversations.find((c) => c.id === conversationId);
    if (!convo) notFound();
    convo.title = title;
    return summary(convo);
  },
};

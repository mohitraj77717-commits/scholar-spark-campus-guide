/**
 * Campus AI API service layer.
 *
 * Every request to the Flask backend goes through this file. Components never call
 * `fetch` directly. When VITE_API_BASE_URL is empty (or VITE_USE_MOCK_API=true) the
 * clearly separated mock client in ./mock/mockApi.ts answers instead.
 */
import { API_BASE_URL, USE_MOCK_API } from "@/config/env";
import type {
  ApiClient,
  ChatMessage,
  ChatResponse,
  ConversationSummary,
  Source,
  StudentPayload,
  StudentProfile,
  StudentResponse,
} from "@/types/campus";
import { mockApi } from "./mock/mockApi";

export class ApiError extends Error {
  status?: number | undefined;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/** Maps onboarding answers to the POST /api/students body. */
export function buildStudentPayload(
  profile: Pick<StudentProfile, "course" | "year" | "interests" | "event_notifications" | "academic_notifications">,
): StudentPayload {
  return {
    course: profile.course,
    year: profile.year,
    interests: [...profile.interests],
    event_notification_preference: profile.event_notifications,
    academic_notification_preference: profile.academic_notifications,
  };
}

/** Turns any thrown value into a message that is safe to show to students. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}

function normalizeSources(raw: unknown): Source[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((s): Source | null => {
      if (typeof s === "string") return { title: s };
      if (s && typeof s === "object" && "title" in s) {
        const o = s as { title: unknown; url?: unknown };
        return { title: String(o.title), url: typeof o.url === "string" ? o.url : null };
      }
      return null;
    })
    .filter((s): s is Source => s !== null);
}

function unwrapList<T>(data: unknown, key: string): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && Array.isArray((data as Record<string, unknown>)[key])) {
    return (data as Record<string, T[]>)[key] ?? [];
  }
  return [];
}

export interface ApiClientOptions {
  baseUrl: string;
  useMock: boolean;
  fetchImpl?: typeof fetch;
}

export function createApiClient({ baseUrl, useMock, fetchImpl }: ApiClientOptions): ApiClient {
  if (useMock) return mockApi;

  const doFetch: typeof fetch = fetchImpl ?? ((input, init) => fetch(input, init));

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    let res: Response;
    try {
      res = await doFetch(`${baseUrl}${path}`, {
        ...init,
        headers: { "Content-Type": "application/json", Accept: "application/json", ...init?.headers },
      });
    } catch {
      throw new ApiError(
        "Can't reach the Campus AI server. Check your connection or make sure the backend is running.",
      );
    }

    if (!res.ok) {
      let message = `The server responded with an error (${res.status}).`;
      try {
        const body = (await res.json()) as { error?: string; message?: string };
        message = body.error || body.message || message;
      } catch {
        /* non-JSON error body */
      }
      throw new ApiError(message, res.status);
    }

    if (res.status === 204) return undefined as T;
    const text = await res.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }

  const id = (value: string) => encodeURIComponent(value);

  return {
    createStudent: (payload) =>
      request<StudentResponse>("/api/students", { method: "POST", body: JSON.stringify(payload) }),

    async sendMessage({ conversation_id, message }) {
      const data = await request<Partial<ChatResponse>>("/api/chat", {
        method: "POST",
        body: JSON.stringify({ conversation_id, message }),
      });
      if (!data?.conversation_id || typeof data.reply !== "string") {
        throw new ApiError("The server sent an unexpected chat response.");
      }
      return {
        conversation_id: String(data.conversation_id),
        reply: data.reply,
        sources: normalizeSources(data.sources),
      };
    },

    async listConversations() {
      const data = await request<unknown>("/api/conversations");
      return unwrapList<ConversationSummary>(data, "conversations");
    },

    async getMessages(conversationId) {
      const data = await request<unknown>(`/api/conversations/${id(conversationId)}/messages`);
      return unwrapList<ChatMessage>(data, "messages").map((m) => ({
        ...m,
        sources: normalizeSources(m.sources),
      }));
    },

    async deleteConversation(conversationId) {
      await request<void>(`/api/conversations/${id(conversationId)}`, { method: "DELETE" });
    },

    /** Optional endpoint — add PATCH /api/conversations/{id} to Flask to persist renames. */
    async renameConversation(conversationId, title) {
      const data = await request<Partial<ConversationSummary> | undefined>(
        `/api/conversations/${id(conversationId)}`,
        { method: "PATCH", body: JSON.stringify({ title }) },
      );
      return {
        id: conversationId,
        title: data?.title ?? title,
        updated_at: data?.updated_at ?? new Date().toISOString(),
      };
    },
  };
}

/** The client the app uses, configured from environment variables. */
export const api: ApiClient = createApiClient({ baseUrl: API_BASE_URL, useMock: USE_MOCK_API });
export const isMockMode = USE_MOCK_API;
export const apiBaseUrl = API_BASE_URL;

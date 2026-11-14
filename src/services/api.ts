/**
 * Campus AI API service layer.
 *
 * Every request to the Flask backend goes through this file. Components never call
 * `fetch` directly. When VITE_API_BASE_URL is empty (or VITE_USE_MOCK_API=true) the
 * clearly separated mock client in ./mock/mockApi.ts answers instead.
 *
 * Paths live in ./endpoints.ts. Anything marked PROPOSED there is not built yet.
 */
import { API_BASE_URL, USE_MOCK_API } from "@/config/env";
import { getSessionToken } from "@/lib/session-store";
import type {
  Announcement,
  ApiClient,
  AuthUser,
  ChatMessage,
  ChatResponse,
  ConversationSummary,
  SignInResponse,
  Source,
  StudentNotification,
  StudentPayload,
  StudentProfile,
  StudentResponse,
  TeacherSubmission,
  UserRole,
} from "@/types/campus";
import { ENDPOINTS } from "./endpoints";
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

/** True when the backend says the token is missing, expired or lacks permission. */
export function isAuthError(error: unknown): boolean {
  const status = (error as { status?: number } | null)?.status;
  return status === 401 || status === 403;
}

const ROLE_LABEL: Record<UserRole, string> = {
  student: "student",
  teacher: "teacher / in-charge",
  admin: "administrator",
};

/** The role a login screen asked for must match the role the backend verified. */
export function assertRole(user: AuthUser, expected: UserRole): AuthUser {
  if (user.role !== expected) {
    throw new ApiError(`This account isn't authorised as a ${ROLE_LABEL[expected]}.`, 403);
  }
  return user;
}

const str = (v: unknown) => (typeof v === "string" ? v : null);

function normalizeSources(raw: unknown): Source[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((s): Source | null => {
      if (typeof s === "string") return { title: s };
      if (s && typeof s === "object" && "title" in s) {
        const o = s as Record<string, unknown>;
        const by = o["submitted_by"] as Record<string, unknown> | null | undefined;
        const category = str(o["category"]);
        return {
          title: String(o["title"]),
          url: str(o["url"]),
          announcement_id: str(o["announcement_id"]),
          category: category === "event" || category === "academic" || category === "general" ? category : null,
          registration_url: str(o["registration_url"]),
          submitted_by:
            by && typeof by === "object" && str(by["teacher_name"])
              ? {
                  teacher_id: String(by["teacher_id"] ?? ""),
                  teacher_name: String(by["teacher_name"]),
                  department: str(by["department"]),
                }
              : null,
        };
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

function unwrapItem<T>(data: unknown, key: string): T {
  if (data && typeof data === "object" && key in (data as Record<string, unknown>)) {
    return (data as Record<string, T>)[key] as T;
  }
  return data as T;
}

function readUser(data: unknown): AuthUser {
  const user = unwrapItem<Partial<AuthUser> | undefined>(data, "user");
  if (!user?.id || !user.role || !["student", "teacher", "admin"].includes(user.role)) {
    throw new ApiError("The server sent an unexpected account response.");
  }
  return user as AuthUser;
}

function readSignIn(data: unknown): SignInResponse {
  const token = (data as { token?: unknown } | undefined)?.token;
  if (typeof token !== "string" || !token) throw new ApiError("The server didn't return a sign-in token.");
  return { token, user: readUser(data) };
}

const SIGN_IN_PATH: Record<UserRole, string> = {
  student: ENDPOINTS.studentSignIn,
  teacher: ENDPOINTS.teacherSignIn,
  admin: ENDPOINTS.adminSignIn,
};

export interface ApiClientOptions {
  baseUrl: string;
  useMock: boolean;
  fetchImpl?: typeof fetch;
  /** Returns the current sign-in token (defaults to the one saved on this device). */
  getAuthToken?: () => string | null;
}

export function createApiClient({ baseUrl, useMock, fetchImpl, getAuthToken = getSessionToken }: ApiClientOptions): ApiClient {
  if (useMock) return mockApi;

  const doFetch: typeof fetch = fetchImpl ?? ((input, init) => fetch(input, init));

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const isForm = typeof FormData !== "undefined" && init?.body instanceof FormData;
    const token = getAuthToken();
    let res: Response;
    try {
      res = await doFetch(`${baseUrl}${path}`, {
        ...init,
        headers: {
          Accept: "application/json",
          ...(isForm ? {} : { "Content-Type": "application/json" }),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...init?.headers,
        },
      });
    } catch {
      throw new ApiError(
        "Can't reach the Campus AI server. Check your connection or make sure the backend is running.",
      );
    }

    if (!res.ok) {
      let message =
        res.status === 401
          ? "Your session has ended. Please sign in again."
          : res.status === 403
            ? "You don't have permission to do that."
            : `The server responded with an error (${res.status}).`;
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

  const post = (body?: unknown): RequestInit => ({
    method: "POST",
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

  return {
    createStudent: (payload) => request<StudentResponse>(ENDPOINTS.students, post(payload)),

    async sendMessage({ conversation_id, message }) {
      const data = await request<Partial<ChatResponse>>(ENDPOINTS.chat, post({ conversation_id, message }));
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
      return unwrapList<ConversationSummary>(await request<unknown>(ENDPOINTS.conversations), "conversations");
    },

    async getMessages(conversationId) {
      const data = await request<unknown>(ENDPOINTS.conversationMessages(conversationId));
      return unwrapList<ChatMessage>(data, "messages").map((m) => ({ ...m, sources: normalizeSources(m.sources) }));
    },

    async deleteConversation(conversationId) {
      await request<void>(ENDPOINTS.conversation(conversationId), { method: "DELETE" });
    },

    /** Optional endpoint — add PATCH /api/conversations/{id} to Flask to persist renames. */
    async renameConversation(conversationId, title) {
      const data = await request<Partial<ConversationSummary> | undefined>(ENDPOINTS.conversation(conversationId), {
        method: "PATCH",
        body: JSON.stringify({ title }),
      });
      return {
        id: conversationId,
        title: data?.title ?? title,
        updated_at: data?.updated_at ?? new Date().toISOString(),
      };
    },

    // ---- authentication
    async signIn({ email, password, role }) {
      const res = readSignIn(await request<unknown>(SIGN_IN_PATH[role], post({ email, password })));
      assertRole(res.user, role);
      return res;
    },

    async registerStudent({ name, email, password }) {
      const res = readSignIn(await request<unknown>(ENDPOINTS.studentRegister, post({ name, email, password })));
      assertRole(res.user, "student");
      return res;
    },

    async getCurrentUser() {
      return readUser(await request<unknown>(ENDPOINTS.currentUser));
    },

    async signOut() {
      await request<void>(ENDPOINTS.signOut, post());
    },

    // ---- notifications
    async listNotifications() {
      return unwrapList<StudentNotification>(await request<unknown>(ENDPOINTS.notifications), "notifications");
    },

    async markNotificationRead(notificationId) {
      await request<void>(ENDPOINTS.notificationRead(notificationId), post());
    },

    async markAllNotificationsRead() {
      await request<void>(ENDPOINTS.notificationsReadAll, post());
    },

    async updateNotificationPreferences(prefs) {
      const data = await request<Partial<typeof prefs> | undefined>(ENDPOINTS.notificationPreferences, {
        method: "PUT",
        body: JSON.stringify(prefs),
      });
      return { ...prefs, ...data };
    },

    async getAnnouncement(announcementId) {
      return unwrapItem<Announcement>(await request<unknown>(ENDPOINTS.announcement(announcementId)), "announcement");
    },

    // ---- teacher submissions
    async listMySubmissions() {
      return unwrapList<TeacherSubmission>(await request<unknown>(ENDPOINTS.mySubmissions), "submissions");
    },

    async getMySubmission(submissionId) {
      return unwrapItem<TeacherSubmission>(await request<unknown>(ENDPOINTS.mySubmission(submissionId)), "submission");
    },

    async createSubmission(input) {
      // Teacher identity is deliberately absent: the backend takes it from the verified token.
      const form = new FormData();
      form.append("title", input.title.trim());
      form.append("category", input.category);
      form.append("announcement_text", input.announcement_text.trim());
      form.append("registration_url", input.registration_url.trim());
      input.audience.forEach((c) => form.append("audience", c));
      if (input.file) form.append("document", input.file, input.file.name);
      const data = await request<unknown>(ENDPOINTS.mySubmissions, { method: "POST", body: form });
      return unwrapItem<TeacherSubmission>(data, "submission");
    },

    // ---- admin approvals
    async listReviewQueue() {
      return unwrapList<TeacherSubmission>(await request<unknown>(ENDPOINTS.reviewQueue), "submissions");
    },

    async getReviewSubmission(submissionId) {
      return unwrapItem<TeacherSubmission>(await request<unknown>(ENDPOINTS.reviewSubmission(submissionId)), "submission");
    },

    async reviewSubmission(submissionId, decision) {
      const data = await request<unknown>(ENDPOINTS.reviewDecision(submissionId), post(decision));
      return unwrapItem<TeacherSubmission>(data, "submission");
    },
  };
}

/** The client the app uses, configured from environment variables. */
export const api: ApiClient = createApiClient({ baseUrl: API_BASE_URL, useMock: USE_MOCK_API });
export const isMockMode = USE_MOCK_API;
export const apiBaseUrl = API_BASE_URL;

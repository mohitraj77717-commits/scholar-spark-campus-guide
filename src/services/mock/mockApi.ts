/**
 * MOCK API — demonstration responses used until the Flask backend is connected.
 *
 * It behaves like a backend (tokens, role checks, approvals) so the interface can be
 * explored, but data lives in memory and resets when the page reloads. Nothing here is
 * real university information. Type "/error" in the chat to preview the error state.
 */
import { getProfile } from "@/lib/profile-store";
import { getSessionToken } from "@/lib/session-store";
import { submissionTypeOf } from "@/lib/submission-rules";
import type { ApiClient, AuthUser, ChatMessage, ConversationSummary, UserRole } from "@/types/campus";
import {
  buildMockReply,
  createSeedAccounts,
  createSeedConversations,
  createSeedSubmissions,
  SEED_READ_NOTIFICATIONS,
  type MockAccount,
  type MockConversation,
} from "./mockData";
import {
  approvedAnnouncementsFor,
  notificationIdFor,
  studentNotifications,
  toAnnouncement,
  type MockSubmission,
} from "./notificationWorkflow";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const jitter = (min: number, max: number) => min + Math.random() * (max - min);

let conversations: MockConversation[] = createSeedConversations();
let accounts: MockAccount[] = createSeedAccounts();
let submissions: MockSubmission[] = createSeedSubmissions();
let readIds = new Set<string>(SEED_READ_NOTIFICATIONS);
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

function fail(message: string, status: number): never {
  throw Object.assign(new Error(message), { name: "ApiError", status });
}

const notFound = (what = "conversation"): never => fail(`That ${what} could not be found.`, 404);

/** Resets demo data (used by tests). */
export function resetMockData() {
  conversations = createSeedConversations();
  accounts = createSeedAccounts();
  submissions = createSeedSubmissions();
  readIds = new Set(SEED_READ_NOTIFICATIONS);
}

/* ------------------------------------------------------------- demo tokens */

function encodeToken(user: AuthUser): string {
  return `demo.${btoa(encodeURIComponent(JSON.stringify(user)))}`;
}

function decodeToken(token: string | null): AuthUser | null {
  if (!token?.startsWith("demo.")) return null;
  try {
    return JSON.parse(decodeURIComponent(atob(token.slice(5)))) as AuthUser;
  } catch {
    return null;
  }
}

function currentUser(): AuthUser {
  const user = decodeToken(getSessionToken());
  if (!user) fail("Your session has ended. Please sign in again.", 401);
  return accounts.find((a) => a.user.id === user.id)?.user ?? user;
}

function requireRole(role: UserRole): AuthUser {
  const user = currentUser();
  if (user.role !== role) fail("You don't have permission to do that.", 403);
  return user;
}

function studentContext() {
  const profile = getProfile();
  return {
    course: profile?.course ?? "cse-ai-ml",
    event_notifications: profile?.event_notifications ?? true,
    academic_notifications: profile?.academic_notifications ?? true,
  } as const;
}

export const mockApi: ApiClient = {
  async createStudent(payload) {
    await wait(jitter(400, 700));
    const user = requireRole("student");
    const student_id = nextId("demo-student");
    const account = accounts.find((a) => a.user.id === user.id);
    if (account) account.user = { ...account.user, student_profile: { student_id, ...payload } };
    return { student_id };
  },

  async sendMessage({ conversation_id, message }) {
    await wait(jitter(700, 1300));
    requireRole("student");

    if (message.trim().toLowerCase() === "/error") {
      fail("Demo: the assistant couldn't respond (simulated error). Try sending again.", 503);
    }

    const now = new Date().toISOString();
    let convo = conversation_id ? conversations.find((c) => c.id === conversation_id) : undefined;
    if (conversation_id && !convo) notFound();
    if (!convo) {
      convo = { id: nextId("demo-chat"), title: deriveTitle(message), updated_at: now, messages: [] };
      conversations = [convo, ...conversations];
    }

    const { reply, sources } = buildMockReply(message, approvedAnnouncementsFor(submissions, studentContext().course));
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
    return [...conversations].sort((a, b) => b.updated_at.localeCompare(a.updated_at)).map(summary);
  },

  async getMessages(conversationId) {
    await wait(jitter(250, 500));
    const convo = conversations.find((c) => c.id === conversationId);
    if (!convo) return notFound();
    return convo.messages.map((m) => ({ ...m }));
  },

  async deleteConversation(conversationId) {
    await wait(jitter(200, 400));
    conversations = conversations.filter((c) => c.id !== conversationId);
  },

  async renameConversation(conversationId, title) {
    await wait(jitter(150, 300));
    const convo = conversations.find((c) => c.id === conversationId);
    if (!convo) return notFound();
    convo.title = title;
    return summary(convo);
  },

  // ---- authentication (each login screen only accepts its own role)
  async signIn({ email, password, role }) {
    await wait(jitter(400, 700));
    const account = accounts.find((a) => a.user.email.toLowerCase() === email.trim().toLowerCase());
    if (!account || account.password !== password) fail("Incorrect email or password.", 401);
    if (account.user.role !== role) fail("This account isn't authorised for this sign-in page.", 403);
    return { token: encodeToken(account.user), user: account.user };
  },

  async registerStudent({ name, email, password }) {
    await wait(jitter(400, 700));
    if (accounts.some((a) => a.user.email.toLowerCase() === email.trim().toLowerCase())) {
      fail("An account with this email already exists.", 409);
    }
    // Public registration can only ever create students.
    const user: AuthUser = { id: nextId("student"), name: name.trim(), email: email.trim(), role: "student", student_profile: null };
    accounts.push({ user, password });
    return { token: encodeToken(user), user };
  },

  async getCurrentUser() {
    await wait(jitter(150, 300));
    return currentUser();
  },

  async signOut() {
    await wait(100);
  },

  // ---- notifications
  async listNotifications() {
    await wait(jitter(200, 400));
    requireRole("student");
    return studentNotifications(submissions, studentContext(), readIds);
  },

  async markNotificationRead(notificationId) {
    await wait(100);
    requireRole("student");
    readIds.add(notificationId);
  },

  async markAllNotificationsRead() {
    await wait(150);
    requireRole("student");
    studentNotifications(submissions, studentContext(), readIds).forEach((n) => readIds.add(n.id));
  },

  async updateNotificationPreferences(prefs) {
    await wait(200);
    requireRole("student");
    return prefs;
  },

  async getAnnouncement(announcementId) {
    await wait(jitter(150, 300));
    requireRole("student");
    const s = submissions.find((x) => x.id === announcementId && x.status === "approved");
    if (!s) return notFound("announcement");
    return toAnnouncement(s);
  },

  // ---- teacher submissions
  async listMySubmissions() {
    await wait(jitter(250, 450));
    const me = requireRole("teacher");
    return submissions.filter((s) => s.teacher_id === me.id).sort((a, b) => b.submitted_at.localeCompare(a.submitted_at));
  },

  async getMySubmission(submissionId) {
    await wait(jitter(150, 300));
    const me = requireRole("teacher");
    const s = submissions.find((x) => x.id === submissionId && x.teacher_id === me.id);
    if (!s) return notFound("submission");
    return s;
  },

  async createSubmission(input) {
    await wait(jitter(600, 1000));
    const me = requireRole("teacher");
    const text = input.announcement_text.trim();
    const s: MockSubmission = {
      id: nextId("s"),
      title: input.title.trim(),
      category: input.category,
      type: submissionTypeOf(!!input.file, !!text),
      announcement_text: text || null,
      document: input.file
        ? { name: input.file.name, size: input.file.size, url: typeof URL.createObjectURL === "function" ? URL.createObjectURL(input.file) : null }
        : null,
      registration_url: input.registration_url.trim() || null,
      audience: [...input.audience],
      status: "pending",
      submitted_at: new Date().toISOString(),
      reviewed_at: null,
      review_note: null,
      teacher_id: me.id,
      teacher_name: me.name,
      teacher_department: me.department ?? null,
    };
    submissions = [s, ...submissions];
    return s;
  },

  // ---- admin approvals
  async listReviewQueue() {
    await wait(jitter(250, 450));
    requireRole("admin");
    const rank = { pending: 0, approved: 1, rejected: 2 } as const;
    return [...submissions].sort((a, b) => rank[a.status] - rank[b.status] || b.submitted_at.localeCompare(a.submitted_at));
  },

  async getReviewSubmission(submissionId) {
    await wait(jitter(150, 300));
    requireRole("admin");
    const s = submissions.find((x) => x.id === submissionId);
    if (!s) return notFound("submission");
    return s;
  },

  async reviewSubmission(submissionId, { decision, note }) {
    await wait(jitter(300, 500));
    requireRole("admin");
    const s = submissions.find((x) => x.id === submissionId);
    if (!s) return notFound("submission");
    if (decision === "rejected" && !note.trim()) fail("Add a note explaining why it was rejected.", 400);
    s.status = decision;
    s.reviewed_at = new Date().toISOString();
    s.review_note = note.trim() || null;
    // Approval re-shows the item as new to eligible students exactly once.
    readIds.delete(notificationIdFor(s.id));
    return s;
  },
};

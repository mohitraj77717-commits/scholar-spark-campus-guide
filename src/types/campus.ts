/** Shared types for Campus AI. Field names match the Flask API contract (snake_case). */

export type CourseId = "cse-ai-ml" | "cse-core";

/** Campus AI is currently intended for first-year students only. */
export const STUDENT_YEAR = 1 as const;

/* ------------------------------------------------------------------ students */

/** Onboarding answers kept on this device. */
export interface StudentProfile {
  student_id: string | null;
  course: CourseId;
  year: typeof STUDENT_YEAR;
  interests: string[];
  event_notifications: boolean;
  academic_notifications: boolean;
}

/** POST /api/students request body */
export interface StudentPayload {
  course: CourseId;
  year: number;
  interests: string[];
  event_notification_preference: boolean;
  academic_notification_preference: boolean;
}

/** POST /api/students response body. `token` is optional: the backend may identify students by token. */
export interface StudentResponse {
  student_id: string;
  token?: string | null;
}

/* ---------------------------------------------------------------------- auth */

/** Roles the backend can assign. Picking a role in the UI never grants it. */
export type UserRole = "student" | "teacher" | "admin";

/** Student onboarding answers as stored by the backend (returned by GET /api/auth/me). */
export interface StoredStudentProfile {
  student_id: string;
  course: CourseId;
  year: number;
  interests: string[];
  event_notification_preference: boolean;
  academic_notification_preference: boolean;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string | null;
  /** Students only: their saved course setup, or null if they haven't finished it. */
  student_profile?: StoredStudentProfile | null;
}

export interface SignInRequest {
  email: string;
  password: string;
  /** The login screen used. Each role has its own endpoint; the backend must verify the account's role. */
  role: UserRole;
}

/** Public registration only ever creates student accounts. */
export interface RegisterStudentRequest {
  name: string;
  email: string;
  password: string;
}

export interface SignInResponse {
  token: string;
  user: AuthUser;
}

/* ------------------------------------------------------------- announcements */

export type AnnouncementCategory = "event" | "academic" | "general";
/** Students can only receive Event or Academic notifications. */
export type NotificationCategory = "event" | "academic";
export type ApprovalStatus = "pending" | "approved" | "rejected";
export type SubmissionType = "pdf" | "text" | "pdf_text";

/** The verified faculty account that submitted a piece of information. */
export interface VerifiedBy {
  teacher_id: string;
  teacher_name: string;
  department?: string | null;
}

export interface DocumentFile {
  name: string;
  url?: string | null;
  size?: number | null;
}

/** Approved information that students can read (GET announcement). */
export interface Announcement {
  id: string;
  title: string;
  summary: string;
  content: string | null;
  category: AnnouncementCategory;
  audience: CourseId[];
  registration_url: string | null;
  document: DocumentFile | null;
  source: VerifiedBy;
  approved_at: string;
}

export interface StudentNotification {
  id: string;
  announcement_id: string;
  title: string;
  description: string;
  category: NotificationCategory;
  created_at: string;
  read: boolean;
  source: VerifiedBy;
  approval_status: ApprovalStatus;
}

export interface NotificationPreferences {
  event_notifications: boolean;
  academic_notifications: boolean;
}

/** What a teacher fills in. Teacher identity is NOT part of it — the backend takes it from the session. */
export interface SubmissionInput {
  title: string;
  category: AnnouncementCategory;
  announcement_text: string;
  registration_url: string;
  audience: CourseId[];
  file: File | null;
}

export interface ReviewDecision {
  decision: "approved" | "rejected";
  /** Required when rejecting so the teacher knows what to fix. */
  note: string;
}

export interface TeacherSubmission {
  id: string;
  title: string;
  category: AnnouncementCategory;
  type: SubmissionType;
  announcement_text: string | null;
  document: DocumentFile | null;
  registration_url: string | null;
  audience: CourseId[];
  status: ApprovalStatus;
  submitted_at: string;
  reviewed_at?: string | null;
  review_note?: string | null;
  teacher_id: string;
  teacher_name: string;
}

/* ---------------------------------------------------------------------- chat */

/** POST /api/chat request body */
export interface ChatRequest {
  conversation_id: string | null;
  message: string;
}

export interface Source {
  title: string;
  url?: string | null;
  /** Links the source to an approved announcement students can open. */
  announcement_id?: string | null;
  category?: AnnouncementCategory | null;
  registration_url?: string | null;
  /** Verified faculty account that submitted this information. */
  submitted_by?: VerifiedBy | null;
}

/** POST /api/chat response body */
export interface ChatResponse {
  conversation_id: string;
  reply: string;
  sources: Source[];
}

/** Item of GET /api/conversations */
export interface ConversationSummary {
  id: string;
  title: string;
  updated_at: string;
}

/** Item of GET /api/conversations/{conversation_id}/messages */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  sources?: Source[];
  /** Frontend-only delivery state. */
  status?: "sent" | "failed";
}

/* ---------------------------------------------------------------- api client */

/** Every backend call the UI makes. Implemented by the HTTP client and the mock client. */
export interface ApiClient {
  // students & chat
  createStudent(payload: StudentPayload): Promise<StudentResponse>;
  sendMessage(request: ChatRequest): Promise<ChatResponse>;
  listConversations(): Promise<ConversationSummary[]>;
  getMessages(conversationId: string): Promise<ChatMessage[]>;
  deleteConversation(conversationId: string): Promise<void>;
  renameConversation(conversationId: string, title: string): Promise<ConversationSummary>;

  // authentication & role verification
  signIn(request: SignInRequest): Promise<SignInResponse>;
  registerStudent(request: RegisterStudentRequest): Promise<SignInResponse>;
  getCurrentUser(): Promise<AuthUser>;
  signOut(): Promise<void>;

  // student notifications
  listNotifications(): Promise<StudentNotification[]>;
  markNotificationRead(notificationId: string): Promise<void>;
  markAllNotificationsRead(): Promise<void>;
  updateNotificationPreferences(prefs: NotificationPreferences): Promise<NotificationPreferences>;
  getAnnouncement(announcementId: string): Promise<Announcement>;

  // teacher submissions
  listMySubmissions(): Promise<TeacherSubmission[]>;
  getMySubmission(submissionId: string): Promise<TeacherSubmission>;
  createSubmission(input: SubmissionInput): Promise<TeacherSubmission>;

  // admin approvals
  listReviewQueue(): Promise<TeacherSubmission[]>;
  getReviewSubmission(submissionId: string): Promise<TeacherSubmission>;
  reviewSubmission(submissionId: string, decision: ReviewDecision): Promise<TeacherSubmission>;
}

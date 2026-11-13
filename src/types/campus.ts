/** Shared types for Campus AI. Field names match the Flask API contract (snake_case). */

export type CourseId = "cse-ai-ml" | "cse-core";

/** Campus AI is currently intended for first-year students only. */
export const STUDENT_YEAR = 1 as const;

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

/** POST /api/students response body */
export interface StudentResponse {
  student_id: string;
}

/** POST /api/chat request body */
export interface ChatRequest {
  conversation_id: string | null;
  message: string;
}

export interface Source {
  title: string;
  url?: string | null;
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

/** Every backend call the UI makes. Implemented by the HTTP client and the mock client. */
export interface ApiClient {
  createStudent(payload: StudentPayload): Promise<StudentResponse>;
  sendMessage(request: ChatRequest): Promise<ChatResponse>;
  listConversations(): Promise<ConversationSummary[]>;
  getMessages(conversationId: string): Promise<ChatMessage[]>;
  deleteConversation(conversationId: string): Promise<void>;
  renameConversation(conversationId: string, title: string): Promise<ConversationSummary>;
}

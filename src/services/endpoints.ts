/**
 * Every backend path the frontend calls, in one place.
 *
 * CONFIRMED: the original Campus AI contract (students, chat, conversations).
 * PROPOSED: suggested paths for features the Flask backend has not built yet. They are
 * not live anywhere — rename them here if the backend team chooses different URLs.
 */
const id = (value: string) => encodeURIComponent(value);

export const ENDPOINTS = {
  // confirmed
  students: "/api/students",
  chat: "/api/chat",
  conversations: "/api/conversations",
  conversation: (c: string) => `/api/conversations/${id(c)}`,
  conversationMessages: (c: string) => `/api/conversations/${id(c)}/messages`,

  // proposed — authentication & role verification
  signIn: "/api/auth/login",
  currentUser: "/api/auth/me",
  signOut: "/api/auth/logout",

  // proposed — student notifications
  notifications: "/api/notifications",
  notificationRead: (n: string) => `/api/notifications/${id(n)}/read`,
  notificationsReadAll: "/api/notifications/read-all",
  notificationPreferences: "/api/notification-preferences",
  announcement: (a: string) => `/api/announcements/${id(a)}`,

  // proposed — teacher submissions (approval status is read-only for teachers)
  mySubmissions: "/api/teacher/submissions",
  mySubmission: (s: string) => `/api/teacher/submissions/${id(s)}`,
} as const;

/**
 * MOCK of the backend's approval → notification workflow, so the preview behaves like
 * the real system. The Flask backend owns the real version of these rules:
 *
 *  - only approved submissions become announcements students can see or ask about
 *  - Event / Academic notifications go only to students in the chosen courses
 *    who have that category switched on
 *  - General announcements are searchable in chat but never send notifications
 *  - one notification per announcement (no duplicates)
 */
import type {
  Announcement,
  CourseId,
  NotificationPreferences,
  StudentNotification,
  TeacherSubmission,
} from "@/types/campus";

export interface MockSubmission extends TeacherSubmission {
  teacher_department: string | null;
}

export interface StudentContext extends NotificationPreferences {
  course: CourseId;
}

export function summarize(s: Pick<TeacherSubmission, "announcement_text" | "document">): string {
  const text = (s.announcement_text ?? "").replace(/\s+/g, " ").trim();
  if (text) return text.length > 140 ? `${text.slice(0, 138).trimEnd()}…` : text;
  return s.document ? `PDF document: ${s.document.name}` : "";
}

export const notificationIdFor = (submissionId: string) => `ntf-${submissionId}`;

export function toAnnouncement(s: MockSubmission): Announcement {
  return {
    id: s.id,
    title: s.title,
    summary: summarize(s),
    content: s.announcement_text,
    category: s.category,
    audience: [...s.audience],
    registration_url: s.registration_url,
    document: s.document,
    source: { teacher_id: s.teacher_id, teacher_name: s.teacher_name, department: s.teacher_department },
    approved_at: s.reviewed_at ?? s.submitted_at,
  };
}

/** Approved announcements a student in `course` may read or receive answers from. */
export function approvedAnnouncementsFor(submissions: MockSubmission[], course: CourseId): Announcement[] {
  return submissions
    .filter((s) => s.status === "approved" && s.audience.includes(course))
    .map(toAnnouncement)
    .sort((a, b) => b.approved_at.localeCompare(a.approved_at));
}

export function studentNotifications(
  submissions: MockSubmission[],
  student: StudentContext,
  readIds: ReadonlySet<string>,
): StudentNotification[] {
  const seen = new Set<string>();
  const result: StudentNotification[] = [];
  for (const s of submissions) {
    if (s.status !== "approved") continue;
    if (s.category === "general") continue;
    if (s.category === "event" && !student.event_notifications) continue;
    if (s.category === "academic" && !student.academic_notifications) continue;
    if (!s.audience.includes(student.course)) continue;
    const id = notificationIdFor(s.id);
    if (seen.has(id)) continue;
    seen.add(id);
    result.push({
      id,
      announcement_id: s.id,
      title: s.title,
      description: summarize(s),
      category: s.category,
      created_at: s.reviewed_at ?? s.submitted_at,
      read: readIds.has(id),
      source: { teacher_id: s.teacher_id, teacher_name: s.teacher_name, department: s.teacher_department },
      approval_status: "approved",
    });
  }
  return result.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

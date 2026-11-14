/**
 * DEMONSTRATION DATA ONLY.
 * None of these people, accounts, conversations, events or announcements are real. They
 * exist so the interface can be explored before the Flask backend is connected.
 * Registration links point at example.com, a reserved placeholder domain.
 */
import { format } from "date-fns";

import type { Announcement, AuthUser, ChatMessage, ConversationSummary, Source } from "@/types/campus";
import type { MockSubmission } from "./notificationWorkflow";

export const DEMO_SOURCE: Source = { title: "Demonstration source (placeholder, not a real document)" };

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();
const dayLabel = (daysFromNow: number) => format(new Date(Date.now() + daysFromNow * 86_400_000), "EEEE d MMMM");

/* ---------------------------------------------------------------- accounts */

export interface MockAccount {
  user: AuthUser;
  password: string;
}

export const DEMO_PASSWORD = "demo1234";

export function createSeedAccounts(): MockAccount[] {
  return [
    {
      password: DEMO_PASSWORD,
      user: { id: "student-1", name: "Demo Student", email: "student@demo.campus", role: "student", student_profile: null },
    },
    {
      password: DEMO_PASSWORD,
      user: {
        id: "teacher-1",
        name: "Dr. Meera Rao (demo)",
        email: "faculty.ai@demo.campus",
        role: "teacher",
        department: "Dept. of CSE (AI & ML) · demo",
      },
    },
    {
      password: DEMO_PASSWORD,
      user: {
        id: "teacher-2",
        name: "Prof. Arjun Menon (demo)",
        email: "faculty.core@demo.campus",
        role: "teacher",
        department: "Dept. of CSE · demo",
      },
    },
    {
      password: DEMO_PASSWORD,
      user: { id: "admin-1", name: "Academic Office (demo)", email: "admin@demo.campus", role: "admin" },
    },
  ];
}

/** Shown on the sign-in screens in demo mode only. */
export const DEMO_LOGINS = {
  student: [{ label: "Demo student", email: "student@demo.campus" }],
  teacher: [
    { label: "Dr. Meera Rao (demo)", email: "faculty.ai@demo.campus" },
    { label: "Prof. Arjun Menon (demo)", email: "faculty.core@demo.campus" },
  ],
  admin: [{ label: "Academic Office (demo)", email: "admin@demo.campus" }],
} as const;

/* ------------------------------------------------------------- submissions */

const RAO = { teacher_id: "teacher-1", teacher_name: "Dr. Meera Rao (demo)", teacher_department: "Dept. of CSE (AI & ML) · demo" };
const MENON = { teacher_id: "teacher-2", teacher_name: "Prof. Arjun Menon (demo)", teacher_department: "Dept. of CSE · demo" };

export function createSeedSubmissions(): MockSubmission[] {
  return [
    {
      ...RAO,
      id: "s-101",
      title: "Beginner robotics workshop (demo)",
      category: "event",
      type: "text",
      announcement_text: `Hands-on introduction to building simple Arduino robots, open to all first-year CSE students. No experience needed.\n\nWhen: ${dayLabel(6)}, 10:00 AM – 1:00 PM\nWhere: Robotics Lab (sample venue)\nRegister by ${dayLabel(4)} — seats are limited.`,
      document: null,
      registration_url: "https://example.com/demo/robotics-workshop",
      audience: ["cse-ai-ml", "cse-core"],
      status: "approved",
      submitted_at: minutesAgo(60 * 6),
      reviewed_at: minutesAgo(60 * 2),
      review_note: null,
    },
    {
      ...RAO,
      id: "s-102",
      title: "Mid-semester exam timetable released (demo)",
      category: "academic",
      type: "pdf_text",
      announcement_text: `The mid-semester examination timetable for first-year CSE AI & ML is attached. Exams begin ${dayLabel(14)}. Check your hall allocation in the PDF.`,
      document: { name: "midsem-timetable-demo.pdf", url: null, size: 245_000 },
      registration_url: null,
      audience: ["cse-ai-ml"],
      status: "approved",
      submitted_at: minutesAgo(60 * 30),
      reviewed_at: minutesAgo(60 * 24),
      review_note: null,
    },
    {
      ...RAO,
      id: "s-103",
      title: "Hackathon team formation session (demo)",
      category: "event",
      type: "text",
      announcement_text: `Looking for teammates for the upcoming campus hackathon? Join the team formation session on ${dayLabel(3)} at 4:00 PM in Seminar Hall 1 (sample venue).`,
      document: null,
      registration_url: "https://example.com/demo/hackathon-teams",
      audience: ["cse-ai-ml", "cse-core"],
      status: "pending",
      submitted_at: minutesAgo(60 * 3),
      reviewed_at: null,
      review_note: null,
    },
    {
      ...RAO,
      id: "s-104",
      title: "Inter-college coding contest (demo)",
      category: "event",
      type: "text",
      announcement_text: "An inter-college coding contest is open for first-year teams of two. Details to follow.",
      document: null,
      registration_url: "https://example.com/demo/coding-contest",
      audience: ["cse-ai-ml", "cse-core"],
      status: "rejected",
      submitted_at: minutesAgo(60 * 24 * 3),
      reviewed_at: minutesAgo(60 * 24 * 2),
      review_note: "Please attach the official circular from the organising college.",
    },
    {
      ...MENON,
      id: "s-201",
      title: "Data Structures assignment 2 deadline extended (demo)",
      category: "academic",
      type: "text",
      announcement_text: `The submission deadline for Data Structures assignment 2 has moved to ${dayLabel(5)}, 11:59 PM. Submit through the usual portal.`,
      document: null,
      registration_url: null,
      audience: ["cse-core", "cse-ai-ml"],
      status: "approved",
      submitted_at: minutesAgo(60 * 8),
      reviewed_at: minutesAgo(60 * 5),
      review_note: null,
    },
    {
      ...MENON,
      id: "s-202",
      title: "Tech fest volunteer call (demo)",
      category: "event",
      type: "text",
      announcement_text: "The annual tech fest needs first-year volunteers for registration desks, stage management and the robotics arena. Volunteers receive a participation certificate.",
      document: null,
      registration_url: "https://example.com/demo/techfest-volunteers",
      audience: ["cse-ai-ml", "cse-core"],
      status: "approved",
      submitted_at: minutesAgo(60 * 24 * 4),
      reviewed_at: minutesAgo(60 * 24 * 3),
      review_note: null,
    },
    {
      ...MENON,
      id: "s-203",
      title: "Central library extended hours (demo)",
      category: "general",
      type: "text",
      announcement_text: "During the exam period the central library will stay open until 10:00 PM on weekdays.",
      document: null,
      registration_url: null,
      audience: ["cse-ai-ml", "cse-core"],
      status: "approved",
      submitted_at: minutesAgo(60 * 24 * 2),
      reviewed_at: minutesAgo(60 * 24 * 2 - 30),
      review_note: null,
    },
    {
      ...MENON,
      id: "s-204",
      title: "CSE Core lab timetable change (demo)",
      category: "academic",
      type: "text",
      announcement_text: "From next week, the Programming Lab for CSE Core section B moves from Tuesday to Thursday afternoons.",
      document: null,
      registration_url: null,
      audience: ["cse-core"],
      status: "approved",
      submitted_at: minutesAgo(60 * 24 * 2 + 60),
      reviewed_at: minutesAgo(60 * 24 * 2),
      review_note: null,
    },
    {
      ...MENON,
      id: "s-205",
      title: "Web development club orientation (demo)",
      category: "event",
      type: "text",
      announcement_text: `Orientation for the web development club on ${dayLabel(8)} at 3:30 PM, Lab 4 (sample venue). Bring a laptop.`,
      document: null,
      registration_url: "https://example.com/demo/webdev-club",
      audience: ["cse-ai-ml", "cse-core"],
      status: "pending",
      submitted_at: minutesAgo(90),
      reviewed_at: null,
      review_note: null,
    },
  ];
}

export const SEED_READ_NOTIFICATIONS = ["ntf-s-202"];

/* ----------------------------------------------------------- conversations */

export interface MockConversation extends ConversationSummary {
  messages: ChatMessage[];
}

export function createSeedConversations(): MockConversation[] {
  return [
    {
      id: "demo-1",
      title: "Robotics workshops (demo)",
      updated_at: minutesAgo(45),
      messages: [
        {
          id: "demo-1-m1",
          role: "user",
          content: "Are there any robotics workshops for first-years?",
          created_at: minutesAgo(46),
        },
        {
          id: "demo-1-m2",
          role: "assistant",
          content:
            "Demo response — this is a sample conversation, not real university information.\n\nOnce Campus AI is connected to its backend, I'll list robotics workshops open to first-year students, with dates, venues and registration links taken from approved faculty announcements.",
          created_at: minutesAgo(45),
          sources: [DEMO_SOURCE],
        },
      ],
    },
    {
      id: "demo-2",
      title: "Preparing for a first hackathon (demo)",
      updated_at: minutesAgo(60 * 24 * 5),
      messages: [
        {
          id: "demo-2-m1",
          role: "user",
          content: "How should I prepare for my first hackathon?",
          created_at: minutesAgo(60 * 24 * 5 + 2),
        },
        {
          id: "demo-2-m2",
          role: "assistant",
          content:
            "Demo response — general tips (not tied to any real event):\n\n• Form a small team with mixed skills\n• Pick one simple idea and build a working demo\n• Practise a short, clear pitch\n• Rest and stay hydrated",
          created_at: minutesAgo(60 * 24 * 5),
        },
      ],
    },
  ];
}

/* ------------------------------------------------------------ chat replies */

const EVENT_WORDS = ["hackathon", "event", "workshop", "robot", "fest", "competition", "contest", "club", "register", "volunteer"];
const ACADEMIC_WORDS = ["academic", "announcement", "exam", "assignment", "timetable", "deadline", "lab", "library"];

function toSource(a: Announcement): Source {
  return {
    title: a.title,
    announcement_id: a.id,
    category: a.category,
    registration_url: a.registration_url,
    submitted_by: a.source,
  };
}

function pickRelevant(text: string, list: Announcement[]): Announcement[] {
  const words = text.split(/\W+/).filter((w) => w.length > 3);
  const matched = list.filter((a) => words.some((w) => a.title.toLowerCase().includes(w.replace(/s$/, ""))));
  return matched.length > 0 ? matched : list;
}

/**
 * Placeholder replies. Facts come only from approved demo announcements and every
 * source names the verified faculty account that submitted it — nothing is invented.
 */
export function buildMockReply(message: string, announcements: Announcement[]): { reply: string; sources: Source[] } {
  const text = message.toLowerCase();
  const note = "\n\nThis is a demonstration reply built from sample announcements, not real university information.";

  const wantsEvents = EVENT_WORDS.some((k) => text.includes(k));
  const wantsAcademic = ACADEMIC_WORDS.some((k) => text.includes(k));

  if (wantsEvents || wantsAcademic) {
    const pool = announcements.filter((a) =>
      wantsEvents && wantsAcademic ? true : wantsEvents ? a.category === "event" : a.category !== "event",
    );
    const items = pickRelevant(text, pool).slice(0, 4);
    if (items.length === 0) {
      return {
        reply:
          "Demo response — there are no approved announcements about that for your course yet. I only answer from information verified faculty have submitted and the college has approved, so I won't guess." +
          note,
        sources: [],
      };
    }
    const lines = items.map((a) => `• ${a.title}\n  ${a.summary}`).join("\n\n");
    const hasLinks = items.some((a) => a.registration_url);
    return {
      reply:
        `Demo response — here's what verified faculty have shared for your course:\n\n${lines}` +
        (hasLinks ? "\n\nRegistration links are shown with each source below." : "") +
        note,
      sources: items.map(toSource),
    };
  }

  return {
    reply: `Demo response — Campus AI isn't connected to its backend yet, so this is a placeholder reply to:\n\n“${message.trim()}”\n\nTry asking about workshops, hackathons, exams or deadlines to see answers built from sample faculty announcements.`,
    sources: [],
  };
}

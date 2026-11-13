/**
 * DEMONSTRATION DATA ONLY.
 * None of these conversations, events or announcements are real. They exist so the
 * interface can be explored before the Flask backend is connected.
 */
import type { ChatMessage, ConversationSummary, Source } from "@/types/campus";

export const DEMO_SOURCE: Source = { title: "Demonstration source (placeholder, not a real document)" };

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString();

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
            "Demo response — this is a sample conversation, not real university information.\n\nOnce Campus AI is connected to its backend, I'll list robotics workshops open to first-year students, with dates, venues and registration links taken from official announcements.",
          created_at: minutesAgo(45),
          sources: [DEMO_SOURCE],
        },
      ],
    },
    {
      id: "demo-2",
      title: "Exam timetable question (demo)",
      updated_at: minutesAgo(60 * 26),
      messages: [
        {
          id: "demo-2-m1",
          role: "user",
          content: "When will the mid-semester exam timetable be published?",
          created_at: minutesAgo(60 * 26 + 1),
        },
        {
          id: "demo-2-m2",
          role: "assistant",
          content:
            "Demo response — I don't have access to real academic announcements yet.\n\nWhen the backend is connected, I'll answer from the official examination notices and let you know as soon as a timetable is released (if academic notifications are switched on).",
          created_at: minutesAgo(60 * 26),
          sources: [DEMO_SOURCE],
        },
      ],
    },
    {
      id: "demo-3",
      title: "Preparing for a first hackathon (demo)",
      updated_at: minutesAgo(60 * 24 * 5),
      messages: [
        {
          id: "demo-3-m1",
          role: "user",
          content: "How should I prepare for my first hackathon?",
          created_at: minutesAgo(60 * 24 * 5 + 2),
        },
        {
          id: "demo-3-m2",
          role: "assistant",
          content:
            "Demo response — general tips (not tied to any real event):\n\n• Form a small team with mixed skills\n• Pick one simple idea and build a working demo\n• Practise a short, clear pitch\n• Rest and stay hydrated\n\nOnce connected, I'll also point you to hackathons announced by your university.",
          created_at: minutesAgo(60 * 24 * 5),
        },
      ],
    },
  ];
}

/** Placeholder replies keyed by topic. Never contains real events or announcements. */
export function buildMockReply(message: string): { reply: string; sources: Source[] } {
  const text = message.toLowerCase();
  const note =
    "\n\nThis is a demonstration reply. Real answers will come from official university information once the Campus AI backend is connected.";

  if (text.includes("hackathon")) {
    return {
      reply:
        "Demo response — I'm not connected to the university's event data yet, so I can't list real hackathons.\n\nWhen connected, this answer will include:\n• Upcoming hackathons open to first-year students\n• Registration deadlines and team size rules\n• Links to the official announcements\n\nExample format (placeholder):\n• Sample Hackathon · Date TBA · Venue TBA" +
        note,
      sources: [DEMO_SOURCE],
    };
  }
  if (text.includes("robot")) {
    return {
      reply:
        "Demo response — robotics workshop listings aren't available in demo mode.\n\nWhen connected, I'll show workshops matching your interests, including level (beginner / intermediate), dates and how to register.\n\nExample format (placeholder):\n• Sample Robotics Workshop · Date TBA" +
        note,
      sources: [DEMO_SOURCE],
    };
  }
  if (text.includes("event") || text.includes("fest")) {
    return {
      reply:
        "Demo response — I can't show real college events yet.\n\nWhen connected, I'll list upcoming technical events, workshops, competitions and festivals, filtered by the interests you chose during onboarding." +
        note,
      sources: [DEMO_SOURCE],
    };
  }
  if (
    ["academic", "announcement", "exam", "assignment", "timetable", "deadline"].some((k) =>
      text.includes(k),
    )
  ) {
    return {
      reply:
        "Demo response — academic announcements aren't available in demo mode.\n\nWhen connected, I'll summarise the latest examination updates, assignment deadlines, timetable changes and official academic announcements for your course." +
        note,
      sources: [DEMO_SOURCE],
    };
  }
  return {
    reply: `Demo response — Campus AI isn't connected to its backend yet, so this is a placeholder reply to:\n\n“${message.trim()}”${note}`,
    sources: [],
  };
}

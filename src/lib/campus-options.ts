import {
  Brain,
  Bot,
  Code2,
  Zap,
  Trophy,
  Rocket,
  FlaskConical,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import type { CourseId } from "@/types/campus";

export const COURSES: { id: CourseId; label: string; description: string }[] = [
  {
    id: "cse-ai-ml",
    label: "CSE AI & ML",
    description: "Computer Science and Engineering with Artificial Intelligence & Machine Learning.",
  },
  {
    id: "cse-core",
    label: "CSE Core",
    description: "Core Computer Science and Engineering.",
  },
];

export const INTERESTS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "artificial-intelligence", label: "Artificial Intelligence", icon: Brain },
  { id: "robotics", label: "Robotics", icon: Bot },
  { id: "web-development", label: "Web Development", icon: Code2 },
  { id: "hackathons", label: "Hackathons", icon: Zap },
  { id: "coding-competitions", label: "Coding Competitions", icon: Trophy },
  { id: "entrepreneurship", label: "Entrepreneurship", icon: Rocket },
  { id: "research", label: "Research", icon: FlaskConical },
  { id: "technical-workshops", label: "Technical Workshops", icon: Wrench },
];

export const EVENT_NOTIFICATION_TOPICS = [
  "Hackathons",
  "Workshops",
  "Competitions",
  "College festivals",
  "Technical events",
];

export const ACADEMIC_NOTIFICATION_TOPICS = [
  "Examination updates",
  "Assignment deadlines",
  "Timetable changes",
  "Academic announcements",
];

export const SUGGESTED_PROMPTS = [
  "What are the upcoming hackathons?",
  "Are there any robotics workshops?",
  "Show me upcoming college events.",
  "What are the latest academic announcements?",
];

export function courseLabel(id: CourseId | undefined | null): string {
  return COURSES.find((c) => c.id === id)?.label ?? "—";
}

export function interestLabel(id: string): string {
  return INTERESTS.find((i) => i.id === id)?.label ?? id;
}

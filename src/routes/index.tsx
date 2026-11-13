import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { CampusLogo } from "@/components/campus/CampusLogo";
import { DemoBadge } from "@/components/campus/DemoBadge";
import { CourseStep } from "@/components/onboarding/CourseStep";
import { InterestsStep } from "@/components/onboarding/InterestsStep";
import { NotificationsStep } from "@/components/onboarding/NotificationsStep";
import { StepProgress } from "@/components/onboarding/StepProgress";
import { Button } from "@/components/ui/button";
import { saveProfile, useProfile } from "@/lib/profile-store";
import { api, buildStudentPayload, getErrorMessage, isMockMode } from "@/services/api";
import { STUDENT_YEAR, type CourseId } from "@/types/campus";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { edit?: boolean } =>
    search.edit === true || search.edit === "true" ? { edit: true } : {},
  head: () => ({
    meta: [
      { title: "Campus AI — Your personal university assistant" },
      {
        name: "description",
        content:
          "Set up Campus AI, the AI assistant for first-year CSE students: pick your course, interests and notifications.",
      },
      { property: "og:title", content: "Campus AI — Your personal university assistant" },
      {
        property: "og:description",
        content: "Personalised answers about campus events, workshops and academic updates.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OnboardingPage,
});

const STEPS = [
  {
    eyebrow: "Welcome to Campus AI",
    title: "Which course are you in?",
    description: "Campus AI is currently available for first-year students.",
  },
  {
    eyebrow: "Your interests",
    title: "What are you into?",
    description: "Pick as many as you like. Campus AI uses these to personalise suggestions.",
  },
  {
    eyebrow: "Notifications",
    title: "How should we keep you updated?",
    description: "Turn each type of notification on or off independently.",
  },
];

function OnboardingPage() {
  const { edit } = Route.useSearch();
  const navigate = useNavigate();
  const profile = useProfile();

  const [step, setStep] = useState(0);
  const [course, setCourse] = useState<CourseId | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [eventNotifications, setEventNotifications] = useState(true);
  const [academicNotifications, setAcademicNotifications] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefilled, setPrefilled] = useState(false);

  // Returning students go straight to the chat unless they chose to edit preferences.
  useEffect(() => {
    if (profile && !edit) void navigate({ to: "/chat", replace: true });
  }, [profile, edit, navigate]);

  useEffect(() => {
    if (edit && profile && !prefilled) {
      setCourse(profile.course);
      setInterests(profile.interests);
      setEventNotifications(profile.event_notifications);
      setAcademicNotifications(profile.academic_notifications);
      setPrefilled(true);
    }
  }, [edit, profile, prefilled]);

  const canContinue = step === 0 ? course !== null : step === 1 ? interests.length > 0 : true;
  const isLast = step === STEPS.length - 1;

  const toggleInterest = (id: string) =>
    setInterests((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));

  const finish = async () => {
    if (!course) return;
    setSubmitting(true);
    setError(null);
    const draft = {
      course,
      year: STUDENT_YEAR,
      interests,
      event_notifications: eventNotifications,
      academic_notifications: academicNotifications,
    };
    try {
      const res = await api.createStudent(buildStudentPayload(draft));
      saveProfile({ ...draft, student_id: res.student_id ?? profile?.student_id ?? null });
      await navigate({ to: "/chat" });
    } catch (e) {
      setError(getErrorMessage(e));
      setSubmitting(false);
    }
  };

  const next = () => {
    if (!canContinue) return;
    if (isLast) void finish();
    else setStep((s) => s + 1);
  };

  const current = STEPS[step];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between px-5 py-4 sm:px-8">
        <CampusLogo />
        {isMockMode && <DemoBadge label="Demo mode" />}
      </header>

      <main className="flex flex-1 items-start justify-center px-5 pb-10 pt-4 sm:items-center sm:pt-0">
        <div className="w-full max-w-xl">
          <StepProgress step={step} total={STEPS.length} />

          <div key={step} className="mt-8 animate-fade-up">
            <p className="text-sm font-medium text-primary">{current.eyebrow}</p>
            <h1 className="mt-2 font-display text-4xl leading-tight text-foreground sm:text-[2.75rem]">
              {current.title}
            </h1>
            <p className="mt-2 text-[15px] text-muted-foreground">{current.description}</p>

            <div className="mt-7">
              {step === 0 && <CourseStep value={course} onChange={setCourse} />}
              {step === 1 && <InterestsStep value={interests} onToggle={toggleInterest} />}
              {step === 2 && (
                <NotificationsStep
                  events={eventNotifications}
                  academic={academicNotifications}
                  onEventsChange={setEventNotifications}
                  onAcademicChange={setAcademicNotifications}
                />
              )}
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-5 rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={submitting}>
                <ArrowLeft /> Back
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">Takes less than a minute</span>
            )}
            <div className="flex items-center gap-3">
              {step === 1 && (
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {interests.length} selected
                </span>
              )}
              <Button size="lg" className="px-6" onClick={next} disabled={!canContinue || submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" /> Setting up…
                  </>
                ) : (
                  <>
                    Continue <ArrowRight />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

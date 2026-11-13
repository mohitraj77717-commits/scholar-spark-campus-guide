import { ArrowUpRight } from "lucide-react";

import { CampusMark } from "@/components/campus/CampusLogo";
import { SUGGESTED_PROMPTS, courseLabel } from "@/lib/campus-options";
import type { StudentProfile } from "@/types/campus";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function WelcomeScreen({
  profile,
  onPrompt,
  disabled,
}: {
  profile: StudentProfile;
  onPrompt: (text: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-10">
      <div className="animate-fade-up">
        <CampusMark className="mb-6 size-10 rounded-xl" />
        <h1 className="font-display text-4xl leading-tight text-foreground sm:text-5xl">
          {greeting()}.
          <br />
          <span className="text-muted-foreground">How can I help on campus?</span>
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Ask about events, workshops and academic updates for {courseLabel(profile.course)}, first
          year.
        </p>
      </div>

      <div className="mt-8 grid gap-2 sm:grid-cols-2">
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <button
            key={prompt}
            type="button"
            disabled={disabled}
            onClick={() => onPrompt(prompt)}
            style={{ animationDelay: `${80 + i * 50}ms` }}
            className="group flex animate-fade-up items-start justify-between gap-3 rounded-xl border bg-card px-4 py-3 text-left text-sm text-foreground/85 transition-colors hover:border-foreground/20 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            {prompt}
            <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </button>
        ))}
      </div>
    </div>
  );
}

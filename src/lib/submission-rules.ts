/** Checks a teacher's upload form before it is sent. The backend must repeat these checks. */
import type { SubmissionInput, SubmissionType } from "@/types/campus";

export const MAX_PDF_BYTES = 10 * 1024 * 1024;
export const MAX_TITLE_LENGTH = 120;

export type SubmissionErrors = Partial<Record<"title" | "category" | "content" | "file" | "registration_url" | "audience", string>>;

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function validateSubmission(input: SubmissionInput): SubmissionErrors {
  const errors: SubmissionErrors = {};
  const title = input.title.trim();
  if (!title) errors.title = "Add a title.";
  else if (title.length > MAX_TITLE_LENGTH) errors.title = `Keep the title under ${MAX_TITLE_LENGTH} characters.`;

  if (!["event", "academic", "general"].includes(input.category)) errors.category = "Choose a category.";

  if (!input.announcement_text.trim() && !input.file) {
    errors.content = "Paste the announcement text or attach a PDF (or both).";
  }

  if (input.file) {
    const isPdf = input.file.type === "application/pdf" || input.file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) errors.file = "Only PDF documents can be uploaded.";
    else if (input.file.size > MAX_PDF_BYTES) errors.file = "The PDF must be 10 MB or smaller.";
  }

  const url = input.registration_url.trim();
  if (url && !isHttpUrl(url)) errors.registration_url = "Enter a full link starting with https://";

  if (input.audience.length === 0) errors.audience = "Choose at least one course.";
  return errors;
}

export function submissionTypeOf(hasFile: boolean, hasText: boolean): SubmissionType {
  if (hasFile && hasText) return "pdf_text";
  return hasFile ? "pdf" : "text";
}

/** Sign-in / registration form checks (the backend stays the authority). */
export function validateEmail(email: string): string | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? null : "Enter a valid email address.";
}

export const MIN_PASSWORD_LENGTH = 8;

export function validateNewPassword(password: string, confirm: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) return `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
  if (password !== confirm) return "The passwords don't match.";
  return null;
}

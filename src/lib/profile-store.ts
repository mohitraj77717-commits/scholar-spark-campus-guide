/**
 * Onboarding answers, remembered on this device only so students aren't asked twice.
 * This is a UI preference, not a database: the backend copy lives behind POST /api/students.
 */
import { useSyncExternalStore } from "react";

import type { StudentProfile } from "@/types/campus";

const KEY = "campus-ai.profile";
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedProfile: StudentProfile | null = null;

function read(): StudentProfile | null {
  if (typeof window === "undefined") return null;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
  if (raw === cachedRaw) return cachedProfile;
  cachedRaw = raw;
  try {
    cachedProfile = raw ? (JSON.parse(raw) as StudentProfile) : null;
  } catch {
    cachedProfile = null;
  }
  return cachedProfile;
}

function emit() {
  listeners.forEach((l) => l());
}

export function saveProfile(profile: StudentProfile) {
  window.localStorage.setItem(KEY, JSON.stringify(profile));
  emit();
}

export function clearProfile() {
  window.localStorage.removeItem(KEY);
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => e.key === KEY && listener();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useProfile(): StudentProfile | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

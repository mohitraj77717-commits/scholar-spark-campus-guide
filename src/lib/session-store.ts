/**
 * The sign-in token issued by the Flask backend, kept on this device so the API layer
 * can send it as `Authorization: Bearer <token>`.
 *
 * The stored `user` is only a display hint. Pages never trust it for access: every
 * protected area re-checks the account with GET /api/auth/me, and the backend must
 * verify the token and role on every request.
 */
import { useSyncExternalStore } from "react";

import type { AuthUser } from "@/types/campus";

export interface Session {
  token: string;
  user: AuthUser;
}

const KEY = "campus-ai.session";
const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedSession: Session | null = null;

function read(): Session | null {
  if (typeof window === "undefined") return null;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
  if (raw === cachedRaw) return cachedSession;
  cachedRaw = raw;
  try {
    const parsed = raw ? (JSON.parse(raw) as Session) : null;
    cachedSession = parsed && typeof parsed.token === "string" && parsed.user ? parsed : null;
  } catch {
    cachedSession = null;
  }
  return cachedSession;
}

function emit() {
  listeners.forEach((l) => l());
}

export function saveSession(session: Session) {
  window.localStorage.setItem(KEY, JSON.stringify(session));
  emit();
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  emit();
}

export function getSession(): Session | null {
  return read();
}

export function getSessionToken(): string | null {
  return read()?.token ?? null;
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

export function useSession(): Session | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

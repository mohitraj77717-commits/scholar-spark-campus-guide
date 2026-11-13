/**
 * Frontend runtime configuration.
 *
 * VITE_API_BASE_URL  – base URL of the Flask backend, e.g. http://localhost:5000
 * VITE_USE_MOCK_API  – "true" forces demo responses, "false" forces real requests.
 *
 * With no base URL configured the app runs entirely on demonstration (mock) data.
 */
const env = import.meta.env as Record<string, string | undefined>;

export function normalizeBaseUrl(raw: string | undefined): string {
  return (raw ?? "").trim().replace(/\/+$/, "");
}

export function resolveUseMock(baseUrl: string, flag: string | undefined): boolean {
  if (flag === "true") return true;
  if (flag === "false") return !baseUrl;
  return !baseUrl;
}

export const API_BASE_URL = normalizeBaseUrl(env.VITE_API_BASE_URL);
export const USE_MOCK_API = resolveUseMock(API_BASE_URL, env.VITE_USE_MOCK_API);

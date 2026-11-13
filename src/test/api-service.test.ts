import { describe, expect, it, vi } from "vitest";

import { normalizeBaseUrl, resolveUseMock } from "@/config/env";
import { ApiError, buildStudentPayload, createApiClient } from "@/services/api";
import { mockApi } from "@/services/mock/mockApi";

const BASE = "http://localhost:5000";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function clientWith(fetchImpl: ReturnType<typeof vi.fn>) {
  return createApiClient({ baseUrl: BASE, useMock: false, fetchImpl: fetchImpl as unknown as typeof fetch });
}

describe("environment config", () => {
  it("uses mock responses when VITE_API_BASE_URL is empty", () => {
    expect(resolveUseMock(normalizeBaseUrl(""), undefined)).toBe(true);
  });

  it("uses the real backend when VITE_API_BASE_URL is set", () => {
    expect(resolveUseMock(normalizeBaseUrl("http://localhost:5000/"), undefined)).toBe(false);
  });

  it("strips trailing slashes from the base URL", () => {
    expect(normalizeBaseUrl(" http://localhost:5000// ")).toBe("http://localhost:5000");
  });

  it("forces mock mode when VITE_USE_MOCK_API is true", () => {
    expect(resolveUseMock("http://localhost:5000", "true")).toBe(true);
  });
});

describe("student onboarding payload", () => {
  it("sends course, year, interests and both notification preferences", () => {
    const payload = buildStudentPayload({
      course: "cse-ai-ml",
      year: 1,
      interests: ["robotics", "hackathons"],
      event_notifications: true,
      academic_notifications: false,
    });
    expect(payload).toEqual({
      course: "cse-ai-ml",
      year: 1,
      interests: ["robotics", "hackathons"],
      event_notification_preference: true,
      academic_notification_preference: false,
    });
  });

  it("POSTs the payload to /api/students", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ student_id: "s1" }));
    const payload = buildStudentPayload({
      course: "cse-core",
      year: 1,
      interests: ["research"],
      event_notifications: false,
      academic_notifications: true,
    });
    const res = await clientWith(fetchImpl).createStudent(payload);
    expect(res.student_id).toBe("s1");
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe(`${BASE}/api/students`);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual(payload);
  });
});

describe("chat endpoints", () => {
  it("POSTs conversation_id and message to /api/chat and returns reply + sources", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse({ conversation_id: "c9", reply: "Hi", sources: [{ title: "Notice", url: "https://x.test" }] }),
    );
    const res = await clientWith(fetchImpl).sendMessage({ conversation_id: null, message: "Hello" });
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe(`${BASE}/api/chat`);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ conversation_id: null, message: "Hello" });
    expect(res).toEqual({
      conversation_id: "c9",
      reply: "Hi",
      sources: [{ title: "Notice", url: "https://x.test" }],
    });
  });

  it("uses the conversation history endpoints", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse([{ id: "c1", title: "T", updated_at: "2026-01-01T00:00:00Z" }]))
      .mockResolvedValueOnce(jsonResponse([]))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const client = clientWith(fetchImpl);

    await client.listConversations();
    await client.getMessages("c1");
    await client.deleteConversation("c1");

    expect(fetchImpl.mock.calls[0][0]).toBe(`${BASE}/api/conversations`);
    expect(fetchImpl.mock.calls[1][0]).toBe(`${BASE}/api/conversations/c1/messages`);
    expect(fetchImpl.mock.calls[2][0]).toBe(`${BASE}/api/conversations/c1`);
    expect(fetchImpl.mock.calls[2][1].method).toBe("DELETE");
  });

  it("turns server errors into an ApiError with the server's message", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ error: "Model unavailable" }, 503));
    await expect(
      clientWith(fetchImpl).sendMessage({ conversation_id: "c1", message: "Hi" }),
    ).rejects.toMatchObject({ name: "ApiError", message: "Model unavailable", status: 503 });
  });

  it("reports a friendly error when the backend can't be reached", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(clientWith(fetchImpl).listConversations()).rejects.toBeInstanceOf(ApiError);
  });
});

describe("mock client", () => {
  it("is used when mock mode is on", () => {
    expect(createApiClient({ baseUrl: "", useMock: true })).toBe(mockApi);
  });
});

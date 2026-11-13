# Campus AI — Frontend Prototype

Campus AI is a personalised AI assistant for first-year university students (CSE AI & ML and CSE Core).
This repository contains the **frontend only**. The backend is a separate Python Flask service.

> **Demo data notice:** until a backend is connected, every conversation, reply and "source" in the app is
> placeholder demonstration data. Nothing shown is real university information, and chats are kept in memory
> only — they reset when the page reloads.

## What's included

- **Onboarding** (`/`) — course, interests and two independent notification settings (event / academic).
- **Chat** (`/chat`) — ChatGPT/Claude-style interface: sidebar with conversation history, new chat, rename,
  delete, profile & settings; messages with timestamps and sources; loading and error states; suggested prompts;
  multiline input with Enter-to-send (Shift+Enter for a new line).
- **API service layer** — `src/services/api.ts`, with clearly separated mock responses in `src/services/mock/`.

## Tech stack

React 19 · TanStack Start/Router · Vite · Tailwind CSS v4 · shadcn/ui (Radix) · lucide icons.

## Running the frontend

```sh
bun install        # or: npm install
cp .env.example .env
bun run dev        # or: npm run dev  → http://localhost:8080
bun run test       # API contract tests
```

With `VITE_API_BASE_URL` empty the app runs in **demo mode** using the mock client.
Type `/error` in the chat to preview the error state.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Base URL of the Flask backend, e.g. `http://localhost:5000`. Empty = demo mode. |
| `VITE_USE_MOCK_API` | Optional. `true` forces mock responses even if a base URL is set. |

`VITE_*` values are bundled into the browser build — never put API keys (e.g. Gemini) in them.
All AI logic and keys belong in the Flask backend.

## Connecting the Flask backend

1. Set `VITE_API_BASE_URL=http://localhost:5000` in `.env` and restart the dev server.
2. Enable CORS in Flask for the frontend origin (e.g. `flask-cors`: `CORS(app, origins=["http://localhost:8080"])`).
3. Implement the endpoints below. Errors may return `{ "error": "message" }` — the message is shown to the student.

### API contract

**`POST /api/students`** — save onboarding answers

```json
// request
{
  "course": "cse-ai-ml",              // or "cse-core"
  "year": 1,
  "interests": ["artificial-intelligence", "robotics"],
  "event_notification_preference": true,
  "academic_notification_preference": false
}
// response
{ "student_id": "abc123" }
```

Interest ids: `artificial-intelligence`, `robotics`, `web-development`, `hackathons`, `coding-competitions`,
`entrepreneurship`, `research`, `technical-workshops`.

**`POST /api/chat`** — send a message (`conversation_id: null` starts a new conversation)

```json
// request
{ "conversation_id": "c1", "message": "What are the upcoming hackathons?" }
// response
{ "conversation_id": "c1", "reply": "…", "sources": [{ "title": "Notice", "url": "https://…" }] }
```

`sources` may also be a list of plain strings.

**`GET /api/conversations`** → `[{ "id": "c1", "title": "…", "updated_at": "2026-01-01T10:00:00Z" }]`
(or `{ "conversations": [...] }`)

**`GET /api/conversations/{conversation_id}/messages`** →
`[{ "id": "m1", "role": "user" | "assistant", "content": "…", "created_at": "ISO date", "sources": [] }]`
(or `{ "messages": [...] }`)

**`DELETE /api/conversations/{conversation_id}`** → `204 No Content` (or any 2xx)

**Optional — `PATCH /api/conversations/{conversation_id}`** with `{ "title": "…" }` to persist renames.
Returns the updated conversation summary.

### Minimal Flask sketch

```python
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:8080"])

@app.post("/api/chat")
def chat():
    data = request.get_json()
    # call your AI model here (keep API keys on the server)
    return jsonify(conversation_id=data.get("conversation_id") or "new-id", reply="Hello!", sources=[])
```

## Project structure

```
src/
  config/env.ts              environment variables (VITE_API_BASE_URL, VITE_USE_MOCK_API)
  services/api.ts            API service layer — the only place that talks to the backend
  services/mock/             demonstration data + mock client (no real university data)
  types/campus.ts            shared types matching the API contract
  hooks/use-chat.ts          chat state (conversations, messages, sending, errors)
  lib/profile-store.ts       onboarding answers remembered on this device
  lib/campus-options.ts      courses, interests, notification topics, suggested prompts
  components/onboarding/     onboarding steps
  components/chat/           sidebar, messages, input, dialogs
  routes/index.tsx           onboarding page
  routes/chat.tsx            chat page
```

## Current limitations (by design)

- No authentication, no admin dashboard, no database in the frontend.
- Chats are not persisted in demo mode.
- Onboarding answers are remembered in the browser so students aren't asked twice; the backend copy is
  sent to `POST /api/students`.

# Backend Fix Notes — Revela AI

The Next.js frontend was good, but the FastAPI backend was returning **HTTP 500** on
almost every endpoint. The frontend (login, candidates, dashboard, analytics,
interview workspace) was therefore showing empty / error states even though the UI
itself was fine.

## Root cause — a half-finished sync → async migration

Someone started converting `HindsightService.get_candidate_context()` from a **synchronous**
method into an **async** one (`recall` → `arecall`, adding `await`), but only updated a few
of its callers. The result was an inconsistent codebase:

* `services/hindsight_service.py` → `get_candidate_context` was `async def`
* `api_server.py` → `_memory_context` became `async` and `await`-ed it
* **but** 9 of the 11 `_memory_context(...)` call sites, plus the 3 calls inside
  `agents/orchestrator.py`, plus `pages/candidates.py` and `tests/`, still called it
  **synchronously** (no `await`).

Calling an `async def` function without `await` returns a **coroutine object**, not a `dict`.
So code like `context["history"]` or `memory_context.get("weak_areas")` blew up with
`'coroutine' object is not subscriptable` / `has no attribute 'get'`, surfacing as 500s.

This also matches the production logs, which were dominated (800+ lines) by:

```
ERROR | services.hindsight_service:get_candidate_context - This event loop is already running
ERROR | services.hindsight_service:get_candidate_context - Timeout context manager should be used inside a task
```

(MongoDB, Groq, CascadeFlow etc. were **not** the problem — there were zero DB errors in the logs.)

## The fix — make it sync again, matching the reference (`Revela-AI-main`)

The reference build keeps `get_candidate_context` **synchronous**, so the broken version was
reverted to that contract. `nest_asyncio.apply()` (already present) keeps the optional
Hindsight Cloud call event-loop-safe when running inside FastAPI.

**Only 2 files changed, 6 lines total:**

### `services/hindsight_service.py`
```diff
-    async def get_candidate_context(self, candidate_id: str) -> Dict[str, Any]:
+    def get_candidate_context(self, candidate_id: str) -> Dict[str, Any]:
...
-                results = await self.client.arecall(          # ← recall → arecall, await add
+                results = self.client.recall(
```

### `api_server.py`
```diff
-async def _memory_context(candidate_id: str, service: HindsightService | None = None) -> dict[str, Any]:
+def _memory_context(candidate_id: str, service: HindsightService | None = None) -> dict[str, Any]:
...
-    context = await hindsight.get_candidate_context(candidate_id)
+    context = hindsight.get_candidate_context(candidate_id)
...
# create_candidate route
-    return _candidate_payload(new_candidate, await _memory_context(candidate_id))
+    return _candidate_payload(new_candidate, _memory_context(candidate_id))
# update_candidate route
-    return _candidate_payload(candidate, await _memory_context(candidate_id))
+    return _candidate_payload(candidate, _memory_context(candidate_id))
```

Every other caller was already synchronous, so it became correct automatically — nothing
else needed to change. The richer evaluator output (`strengths` / `weaknesses` /
`recommendations`), the defensive memory-manager parsing, and the rest of the app were left
untouched, since they were improvements, not bugs.

## Verified

With the Hindsight cloud client falling back to local storage and the LLM agents stubbed
(no live Groq key needed), all endpoints now return **200**:

```
READ:    /api/overview  /api/candidates  /api/candidates/{id}
         /api/candidates/{id}/memory  /api/analytics  /api/settings   ✅
SESSION: POST /sessions/start → GET /sessions/{id}
         → POST /sessions/{id}/message → POST /sessions/{id}/end       ✅
WRITE:   POST /api/candidates   PUT /api/candidates/{id}               ✅
=> 12/12 endpoints 200.  `tests/test_memory.py` → 2 passed.
```

## Running it

Backend (port 5000):
```bash
pip install -r requirements.txt
uvicorn api_server:app --reload --port 5000      # needs GROQ_API_KEY + MongoDB running
```

Frontend (port 3000):
```bash
cd frontend
npm install
npm run dev
```

Make sure `frontend/.env.local` has `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api`
(it already does). The backend still uses MongoDB for candidate/session persistence and
NextAuth still uses it for login, so a running MongoDB (`MONGODB_URI`) is required — that
part was already working and was left as-is.

---

## Update — frontend Edge-runtime crash on `/login`

After the backend was fixed, the Next.js app threw at runtime:

```
Runtime Error: The edge runtime does not support Node.js 'stream' module.
  at (middleware)/../node_modules/mongodb/lib/cursor/abstract_cursor.js
GET http://localhost:3000/login 500
```

**Cause:** `middleware.ts` imported `auth` from `@/auth`, and `auth.ts` statically imported
the MongoDB driver (`@/lib/mongodb`). Next.js middleware runs in the **Edge runtime**, which
can't load Node-only modules (`stream`/`net`/`tls`) that the Mongo driver depends on.

**Fix (standard Auth.js v5 split-config pattern), 3 files:**

* **`frontend/auth.config.ts`** (new) — Edge-safe config: providers, session strategy,
  pages, secret. No DB import.
* **`frontend/middleware.ts`** — now builds its auth instance from `./auth.config`
  (`const { auth } = NextAuth(authConfig)`) instead of importing `@/auth`, so the Mongo
  driver never enters the Edge bundle.
* **`frontend/auth.ts`** — spreads `authConfig` and imports the Mongo client **lazily**
  (`await import("@/lib/mongodb")`) inside the `signIn` callback, so it only loads in the
  Node runtime (API routes / server components) and only when `MONGODB_URI` is set.

After changing these, delete the `frontend/.next` cache and restart `npm run dev` (the old
compiled `middleware.js` is cached).

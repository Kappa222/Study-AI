# Roadmap

## Phase 1 — Foundation ✅

- Landing page — Hero, features, CTA
- DB schema — 10 tables with RLS
- AI API — Groq streaming (OpenAI-compatible)
- Auth — email/password, profile creation on signup
- Auth middleware (`proxy.ts`) — protect `/dashboard`, `/subjects`, `/topics`, `/settings`, `/setup-profile`
- Auth callback route (`/auth/callback`)
- Dashboard — navigation hub
- Seed 3 subjects (Matematika, Történelem, Irodalom) with logo colors and descriptions

---

## Phase 2 — Core Learning Structure

### Task 1 — Topics CRUD (edit/delete) ✅
- Add edit + delete buttons to topics on subject detail page
- Create `/api/topics/[id]` endpoint for update + delete
- Inline edit form (reuses create pattern)

### Task 2 — Study Materials ✅
- Add `topic_id` column to `study_materials` table (migration)
- Create `/topics/[topicId]/materials` page
- Create `/api/materials` endpoint (CRUD)
- PDF upload to Supabase storage + text paste input
- List materials per topic with delete option
- Storage cleanup when material deleted

### Task 3 — Topic Detail Page ✅
- Create `/topics/[topicId]` page
- Three tabs: AI Chat | Kvíz | Statisztika
- Per-topic stats section (sessions completed, quiz scores)
- Link subject detail page topic items to this page

### Task 3.5 — Learning Plan → Island Analysis (Replaced ✅)

- **Old:** `/api/plan` generated a structured learning plan (now deprecated)
- **New:** `/api/analyze` — analyzes study materials via Groq (GPT-4o fallback), splits into logical islands. Each island has: title, approach (scenario/socratic/conversational), key_concepts[], probe_questions[]
- Islands stored as `__ISLANDS__:` message in session — parsed on resume
- `/api/plan` kept for backward compatibility but no longer used by the learn page

### Task 4 — Interactive Learning Session (`/topics/[topicId]/learn`)

This is the core of Cognimo — an island-based interactive lesson player, not a chat app. The AI analyzes uploaded materials and splits them into logical sections (islands). Each island is a self-contained learning unit with 3 sub-steps.

**Page layout:** Top bar (back link + topic name + progress bar "K/N" + island title badge) → conversation area → text input or quiz UI → no scrollable history (messages accumulate)

**Island sub-steps:**

| Sub-step | Mode | Advance |
|---|---|---|
| **Teach** | AI streams interactive teaching (scenario/socratic/conversational), scoped to island's key_concepts only, no future topics mentioned, no questions asked | User types response |
| **Probe** | AI uses Inverted Teacher — acts confused, asks from probe_questions | User answers |
| **Mini-quiz** | 6 MCQ on island's key_concepts — select → [Ellenőrzés] → ✅/❌ feedback → [Következő] | **Manual** (two clicks per question). Last question → save checkpoint + redirect to roadmap (or completion if final island) |

#### 4a — Learn page components ✅
- `LearnPage` — page wrapper (`/topics/[topicId]/learn`), island-driven content area, progress bar, back link, loading/error/empty states
- `AIBubble` — AI message card with avatar + name + streaming text (token-by-token)
- `UserBubble` — user response card
- `ResponseInput` — text input + Küldés button, disabled during AI stream (hidden during mini-quiz)
- `QuizQuestion` — MCQ card with 4 option buttons, [Ellenőrzés] button, ✅/❌ indicator + correct answer, [Következő] button (used for both teaching mini-quizzes)
- `CompletionScreen` — "🎉 Gratulálunk!" card with stats (score, islands completed, XP earned), [🔄 Újratanulás] and [← Vissza] buttons
- `ProgressBar` — top bar fraction indicator (e.g. "▓▓ 2/5") with island title badge

#### 4b — Island phase manager ✅
- `useSessionPhaseManager` hook — accepts `islandTitles[]`, builds dynamic structure: N explain steps + 1 complete step
- Tracks `stepIndex`, `currentCheckpoint`, `subPhase` (idle / ai-responding / waiting-response / quiz-answering / quiz-result / complete)
- No global quiz step — each island has its own mini-quiz managed locally in the learn page
- Phase badge shows current island title (or "Befejezés" on complete)
- `resumeFrom(checkpoint)` restores session to the correct island step
- `totalCheckpoints = islandTitles.length`

#### 4c — ProgressRoadmap wiring ✅
- N islands = AI-generated sections (titles shown below circles, truncated)
- Completed (accent fill + checkmark) / current (avatar + pulsing ring) / locked (muted + lock icon)
- Left/right arrow pan, no phase tints (all islands uniform), "Kezdés"/"Folytatás" button is a `<Link>` to the learn page
- Reads real `currentCheckpoint` + island titles from latest in-progress session's `__ISLANDS__:` message
- Topic detail page dynamically computes `totalCheckpoints = islandTitles.length`

#### 4d — Session lifecycle ✅
- `POST /api/sessions` — create session linked to topic
- `GET /api/sessions?topic_id=` — find latest in-progress session
- `GET /api/sessions/[id]` — resume: load session state, checkpoint, messages
- `PUT /api/sessions/[id]/checkpoint` — save checkpoint after each completed step
- `POST /api/sessions/[id]/messages` — save user/AI messages
- Checkpoint granularity: saving mid-step means user restarts that one step, not the whole phase

#### 4e — AI context wiring ✅
- Lumi system prompt hardcoded in `/api/chat` (no DB dependency)
- Study materials injected as system prompt with explicit "use as primary source" directive
- PDF text extraction on upload via `pdf-parse` (stored in `content` column)
- AI provider fallback: if Groq fails/times out, retry with OpenAI SDK (GPT-4o)
- Per-island phase instruction passed via `phaseInstruction` field — includes approach guide + key_concepts for teaching, probe_questions for Inverted Teacher
- Teaching instruction explicitly scoped: "Csak a(z) 'Island Title' részhez tartozó kulcsfogalmakat fedd le. NE említs más részeket vagy későbbi témákat. Ne tegyél fel kérdéseket — csak magyarázz."
- `islandStep` ("teach" | "probe" | "mini-quiz") tracked client-side to select the correct instruction for each AI call

#### 4f — Mini-quiz scoped generation ✅
- `/api/quiz/generate` accepts optional `keyConcepts: string[]`, `questionCount: number` (default 4, max 10), `islandTitle: string`
- When `keyConcepts` provided, generates 6 MCQ scoped to that island's concepts only
- Used by learn page: each island gets its own mini-quiz on completion of teaching + probe
- No global quiz phase — quizzes are per-island, auto-generated on-the-fly

### Task 5 — User Avatar Selection ✅ (replaces Task 5 — Persona Selection)
- Male/female avatar SVGs in `public/avatars/`
- Avatar picker on `/setup-profile` and `/settings` pages (no labels, just images)
- Stored in `profiles.avatar_url` — learning partner (Lumi) set automatically

### Task 5 — Persona Selection ✅
- Add character picker to `/setup-profile` page (saves to `profiles.preferred_character_id`) — removed when simplified to single Lumi character
- Create `/settings` page to change persona anytime (character picker removed when simplified)
- Chat UI reads `preferred_character_id` from profile

### Task 6 — Polish & Cleanup ✅
- Update dashboard: "Tanulj Robival" → "Tanulj Lumi-val"
- Extend `proxy.ts` matcher to protect new routes
- Move logout + settings to global header (auth-aware: shows Belépés when logged out, ⚙️+Kijelentkezés when logged in)
- Replace placeholder buttons on subject detail page with links
- Character descriptions localized to Hungarian

---

## Phase 3 — Assessment

### Task 1 — Quiz Generation
- AI generates quiz questions from a topic's study materials (final step in learning session)
- Store in `quiz_questions` table — `topic_id` column added ✅
- Migration run on `quiz_questions` and `quiz_attempts` tables ✅
- `schema.sql` updated to reflect new columns ✅

### Task 2 — Quiz UI (`/topics/[topicId]/quiz`)
- **Reuses `QuizQuestion` component** from Phase 2 (MCQ with 4 options, feedback)
- **`QuizScoreSummary`** — standalone score card (correct/total, percentage, emoji rating)
- Standalone quiz page — independent from learning session, can be retaken anytime
- Replace Kvíz tab placeholder on topic detail page with link

| Component | Purpose |
|---|---|
| `QuizQuestion` | MCQ card (shared with Learn page): question text, 4 option buttons, [Ellenőrzés], ✅/❌ feedback |
| `QuizScoreSummary` | Final score card: correct/total, percentage, emoji, [Újra] / [Vissza] buttons |

### Task 3 — Quiz History
- **`QuizHistoryList`** — table of past attempts per topic: date, score, link to detail
- **`QuizAttemptReview`** — per-attempt detail: each question shown with user's answer vs correct answer
- Routes: `/topics/[topicId]/quiz/history` (list) and `/quiz/[attemptId]` (detail)

---

## Phase 4 — Tracking & Polish

### UI Components to Build

| UI | Route / Location | Components |
|---|---|---|
| Progress charts | Dashboard or `/statistics` | Line/bar chart component (quiz scores over time, topics per week) |
| Per-topic stats | Topic detail → Statisztika tab | Sessions completed, avg score, study time, streak |
| Streak indicator | Dashboard header | Fire emoji + "N napos sorozat" badge |
| XP / Level display | Dashboard header | XP progress bar + current level number |
| Achievements / badges | Dashboard or `/settings` | Badge gallery with earned (colored) / locked (gray) states |
| Loading skeletons | All data-fetching pages | Replace `<div className="animate-spin">` spinners with skeleton placeholders (card shapes, text lines) |
| Error boundaries | `app/error.tsx` + per-page | Fallback UI: "Valami hiba történt" message + [Újra] button |
| Mobile responsive | All pages | Audit 320px–1920px, fix breakpoints, adjust layouts |
| Keyboard accessibility | All pages | Focus rings, tab order, aria labels on all interactive elements |
| Character library | Settings or new page | Browse/select future personas (beyond Lumi) |

## Phase 5 — Quality & Deploy (No new UI)

- End-to-end testing — critical flows: signup → setup → create topic → add material → start learn session → complete quiz
- Component testing — AIBubble, QuizQuestion, ConfirmModal, ProgressRoadmap, CompletionScreen
- Error monitoring — log AI API failures (Groq, OpenAI fallback), storage upload errors
- Performance audit — bundle size, lazy loading, image optimization, streaming renderer efficiency
- Production deploy — environment config, secrets, Supabase project setup

---

## Infrastructure (ongoing)

These aren't phases — they're maintained across all phases:

- **Schema migrations** — `study-app/supabase/migrations/` folder with numbered SQL files (one per schema change); `schema.sql` is always the canonical single-source-of-truth
- **API contract** — every endpoint (`/api/chat`, `/api/sessions`, `/api/materials`, `/api/topics`) has its expected request/response shape documented in the route file header comment
- **Subjects setup** — created via Supabase dashboard or seed script; no user-facing CRUD for subjects (fixed set)

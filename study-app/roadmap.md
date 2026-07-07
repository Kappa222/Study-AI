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

### Task 4 — AI Chat UI
- **4a — Chat message component + streaming renderer**
  - Scrollable message list with user/AI bubbles
  - Stream AI response token-by-token via `/api/chat`
  - Loading / error / empty states
  - Input field with send button (disabled during stream)
  - Message history pagination (load older messages on scroll) for long sessions
- **4b — Three-phase session manager**
  - Exercises phase: AI generates interactive Q&A (count based on material size)
  - Reverse teaching phase: Leo/Mia persona — user explains, AI asks probing questions
  - Quiz phase: AI generates questions from materials, results saved to `quiz_attempts`
  - Phase transition logic (auto-advance + manual confirm)
  - Phase indicator in chat header
- **4c — Horizontal progress roadmap with bubbles**
  - Completed (accent filled) / current (pulsing) / locked (muted) states
  - Tap any completed bubble to redo that phase
  - Tap current bubble to continue from where they left off
- **4d — Session lifecycle**
  - Create/attach session to topic + user's preferred character
  - Checkpoints saved after each exercise — quitting mid-exercise restarts that one
  - Resume: load existing session on page visit
- **4e — AI context wiring**
  - Send topic's study materials as system context
  - Read `preferred_character_id` from profile for persona selection
  - AI provider fallback: retry with GPT-4o (via OpenAI SDK) if Groq fails or times out

### Task 5 — Persona Selection ✅
- Add Leo/Mia picker to `/setup-profile` page (saves to `profiles.preferred_character_id`)
- Create `/settings` page to change persona anytime
- Chat UI reads `preferred_character_id` from profile

### Task 6 — Polish & Cleanup ✅
- Update dashboard: "Tanulj Robival" → "Tanulj Leo-val / Mia-val"
- Extend `proxy.ts` matcher to protect new routes
- Move logout + settings to global header (auth-aware: shows Belépés when logged out, ⚙️+Kijelentkezés when logged in)
- Replace placeholder buttons on subject detail page with links
- Leo/Mia descriptions localized to Hungarian

---

## Phase 3 — Assessment

### Task 1 — Quiz Generation
- AI generates quiz questions from a topic's study materials (final bubble in learning session)
- Store in `quiz_questions` table (add `topic_id` column — needs migration)
- Run migration on `quiz_questions` and `quiz_attempts` tables
- Update `schema.sql` to reflect new columns

### Task 2 — Quiz UI
- Interactive quiz at `/topics/[topicId]/quiz` (standalone, outside the learning session)
- Instant feedback (correct/wrong, show correct answer)
- Score summary at end

### Task 3 — Quiz History
- Review past attempts, scores, questions missed per topic
- List view: date, score, topic name

---

## Phase 4 — Tracking & Polish

- Progress dashboard — stats, charts (studied topics, quiz scores over time)
- Per-topic statistics on topic detail page (sessions completed, avg score, streak)
- Gamification — daily streaks, XP, levels
- Character library — future personas beyond Leo & Mia
- Mobile responsiveness audit — test all pages at 320px–1920px, fix breakpoints
- Error boundaries — graceful fallbacks for API failures, network errors, empty states
- Loading states — skeleton placeholders on all data-fetching pages
- Keyboard accessibility — focus rings, tab order, aria labels on all interactive elements

## Phase 5 — Quality & Deploy

- End-to-end testing — critical flows: signup → setup → create topic → add material → start session → complete quiz
- Component testing — chat renderer, progress roadmap, modals
- Error monitoring — log AI API failures, storage upload errors
- Performance audit — bundle size, image optimization, lazy loading
- Production deploy — environment config, secrets, Supabase project setup

---

## Infrastructure (ongoing)

These aren't phases — they're maintained across all phases:

- **Schema migrations** — `study-app/supabase/migrations/` folder with numbered SQL files (one per schema change); `schema.sql` is always the canonical single-source-of-truth
- **API contract** — every endpoint (`/api/chat`, `/api/materials`, `/api/topics`) has its expected request/response shape documented in the route file header comment
- **Subjects setup** — created via Supabase dashboard or seed script; no user-facing CRUD for subjects (fixed set)

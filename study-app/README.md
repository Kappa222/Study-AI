<!-- AI: This is NOT the Next.js you know. This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices. -->

<!-- AI: Agent memory — update this file after every session with new decisions, completed tasks, and known issues. -->

<!-- AI: Git commit cadence — commit after every completed sub-task. Each commit should be a self-contained, meaningful unit. -->
<!-- AI: Quality gate — before every commit, run `npm run build && npm run lint`. Never commit if either fails. -->

# Cognimo

Hungarian-language AI-powered learning platform featuring multiple learning methods, including the **Inverted Teacher** method (you learn by teaching).

The AI plays the persona of **Lumi** (meaning "light", from "lumen") — a friendly study partner. The user explains topics to them, they ask questions, point out gaps, and keep the user engaged. Lumi is aware of the user's uploaded study materials and can reference them during learning sessions.

## Tech Stack

- **Framework:** Next.js 16
- **Styling:** Tailwind v4 (violet accent `#7c3aed`, no external component libraries)
- **AI:** Groq (Llama 3.3 70B) via OpenAI-compatible SDK, with GPT-4o fallback
- **Database:** Supabase PostgreSQL with RLS on every table
- **Auth:** Email + password with confirmation link (cookie-based sessions via `@supabase/ssr`)
- **Client:** `createBrowserClient` (cookies), **Server:** `createServerClient` (cookies)

## Key Decisions & Conventions

| Decision | Choice |
| --- | --- |
| Accent color | Violet (#7c3aed) — minimal, clean, educational |
| UI language | Hungarian throughout |
| Auth flow | Signup → confirmation email → /setup-profile (username + AI persona) → /dashboard |
| Auth-aware header | Shows Belépés when logged out, ⚙️+Kijelentkezés when logged in; hidden on /login and /setup-profile |
| AI provider | Groq (Llama 3.3 70B via OpenAI-compatible SDK) — falls back to GPT-4o on failure |
| AI persona | Lumi (friendly study partner, meaning "light" from "lumen") |
| Subjects | Fixed set: Matematika, Történelem, Irodalom (global, read-only, with logo colors) |
| Topics | Per-user CRUD inside a subject |
| AI output style | Streaming responses (real-time token output) |
| Session storage | Cookies — so server-side code (proxy, API routes) can read auth state |
| Learning flow | Phase 1: Exercises (AI explains topic + Inverted Teacher Q&A) → Phase 2: Reverse Teaching (AI probes, user teaches back) → Phase 3: Quiz (multiple choice, scored). One session, resumable via checkpoints |
| Exercise checkpoints | Saved after each completed step; quitting mid-step restarts it |
| Progress UI | Only on topic detail page — horizontal roadmap with 7 islands (completed / current / locked). Learn page has a simple progress bar (e.g. "3/7") |
| Card style | `rounded-2xl border-zinc-200/60 bg-white shadow-sm` with hover lift |
| Button style | `cursor-pointer` with hover lift (`-translate-y-0.5`) and click press (`scale-[0.98]`) |
| Input style | `border-zinc-200 py-2.5` with accent focus ring |
| Gamification | Planned: daily streaks, XP, per-topic stats |
| User avatar | Male / female flat SVG (no labels), chosen on signup, changeable in /settings, stored in `profiles.avatar_url` |
| Learning partner | Lumi — single character with dedicated avatar |
| Roadmap UI | Horizontal island-based progress roadmap (7 islands: 3 exercises, 3 teaching, 1 quiz) with left/right arrow nav; user avatar stands on current island |
| Quality gate | Run `npm run build && npm run lint` before every commit — catches type errors, lint violations, and compilation failures. Full E2E + component testing planned in Phase 5 |

## Database Schema

10 tables:

| Table             | Key Relationships                                                | Notes                                                               |
| ----------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| `profiles`        | id → auth.users                                                  | Auto-created on signup via trigger |
| `subjects`        | —                                                                | Global (3 seeded rows: Matematika, Történelem, Irodalom)            |
| `topics`          | user_id → profiles, subject_id → subjects                        | Per-user CRUD                                                       |
| `study_materials` | user_id → profiles, topic_id → topics                            | PDF (Supabase Storage) or text input                                |
| `characters`      | —                                                                | Global (Lumi seeded, Hungarian description)                         |
| `chat_sessions`   | user_id → profiles, topic_id → topics                            | Tracks `status`, `current_checkpoint`, `total_checkpoints`; resumable |
| `chat_messages`   | session_id → chat_sessions                                       | role check (user/assistant)                                         |
| `quiz_questions`  | user_id → profiles, subject_id → subjects                        | AI-generated                                                        |
| `quiz_attempts`   | user_id → profiles, topic_id → topics                            | Score tracking per topic                                             |
| `progress_log`    | user_id → profiles                                               | Daily unique per user                                               |

All tables have RLS enabled. Auto-`user_id` trigger on user-owned tables via `set_user_id()` function.

## UI Inventory — What Exists & What's Planned

### ✅ Phase 1 — Foundation (All Built)

| UI | Route | Screens & Components |
|---|---|---|
| Landing page | `/` | Hero with glowing orbs + floating decorations, nav with Belépés link, gradient heading, chat mockup (desktop), 3-step how-it-works cards with SVG icons + dashed connector, 4-feature grid, animated stats counters (scroll-triggered), 2 testimonials, dark CTA panel, 4-column footer |
| Login / Signup | `/login` | Full dark bg with orbs + floating decorations, split layout (brand panel left / form right), tab toggle (Belépés / Regisztráció) with sliding indicator, email + password inputs with SVG icons + show/hide toggle, banner error/success messages, staggered fade-in-up animations |
| Auth callback | `/auth/callback` | Route handler (no UI) |
| Setup profile | `/setup-profile` | Centered card: username input, 2-avatar grid (male/female, no labels), "Kezdjük!" accent button, error message |
| Dashboard | `/dashboard` | Greeting with username, "Folytasd a tanulást" section with session cards (progress dots, hover-revealed link), empty state with CTA to subjects, quick-nav pills (📚 Tárgyak / 📄 Tananyagok / ⚙️ Beállítások), stats footer (topics count, quizzes count), full-screen spinner loading state |
| Subjects list | `/subjects` | Centered full-viewport layout, floating decors, back link, 3 subject cards with color-coded gradient headers (violet/blue/green) + hover-revealed "Témák megnyitása →" link |
| Subject detail | `/subjects/[id]` | Back link, subject name heading, topic list with CRUD (create inline form, inline edit, delete via ConfirmModal), empty state dashed card, loading spinner + error + retry states |
| Topic detail | `/topics/[topicId]` | Back link, breadcrumb, topic name heading, ProgressRoadmap (when materials exist), tab bar (Tanulj / Kvíz / Statisztika), materials list with emoji icons, "Indíts tanulást" CTA, Kvíz tab placeholder ("Hamarosan elérhető..."), Statisztika tab with 3 stat cards |
| Study materials | `/topics/[topicId]/materials` | Back link, tab bar (Szöveg / PDF), text form (title + textarea), PDF form (title + file input), success banner after upload, material list with expandable text viewer + delete via ConfirmModal, empty state dashed card |
| Settings | `/settings` | Back link, profile card with username input, avatar card with 2-avatar grid, save button with "Elmentve!" confirmation, logout button with ConfirmModal (danger variant) |

### ✅ Reusable Components

| Component | Props | Details |
|---|---|---|
| `Header` | none | Auth-aware: Belépés when logged out, ⚙️+Kijelentkezés when logged in. Hidden on `/`, `/login`, `/setup-profile`. Kijelentkezés triggers inline ConfirmModal |
| `ConfirmModal` | `open`, `title`, `message`, `confirmLabel`, `cancelLabel`, `onConfirm`, `onCancel`, `variant` | Backdrop dismiss, focus rings, danger (red) / default (accent) variants |
| `AnimatedStats` | `stats: {value, label}[]` | IntersectionObserver + requestAnimationFrame + easeOutExpo counter animation |
| `ProgressRoadmap` | `topicName`, `currentCheckpoint`, `totalCheckpoints`, `phases[]`, `avatarUrl` | 7 islands with avatar on current, left/right arrow nav, 3 phase tints, "Kezdés"/"Folytatás" button. Reads real checkpoint from DB |

---

### 🏗️ Phase 2 — Core Learning: Interactive Learning Session

| UI | Route | Screens & Components | Status |
|---|---|---|---|
| Learn page | `/topics/[topicId]/learn` | Interactive lesson player — AI streams explanations, runs Inverted Teacher Q&A, probes during Reverse Teaching, and administers a scored quiz. See design below | ✅ Built with real session flow |
| Session API | `/api/sessions` | Create, resume, checkpoint save, complete | ✅ Built |
| Session messages API | `/api/sessions/[id]/messages` | List messages, create | ✅ Built |
| Chat API update | `/api/chat` | Enhanced with session context, study materials as system prompt, GPT-4o fallback | ✅ Done |

#### Learn Page — Final Design (`/topics/[topicId]/learn`)

```
┌──────────────────────────────────────────────────────────┐
│ ← Vissza       Téma neve                 ▓▓▓▓▓░░░░  3/7  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [Phase 1 — Exercises: AI Explains × N]                 │
│  ┌── Lumi ──────────────────────────────────────────┐   │
│  │  [avatar]  AI streams explanation...             │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌── "❓ Van kérdésed eddig?" ─────────────────┐   │
│  │  [Igen, van kérdésem]  [Nem, folytassuk]     │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  [Phase 1 — Exercises: Inverted Teacher × N]            │
│  ┌── Lumi ───────────────────────────────────────┐    │
│  │  "Nem értem, hogy jön ki..."                  │    │
│  └────────────────────────────────────────────────┘    │
│  ┌── Te ───────────────────────────────────────────┐   │
│  │  ✏️ Írd a válaszod...               [Küldés]   │   │
│  └──────────────────────────────────────────────────┘   │
│  (auto-advances after AI responds)                       │
│                                                          │
│  [Phase 2 — Reverse Teaching × N]                       │
│  ┌── Lumi ───────────────────────────────────────┐    │
│  │  "És ha negatív a diszkrimináns, akkor...?"  │    │
│  └────────────────────────────────────────────────┘    │
│  ┌── Te ───────────────────────────────────────────┐   │
│  │  ✏️ Írd a válaszod...               [Küldés]   │   │
│  └──────────────────────────────────────────────────┘   │
│  (auto-advances after AI responds)                       │
│                                                          │
│  [Phase 3 — Quiz × N]                                    │
│  ┌── Kvíz ────────────────────────────────────────┐   │
│  │  Mi a másodfokú egyenlet megoldóképlete?       │   │
│  │  ○ x = (-b ± √(b² - 4ac)) / 2a               │   │
│  │  ○ x = (-b ± √(b² + 4ac)) / 2a               │   │
│  │  ...                                           │   │
│  │                    [Ellenőrzés]               │   │
│  │  (after: ✅ Igen! / ❌ Nem, a helyes: ...)   │   │
│  │                    [Következő]                │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  [Session End — Congratulations]                        │
│  ┌── 🎉 Gratulálunk! ──────────────────────────────┐   │
│  │  Befejezted a "Téma neve" tanulást!             │   │
│  │                                                 │   │
│  │  📊 Eredményed                                 │   │
│  │  Helyes válaszok: 8/10 (80%)                   │   │
│  │  Teljesített gyakorlatok: 5/5                  │   │
│  │  Megszerzett XP: +120                          │   │
│  │                                                 │   │
│  │   [🔄 Újratanulás]   [← Vissza a témához]     │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

#### Interaction Rules

| Phase | Mode | Advance Mechanism |
|---|---|---|
| Explain | AI streams explanation | "Van kérdésed?" → [Igen] (input opens) / [Nem] (next exercise) |
| Inverted Teacher | AI asks → user types answer → AI responds | **Auto-advance** — next question after AI responds |
| Reverse Teaching | AI probes → user teaches → AI responds | **Auto-advance** — next question after AI responds |
| Quiz | MCQ — user selects → [Ellenőrzés] → feedback shown → [Következő] | **Manual** — user clicks [Ellenőrzés] then [Következő] |
| End | Congratulations screen | [🔄 Újratanulás] restarts session, [← Vissza] goes to topic detail |

#### Tasks Breakdown

| Task | Components to Build | Status |
|---|---|---|
| **4a — Learn page renderer** | `LearnPage` — page wrapper, phase-aware content area, progress bar, back link, loading/error/empty states | ✅ |
| | `AIBubble` — AI message card with avatar + name + streaming text | ✅ |
| | `UserBubble` — user response card with text | ✅ |
| | `ResponseInput` — text input + Küldés button, disabled during AI stream | ✅ |
| | `QuestionPrompt` — "Van kérdésed?" with [Igen] [Nem] buttons | ✅ |
| | `QuizQuestion` — MCQ with 4 option buttons, feedback (✅/❌), [Következő] button | ✅ |
| | `CompletionScreen` — congratulations card with stats, XP, [Újratanulás] + [Vissza] buttons | ✅ |
| | `ProgressBar` — simple fraction bar at top (e.g. "3/7") | ✅ |
| **4b — Phase manager** | `useSessionPhaseManager` hook — phase state machine, auto-advance logic, phase badge, resume support | ✅ |
| **4c — Roadmap wiring** | Wire `ProgressRoadmap` to real session.checkpoint | ✅ Wired to real session data |
| **4d — Session lifecycle** | API routes: create session, save checkpoints, resume existing session. Checkpoint save on each completed step | ✅ |
| **4e — AI context wiring** | Inject study materials + Lumi persona as system prompt, Groq → GPT-4o fallback | ✅ |

---

### 🏗️ Phase 3 — Assessment UI

| UI | Route | Screens & Components | Status |
|---|---|---|---|
| Standalone quiz | `/topics/[topicId]/quiz` | Independent quiz outside learning session. Reuses `QuizQuestion` component. Score summary at end | ❌ |
| Quiz history list | `/topics/[topicId]/quiz/history` or similar | Table: date, score, topic name, link to detail | ❌ |
| Quiz attempt detail | `/quiz/[attemptId]` | Per-question review: user answer vs correct answer | ❌ |
| Quiz tab wire | Topic detail | Replace "Hamarosan elérhető..." placeholder with links to quiz | ❌ |

| Component | Purpose |
|---|---|
| `QuizQuestion` (shared with learn page) | MCQ with 4 options, feedback display |
| `QuizScoreSummary` | Correct/total, percentage, emoji rating |
| `QuizHistoryList` | Attempt rows: date, score, view link |
| `QuizAttemptReview` | Each question with user answer vs correct |

---

### 🏗️ Phase 4 — Tracking & Polish UI

| UI | Route / Location | Components | Status |
|---|---|---|---|
| Progress charts | Dashboard or `/statistics` | Line/bar charts: quiz scores over time, topics per week | ❌ |
| Per-topic stats | Topic detail → Statisztika tab | Sessions completed, avg score, study time, streak | 📄 Basic counts exist |
| Streak indicator | Dashboard header | Fire emoji + "N napos sorozat" badge | ❌ |
| XP / Level display | Dashboard header | XP progress bar + level number | ❌ |
| Achievements / badges | Dashboard or `/settings` | Badge gallery with earned/locked states | ❌ |
| Loading skeletons | All data-fetching pages | Replace spinners with skeleton placeholders | ❌ |
| Error boundaries | App root + per-page | Fallback UI: "Valami hiba történt" + [Újra] | ❌ |
| Mobile responsive | All pages | 320px–1920px audit, fix breakpoints, adjust layouts | ❌ |
| Keyboard a11y | All pages | Focus rings, tab order, aria labels on all interactive elements | ❌ |
| Character library | Settings or new page | Browse future personas (beyond Lumi) | ❌ |

---

### 🏗️ Phase 5 — Quality & Deploy (No new UI)

- E2E testing (signup → setup → topic → materials → learn → quiz)
- Component testing (AIBubble, QuizQuestion, ConfirmModal, ProgressRoadmap)
- Error monitoring (AI API failures, storage upload errors)
- Performance audit (bundle size, lazy loading, image optimization)
- Production deploy (env config, secrets, Supabase project setup)

## Current Routes

| Route                         | Status | Description                                                   |
| ----------------------------- | ------ | ------------------------------------------------------------- |
| `/`                           | ✅     | Landing page (authenticated users redirected to `/dashboard`) |
| `/login`                      | ✅     | Login / Signup (dark full bg with orbs, centered card)        |
| `/auth/callback`              | ✅     | Email confirmation handler                                    |
| `/setup-profile`              | ✅     | Username + avatar selection (male/female)                      |
| `/dashboard`                  | ✅     | Dashboard with continue-learning cards, quick nav, stats      |
| `/subjects`                   | ✅     | Fixed subject picker (3 cards with gradient top panels, centered full-viewport layout) |
| `/subjects/[id]`              | ✅     | Subject detail with topic CRUD                                |
| `/topics/[topicId]`           | ✅     | Topic detail (Tanulj / Kvíz / Statisztika tabs)               |
| `/topics/[topicId]/materials` | ✅     | Study materials (text + PDF upload)                           |
| `/topics/[topicId]/learn`     | ✅     | Phase 2 — Interactive lesson player (AI explains → Inverted Teacher → Reverse Teaching → Quiz → Results, real session flow) |
| `/topics/[topicId]/quiz`      | ❌     | Phase 3 — Standalone quiz (MCQ with instant feedback, score summary) |
| `/settings`                   | ✅     | Profile editing, persona change, logout                       |
| `/api/chat`                   | ✅     | Groq streaming with session context + study materials + GPT-4o fallback |
| `/api/sessions`               | ✅     | POST (create) + GET ?topic_id= (find latest in-progress)      |
| `/api/sessions/[id]`          | ✅     | GET (session + messages)                                       |
| `/api/sessions/[id]/checkpoint` | ✅   | PUT (update current_checkpoint)                                |
| `/api/sessions/[id]/messages` | ✅     | POST (save message)                                            |
| `/api/materials`              | ✅     | GET (list by topic) + POST (text JSON or PDF FormData)        |
| `/api/materials/[id]`         | ✅     | DELETE material + storage file                                |
| `/api/topics`                 | ✅     | GET (list by subject) + POST (create) + PUT (edit) + DELETE   |

## Known Issues

- Kvíz tab on topic detail page is a placeholder ("Hamarosan elérhető...")
- Statisztika tab shows only basic counts (session count, material count)
- Quiz questions are hardcoded mock data (Phase 3 Task 1 — AI-generated quizzes)
- No error boundaries — API failures show raw errors or silent fails
- No loading skeletons — spinner-only loading states
- No mobile responsiveness audit done yet

## Migration History

1. `migration_set_user_id_minimal.sql` — added trigger to auto-set user_id on subjects insert
2. `migration_global_subjects.sql` — removed user_id, seeded 3 global subjects, updated RLS
3. Phase 2 setup — ensured topics table, added topic_id to study_materials, added preferred_character_id to profiles
4. Character descriptions localized to Hungarian; redundant characters removed
5. Rebranded Study AI → Cognimo across all files; added wordmark SVG
6. Landing page redesign — dark hero with orbs, animated stats, testimonials, multi-column footer
7. Login page redesign — full dark bg with floating decorations, centered card
8. Site-wide style unification — card/input/button conventions, global header with auth state
9. Login page reveal animations, avatar system (male/female SVGs replacing character picker), ProgressRoadmap component, subjects page redesign, header sizing unified with landing page
10. Task 4a built — 7 Learn page components (AIBubble, UserBubble, ResponseInput, QuestionPrompt, QuizQuestion, CompletionScreen, ProgressBar) with mock 7-step session flow at `/topics/[topicId]/learn`. Leo/Mia characters replaced with Lumi across schema, UI, docs, landing page, settings, setup-profile. Lumi avatar refined as detailed otter SVG (full-body, transparent bg, no particles). Route links updated from `/chat` → `/learn`
11. Tasks 4b-4e built — `useSessionPhaseManager` hook, session lifecycle API (`POST/GET /api/sessions`, `GET /api/sessions/[id]`, `PUT /api/sessions/[id]/checkpoint`, `POST /api/sessions/[id]/messages`), `/api/chat` enhanced with study materials + Lumi persona + GPT-4o fallback, learn page wired to real API, ProgressRoadmap reads real checkpoint, PDF text extraction on upload via `pdf-parse`. Migration `003_session_checkpoints.sql` added checkpoint columns + `topic_id` on quiz tables

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

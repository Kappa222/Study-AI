<!-- AI: This is NOT the Next.js you know. This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices. -->

<!-- AI: Agent memory — update this file after every session with new decisions, completed tasks, and known issues. -->

<!-- AI: Git commit cadence — commit after every completed sub-task. Each commit should be a self-contained, meaningful unit. -->

# Cognimo

Hungarian-language AI-powered learning platform based on the **Inverted Teacher** method — you learn by teaching.

The AI plays two personas (**Leo** & **Mia** — identical behavior, only the name differs). The user explains topics to them, they ask questions, point out gaps, and keep the user engaged. Both characters are aware of the user's uploaded study materials and can reference them during chats.

## Tech Stack

- **Framework:** Next.js 16
- **Styling:** Tailwind v4 (violet accent `#7c3aed`, no external component libraries)
- **AI:** Groq (llama-3.3-70b-versatile) via OpenAI-compatible SDK
- **Database:** Supabase PostgreSQL with RLS on every table
- **Auth:** Email + password with confirmation link (cookie-based sessions via `@supabase/ssr`)
- **Client:** `createBrowserClient` (cookies), **Server:** `createServerClient` (cookies)

## Key Decisions & Conventions

| Decision | Choice |
|----------|--------|
| Accent color | Violet (#7c3aed) — minimal, clean, educational |
| UI language | Hungarian throughout |
| Auth flow | Signup → confirmation email → /setup-profile (username + AI persona) → /dashboard |
| Auth-aware header | Shows Belépés when logged out, ⚙️+Kijelentkezés when logged in; hidden on /login and /setup-profile |
| AI provider | Groq (free Llama 3.3 70B via OpenAI-compatible SDK) — swappable to GPT-4o with fallback |
| AI personas | Leo & Mia (identical, name only) — chosen on signup, changeable in /settings |
| Subjects | Fixed set: Matematika, Történelem, Irodalom (global, read-only, with logo colors) |
| Topics | Per-user CRUD inside a subject |
| Chat style | Streaming responses (real-time token output) |
| Session storage | Cookies — so server-side code (proxy, API routes) can read auth state |
| Learning flow | Structured: Exercises → Reverse Teaching → Quiz (one session, resumable) |
| Exercise checkpoints | Saved after each exercise; quitting mid-exercise restarts it |
| Progress UI | Horizontal roadmap with bubbles (completed / current / locked); tap any completed to redo |
| Card style | `rounded-2xl border-zinc-200/60 bg-white shadow-sm` with hover lift |
| Button style | `cursor-pointer` with hover lift (`-translate-y-0.5`) and click press (`scale-[0.98]`) |
| Input style | `border-zinc-200 py-2.5` with accent focus ring |
| Gamification | Planned: daily streaks, XP, per-topic stats |

## Database Schema

10 tables:

| Table | Key Relationships | Notes |
|-------|-------------------|-------|
| `profiles` | id → auth.users | Auto-created on signup via trigger, stores `preferred_character_id` |
| `subjects` | — | Global (3 seeded rows: Matematika, Történelem, Irodalom) |
| `topics` | user_id → profiles, subject_id → subjects | Per-user CRUD |
| `study_materials` | user_id → profiles, topic_id → topics | PDF (Supabase Storage) or text input |
| `characters` | — | Global (Leo & Mia seeded, Hungarian descriptions) |
| `chat_sessions` | user_id → profiles, topic_id → topics, character_id → characters | Resumable with checkpoints |
| `chat_messages` | session_id → chat_sessions | role check (user/assistant) |
| `quiz_questions` | user_id → profiles, subject_id → subjects | AI-generated |
| `quiz_attempts` | user_id → profiles | Score tracking (needs `topic_id` migration) |
| `progress_log` | user_id → profiles | Daily unique per user |

All tables have RLS enabled. Auto-`user_id` trigger on user-owned tables via `set_user_id()` function.

## Current State

### Done

**Foundation:**
- Landing page — dark hero panel with orbs, floating decorations, chat mockup, steps with SVG icons, features with SVG icons + animated stats (scroll-triggered count-up), testimonials, dark CTA panel, multi-column footer
- Auth system — signup/login with email confirmation, `proxy.ts` guard (redirects authenticated users from `/` to `/dashboard`), cookie-based sessions
- Auth callback handler at `/auth/callback`
- 10-table Supabase schema with RLS, triggers, and seed data
- Characters seeded: Leo & Mia (identical system prompts, Hungarian descriptions)
- SVG logos: `cognimo-wordmark.svg` (Cogni+violet + mo+dark) and `cognimo-icon.svg` (faceted diamond/gem)

**Login page:**
- Full dark background (`bg-zinc-950`) with glowing orbs, floating decorations, and bubbles
- Centered white card with gradient "Cogni"+"mo" logo above form on mobile
- Split layout preserved on desktop (brand panel left, form right)
- Tab toggle with sliding indicator (Belépés / Regisztráció)
- Monochrome SVG icons for email, password, show/hide
- Password reveal toggle
- Banner-style error/success messages with icons

**Subjects & Topics:**
- 3 global subjects (Matematika, Történelem, Irodalom) with logo colors — clickable cards
- Per-user topic CRUD (create, edit, delete, list) with inline edit form
- ConfirmModal for delete confirmation (backdrop dismiss, focus rings, danger variant)

**Study Materials:**
- API: GET (list by topic), POST (text JSON or PDF FormData), DELETE (with storage cleanup)
- Materials page at `/topics/[topicId]/materials` with text paste + PDF upload tabs
- Expandable content viewer for text materials (max-h animation)
- Success banner with start-learning CTA after upload

**Topic Detail:**
- Page at `/topics/[topicId]` with Tanulj / Kvíz / Statisztika tabs
- Materials list, start-learning CTA (or add-materials prompt when empty)
- Stat cards (session count, material count)

**Dashboard:**
- Continue-learning cards for in-progress sessions (with progress dots)
- Empty state with CTA to subjects
- Quick nav bar (Tárgyak, Tananyagok, Beállítások)
- Stats footer (studied topics, completed quizzes)
- Greeting with username

**Persona Selection:**
- Leo/Mia picker on `/setup-profile` page (first-login wizard)
- Profile editing (username + persona change) on `/settings` page
- Logout with confirmation modal

**Global Header:**
- Auth-aware: shows Belépés when logged out, ⚙️ settings + Kijelentkezés when logged in
- Hidden on `/login` and `/setup-profile`
- Kijelentkezés has confirmation modal

**Site-wide style unification:**
- All cards: `rounded-2xl border-zinc-200/60 bg-white shadow-sm dark:border-zinc-800/60 dark:bg-zinc-900`
- All inputs: `border-zinc-200 py-2.5` with accent focus ring
- All buttons: `cursor-pointer` with hover lift `-translate-y-0.5`, click press `scale-[0.98]`, and shadow
- Back buttons on all pages (← Vissza...)

**Component:**
- `ConfirmModal` — reusable modal with backdrop dismiss, focus rings, danger/default variants
- `Header` — auth-aware global header (hidden on `/`, `/login`, `/setup-profile`)
- `AnimatedStats` — scroll-triggered count-up with IntersectionObserver + requestAnimationFrame + easeOutExpo

### Next — Phase 2 Task 4 (AI Chat UI)

- **4a:** Chat message component with streaming renderer, message history pagination
- **4b:** Three-phase session manager (exercises → reverse teaching → quiz)
- **4c:** Horizontal progress roadmap with checkpoint bubbles
- **4d:** Session lifecycle (create, resume, redo, checkpoint save)
- **4e:** AI context wiring (materials as context, persona selection, Groq → GPT-4o fallback)

### Not Started — Phase 3 (Assessment)

- Quiz generation from study materials
- Standalone quiz UI with instant feedback
- Quiz history review

### Not Started — Phase 4 (Tracking & Polish)

- Progress dashboard with charts
- Per-topic statistics
- Gamification (daily streaks, XP)
- Mobile responsiveness audit, error boundaries, loading skeletons, accessibility

### Not Started — Phase 5 (Quality & Deploy)

- End-to-end and component testing
- Error monitoring
- Performance audit
- Production deploy

## Current Routes

| Route | Status | Description |
|-------|--------|-------------|
| `/` | ✅ | Landing page (authenticated users redirected to `/dashboard`) |
| `/login` | ✅ | Login / Signup (dark full bg with orbs, centered card) |
| `/auth/callback` | ✅ | Email confirmation handler |
| `/setup-profile` | ✅ | Username + AI persona setup |
| `/dashboard` | ✅ | Dashboard with continue-learning cards, quick nav, stats |
| `/subjects` | ✅ | Fixed subject picker (3 cards) |
| `/subjects/[id]` | ✅ | Subject detail with topic CRUD |
| `/topics/[topicId]` | ✅ | Topic detail (Tanulj / Kvíz / Statisztika tabs) |
| `/topics/[topicId]/materials` | ✅ | Study materials (text + PDF upload) |
| `/topics/[topicId]/chat` | 📄 | Phase 2 — Structured learning session with roadmap |
| `/topics/[topicId]/quiz` | ❌ | Phase 3 — Standalone quiz |
| `/settings` | ✅ | Profile editing, persona change, logout |
| `/api/chat` | ✅ | Groq streaming API (basic, needs session+topic context) |
| `/api/materials` | ✅ | GET (list by topic) + POST (text JSON or PDF FormData) |
| `/api/materials/[id]` | ✅ | DELETE material + storage file |
| `/api/topics` | ✅ | GET (list by subject) + POST (create) + PUT (edit) + DELETE |

## Known Issues

- Kvíz tab on topic detail page is a placeholder ("Hamarosan elérhető...")
- Statisztika tab shows only basic counts (session count, material count)
- Chat UI at `/topics/[topicId]/chat` does not exist yet
- Quiz tables (`quiz_questions`, `quiz_attempts`) need `topic_id` column migration
- No error boundaries — API failures show raw errors or silent fails
- No loading skeletons — spinner-only loading states

## Migration History

1. `migration_set_user_id_minimal.sql` — added trigger to auto-set user_id on subjects insert
2. `migration_global_subjects.sql` — removed user_id, seeded 3 global subjects, updated RLS
3. Phase 2 setup — ensured topics table, added topic_id to study_materials, added preferred_character_id to profiles
4. Leo/Mia descriptions localized to Hungarian; redundant characters removed
5. Rebranded Study AI → Cognimo across all files; added wordmark + icon SVGs
6. Landing page redesign — dark hero with orbs, animated stats, testimonials, multi-column footer
7. Login page redesign — full dark bg with floating decorations, centered card
8. Site-wide style unification — card/input/button conventions, global header with auth state

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

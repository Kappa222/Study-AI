<!-- AI: This is NOT the Next.js you know. This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices. -->

<!-- AI: Agent memory — update this file after every session with new decisions, completed tasks, and known issues. -->

# Study AI

Hungarian-language AI-powered learning platform based on the **Inverted Teacher** method — you learn by teaching.

The AI plays two personas (**Leo** & **Mia** — identical behavior, only the name differs). The user explains topics to them, they ask questions, point out gaps, and keep the user engaged. Both characters are aware of the user's uploaded study materials and can reference them during chats.

## Tech Stack

- **Framework:** Next.js 16
- **Styling:** Tailwind v4 (violet accent, no external component libraries)
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
| AI provider | Groq (free Llama 3.3 70B via OpenAI-compatible SDK) — swappable to GPT-4o |
| AI personas | Leo & Mia (identical, name only) — chosen on signup, changeable in /settings |
| Subjects | Fixed set: Matematika, Történelem, Irodalom (global, read-only) |
| Topics | Per-user CRUD inside a subject |
| Chat style | Streaming responses (real-time token output) |
| Session storage | Cookies — so server-side code (proxy, API routes) can read auth state |
| Gamification | Planned: daily streaks, XP, per-topic stats |

## Database Schema

9 tables + the `topics` table (10 total):

| Table | Key Relationships | Notes |
|-------|-------------------|-------|
| `profiles` | id → auth.users | Auto-created on signup via trigger |
| `subjects` | — | Global (3 seeded rows: Matematika, Történelem, Irodalom) |
| `topics` | user_id → profiles, subject_id → subjects | Per-user CRUD |
| `study_materials` | user_id → profiles, topic_id → topics | PDF or text input |
| `characters` | — | Global (Leo & Mia seeded) |
| `chat_sessions` | user_id → profiles, topic_id → topics, character_id → characters | Resumable sessions |
| `chat_messages` | session_id → chat_sessions | role check (user/assistant) |
| `quiz_questions` | user_id → profiles, subject_id → subjects | AI-generated |
| `quiz_attempts` | user_id → profiles | Score tracking |
| `progress_log` | user_id → profiles | Daily unique per user |

All tables have RLS enabled. Auto-`user_id` trigger on user-owned tables via `set_user_id()` function.

## Current State

### Done
- Landing page — Hero, How it works, Features grid, CTA, Footer; Hungarian
- Auth system — signup/login with email confirmation, proxy.ts guard, cookie-based sessions
- Dashboard — 5 nav cards (Tárgyak, AI Chat, Tananyagok, Kvízek, Haladás)
- Subjects — 3 global subjects, read-only cards (no add/edit/delete)
- Topics — per-user create + list under each subject
- Groq streaming API endpoint (`/api/chat`)
- All DB schema written: 10 tables, RLS, triggers, seed data
- Characters seeded: Leo & Mia

### In Progress — Phase 2
- Topics CRUD (needs edit/delete)
- Study Materials (needs UI + upload to Supabase storage)
- Topic Detail Page (tabs: AI Chat / Quiz / Stats)
- AI Chat UI (streaming UI at `/topics/[topicId]/chat`)
- Session History (resume past chats)
- Settings Page (change AI persona)
- Setup-profile (add persona picker)

### In Progress — Phase 3 (not started)
- Quiz generation from study materials
- Quiz UI with instant feedback
- Quiz history review

### In Progress — Phase 4 (not started)
- Progress dashboard with charts
- Per-topic statistics
- Gamification (daily streaks, XP)
- Polish & responsiveness

### Current Routes

| Route | Status | Description |
|-------|--------|-------------|
| `/` | ✅ | Landing page |
| `/login` | ✅ | Login / Signup |
| `/auth/callback` | ✅ | Email confirmation handler |
| `/setup-profile` | ✅ | Username + AI persona setup |
| `/dashboard` | ✅ | Navigation hub |
| `/api/chat` | ✅ | Groq streaming API |
| `/subjects` | ⬜ | To be replaced with fixed subject picker |
| `/subjects/[subjectId]/topics` | ❌ | Phase 2 — Topics CRUD |
| `/topics/[topicId]` | ❌ | Phase 2 — Topic detail (tabs) |
| `/topics/[topicId]/materials` | ❌ | Phase 2 — Study materials |
| `/topics/[topicId]/chat` | ❌ | Phase 2 — AI chat session |
| `/topics/[topicId]/quiz` | ❌ | Phase 3 — Quiz |
| `/settings` | ❌ | Phase 2 — AI persona, profile settings |
| `/progress` | ❌ | Phase 4 — Progress dashboard |

## Known Issues

- `topics` table not yet created in Supabase (needs full schema run or migration)
- Tanulj/Kvíz buttons on subject detail page are placeholders
- No logout button on subjects/topics pages
- Subject detail page placeholder buttons need to link to `/topics/[topicId]`
- `study_materials` table needs `topic_id` column added
- `profiles` table needs `preferred_character_id` column added

## Migration History

1. `migration_set_user_id_minimal.sql` — added trigger to auto-set user_id on subjects insert
2. `migration_global_subjects.sql` — removed user_id, seeded 3 global subjects, updated RLS

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

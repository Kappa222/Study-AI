# Study AI

Hungarian-language AI-powered learning platform.

## Tech Stack

- **Framework:** Next.js 16
- **Styling:** Tailwind v4 (violet accent, no component libraries)
- **AI:** Groq (llama-3.3-70b-versatile) via OpenAI-compatible SDK
- **Database:** Supabase PostgreSQL with RLS on every table
- **Auth:** Email + password with confirmation link (cookie-based sessions via `@supabase/ssr`)
- **Client:** `createBrowserClient` (cookies), **Server:** `createServerClient` (cookies)

## Progress

### Done
- Landing page — Hero, How it works, Features, CTA, Footer; Hungarian
- Auth system — signup/login, confirmation link, proxy.ts guard, profile setup
- Dashboard — 5 nav cards (Tárgyak, AI Chat, Tananyagok, Kvízek, Haladás)
- Subjects — 3 global subjects (Matematika, Történelem, Irodalom), read-only cards, no add/edit/delete
- Topics — per-user create/list under each subject
- Groq streaming API endpoint (`/api/chat`)
- Database schema (9 tables, RLS, triggers, seed data)
- Auto-`user_id` trigger on insert for all user-owned tables
- Migration: subjects made global (user_id removed, 3 rows seeded)

### Not Started
- Tanulj chat flow (topic context, Leo/Mia persona, streaming messages)
- Kvíz (AI-generated quizzes per topic)
- Tananyagok (study materials — PDF upload + text paste)
- Haladás (statistics per subject/topic)
- Running the full schema (topics, study_materials, chat_sessions, etc. not yet created in Supabase)
- Tanulj/Kvíz buttons are placeholders (no handlers)

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

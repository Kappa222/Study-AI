<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:session-progress -->
## Current State
- Landing page (/) — Hero, How it works, Features grid, CTA, Footer; Hungarian; violet accent
- Auth system — email+password with confirmation link, proxy.ts guard, cookie-based
- Subjects: 3 global subjects (Matematika, Történelem, Irodalom), seeded in DB, read-only UI cards
- Topics: per-user CRUD (add/list) under each subject
- Groq streaming API at /api/chat
- Dashboard with 5 nav cards
- Supabase schema: 9 tables, RLS, auto-profile trigger, triggers for auto user_id

## Known Issues
- topics table not created yet in Supabase (needs full schema run or create it)
- Tanulj/Kvíz buttons on subject detail page are placeholders
- No logout button visible on subjects/topics pages
- AGENTS.md should be updated when significant progress is made

## Key Conventions
- UI language: Hungarian throughout
- Accent color: violet (#7c3aed), pure Tailwind v4, no component libraries
- AI provider: Groq (llama-3.3-70b-versatile) via OpenAI-compatible SDK
- Database: Supabase PostgreSQL with RLS on every table
- Session storage: cookies (createBrowserClient from @supabase/ssr)
- Auth: email + password with confirmation link
- Subjects are global (no user_id); topics are per-user (user_id with auto-set trigger)

## Migration History
1. `migration_set_user_id_minimal.sql` — added trigger to auto-set user_id on subjects insert
2. `migration_global_subjects.sql` — removed user_id, seeded 3 global subjects, updated RLS
<!-- END:session-progress -->

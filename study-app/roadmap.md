# Roadmap

## Phase 1 — Foundation ✅

- Landing page — Hero, features, CTA
- DB schema — 10 tables with RLS
- AI API — Groq streaming (OpenAI-compatible)
- Auth — email/password, profile creation on signup
- Dashboard — navigation hub

---

## Phase 2 — Core Learning Structure

### Task 1 — Topics CRUD (edit/delete)
- Add edit + delete buttons to topics on subject detail page
- Create `/api/topics/[id]` endpoint for update + delete
- Inline edit form (reuses create pattern)

### Task 2 — Study Materials
- Add `topic_id` column to `study_materials` table (migration)
- Create `/topics/[topicId]/materials` page
- Create `/api/materials` endpoint (CRUD)
- PDF upload to Supabase storage + text paste input
- List materials per topic with delete option

### Task 3 — Topic Detail Page
- Create `/topics/[topicId]` page
- Three tabs: AI Chat | Kvíz | Statisztika
- Per-topic stats section (sessions completed, quiz scores)
- Link subject detail page topic items to this page

### Task 4 — AI Chat UI
- Streaming chat interface at `/topics/[topicId]/chat`
- Create/attach chat session to topic + user's preferred character
- Send topic's study materials context to AI
- Save messages to `chat_messages` table
- Display chat history (resume previous session)
- List and switch between past sessions for the topic

### Task 5 — Persona Selection
- Add Leo/Mia picker to `/setup-profile` page (saves to `profiles.preferred_character_id`)
- Create `/settings` page to change persona anytime
- Chat UI reads `preferred_character_id` from profile

### Task 6 — Polish & Cleanup
- Update dashboard: "Tanulj Robival" → "Tanulj Leo-val / Mia-val"
- Extend `proxy.ts` matcher to protect new routes
- Add logout button to subjects/topics pages
- Replace placeholder buttons on subject detail page with links

---

## Phase 3 — Assessment

### Task 1 — Quiz Generation
- AI generates quiz questions from a topic's study materials
- Store in `quiz_questions` table (add `topic_id` column)

### Task 2 — Quiz UI
- Interactive quiz at `/topics/[topicId]/quiz`
- Instant feedback (correct/wrong, show correct answer)

### Task 3 — Quiz History
- Review past attempts, scores, questions missed per topic

---

## Phase 4 — Tracking & Polish

- Progress dashboard — stats, charts (studied topics, quiz scores over time)
- Per-topic statistics on topic detail page
- Gamification — daily streaks, XP, etc.
- Character library — future personas beyond Leo & Mia
- Polish & responsiveness — mobile, animations, edge cases

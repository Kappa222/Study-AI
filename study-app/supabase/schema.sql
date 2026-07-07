-- ============================================================
-- Study AI — Full Database Schema
-- Execute this in the Supabase SQL Editor (one time setup)
-- ============================================================

-- 0. Extensions
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. profiles
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function handle_new_user();

-- ============================================================
-- 2. subjects
-- ============================================================
create table subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  description text,
  color text,
  created_at timestamptz not null default now()
);

alter table subjects enable row level security;

create policy "Users can CRUD their own subjects"
  on subjects for all
  using (auth.uid() = user_id);

create index idx_subjects_user_id on subjects(user_id);

-- ============================================================
-- 3. study_materials
-- ============================================================
create table study_materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  title text not null,
  content text,
  file_url text,
  file_type text not null check (file_type in ('pdf', 'text')),
  created_at timestamptz not null default now()
);

alter table study_materials enable row level security;

create policy "Users can CRUD their own study materials"
  on study_materials for all
  using (auth.uid() = user_id);

create index idx_study_materials_user_id on study_materials(user_id);
create index idx_study_materials_subject_id on study_materials(subject_id);

-- ============================================================
-- 4. characters
-- ============================================================
create table characters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  avatar_url text,
  system_prompt text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

alter table characters enable row level security;

-- Everyone can read characters, only admins can modify
create policy "Anyone can view characters"
  on characters for select
  using (true);

-- Seed characters
insert into characters (name, description, system_prompt, is_default) values
  (
    'Robi',
    'A confused intern. Teach him the material and see if he understands.',
    'You are Robi, a well-meaning but confused intern. You know nothing about the topic the user wants to teach you. Ask naive questions, make silly mistakes, and show genuine curiosity. Your goal is to make the user explain concepts clearly by forcing them to correct your misunderstandings. Always stay in character: enthusiastic, slightly clueless, but eager to learn.',
    true
  );

-- ============================================================
-- 5. chat_sessions
-- ============================================================
create table chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  character_id uuid references characters(id),
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table chat_sessions enable row level security;

create policy "Users can CRUD their own chat sessions"
  on chat_sessions for all
  using (auth.uid() = user_id);

create index idx_chat_sessions_user_id on chat_sessions(user_id);
create index idx_chat_sessions_subject_id on chat_sessions(subject_id);

-- ============================================================
-- 6. chat_messages
-- ============================================================
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references chat_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

alter table chat_messages enable row level security;

create policy "Users can read messages from their sessions"
  on chat_messages for select
  using (
    exists (
      select 1 from chat_sessions
      where chat_sessions.id = session_id
        and chat_sessions.user_id = auth.uid()
    )
  );

create policy "Users can insert messages into their sessions"
  on chat_messages for insert
  with check (
    exists (
      select 1 from chat_sessions
      where chat_sessions.id = session_id
        and chat_sessions.user_id = auth.uid()
    )
  );

create index idx_chat_messages_session_id on chat_messages(session_id);

-- ============================================================
-- 7. quiz_questions
-- ============================================================
create table quiz_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  material_id uuid references study_materials(id) on delete set null,
  question text not null,
  options jsonb not null,
  correct_answer text not null,
  created_at timestamptz not null default now()
);

alter table quiz_questions enable row level security;

create policy "Users can CRUD their own quiz questions"
  on quiz_questions for all
  using (auth.uid() = user_id);

create index idx_quiz_questions_user_id on quiz_questions(user_id);
create index idx_quiz_questions_subject_id on quiz_questions(subject_id);

-- ============================================================
-- 8. quiz_attempts
-- ============================================================
create table quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  subject_id uuid not null references subjects(id) on delete cascade,
  score integer not null,
  total_questions integer not null,
  created_at timestamptz not null default now()
);

alter table quiz_attempts enable row level security;

create policy "Users can CRUD their own quiz attempts"
  on quiz_attempts for all
  using (auth.uid() = user_id);

create index idx_quiz_attempts_user_id on quiz_attempts(user_id);

-- ============================================================
-- 9. progress_log
-- ============================================================
create table progress_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  date date not null default current_date,
  xp_earned integer not null default 0,
  actions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table progress_log enable row level security;

create policy "Users can CRUD their own progress logs"
  on progress_log for all
  using (auth.uid() = user_id);

create index idx_progress_log_user_id on progress_log(user_id);

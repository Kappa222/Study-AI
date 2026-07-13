-- ============================================================
-- Migration 003: Add missing columns to chat_sessions,
-- add topic_id to quiz_questions and quiz_attempts
-- ============================================================

do $$
begin
  -- =====================
  -- chat_sessions
  -- =====================
  if exists (select from information_schema.tables where table_name = 'chat_sessions') then

    if not exists (select from information_schema.columns
      where table_name = 'chat_sessions' and column_name = 'method')
    then
      alter table chat_sessions add column method text not null default 'study';
    end if;

    if not exists (select from information_schema.columns
      where table_name = 'chat_sessions' and column_name = 'title')
    then
      alter table chat_sessions add column title text;
    end if;

    if not exists (select from information_schema.columns
      where table_name = 'chat_sessions' and column_name = 'topic_id')
    then
      alter table chat_sessions add column topic_id uuid references topics(id) on delete set null;
    end if;

    if not exists (select from information_schema.columns
      where table_name = 'chat_sessions' and column_name = 'character_id')
    then
      alter table chat_sessions add column character_id uuid references characters(id);
    end if;

    if not exists (select from information_schema.columns
      where table_name = 'chat_sessions' and column_name = 'current_checkpoint')
    then
      alter table chat_sessions add column current_checkpoint int not null default 0;
    end if;

    if not exists (select from information_schema.columns
      where table_name = 'chat_sessions' and column_name = 'total_checkpoints')
    then
      alter table chat_sessions add column total_checkpoints int not null default 7;
    end if;

    if not exists (select from information_schema.columns
      where table_name = 'chat_sessions' and column_name = 'status')
    then
      alter table chat_sessions add column status text not null default 'in_progress';
    end if;

    alter table chat_sessions drop constraint if exists chat_sessions_status_check;
    execute 'alter table chat_sessions add constraint chat_sessions_status_check check (status in (''in_progress'', ''completed'', ''abandoned''))';

    if not exists (select from pg_indexes where indexname = 'idx_chat_sessions_topic_id') then
      create index idx_chat_sessions_topic_id on chat_sessions(topic_id);
    end if;
  end if;

  -- =====================
  -- quiz_questions
  -- =====================
  if exists (select from information_schema.tables where table_name = 'quiz_questions') then
    if not exists (select from information_schema.columns
      where table_name = 'quiz_questions' and column_name = 'topic_id')
    then
      alter table quiz_questions add column topic_id uuid references topics(id) on delete cascade;
    end if;
    if not exists (select from pg_indexes where indexname = 'idx_quiz_questions_topic_id') then
      create index idx_quiz_questions_topic_id on quiz_questions(topic_id);
    end if;
  end if;

  -- =====================
  -- quiz_attempts
  -- =====================
  if exists (select from information_schema.tables where table_name = 'quiz_attempts') then
    if not exists (select from information_schema.columns
      where table_name = 'quiz_attempts' and column_name = 'topic_id')
    then
      alter table quiz_attempts add column topic_id uuid references topics(id) on delete cascade;
    end if;
    if not exists (select from pg_indexes where indexname = 'idx_quiz_attempts_topic_id') then
      create index idx_quiz_attempts_topic_id on quiz_attempts(topic_id);
    end if;
  end if;
end $$;

-- Habit Tracker + Flashcards — initial schema (Supabase / Postgres)

create extension if not exists "pgcrypto";

-- Habits
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text not null default '',
  category text not null,
  schedule jsonb not null default '{"type":"daily"}'::jsonb,
  archived_at timestamptz,
  is_flashcard_linked boolean not null default false,
  created_at timestamptz not null default now()
);

create index habits_user_id_idx on public.habits (user_id);
create index habits_user_archived_idx on public.habits (user_id) where archived_at is null;

-- One completion per habit per calendar day
create table public.completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits (id) on delete cascade,
  completed_on date not null,
  note text not null default '',
  created_at timestamptz not null default now(),
  unique (habit_id, completed_on)
);

create index completions_habit_idx on public.completions (habit_id);

-- Cat progress per habit
create table public.cats (
  habit_id uuid primary key references public.habits (id) on delete cascade,
  total_xp int not null default 0,
  unlocked_accessories jsonb not null default '[]'::jsonb
);

-- Flashcard decks
create table public.decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

create index decks_user_id_idx on public.decks (user_id);

-- Cards with SM-2 fields
create table public.cards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.decks (id) on delete cascade,
  word text not null,
  meaning text not null,
  example_sentence text not null default '',
  pronunciation text not null default '',
  image_url text,
  audio_url text,
  part_of_speech text not null default 'noun',
  ease_factor numeric(4,2) not null default 2.50,
  interval_days int not null default 0,
  repetition_count int not null default 0,
  due_date date not null default (timezone ('utc', now()))::date,
  last_reviewed_at date,
  created_at timestamptz not null default now()
);

create index cards_deck_id_idx on public.cards (deck_id);
create index cards_due_date_idx on public.cards (due_date);

-- RLS
alter table public.habits enable row level security;
alter table public.completions enable row level security;
alter table public.cats enable row level security;
alter table public.decks enable row level security;
alter table public.cards enable row level security;

create policy "habits_own" on public.habits
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "completions_via_habit" on public.completions
  for all using (
    habit_id in (select id from public.habits where user_id = auth.uid())
  ) with check (
    habit_id in (select id from public.habits where user_id = auth.uid())
  );

create policy "cats_via_habit" on public.cats
  for all using (
    habit_id in (select id from public.habits where user_id = auth.uid())
  ) with check (
    habit_id in (select id from public.habits where user_id = auth.uid())
  );

create policy "decks_own" on public.decks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "cards_via_deck" on public.cards
  for all using (
    deck_id in (select id from public.decks where user_id = auth.uid())
  ) with check (
    deck_id in (select id from public.decks where user_id = auth.uid())
  );

-- Storage: create buckets `card-images` and `card-audio` in Supabase Dashboard (public or authenticated policies as you prefer).

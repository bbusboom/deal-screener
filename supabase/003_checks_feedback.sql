-- Deal Check results and in-app feedback. Run once in Supabase: SQL Editor > New query > paste > Run.
-- Read them in Supabase under Table Editor > deal_checks and Table Editor > feedback.

create table if not exists public.deal_checks (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  username text,
  check_id text not null,
  seconds integer not null,
  used_workspace boolean not null default false,
  answers jsonb not null,
  answer_key jsonb not null,
  score integer not null,
  created_at timestamptz not null default now()
);
alter table public.deal_checks enable row level security;
drop policy if exists "add own checks" on public.deal_checks;
drop policy if exists "read own checks" on public.deal_checks;
create policy "add own checks" on public.deal_checks for insert with check (auth.uid() = user_id);
create policy "read own checks" on public.deal_checks for select using (auth.uid() = user_id);

-- Feedback: anyone signed in can send it; nobody can read it from the site. Read it in the Supabase dashboard.
create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  username text,
  page text,
  message text not null check (char_length(message) between 1 and 4000),
  created_at timestamptz not null default now()
);
alter table public.feedback enable row level security;
drop policy if exists "send feedback" on public.feedback;
create policy "send feedback" on public.feedback for insert with check (auth.uid() = user_id);

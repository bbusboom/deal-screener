-- Course progress for the Learn path. Run once in Supabase: SQL Editor > New query > paste > Run.
create table if not exists public.course_progress (
  user_id uuid primary key default auth.uid() references auth.users on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.course_progress enable row level security;
drop policy if exists "own progress" on public.course_progress;
create policy "own progress" on public.course_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

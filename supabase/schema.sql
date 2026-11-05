-- Deal Screener database. Run once in Supabase: SQL Editor > New query > paste > Run.

-- Profiles: one row per user, created automatically at sign up.
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique,
  path text check (path in ('learner', 'pro')),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "read own profile" on public.profiles;
drop policy if exists "insert own profile" on public.profiles;
drop policy if exists "update own profile" on public.profiles;
create policy "read own profile" on public.profiles for select using (auth.uid() = id);
create policy "insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "update own profile" on public.profiles for update using (auth.uid() = id);

-- Deals: each user only ever sees their own.
create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null default '',
  path text not null default 'pro' check (path in ('learner', 'pro')),
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists deals_user_updated on public.deals (user_id, updated_at desc);
alter table public.deals enable row level security;
drop policy if exists "own deals" on public.deals;
create policy "own deals" on public.deals for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Create the profile when someone signs up, using the username they chose.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username) values (new.id, nullif(trim(new.raw_user_meta_data ->> 'username'), ''));
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Lets the sign up form check a username without exposing anyone's data.
create or replace function public.username_available(u text) returns boolean
language sql security definer set search_path = public stable as $$
  select not exists (select 1 from public.profiles where lower(username) = lower(trim(u)));
$$;
grant execute on function public.username_available(text) to anon, authenticated;

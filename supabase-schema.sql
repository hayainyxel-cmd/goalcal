-- ============================================================
-- GoalCal Database Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  whatsapp_number text,
  whatsapp_verified boolean default false,
  theme text default 'light' check (theme in ('light', 'dark')),
  timezone text default 'UTC',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ─── GOALS ───────────────────────────────────────────────────
create table public.goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  type text not null check (type in ('daily', 'weekly', 'monthly')),
  status text default 'pending' check (status in ('pending', 'completed', 'missed')),
  
  -- Date targeting
  target_date date,           -- for daily goals
  target_week_start date,     -- for weekly goals (monday of week)
  target_month date,          -- for monthly goals (first of month)
  
  -- Reminder
  reminder_time time,         -- e.g. 09:00
  reminder_sent boolean default false,
  
  -- Streak tracking
  streak_count integer default 0,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.goals enable row level security;

create policy "Users can manage own goals"
  on public.goals for all
  using (auth.uid() = user_id);

-- ─── GOAL LOGS ───────────────────────────────────────────────
create table public.goal_logs (
  id uuid default uuid_generate_v4() primary key,
  goal_id uuid references public.goals(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  logged_at timestamptz default now(),
  note text,
  status text not null check (status in ('completed', 'missed', 'partial'))
);

alter table public.goal_logs enable row level security;

create policy "Users can manage own goal logs"
  on public.goal_logs for all
  using (auth.uid() = user_id);

-- ─── WHATSAPP VERIFICATION ───────────────────────────────────
create table public.whatsapp_verifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  phone_number text not null,
  code text not null,
  expires_at timestamptz not null,
  verified boolean default false,
  created_at timestamptz default now()
);

alter table public.whatsapp_verifications enable row level security;

create policy "Users can manage own verifications"
  on public.whatsapp_verifications for all
  using (auth.uid() = user_id);

-- ─── FUNCTIONS ───────────────────────────────────────────────

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, split_part(new.email, '@', 1));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update updated_at on profiles
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at();

create trigger update_goals_updated_at
  before update on public.goals
  for each row execute procedure public.update_updated_at();

-- ─── INDEXES ─────────────────────────────────────────────────
create index goals_user_id_idx on public.goals(user_id);
create index goals_target_date_idx on public.goals(target_date);
create index goals_type_idx on public.goals(type);
create index goal_logs_goal_id_idx on public.goal_logs(goal_id);
create index goal_logs_user_id_idx on public.goal_logs(user_id);

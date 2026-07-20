create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  time_zone text not null default 'Etc/UTC',
  streak_freezes int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 90),
  cadence text not null default 'daily' check (cadence in ('daily', 'weekdays', 'custom')),
  schedule_days int[] not null default '{0,1,2,3,4,5,6}',
  reminder_time time not null default '08:00',
  reminder_retries int[] not null default '{0,30,120,360}',
  tone text not null default 'strict' check (tone in ('strict', 'hard', 'direct')),
  color text not null default '#ef6f56',
  icon text not null default 'flame',
  is_paused boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.habit_completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  completed_on date not null,
  count int not null default 1 check (count > 0),
  proof_url text,
  proof_type text check (proof_type in ('image', 'audio', 'none')),
  is_freeze boolean not null default false,
  created_at timestamptz not null default now(),
  unique (habit_id, completed_on)
);

create table if not exists public.notification_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  keys jsonb not null,
  user_agent text,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  event_date date not null,
  retry_minute int not null,
  delivered_at timestamptz,
  error text,
  created_at timestamptz not null default now(),
  unique (habit_id, event_date, retry_minute)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_habits_updated_at on public.habits;
create trigger set_habits_updated_at
before update on public.habits
for each row execute function public.set_updated_at();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name')
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists create_profile_for_new_user on auth.users;
create trigger create_profile_for_new_user
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.habit_completions enable row level security;
alter table public.notification_subscriptions enable row level security;
alter table public.notification_events enable row level security;

create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "habits_select_own"
on public.habits for select
using (auth.uid() = user_id);

create policy "habits_insert_own"
on public.habits for insert
with check (auth.uid() = user_id);

create policy "habits_update_own"
on public.habits for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "habits_delete_own"
on public.habits for delete
using (auth.uid() = user_id);

create policy "completions_select_own"
on public.habit_completions for select
using (auth.uid() = user_id);

create policy "completions_insert_own"
on public.habit_completions for insert
with check (auth.uid() = user_id);

create policy "completions_delete_own"
on public.habit_completions for delete
using (auth.uid() = user_id);

create policy "subscriptions_select_own"
on public.notification_subscriptions for select
using (auth.uid() = user_id);

create policy "subscriptions_upsert_own"
on public.notification_subscriptions for insert
with check (auth.uid() = user_id);

create policy "subscriptions_update_own"
on public.notification_subscriptions for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "events_select_own"
on public.notification_events for select
using (auth.uid() = user_id);

-- Storage Setup
insert into storage.buckets (id, name, public)
values ('habit_proofs', 'habit_proofs', false)
on conflict (id) do nothing;

create policy "Users can view their own proofs"
on storage.objects for select
using ( bucket_id = 'habit_proofs' and auth.uid() = owner );

create policy "Users can upload their own proofs"
on storage.objects for insert
with check ( bucket_id = 'habit_proofs' and auth.uid() = owner );

GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.habits TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.habit_completions TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.notification_subscriptions TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.notification_events TO anon, authenticated, service_role;

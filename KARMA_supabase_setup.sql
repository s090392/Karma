create extension if not exists pgcrypto;

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  seg text check (seg in ('bpo', 'it', 'fresher', 'manager', 'generic')),
  fn text check (fn in ('fa', 'cs', 'hr', 'it', 'analytics', 'lpo', 'generic')),
  ai_adoption text check (ai_adoption in ('none', 'pilot', 'scaling', 'replacing')),
  exp int,
  yrs int,
  risk_score numeric(4,1) not null check (risk_score between 1 and 10),
  lq_score numeric(4,1) not null check (lq_score between 1 and 10),
  csw_months int not null check (csw_months >= 0),
  safety_score numeric(4,1) not null check (safety_score between 1 and 10),
  country text default 'india',
  created_at timestamptz not null default now()
);

create index if not exists assessments_user_created_idx
  on public.assessments (user_id, created_at desc);

create table if not exists public.streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  streak int not null default 0,
  longest_streak int not null default 0,
  last_checkin date,
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'explorer', 'navigator', 'pioneer')),
  status text not null default 'active' check (status in ('active', 'cancelled', 'expired')),
  razorpay_customer_id text,
  razorpay_sub_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.assessments enable row level security;
alter table public.streaks enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "Users read own assessments" on public.assessments;
drop policy if exists "Users insert own assessments" on public.assessments;
drop policy if exists "Users delete own assessments" on public.assessments;
create policy "Users read own assessments"
  on public.assessments for select
  using (auth.uid() = user_id);
create policy "Users insert own assessments"
  on public.assessments for insert
  with check (auth.uid() = user_id);
create policy "Users delete own assessments"
  on public.assessments for delete
  using (auth.uid() = user_id);

drop policy if exists "Users read own streak" on public.streaks;
drop policy if exists "Users upsert own streak" on public.streaks;
drop policy if exists "Users update own streak" on public.streaks;
drop policy if exists "Users delete own streak" on public.streaks;
create policy "Users read own streak"
  on public.streaks for select
  using (auth.uid() = user_id);
create policy "Users upsert own streak"
  on public.streaks for insert
  with check (auth.uid() = user_id);
create policy "Users update own streak"
  on public.streaks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "Users delete own streak"
  on public.streaks for delete
  using (auth.uid() = user_id);

drop policy if exists "Users read own subscription" on public.subscriptions;
drop policy if exists "Users upsert own subscription" on public.subscriptions;
drop policy if exists "Users update own subscription" on public.subscriptions;
drop policy if exists "Users delete own subscription" on public.subscriptions;
create policy "Users read own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);
create policy "Users upsert own subscription"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);
create policy "Users update own subscription"
  on public.subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create policy "Users delete own subscription"
  on public.subscriptions for delete
  using (auth.uid() = user_id);

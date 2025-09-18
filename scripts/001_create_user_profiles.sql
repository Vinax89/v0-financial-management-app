-- Create user profiles table with RLS
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  date_of_birth date,
  annual_income numeric,
  onboarding_completed boolean default false,
  onboarding_step integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  financial_goals text[],
  risk_tolerance text,
  preferred_currency text default 'USD',
  phone_number text,
  occupation text,
  timezone text default 'UTC'
);

-- Enable RLS
alter table public.user_profiles enable row level security;

-- Create RLS policies
create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

create policy "Users can delete own profile"
  on public.user_profiles for delete
  using (auth.uid() = id);

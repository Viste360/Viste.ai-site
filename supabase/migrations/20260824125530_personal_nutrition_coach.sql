-- Private-first personal nutrition coach. Health-adjacent data is isolated per user.

do $$ begin
  create type public.nutrition_goal as enum ('eat_better', 'lose_weight', 'maintain_weight');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.nutrition_meal_type as enum ('breakfast', 'lunch', 'dinner', 'snack', 'other');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.nutrition_message_role as enum ('user', 'assistant');
exception when duplicate_object then null;
end $$;

create table if not exists public.nutrition_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  goal public.nutrition_goal not null,
  dietary_preferences text[] not null default '{}',
  allergies text[] not null default '{}',
  foods_to_avoid text[] not null default '{}',
  context_notes text not null default '' check (char_length(context_notes) <= 1200),
  locale text not null default 'es' check (locale in ('en', 'es')),
  consent_version text not null default 'nutrition-private-v1',
  consent_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.nutrition_meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  eaten_at timestamptz not null,
  meal_type public.nutrition_meal_type not null,
  description text not null check (char_length(description) between 2 and 1200),
  hunger_before smallint check (hunger_before between 1 and 10),
  fullness_after smallint check (fullness_after between 1 and 10),
  created_at timestamptz not null default now()
);

create table if not exists public.nutrition_weights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  measured_on date not null,
  weight_kg numeric(5,2) not null check (weight_kg between 25 and 350),
  note text not null default '' check (char_length(note) <= 300),
  created_at timestamptz not null default now(),
  unique (user_id, measured_on)
);

create table if not exists public.nutrition_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.nutrition_message_role not null,
  content text not null check (char_length(content) between 1 and 2000),
  safety_level text not null default 'general' check (safety_level in ('general', 'caution', 'urgent')),
  created_at timestamptz not null default now()
);

create index if not exists nutrition_meals_user_eaten_idx on public.nutrition_meals (user_id, eaten_at desc);
create index if not exists nutrition_weights_user_measured_idx on public.nutrition_weights (user_id, measured_on desc);
create index if not exists nutrition_messages_user_created_idx on public.nutrition_messages (user_id, created_at desc);

alter table public.nutrition_profiles enable row level security;
alter table public.nutrition_meals enable row level security;
alter table public.nutrition_weights enable row level security;
alter table public.nutrition_messages enable row level security;

revoke all on public.nutrition_profiles, public.nutrition_meals, public.nutrition_weights, public.nutrition_messages from anon, authenticated;
grant select, insert, update, delete on public.nutrition_profiles, public.nutrition_meals, public.nutrition_weights to authenticated;
grant select on public.nutrition_messages to authenticated;
grant all on public.nutrition_profiles, public.nutrition_meals, public.nutrition_weights, public.nutrition_messages to service_role;

drop policy if exists nutrition_profiles_select_own on public.nutrition_profiles;
create policy nutrition_profiles_select_own on public.nutrition_profiles for select to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);
drop policy if exists nutrition_profiles_insert_own on public.nutrition_profiles;
create policy nutrition_profiles_insert_own on public.nutrition_profiles for insert to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);
drop policy if exists nutrition_profiles_update_own on public.nutrition_profiles;
create policy nutrition_profiles_update_own on public.nutrition_profiles for update to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);
drop policy if exists nutrition_profiles_delete_own on public.nutrition_profiles;
create policy nutrition_profiles_delete_own on public.nutrition_profiles for delete to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists nutrition_meals_select_own on public.nutrition_meals;
create policy nutrition_meals_select_own on public.nutrition_meals for select to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);
drop policy if exists nutrition_meals_insert_own on public.nutrition_meals;
create policy nutrition_meals_insert_own on public.nutrition_meals for insert to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);
drop policy if exists nutrition_meals_update_own on public.nutrition_meals;
create policy nutrition_meals_update_own on public.nutrition_meals for update to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);
drop policy if exists nutrition_meals_delete_own on public.nutrition_meals;
create policy nutrition_meals_delete_own on public.nutrition_meals for delete to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists nutrition_weights_select_own on public.nutrition_weights;
create policy nutrition_weights_select_own on public.nutrition_weights for select to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);
drop policy if exists nutrition_weights_insert_own on public.nutrition_weights;
create policy nutrition_weights_insert_own on public.nutrition_weights for insert to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);
drop policy if exists nutrition_weights_update_own on public.nutrition_weights;
create policy nutrition_weights_update_own on public.nutrition_weights for update to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);
drop policy if exists nutrition_weights_delete_own on public.nutrition_weights;
create policy nutrition_weights_delete_own on public.nutrition_weights for delete to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

drop policy if exists nutrition_messages_select_own on public.nutrition_messages;
create policy nutrition_messages_select_own on public.nutrition_messages for select to authenticated
using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

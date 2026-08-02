create extension if not exists pgcrypto;
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(),
  name text not null, email text not null, company text not null, role text, country text, phone text,
  challenge text not null, budget text not null, timeline text not null, locale text not null check (locale in ('en','es')),
  consent_at timestamptz not null, source text not null default 'website', source_url text, referrer text, utm_source text, utm_medium text, utm_campaign text, ip_hash text, status text not null default 'new' check (status in ('new','contacted','qualified','closed','archived'))
);
create table if not exists public.admin_users (user_id uuid primary key references auth.users(id) on delete cascade, created_at timestamptz not null default now());
create table if not exists public.lead_notes (id uuid primary key default gen_random_uuid(), lead_id uuid not null references public.leads(id) on delete cascade, author_id uuid not null references auth.users(id), body text not null, created_at timestamptz not null default now());
create table if not exists public.lead_events (id uuid primary key default gen_random_uuid(), lead_id uuid not null references public.leads(id) on delete cascade, event text not null, metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
alter table public.leads enable row level security;alter table public.admin_users enable row level security;alter table public.lead_notes enable row level security;alter table public.lead_events enable row level security;
revoke all on public.leads,public.admin_users,public.lead_notes,public.lead_events from anon,authenticated;
create index if not exists leads_created_at_idx on public.leads(created_at desc);create index if not exists leads_status_idx on public.leads(status);

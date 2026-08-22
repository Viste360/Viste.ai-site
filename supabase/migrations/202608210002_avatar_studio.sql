-- Viste Avatar Studio: consented talent profiles and provider-neutral render jobs.
-- Rendering is dispatched by server routes; authenticated clients receive read-only access.

do $$ begin
  create type public.avatar_talent_status as enum ('draft','ready','revoked','archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.avatar_consent_status as enum ('pending','active','revoked','expired');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.avatar_render_status as enum ('awaiting_upload','queued','processing','review','approved','failed','cancelled');
exception when duplicate_object then null;
end $$;

create table if not exists public.avatar_talents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete restrict,
  display_name text not null check (char_length(display_name) between 1 and 120),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  status public.avatar_talent_status not null default 'draft',
  default_language text not null default 'en' check (default_language in ('en','es')),
  reference_video_asset_id uuid references public.assets(id) on delete set null,
  reference_audio_asset_id uuid references public.assets(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, slug)
);

create table if not exists public.avatar_consents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  talent_id uuid not null references public.avatar_talents(id) on delete cascade,
  status public.avatar_consent_status not null default 'pending',
  scope text not null check (char_length(scope) between 10 and 1000),
  evidence_asset_id uuid references public.assets(id) on delete set null,
  confirmed_by uuid references auth.users(id) on delete set null,
  confirmed_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.avatar_render_jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  talent_id uuid not null references public.avatar_talents(id) on delete restrict,
  created_by uuid references auth.users(id) on delete set null,
  provider text not null check (provider in ('manual','open_source')),
  provider_job_id text,
  status public.avatar_render_status not null,
  cue_id text,
  script text not null check (char_length(script) between 2 and 1200),
  language text not null check (language in ('en','es')),
  aspect_ratio text not null check (aspect_ratio in ('9:16','16:9','1:1')),
  background text not null check (background in ('transparent','studio_dark','source')),
  output_asset_id uuid references public.assets(id) on delete set null,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists avatar_talents_tenant_status_idx on public.avatar_talents (tenant_id, status, created_at desc);
create index if not exists avatar_consents_talent_status_idx on public.avatar_consents (talent_id, status, created_at desc);
create index if not exists avatar_render_jobs_tenant_status_idx on public.avatar_render_jobs (tenant_id, status, created_at desc);
create index if not exists avatar_render_jobs_talent_idx on public.avatar_render_jobs (talent_id, created_at desc);

alter table public.avatar_talents enable row level security;
alter table public.avatar_consents enable row level security;
alter table public.avatar_render_jobs enable row level security;

revoke all on public.avatar_talents, public.avatar_consents, public.avatar_render_jobs from anon, authenticated;
grant select on public.avatar_talents, public.avatar_consents, public.avatar_render_jobs to authenticated;
grant all on public.avatar_talents, public.avatar_consents, public.avatar_render_jobs to service_role;

drop policy if exists avatar_talent_member_select on public.avatar_talents;
create policy avatar_talent_member_select on public.avatar_talents for select to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists avatar_consent_member_select on public.avatar_consents;
create policy avatar_consent_member_select on public.avatar_consents for select to authenticated
using (public.is_tenant_member(tenant_id));

drop policy if exists avatar_render_member_select on public.avatar_render_jobs;
create policy avatar_render_member_select on public.avatar_render_jobs for select to authenticated
using (public.is_tenant_member(tenant_id));

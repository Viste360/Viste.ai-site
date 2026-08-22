-- Viste Studio / campaign composer, approved voices and publishing calendar.
-- Apply after 202608170001_viste_studio_assets.sql.

do $$ begin
  create type public.studio_campaign_status as enum (
    'DRAFT','BRIEF_READY','CONCEPT_REVIEW','SCRIPT_REVIEW','STORYBOARD',
    'READY_TO_RENDER','RENDERING','RENDER_REVIEW','CHANGES_REQUESTED',
    'APPROVED','SCHEDULED','PUBLISHED','FAILED','ARCHIVED'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.studio_voice_type as enum ('premade','professional','cloned','generated');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.studio_voice_status as enum ('draft','approved','suspended','archived');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.studio_platform as enum ('linkedin','instagram','facebook','youtube','tiktok','x','manual_export');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.studio_publication_status as enum (
    'draft','awaiting_approval','scheduled','dispatching','published','failed','cancelled'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.brand_voices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  brand_id uuid not null references public.brands(id) on delete cascade,
  provider text not null check (provider in ('elevenlabs','edge_tts')),
  provider_voice_id text not null,
  name text not null check (char_length(name) between 1 and 120),
  voice_type public.studio_voice_type not null,
  language_codes text[] not null default array['en']::text[],
  licence_reference text,
  consent_reference text,
  status public.studio_voice_status not null default 'draft',
  settings jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, provider, provider_voice_id),
  check (
    (voice_type in ('premade','generated') and licence_reference is not null)
    or (voice_type in ('professional','cloned') and consent_reference is not null)
  )
);

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  brand_id uuid not null references public.brands(id) on delete restrict,
  created_by uuid not null references auth.users(id) on delete restrict,
  name text not null check (char_length(name) between 1 and 180),
  objective text not null,
  audience text not null,
  product_or_service text,
  geographic_market text,
  language text not null check (language in ('en','es')),
  platforms public.studio_platform[] not null default '{}',
  desired_cta text not null,
  idea text not null,
  status public.studio_campaign_status not null default 'DRAFT',
  selected_voice_id uuid references public.brand_voices(id) on delete set null,
  prompt_version text not null default 'studio-hooks-v1',
  model_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scripts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  version integer not null check (version > 0),
  concept_name text not null,
  opening_hook text not null,
  opening_beats jsonb not null,
  main_script text not null,
  alternative_cta text,
  delivery_notes text,
  locked_lines jsonb not null default '[]'::jsonb,
  source_claims jsonb not null default '[]'::jsonb,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (campaign_id, version)
);

create table if not exists public.platform_accounts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  brand_id uuid not null references public.brands(id) on delete cascade,
  platform public.studio_platform not null,
  account_label text not null,
  provider_account_id text,
  status text not null default 'unconfigured' check (status in ('unconfigured','authorised','expired','revoked')),
  secret_reference text,
  authorised_by uuid references auth.users(id) on delete set null,
  authorised_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, platform, provider_account_id)
);

create table if not exists public.publications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  brand_id uuid not null references public.brands(id) on delete restrict,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  platform_account_id uuid not null references public.platform_accounts(id) on delete restrict,
  platform public.studio_platform not null,
  title text not null,
  description text not null default '',
  scheduled_for timestamptz not null,
  timezone text not null,
  status public.studio_publication_status not null default 'awaiting_approval',
  metadata jsonb not null default '{}'::jsonb,
  external_publication_id text,
  error_code text,
  retry_count integer not null default 0 check (retry_count between 0 and 10),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  published_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (scheduled_for > created_at - interval '5 minutes'),
  check (
    status not in ('scheduled','dispatching','published')
    or (approved_by is not null and approved_at is not null)
  )
);

alter table public.approvals add column if not exists campaign_id uuid references public.campaigns(id) on delete cascade;
alter table public.approvals add column if not exists publication_id uuid references public.publications(id) on delete cascade;
alter table public.approvals drop constraint if exists approvals_action_type_check;
alter table public.approvals add constraint approvals_action_type_check check (
  action_type in (
    'marketing_follow_up','crm_change','pricing','proposal','delivery_commitment',
    'script_approval','render_approval','campaign_publish'
  )
);

create index if not exists brand_voices_brand_idx on public.brand_voices (brand_id, status);
create index if not exists campaigns_tenant_status_idx on public.campaigns (tenant_id, status, updated_at desc);
create index if not exists scripts_campaign_version_idx on public.scripts (campaign_id, version desc);
create index if not exists platform_accounts_brand_idx on public.platform_accounts (brand_id, platform, status);
create index if not exists publications_due_idx on public.publications (status, scheduled_for) where status = 'scheduled';
create index if not exists publications_tenant_calendar_idx on public.publications (tenant_id, scheduled_for);

alter table public.brand_voices enable row level security;
alter table public.campaigns enable row level security;
alter table public.scripts enable row level security;
alter table public.platform_accounts enable row level security;
alter table public.publications enable row level security;

revoke all on public.brand_voices, public.campaigns, public.scripts, public.platform_accounts, public.publications from anon, authenticated;
grant select on public.brand_voices, public.campaigns, public.scripts, public.platform_accounts, public.publications to authenticated;

drop policy if exists brand_voice_member_select on public.brand_voices;
create policy brand_voice_member_select on public.brand_voices for select to authenticated using (public.is_tenant_member(tenant_id));
drop policy if exists campaign_member_select on public.campaigns;
create policy campaign_member_select on public.campaigns for select to authenticated using (public.is_tenant_member(tenant_id));
drop policy if exists script_member_select on public.scripts;
create policy script_member_select on public.scripts for select to authenticated using (public.is_tenant_member(tenant_id));
drop policy if exists platform_account_member_select on public.platform_accounts;
create policy platform_account_member_select on public.platform_accounts for select to authenticated using (public.is_tenant_member(tenant_id));
drop policy if exists publication_member_select on public.publications;
create policy publication_member_select on public.publications for select to authenticated using (public.is_tenant_member(tenant_id));

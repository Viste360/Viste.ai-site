-- Viste Studio / first vertical slice
-- Reuses the existing tenant + membership model and adds private brand assets.
-- Apply after the VIS_010 migrations.

create extension if not exists pgcrypto;

do $$ begin
  create type public.studio_asset_type as enum ('logo','image','video','audio','document','template','export');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.studio_asset_status as enum ('uploading','ready','failed','quarantined','archived');
exception when duplicate_object then null;
end $$;

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  legal_name text,
  website text,
  description text,
  default_language text not null default 'en' check (default_language in ('en','es')),
  supported_languages text[] not null default array['en']::text[],
  brand_voice jsonb not null default '{}'::jsonb,
  approval_requirements jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, name)
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  brand_id uuid references public.brands(id) on delete set null,
  owner_id uuid not null references auth.users(id) on delete restrict,
  file_name text not null check (char_length(file_name) between 1 and 240),
  storage_path text not null unique,
  content_type text not null,
  bytes bigint not null check (bytes > 0 and bytes <= 524288000),
  asset_type public.studio_asset_type not null,
  status public.studio_asset_status not null default 'uploading',
  source text not null,
  licence text not null,
  permitted_use text not null,
  licence_expiry date,
  people_or_trademarks text[] not null default '{}',
  ai_generated boolean not null default false,
  file_hash_sha256 text check (file_hash_sha256 is null or file_hash_sha256 ~ '^[a-f0-9]{64}$'),
  technical_metadata jsonb not null default '{}'::jsonb,
  uploaded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.asset_licences (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  asset_id uuid not null references public.assets(id) on delete cascade,
  licence_name text not null,
  licensor text,
  permitted_use text not null,
  evidence_storage_path text,
  starts_on date,
  expires_on date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.asset_usage (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  asset_id uuid not null references public.assets(id) on delete cascade,
  campaign_reference uuid,
  usage_type text not null,
  used_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists brands_tenant_idx on public.brands (tenant_id, name);
create index if not exists assets_tenant_created_idx on public.assets (tenant_id, created_at desc);
create index if not exists assets_brand_type_idx on public.assets (brand_id, asset_type, status);
create index if not exists asset_licences_asset_idx on public.asset_licences (asset_id);
create index if not exists asset_usage_asset_idx on public.asset_usage (asset_id, created_at desc);

alter table public.brands enable row level security;
alter table public.assets enable row level security;
alter table public.asset_licences enable row level security;
alter table public.asset_usage enable row level security;

revoke all on public.brands, public.assets, public.asset_licences, public.asset_usage from anon, authenticated;
grant select on public.brands, public.assets, public.asset_licences, public.asset_usage to authenticated;

drop policy if exists brand_member_select on public.brands;
create policy brand_member_select on public.brands for select to authenticated using (public.is_tenant_member(tenant_id));
drop policy if exists asset_member_select on public.assets;
create policy asset_member_select on public.assets for select to authenticated using (public.is_tenant_member(tenant_id));
drop policy if exists asset_licence_member_select on public.asset_licences;
create policy asset_licence_member_select on public.asset_licences for select to authenticated using (public.is_tenant_member(tenant_id));
drop policy if exists asset_usage_member_select on public.asset_usage;
create policy asset_usage_member_select on public.asset_usage for select to authenticated using (public.is_tenant_member(tenant_id));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'studio-assets',
  'studio-assets',
  false,
  524288000,
  array[
    'image/jpeg','image/png','image/webp','image/gif','image/avif','image/svg+xml',
    'video/mp4','video/quicktime','video/webm',
    'audio/mpeg','audio/mp4','audio/wav','audio/x-wav','audio/ogg',
    'application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain','text/csv'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists studio_asset_member_read on storage.objects;
create policy studio_asset_member_read on storage.objects
for select to authenticated
using (
  bucket_id = 'studio-assets'
  and public.is_tenant_member((storage.foldername(name))[1]::uuid)
);


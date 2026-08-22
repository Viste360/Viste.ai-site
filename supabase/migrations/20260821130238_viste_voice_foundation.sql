-- VISTE Voice provider-neutral control plane.
-- Reuses tenants, memberships, contacts, opportunities, bookings, consent,
-- suppression, knowledge and audit records from VIS_010.

create extension if not exists pgcrypto;

alter table public.contacts
  add column if not exists phone_e164 text,
  add column if not exists phone_hash text;

create unique index if not exists contacts_tenant_phone_hash_idx
  on public.contacts (tenant_id, phone_hash)
  where phone_hash is not null;

alter table public.consent_records
  add column if not exists phone_hash text,
  add column if not exists lawful_basis text,
  add column if not exists proof jsonb not null default '{}'::jsonb,
  add column if not exists policy_version text,
  add column if not exists expires_at timestamptz,
  add column if not exists revoked_at timestamptz;

alter table public.suppression_entries
  add column if not exists phone_hash text,
  add column if not exists scope text not null default 'marketing'
    check (scope in ('marketing', 'all_outbound'));

create unique index if not exists suppression_tenant_phone_scope_idx
  on public.suppression_entries (tenant_id, phone_hash, channel, scope);

create table if not exists public.voice_agents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  brand_id uuid references public.brands(id) on delete set null,
  name text not null check (char_length(name) between 1 and 120),
  purpose text not null check (char_length(purpose) between 1 and 500),
  status text not null default 'draft' check (status in ('draft','testing','published','paused','archived')),
  provider text not null check (provider in ('elevenlabs','openai-realtime')),
  provider_agent_id text,
  default_language text not null check (default_language in ('en','es')),
  supported_languages text[] not null default array['en','es']::text[],
  timezone text not null default 'Europe/Madrid',
  template_key text not null,
  active_version_id uuid,
  kill_switch boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, name),
  unique (provider, provider_agent_id)
);

create table if not exists public.voice_agent_versions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  voice_agent_id uuid not null references public.voice_agents(id) on delete cascade,
  version integer not null check (version > 0),
  prompt text not null,
  prompt_version text not null,
  disclosure_version text not null,
  policy_version text not null,
  voice_config jsonb not null default '{}'::jsonb,
  tool_policy jsonb not null default '{}'::jsonb,
  knowledge_version text,
  status text not null default 'draft' check (status in ('draft','published','superseded','rolled_back')),
  published_at timestamptz,
  published_by uuid references auth.users(id) on delete set null,
  change_note text,
  created_at timestamptz not null default now(),
  unique (voice_agent_id, version)
);

alter table public.voice_agents
  drop constraint if exists voice_agents_active_version_id_fkey;
alter table public.voice_agents
  add constraint voice_agents_active_version_id_fkey
  foreign key (active_version_id) references public.voice_agent_versions(id) on delete set null;

create table if not exists public.voice_numbers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  voice_agent_id uuid references public.voice_agents(id) on delete set null,
  provider text not null check (provider in ('twilio','sip')),
  provider_number_id text not null,
  e164_number text not null check (e164_number ~ '^\+[1-9][0-9]{7,14}$'),
  country text not null,
  number_type text not null,
  direction text not null check (direction in ('inbound','outbound','both')),
  status text not null default 'pending' check (status in ('pending','active','suspended','released')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_number_id),
  unique (e164_number)
);

create table if not exists public.voice_offers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  description text not null,
  onboarding_amount numeric(12,2),
  monthly_amount numeric(12,2),
  included_minutes integer,
  overage_per_minute numeric(12,4),
  currency text not null default 'EUR',
  tax_mode text not null default 'before_vat',
  terms text not null,
  valid_from timestamptz not null,
  valid_until timestamptz,
  approved boolean not null default false,
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (tenant_id, name, valid_from)
);

create table if not exists public.voice_calls (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  agent_id uuid not null references public.voice_agents(id) on delete restrict,
  provider text not null check (provider in ('elevenlabs','openai-realtime')),
  provider_call_id text not null,
  telephony_call_id text,
  direction text not null check (direction in ('inbound','outbound')),
  purpose text not null check (purpose in ('inbound_service','requested_callback','service_callback','commercial_follow_up')),
  from_number_hash text,
  to_number_hash text,
  contact_id uuid references public.contacts(id) on delete set null,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  consent_id uuid references public.consent_records(id) on delete set null,
  disclosure_version text not null,
  disclosure_delivered boolean not null default false,
  started_at timestamptz,
  ended_at timestamptz,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  status text not null,
  outcome text,
  cost_amount numeric(12,6),
  currency text not null default 'EUR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_call_id)
);

alter table public.suppression_entries
  add column if not exists source_call_id uuid references public.voice_calls(id) on delete set null;

create table if not exists public.voice_call_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  call_id uuid references public.voice_calls(id) on delete cascade,
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  occurred_at timestamptz not null,
  payload_redacted jsonb not null default '{}'::jsonb,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  unique (provider, provider_event_id),
  unique (tenant_id, idempotency_key)
);

create table if not exists public.voice_call_analyses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  call_id uuid not null unique references public.voice_calls(id) on delete cascade,
  schema_version text not null,
  summary text not null,
  intent text not null,
  lead_score integer check (lead_score between 0 and 100),
  sentiment text,
  objections jsonb not null default '[]'::jsonb,
  next_action jsonb,
  quality jsonb not null default '{}'::jsonb,
  compliance jsonb not null default '{}'::jsonb,
  model_version text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.voice_tool_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  call_id uuid references public.voice_calls(id) on delete cascade,
  agent_id uuid not null references public.voice_agents(id) on delete restrict,
  tool_name text not null,
  idempotency_key text not null,
  request_redacted jsonb not null default '{}'::jsonb,
  response_redacted jsonb not null default '{}'::jsonb,
  status text not null check (status in ('started','succeeded','failed','denied')),
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  error_code text,
  created_at timestamptz not null default now(),
  unique (tenant_id, idempotency_key)
);

create table if not exists public.voice_usage_ledger (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  call_id uuid references public.voice_calls(id) on delete set null,
  meter text not null,
  quantity numeric(14,4) not null check (quantity >= 0),
  unit text not null,
  provider_cost numeric(12,6) not null default 0,
  customer_charge numeric(12,6) not null default 0,
  currency text not null default 'EUR',
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.voice_outbound_call_checks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete set null,
  phone_hash text not null,
  purpose text not null,
  policy_version text not null,
  decision text not null check (decision in ('allow','deny')),
  reasons jsonb not null default '[]'::jsonb,
  checked_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.voice_country_call_policies (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  country_code text not null,
  direction text not null,
  purpose text not null,
  allowed_number_types text[] not null default '{}',
  quiet_hours jsonb not null default '{}'::jsonb,
  max_attempts integer not null default 1 check (max_attempts between 0 and 20),
  disclosure_version text not null,
  recording_rule text not null,
  review_status text not null default 'pending_legal_review' check (review_status in ('pending_legal_review','approved','suspended')),
  legal_reviewed_at timestamptz,
  effective_from timestamptz not null,
  effective_until timestamptz,
  created_at timestamptz not null default now(),
  unique (tenant_id, country_code, direction, purpose, effective_from)
);

create table if not exists public.voice_demo_requests (
  id uuid primary key,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  first_name text not null check (char_length(first_name) between 2 and 100),
  business_name text not null check (char_length(business_name) between 2 and 160),
  website_url text not null,
  phone_e164 text not null check (phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  phone_hash text not null,
  preferred_language text not null check (preferred_language in ('en','es')),
  consent_wording text not null,
  consent_proof jsonb not null,
  policy_version text not null,
  provider_call_id text,
  status text not null default 'queued' check (status in ('queued','policy_denied','calling','completed','failed','expired','suppressed')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists voice_agents_tenant_status_idx on public.voice_agents (tenant_id, status);
create index if not exists voice_agent_versions_agent_idx on public.voice_agent_versions (voice_agent_id, version desc);
create index if not exists voice_calls_tenant_started_idx on public.voice_calls (tenant_id, started_at desc);
create index if not exists voice_calls_opportunity_idx on public.voice_calls (opportunity_id) where opportunity_id is not null;
create index if not exists voice_call_events_call_idx on public.voice_call_events (call_id, occurred_at);
create index if not exists voice_tool_runs_call_idx on public.voice_tool_runs (call_id, created_at);
create index if not exists voice_usage_tenant_occurred_idx on public.voice_usage_ledger (tenant_id, occurred_at desc);
create index if not exists voice_outbound_phone_idx on public.voice_outbound_call_checks (tenant_id, phone_hash, checked_at desc);
create index if not exists voice_demo_phone_created_idx on public.voice_demo_requests (tenant_id, phone_hash, created_at desc);
create index if not exists voice_demo_expiry_idx on public.voice_demo_requests (expires_at) where status not in ('expired','suppressed');

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'voice_agents','voice_agent_versions','voice_numbers','voice_offers','voice_calls','voice_call_events',
    'voice_call_analyses','voice_tool_runs','voice_usage_ledger','voice_outbound_call_checks',
    'voice_country_call_policies','voice_demo_requests'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on public.%I from anon, authenticated', table_name);
    execute format('grant select on public.%I to authenticated', table_name);
    execute format('grant select, insert, update, delete on public.%I to service_role', table_name);
    execute format('drop policy if exists voice_tenant_member_select on public.%I', table_name);
    execute format('create policy voice_tenant_member_select on public.%I for select to authenticated using (public.is_tenant_member(tenant_id))', table_name);
  end loop;
end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('voice-recordings', 'voice-recordings', false, 104857600, array['audio/mpeg','audio/mp4','audio/wav','audio/ogg'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

insert into public.voice_agents (
  id, tenant_id, name, purpose, status, provider, default_language, supported_languages, timezone, template_key
) values (
  '20000000-0000-4000-8000-000000000010',
  '10000000-0000-4000-8000-000000000010',
  'Vera',
  'VISTE bilingual AI sales concierge for inbound enquiries and explicitly requested callbacks',
  'draft',
  'elevenlabs',
  'es',
  array['es','en'],
  'Europe/Madrid',
  'vera-sales-concierge'
) on conflict (tenant_id, name) do nothing;

insert into public.voice_agent_versions (
  id, tenant_id, voice_agent_id, version, prompt, prompt_version, disclosure_version, policy_version,
  voice_config, tool_policy, status, change_note
) values (
  '21000000-0000-4000-8000-000000000010',
  '10000000-0000-4000-8000-000000000010',
  '20000000-0000-4000-8000-000000000010',
  1,
  'Rendered server-side from the approved vera-sales-concierge template. AI disclosure, approved-facts-only, confirmation, handoff and immediate opt-out rules are immutable.',
  'vera-sales-concierge-2026-08-21-v1',
  'vera-disclosure-2026-08-21-v1',
  'voice-eu-es-2026-08-21-v1',
  '{"default_language":"es","supported_languages":["es","en"]}'::jsonb,
  '{"allow":["search_business_knowledge","get_active_offers","check_availability","create_booking","capture_lead","schedule_human_callback","transfer_to_human","send_confirmation","record_opt_out"],"writes_require_idempotency":true}'::jsonb,
  'draft',
  'Initial Vera development version'
) on conflict (voice_agent_id, version) do nothing;

update public.voice_agents
set active_version_id = '21000000-0000-4000-8000-000000000010'
where id = '20000000-0000-4000-8000-000000000010' and active_version_id is null;

insert into public.voice_offers (
  id, tenant_id, name, description, onboarding_amount, monthly_amount, included_minutes,
  overage_per_minute, currency, tax_mode, terms, valid_from, approved
) values
  ('30000000-0000-4000-8000-000000000010','10000000-0000-4000-8000-000000000010','Voice Essential','Inbound answers, FAQs, lead capture and summaries',390,149,200,0.39,'EUR','before_vat','Launch recommendation; final scope requires written proposal','2026-08-21T00:00:00+02:00',true),
  ('30000000-0000-4000-8000-000000000011','10000000-0000-4000-8000-000000000010','Voice Sales','Qualification, calendar booking, human transfer and bilingual agent',790,299,600,0.35,'EUR','before_vat','Launch recommendation; final scope requires written proposal','2026-08-21T00:00:00+02:00',true),
  ('30000000-0000-4000-8000-000000000012','10000000-0000-4000-8000-000000000010','Voice Growth','Multi-location, requested callbacks, warm follow-up and deeper analytics',1490,599,1200,0.30,'EUR','before_vat','Launch recommendation; final scope requires written proposal','2026-08-21T00:00:00+02:00',true)
on conflict (tenant_id, name, valid_from) do nothing;

insert into public.voice_country_call_policies (
  id, tenant_id, country_code, direction, purpose, allowed_number_types, quiet_hours, max_attempts,
  disclosure_version, recording_rule, review_status, effective_from
) values (
  '40000000-0000-4000-8000-000000000010',
  '10000000-0000-4000-8000-000000000010',
  'ES', 'outbound', 'commercial_follow_up', array['400'],
  '{"timezone":"Europe/Madrid","start":"09:00","end":"21:00"}'::jsonb,
  1, 'vera-disclosure-2026-08-21-v1', 'counsel_review_required', 'pending_legal_review',
  '2026-10-17T00:00:00+02:00'
) on conflict (tenant_id, country_code, direction, purpose, effective_from) do nothing;

create or replace function public.create_viste_voice_demo_request(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid := '10000000-0000-4000-8000-000000000010';
  v_phone_hash text := p_payload->>'phoneHash';
  v_count_24h integer;
  v_count_30d integer;
begin
  if v_phone_hash is null or v_phone_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'invalid phone hash';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_phone_hash, 0));

  if exists (
    select 1 from public.suppression_entries
    where tenant_id = v_tenant_id and phone_hash = v_phone_hash and channel = 'phone'
  ) then
    return jsonb_build_object('accepted', false, 'reason', 'suppressed');
  end if;

  select count(*) into v_count_24h from public.voice_demo_requests
  where tenant_id = v_tenant_id and phone_hash = v_phone_hash and created_at >= now() - interval '24 hours';
  select count(*) into v_count_30d from public.voice_demo_requests
  where tenant_id = v_tenant_id and phone_hash = v_phone_hash and created_at >= now() - interval '30 days';

  if v_count_24h >= 1 then return jsonb_build_object('accepted', false, 'reason', 'daily_limit'); end if;
  if v_count_30d >= 3 then return jsonb_build_object('accepted', false, 'reason', 'monthly_limit'); end if;

  insert into public.voice_demo_requests (
    id, tenant_id, first_name, business_name, website_url, phone_e164, phone_hash,
    preferred_language, consent_wording, consent_proof, policy_version, expires_at
  ) values (
    (p_payload->>'id')::uuid, v_tenant_id, p_payload->>'firstName', p_payload->>'businessName',
    p_payload->>'websiteUrl', p_payload->>'phoneE164', v_phone_hash, p_payload->>'preferredLanguage',
    p_payload->>'consentWording', p_payload->'consentProof', p_payload->>'policyVersion',
    (p_payload->>'expiresAt')::timestamptz
  );

  insert into public.audit_logs (tenant_id, actor_type, action, entity_type, entity_id, metadata)
  values (v_tenant_id, 'visitor', 'voice.demo_requested', 'voice_demo_request', (p_payload->>'id')::uuid,
    jsonb_build_object('preferredLanguage', p_payload->>'preferredLanguage', 'policyVersion', p_payload->>'policyVersion'));

  return jsonb_build_object('accepted', true, 'id', p_payload->>'id');
end;
$$;

revoke all on function public.create_viste_voice_demo_request(jsonb) from public, anon, authenticated;
grant execute on function public.create_viste_voice_demo_request(jsonb) to service_role;

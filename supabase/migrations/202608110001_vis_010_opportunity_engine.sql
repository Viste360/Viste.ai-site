-- VIS_010 / Viste Opportunity Engine
-- Viste is the first tenant. Tenant keys and RLS are present now so later brands
-- do not require an architectural rewrite or share commercial data by default.
create extension if not exists pgcrypto;

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  supported_languages text[] not null default array['en']::text[],
  default_language text not null default 'en',
  retention_days integer not null default 730 check (retention_days between 1 and 3650),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tenant_domains (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  hostname text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique (tenant_id, hostname)
);

create table if not exists public.memberships (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'practitioner', 'analyst', 'reviewer')),
  created_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);

create table if not exists public.agent_configs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  version integer not null default 1,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  languages text[] not null default array['en']::text[],
  policy jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique (tenant_id, name, version)
);

create table if not exists public.knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null,
  source_type text not null check (source_type in ('page', 'document', 'manual', 'faq')),
  source_uri text,
  language text not null check (language in ('en', 'es')),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  approved_claims jsonb not null default '[]'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  email text not null,
  name text not null,
  company text not null,
  region text,
  preferred_language text not null default 'en' check (preferred_language in ('en', 'es')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, email)
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete restrict,
  title text not null,
  intent text not null check (intent in ('AI_EXPLORATION','WHATSAPP_OPERATIONS','SUPPORT_AUTOMATION','KNOWLEDGE_ASSISTANT','DOCUMENT_WORKFLOW','SALES_CRM','DATA_INTELLIGENCE','CUSTOM_PRODUCT','PARTNER','EXISTING_CLIENT','NOT_FIT')),
  stage text not null check (stage in ('NEW','DIAGNOSING','HUMAN_REVIEW','QUALIFIED','DISCOVERY_BOOKED','SPRINT_PROPOSED','SPRINT_WON','PILOT_PROPOSED','IMPLEMENTATION','NURTURE','CLOSED')),
  priority text not null check (priority in ('P1_PRIORITY','P2_QUALIFIED','P3_DEVELOP','P4_EARLY')),
  risk text not null check (risk in ('LOW','MEDIUM','HIGH')),
  score integer not null check (score between 0 and 100),
  qualification_confidence numeric(4,3) not null check (qualification_confidence between 0 and 1),
  recommended_service jsonb not null,
  recommended_next_action text not null,
  brief jsonb not null,
  owner_id uuid references auth.users(id) on delete set null,
  source_url text,
  first_response_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.opportunity_diagnostics (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  opportunity_id uuid not null unique references public.opportunities(id) on delete cascade,
  current_process text not null,
  affected_users text not null,
  volume text not null,
  business_impact text not null,
  desired_outcome text not null,
  systems text not null,
  data_readiness text not null,
  process_ownership text not null,
  stakeholder_access text not null,
  timeline text not null,
  commercial_readiness text not null,
  constraints text,
  captured_at timestamptz not null default now()
);

create table if not exists public.opportunity_scores (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  algorithm_version text not null default 'vis-010-v1',
  total integer not null check (total between 0 and 100),
  priority text not null,
  confidence numeric(4,3) not null,
  components jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete set null,
  channel text not null check (channel in ('web', 'contact_form', 'whatsapp', 'email')),
  language text not null check (language in ('en', 'es')),
  status text not null default 'open' check (status in ('open', 'human_handoff', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  actor text not null check (actor in ('visitor', 'assistant', 'human', 'system')),
  body text not null,
  approval_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.consent_records (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  purpose text not null,
  channel text not null,
  status text not null check (status in ('granted', 'withdrawn')),
  wording text not null,
  source text not null,
  jurisdiction text,
  occurred_at timestamptz not null default now()
);

create table if not exists public.suppression_entries (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete cascade,
  channel text not null,
  reason text not null,
  created_at timestamptz not null default now(),
  unique (tenant_id, contact_id, channel)
);

create table if not exists public.attribution_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  touch_type text not null check (touch_type in ('first', 'last', 'conversion')),
  source_url text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  gclid text,
  occurred_at timestamptz not null default now()
);

create table if not exists public.approvals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  opportunity_id uuid references public.opportunities(id) on delete cascade,
  action_type text not null check (action_type in ('marketing_follow_up','crm_change','pricing','proposal','delivery_commitment')),
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected','expired')),
  requested_by text not null,
  decided_by uuid references auth.users(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  provider text not null,
  provider_reference text not null,
  starts_at timestamptz not null,
  timezone text not null,
  explicitly_confirmed_at timestamptz not null,
  status text not null check (status in ('confirmed','cancelled','completed','no_show')),
  unique (tenant_id, provider, provider_reference)
);

create table if not exists public.integration_configs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  provider_type text not null,
  provider_name text not null,
  status text not null check (status in ('unconfigured','configured','degraded')),
  public_metadata jsonb not null default '{}'::jsonb,
  secret_reference text,
  updated_at timestamptz not null default now(),
  unique (tenant_id, provider_type)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  actor_type text not null check (actor_type in ('visitor','user','system','provider')),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

insert into public.tenants (id, slug, name, supported_languages, default_language)
values ('10000000-0000-4000-8000-000000000010', 'viste', 'Viste.ai', array['en','es'], 'en')
on conflict (slug) do update set supported_languages = excluded.supported_languages;

insert into public.tenant_domains (tenant_id, hostname, is_primary)
values ('10000000-0000-4000-8000-000000000010', 'viste.ai', true)
on conflict (tenant_id, hostname) do update set is_primary = true;

insert into public.agent_configs (tenant_id, name, version, status, languages, policy, published_at)
values (
  '10000000-0000-4000-8000-000000000010',
  'Viste AI Opportunity Advisor',
  1,
  'published',
  array['en','es'],
  '{"disclose_ai":true,"approved_knowledge_only":true,"human_handoff_on_high_risk":true,"outbound_requires_approval":true}'::jsonb,
  now()
)
on conflict (tenant_id, name, version) do nothing;

create or replace function public.is_tenant_member(p_tenant_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.memberships where tenant_id = p_tenant_id and user_id = auth.uid()) $$;

revoke all on function public.is_tenant_member(uuid) from public, anon;
grant execute on function public.is_tenant_member(uuid) to authenticated, service_role;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'tenants','tenant_domains','memberships','agent_configs','knowledge_sources','contacts','opportunities',
    'opportunity_diagnostics','opportunity_scores','conversations','messages','consent_records','suppression_entries',
    'attribution_events','approvals','bookings','integration_configs','audit_logs'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all on public.%I from anon, authenticated', table_name);
    execute format('grant select on public.%I to authenticated', table_name);
  end loop;
end $$;

drop policy if exists tenant_member_select on public.tenants;
create policy tenant_member_select on public.tenants for select to authenticated using (public.is_tenant_member(id));

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'tenant_domains','memberships','agent_configs','knowledge_sources','contacts','opportunities','opportunity_diagnostics',
    'opportunity_scores','conversations','messages','consent_records','suppression_entries','attribution_events','approvals',
    'bookings','integration_configs','audit_logs'
  ] loop
    execute format('drop policy if exists tenant_member_select on public.%I', table_name);
    execute format('create policy tenant_member_select on public.%I for select to authenticated using (public.is_tenant_member(tenant_id))', table_name);
  end loop;
end $$;

create or replace function public.create_viste_opportunity(p_payload jsonb)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid := '10000000-0000-4000-8000-000000000010';
  v_contact_id uuid;
  v_opportunity_id uuid := gen_random_uuid();
  v_title text;
begin
  v_title := left(coalesce(p_payload->>'company', 'Opportunity') || ' — ' || coalesce(p_payload->>'initialNeed', 'New enquiry'), 220);

  insert into public.contacts (tenant_id, email, name, company, region, preferred_language)
  values (v_tenant_id, lower(p_payload->>'email'), p_payload->>'name', p_payload->>'company', p_payload->>'region', p_payload->>'locale')
  on conflict (tenant_id, email) do update
    set name = excluded.name, company = excluded.company, region = excluded.region,
        preferred_language = excluded.preferred_language, updated_at = now()
  returning id into v_contact_id;

  insert into public.opportunities (
    id, tenant_id, contact_id, title, intent, stage, priority, risk, score,
    qualification_confidence, recommended_service, recommended_next_action, brief, source_url
  ) values (
    v_opportunity_id, v_tenant_id, v_contact_id, v_title, p_payload->>'intent', p_payload->>'stage',
    p_payload#>>'{score,priority}', p_payload->>'risk', (p_payload#>>'{score,total}')::integer,
    (p_payload#>>'{score,confidence}')::numeric, p_payload->'service', p_payload->>'nextAction',
    jsonb_build_object(
      'language', p_payload->>'locale', 'region', p_payload->>'region', 'intent', p_payload->>'intent',
      'problemStatement', p_payload->>'initialNeed', 'currentWorkflow', p_payload->>'currentProcess',
      'affectedUsers', p_payload->>'affectedUsers', 'systems', p_payload->>'systems',
      'businessImpact', p_payload->>'businessImpact', 'desiredOutcome', p_payload->>'desiredOutcome',
      'risk', p_payload->>'risk', 'score', p_payload->'score', 'missingInformation', p_payload->'missingInformation',
      'recommendedService', p_payload->'service', 'recommendedNextAction', p_payload->>'nextAction'
    ),
    p_payload->>'sourceUrl'
  );

  insert into public.opportunity_diagnostics (
    tenant_id, opportunity_id, current_process, affected_users, volume, business_impact, desired_outcome,
    systems, data_readiness, process_ownership, stakeholder_access, timeline, commercial_readiness, constraints
  ) values (
    v_tenant_id, v_opportunity_id, p_payload->>'currentProcess', p_payload->>'affectedUsers', p_payload->>'volume',
    p_payload->>'businessImpact', p_payload->>'desiredOutcome', p_payload->>'systems', p_payload->>'dataReadiness',
    p_payload->>'processOwnership', p_payload->>'stakeholderAccess', p_payload->>'timeline',
    p_payload->>'commercialReadiness', nullif(p_payload->>'constraints', '')
  );

  insert into public.opportunity_scores (tenant_id, opportunity_id, total, priority, confidence, components)
  values (v_tenant_id, v_opportunity_id, (p_payload#>>'{score,total}')::integer,
    p_payload#>>'{score,priority}', (p_payload#>>'{score,confidence}')::numeric, p_payload#>'{score,components}');

  insert into public.consent_records (tenant_id, contact_id, purpose, channel, status, wording, source, jurisdiction)
  values (v_tenant_id, v_contact_id, 'respond_and_qualify_enquiry', 'web', 'granted', p_payload->>'consentWording', 'advisor', p_payload->>'region');

  insert into public.attribution_events (
    tenant_id, opportunity_id, touch_type, source_url, referrer, utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid
  ) values (
    v_tenant_id, v_opportunity_id, 'conversion', p_payload->>'sourceUrl', nullif(p_payload->>'referrer',''),
    nullif(p_payload->>'utmSource',''), nullif(p_payload->>'utmMedium',''), nullif(p_payload->>'utmCampaign',''),
    nullif(p_payload->>'utmTerm',''), nullif(p_payload->>'utmContent',''), nullif(p_payload->>'gclid','')
  );

  insert into public.audit_logs (tenant_id, actor_type, action, entity_type, entity_id, metadata)
  values (v_tenant_id, 'visitor', 'opportunity.created', 'opportunity', v_opportunity_id,
    jsonb_build_object('intent', p_payload->>'intent', 'priority', p_payload#>>'{score,priority}', 'risk', p_payload->>'risk'));

  return v_opportunity_id;
end;
$$;

revoke all on function public.create_viste_opportunity(jsonb) from public, anon, authenticated;
grant execute on function public.create_viste_opportunity(jsonb) to service_role;

grant select, insert, update, delete on all tables in schema public to service_role;

create index if not exists opportunities_tenant_stage_created_idx on public.opportunities(tenant_id, stage, created_at desc);
create index if not exists opportunities_tenant_priority_idx on public.opportunities(tenant_id, priority, score desc);
create index if not exists opportunities_owner_idx on public.opportunities(owner_id) where owner_id is not null;
create index if not exists contacts_tenant_company_idx on public.contacts(tenant_id, company);
create index if not exists attribution_opportunity_idx on public.attribution_events(opportunity_id, occurred_at);
create index if not exists approvals_tenant_status_idx on public.approvals(tenant_id, status, created_at);
create index if not exists audit_tenant_created_idx on public.audit_logs(tenant_id, created_at desc);

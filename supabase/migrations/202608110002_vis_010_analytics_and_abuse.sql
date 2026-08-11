-- Privacy-safe VIS_010 funnel reporting and aggregate abuse reporting.
create table if not exists public.opportunity_funnel_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  session_hash text not null,
  event text not null check (event in ('advisor_viewed','advisor_started','advisor_step_completed','advisor_brief_viewed','advisor_handoff_started')),
  locale text not null check (locale in ('en','es')),
  path text not null check (path in ('/advisor','/es/asesor')),
  step integer check (step between 0 and 6),
  intent text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now()
);

create table if not exists public.security_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  route text not null,
  reason text not null check (reason in ('honeypot','too_fast','memory_rate_limit','database_rate_limit','turnstile_failed')),
  created_at timestamptz not null default now()
);

alter table public.opportunity_funnel_events enable row level security;
alter table public.security_events enable row level security;
revoke all on public.opportunity_funnel_events, public.security_events from anon, authenticated;
grant select on public.opportunity_funnel_events, public.security_events to authenticated;
grant select, insert, update, delete on public.opportunity_funnel_events, public.security_events to service_role;

drop policy if exists tenant_member_select on public.opportunity_funnel_events;
create policy tenant_member_select on public.opportunity_funnel_events for select to authenticated using (public.is_tenant_member(tenant_id));
drop policy if exists tenant_member_select on public.security_events;
create policy tenant_member_select on public.security_events for select to authenticated using (public.is_tenant_member(tenant_id));

create index if not exists opportunity_funnel_tenant_created_idx on public.opportunity_funnel_events(tenant_id, created_at desc);
create index if not exists opportunity_funnel_session_idx on public.opportunity_funnel_events(tenant_id, session_hash, created_at);
create index if not exists opportunity_funnel_event_idx on public.opportunity_funnel_events(tenant_id, event, created_at);
create index if not exists security_events_tenant_created_idx on public.security_events(tenant_id, created_at desc);
create index if not exists security_events_reason_idx on public.security_events(tenant_id, reason, created_at);

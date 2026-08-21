alter table public.leads
  add column if not exists online_presence text,
  add column if not exists enquiry_type text not null default 'general',
  add column if not exists preferred_package text,
  add column if not exists add_ons text[] not null default '{}',
  add column if not exists marketing_source text,
  add column if not exists pipeline_stage text not null default 'prospect';

alter table public.leads drop constraint if exists leads_enquiry_type_check;
alter table public.leads add constraint leads_enquiry_type_check
  check (enquiry_type in ('general', 'website'));

alter table public.leads drop constraint if exists leads_preferred_package_check;
alter table public.leads add constraint leads_preferred_package_check
  check (preferred_package is null or preferred_package in ('local-start', 'local-business', 'signature', 'not-sure'));

alter table public.leads drop constraint if exists leads_pipeline_stage_check;
alter table public.leads add constraint leads_pipeline_stage_check
  check (pipeline_stage in ('prospect', 'contacted', 'demo-created', 'demo-sent', 'call-booked', 'won', 'onboarding', 'live', 'upsell'));

create index if not exists leads_enquiry_type_idx on public.leads(enquiry_type);
create index if not exists leads_pipeline_stage_idx on public.leads(pipeline_stage);

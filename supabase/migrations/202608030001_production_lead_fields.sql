alter table public.leads
  add column if not exists company_website text,
  add column if not exists preferred_language text,
  add column if not exists workflow text,
  add column if not exists systems text,
  add column if not exists desired_outcome text,
  add column if not exists utm_term text,
  add column if not exists utm_content text,
  add column if not exists qualified_for_booking boolean not null default false,
  add column if not exists notification_delivered boolean not null default false;

alter table public.leads drop constraint if exists leads_preferred_language_check;
alter table public.leads add constraint leads_preferred_language_check
  check (preferred_language is null or preferred_language in ('en', 'es', 'other'));

create table if not exists public.contact_rate_limits (
  key_hash text not null,
  window_started_at timestamptz not null,
  attempt_count integer not null default 1,
  primary key (key_hash, window_started_at)
);

alter table public.contact_rate_limits enable row level security;
revoke all on public.contact_rate_limits from anon, authenticated;

create or replace function public.check_contact_rate_limit(
  p_key_hash text,
  p_window_seconds integer default 900,
  p_max_attempts integer default 5
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window timestamptz;
  v_count integer;
begin
  v_window := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  insert into public.contact_rate_limits (key_hash, window_started_at, attempt_count)
  values (p_key_hash, v_window, 1)
  on conflict (key_hash, window_started_at)
  do update set attempt_count = public.contact_rate_limits.attempt_count + 1
  returning attempt_count into v_count;

  delete from public.contact_rate_limits
    where window_started_at < now() - interval '24 hours';
  return v_count <= p_max_attempts;
end;
$$;

revoke all on function public.check_contact_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_contact_rate_limit(text, integer, integer) to service_role;

create index if not exists contact_rate_limits_window_idx
  on public.contact_rate_limits(window_started_at);

create or replace function public.hook_restrict_studio_owner(event jsonb)
returns jsonb
language plpgsql
stable
set search_path = ''
as $$
declare
  candidate_email text := lower(coalesce(event->'user'->>'email', ''));
  candidate_provider text := coalesce(event->'user'->'app_metadata'->>'provider', '');
begin
  if candidate_email = 'yon.wallace@viste.ai' and candidate_provider = 'google' then
    return '{}'::jsonb;
  end if;

  return jsonb_build_object(
    'error', jsonb_build_object(
      'message', 'This private Studio is not available to this Google account.',
      'http_code', 403
    )
  );
end;
$$;

grant execute on function public.hook_restrict_studio_owner(jsonb) to supabase_auth_admin;
revoke execute on function public.hook_restrict_studio_owner(jsonb) from public, anon, authenticated;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.provision_studio_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  viste_tenant_id uuid;
begin
  if lower(coalesce(new.email, '')) <> 'yon.wallace@viste.ai' then
    return new;
  end if;

  select id into viste_tenant_id
  from public.tenants
  where slug = 'viste'
  limit 1;

  if viste_tenant_id is null then
    raise exception 'Viste tenant is not configured';
  end if;

  insert into public.memberships (tenant_id, user_id, role)
  values (viste_tenant_id, new.id, 'owner')
  on conflict (tenant_id, user_id) do update set role = excluded.role;

  insert into public.brands (tenant_id, name, website, default_language, supported_languages, created_by)
  select viste_tenant_id, 'Viste.ai', 'https://viste.ai', 'en', array['en', 'es'], new.id
  where not exists (select 1 from public.brands where tenant_id = viste_tenant_id and lower(name) = 'viste.ai');

  return new;
end;
$$;

revoke all on function private.provision_studio_owner() from public, anon, authenticated;

drop trigger if exists provision_studio_owner_after_signup on auth.users;
create trigger provision_studio_owner_after_signup
after insert on auth.users
for each row execute function private.provision_studio_owner();

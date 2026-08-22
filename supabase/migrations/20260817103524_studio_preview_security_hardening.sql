-- Restrict privileged helpers inherited from the public-site schema.
-- Server routes call the rate limiter with the server-only Supabase secret.
revoke all on function public.check_contact_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_contact_rate_limit(text, integer, integer) to service_role;

-- This legacy schema helper is not an application RPC. Keep the migration safe
-- in environments where the helper has already been removed.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke all on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end
$$;

-- Cover the campaign/publication relationships used by approval review and
-- tenant-scoped calendar queries.
create index if not exists approvals_campaign_idx on public.approvals (campaign_id) where campaign_id is not null;
create index if not exists approvals_publication_idx on public.approvals (publication_id) where publication_id is not null;
create index if not exists campaigns_brand_idx on public.campaigns (brand_id, updated_at desc);
create index if not exists publications_account_idx on public.publications (platform_account_id, scheduled_for);

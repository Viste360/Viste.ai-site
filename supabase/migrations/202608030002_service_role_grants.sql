-- Server routes authenticate with Supabase's service role. RLS bypass does not
-- replace the underlying table privileges required by PostgREST.
grant select, insert, update, delete on table public.leads to service_role;
grant select on table public.admin_users to service_role;
grant select, insert, update, delete on table public.lead_notes to service_role;
grant select, insert, update, delete on table public.lead_events to service_role;

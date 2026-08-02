# Supabase setup

1. Create a business-owned project in the approved region and record its owner, retention and backup level.
2. Run `supabase/migrations/202608020001_leads.sql` in a reviewed environment first.
3. Set Vercel variables `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and server-only `SUPABASE_SECRET_KEY` with separate Preview/Production values.
4. Disable public registration. Invite an admin through Supabase Auth, then insert that user UUID into `admin_users` using the dashboard SQL editor.
5. Confirm RLS is enabled and anon/authenticated have no table grants. Test that `/api/admin/leads` rejects missing, non-admin and expired tokens.
6. Configure backups/exports and schedule review of unqualified enquiries after 24 months.

Never expose or print the secret key. Lead inserts occur only in the server route.

# Supabase setup

1. Create a business-owned project in the approved region and record its owner, retention and backup level.
2. Run every migration in filename order in a reviewed environment. VIS_010 requires `202608110001_vis_010_opportunity_engine.sql` followed by `202608110002_vis_010_analytics_and_abuse.sql`.
3. Set Vercel variables `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and server-only `SUPABASE_SECRET_KEY` with separate Preview/Production values.
4. Disable public registration. Invite an admin through Supabase Auth, then insert that user UUID into `admin_users` and the Viste tenant `memberships` table using the dashboard SQL editor.
5. Confirm RLS is enabled and unauthorised users cannot read either legacy or VIS_010 tables. Test that `/api/admin/leads` and `/api/admin/opportunities` reject missing, non-admin and expired tokens.
6. Configure backups/exports and schedule review of unqualified enquiries after 24 months.

Never expose or print the secret key. Lead, opportunity, funnel and aggregate security inserts occur only in server routes. Funnel rows contain no free-text diagnostic answers or contact data.

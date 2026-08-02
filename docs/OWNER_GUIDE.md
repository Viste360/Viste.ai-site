# Owner guide

## Routine changes

- Services, solutions and industries: `src/content/catalog.ts`.
- Company/process/security pages: `src/content/pages.ts`.
- Insights: `src/content/insights.ts`.
- Privacy, terms and cookies: `src/content/legal.ts`; obtain legal review before changing meaning.
- Navigation/contact paths: `src/content/site.ts`.

Ask Codex to make the change in a branch, run the full checks and provide a Vercel Preview. Review desktop, mobile and both languages. Merge only the exact reviewed commit.

## Leads

If Supabase is configured, authorised users can request a magic-link login at `/admin`. Direct access is additionally checked against `admin_users`. For routine follow-up, use the protected inbox and the notification email; never make the lead tables publicly readable.

## Emergency

If a release breaks navigation, forms, legal pages or redirects, promote the prior Vercel production deployment. The old site remains recoverable from the safety tag and archive branch. See `ROLLBACK.md`.

# Production readiness audit

Audit date: 3 August 2026

Production baseline: `b72609e`

Review branch: `codex/production-readiness`

Preview: `https://viste-ai-site-git-codex-product-34f1e5-vistes-projects-c629d2e5.vercel.app`

## Release decision

**Not approved for production.** The application work and review preview are complete, but the preview health endpoint correctly reports `configuration-required` for Supabase lead storage, transactional notification and booking. Production must remain at `b72609e` until business-owned Preview and Production values are supplied, the Supabase migration is applied, a real end-to-end lead is reconciled, legal operator data is approved, and the owner approves the migration report.

## What changed

- Replaced the placeholder contact state with a bilingual qualification form collecting name, work email, company, role, website, country, language, workflow, systems, outcome, budget, timeline and consent.
- Added server validation, same-origin enforcement, payload limits, elapsed-time and honeypot checks, in-memory and atomic Supabase rate limits, durable Supabase lead storage, Resend notification, UTM/referrer capture, request IDs, a qualified booking handoff and PII-free delivery logs.
- Added guarded legal-operator and founder configuration. Unverified placeholders cannot render; `Person` schema is also withheld.
- Rewrote About copy as a senior-led operating implementation company, without launch or repositioning language.
- Split English and Spanish into independent server-rendered root layouts. Each route now emits one locale shell, correct `html lang`, self-canonical, reciprocal `hreflang` and equivalent-page switching.
- Added direct 301 redirects for the known hospitality URLs and preserved former homepage fragment targets as meaningful section IDs.
- Generated production sitemap and robots routes; every preview response is `noindex, nofollow` by header and preview robots disallows all crawling.
- Added per-page metadata, Open Graph data, social image references, breadcrumbs and supported structured data.
- Expanded the AI Opportunity Sprint with configurable commercial scope, added five industry landing pages, a fully interactive illustrative WhatsApp control demo, and stronger insight authorship/read-time/source/CTA treatment.
- Added security headers, client-render error reporting, production uptime checks, lead-delivery readiness checks, automated quality checks and desktop/mobile browser coverage.

## Architecture decision

Keep the current Next.js application in GitHub and deploy with Vercel. Store leads in a business-owned Supabase project using a server-only secret and Row Level Security. Use Resend for transactional notifications and a verified booking URL for qualified handoff. Vercel Analytics/Speed Insights remain consent-gated. Google Analytics is optional; OpenAI is not used in the conversion path and should only be introduced for a separately approved, measurable feature.

This is the smallest stable operating model for a non-developer owner: one repository, one deployment platform, one durable lead database, one notification provider and environment-scoped configuration.

## Evidence

- `npm run check`: passed (lint, typecheck, 15 unit/API tests, internal-link check, 89-route production build).
- `npm run test:e2e`: 66/66 desktop and mobile tests passed.
- GitHub `Quality` workflow: passed on commit `3059970`.
- Preview: 200 on English and Spanish routes; one Spanish header and footer; preview noindex verified.
- Preview contact endpoint: safe 503 with email fallback while providers are unconfigured; no false success and no lead accepted without durable Supabase storage.
- Lighthouse, security, structured data, form, locale and redirect evidence are recorded in the companion reports.

## External configuration still required

No secret values are stored in Git. Configure these directly in Vercel, scoped first to Preview:

- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SECRET_KEY`
- `RESEND_API_KEY`, `CONTACT_NOTIFICATION_EMAIL`, `CONTACT_FROM_EMAIL`
- `CONTACT_IP_SALT`
- `NEXT_PUBLIC_BOOKING_URL`
- verified legal-operator and contact fields from `.env.example`
- approved founder fields only if the visible profile is authorized
- optional `ERROR_MONITORING_WEBHOOK_URL`

Apply `supabase/migrations/202608030001_production_lead_fields.sql` to the intended Supabase project before the first real form test.

## Production approval gate

Production remains untouched until all of the following are true:

1. Preview health reports `status: ok` and every contact check reports `ready`.
2. One consented test lead is stored, notified and reconciled by reference ID; the record is then deleted under the agreed test-data procedure.
3. Booking opens only for a qualified test scenario and points to the approved calendar.
4. Legal operator details and founder data are approved by the owner/counsel.
5. Redirect and Search Console checklists are signed off.
6. The reviewed preview and this migration pack receive explicit owner approval.

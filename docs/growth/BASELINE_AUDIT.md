# Search-to-decision baseline audit

Date: 2026-08-09
Branch at audit: `codex/production-readiness`

## What was already strong

- One bilingual Next.js application with reciprocal English and Spanish routes.
- Typed repository-owned commercial, editorial and legal content.
- Canonical, hreflang, Open Graph, sitemap and robots implementations.
- Premium responsive design with semantic server-rendered page content.
- Consent-gated Vercel Analytics, Speed Insights and optional GA4.
- Server-validated contact qualification with anti-spam controls, Supabase storage, Resend notification and a configurable booking URL.
- Existing service and Solution Blueprint coverage for opportunity discovery, WhatsApp operations, knowledge, workflow/document automation, sales/CRM and data intelligence.

## Demand-layer gaps found

- The main journey moved from general positioning directly to services or a long qualification form.
- There was no pre-contact tool to help a visitor turn “we need AI” into a bounded workflow hypothesis.
- The calendar URL was available only after a qualified form submission and was not visible as an earlier appointment path.
- There was no transparent ROI planning model using visitor-provided assumptions.
- Practical questions existed across pages and insights but not as a curated decision hub.
- Analytics used ad-hoc event labels rather than one privacy-safe demand-funnel contract.

## Indexing and content control

- Existing Vercel Preview deployments are globally `noindex` through metadata and robots behavior.
- New growth assets are additionally marked `publishApproved: false`; they remain `noindex` and outside the sitemap even in a production build until a human approves publication.
- The existing WhatsApp demo contains explicit illustrative-data language and substantive explanatory content. Its current indexability was preserved; this should remain a deliberate owner decision.

## Baseline validation

Before implementation, lint, type checking, 16 unit/API tests and the internal-link check passed. The production build reached the font-fetch stage and failed because the restricted execution environment could not reach Google Fonts; this was an environment/network failure, not a TypeScript or application failure.

## Commercial conclusion

The site did not need a redesign. It needed an earlier decision layer: useful orientation, transparent assumptions, a contextual service path and an easy route to a real appointment. This release adds that layer without changing verified company claims, legal details or production infrastructure.

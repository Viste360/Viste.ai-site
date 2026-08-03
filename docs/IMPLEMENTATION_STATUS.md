# Implementation status — 3 August 2026

The global Viste.ai replacement is live on Vercel from `main`, with the rollback tag and archive branch preserved. DNS and the production domain remain unchanged. Development continues on `rebuild/viste-ai-global`, is validated in a Vercel Preview, and reaches production only after the release gates pass.

Implemented: bilingual typed content and natural slugs; premium responsive design and full-screen mobile navigation; service, solution and industry detail pages; partners, process and about; eight bilingual insights; updated website privacy, terms and cookies drafts without invented entity facts; security page and headers; canonical, hreflang, Open Graph, JSON-LD, sitemap and robots; legacy permanent redirects; consent-gated Vercel Web Analytics, Speed Insights and optional GA4; spam-resistant contact API; independent Supabase and Resend delivery with timeouts and PII-free request tracing; non-secret health endpoint; RLS migration; allowlisted admin inbox; CI, unit, link, redirect, accessibility, desktop and mobile tests; owner, setup, security and rollback documentation.

Current operating mode: `hello@viste.ai` and WhatsApp remain the live contact paths. The secure website form activates automatically after either Supabase lead storage or Resend notification credentials are configured in Vercel. `/api/health` reports `contact: "direct"` until then and `contact: "ready"` afterward.

Owner actions still recommended: enable Web Analytics and Speed Insights in the Vercel project dashboard; configure and test Supabase and/or Resend production variables; verify the `hello@`, `privacy@` and `security@` mailboxes; have counsel approve the legal drafts or supply replacements. No secret values belong in Git.

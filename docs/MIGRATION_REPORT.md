# Production migration report and approval gate

Prepared: 3 August 2026

Source: `codex/production-readiness`

Baseline production: `b72609e`

Preview: `https://viste-ai-site-git-codex-product-34f1e5-vistes-projects-c629d2e5.vercel.app`

## Migration state

Code, content, redirects, security controls and automated tests are ready for review. Production, DNS and the `main` branch were not changed. The preview is deliberately noindex.

## Blocking configuration

- Supabase Preview project/credentials and migration
- Resend verified sender and notification destination
- approved booking URL
- verified legal operator details
- approved founder profile data, or continued omission
- final lead/error monitoring destinations

These values belong to the owner’s accounts and must not be invented or committed.

## Proposed implementation sequence

1. Owner approves business/legal copy, redirect map and external provider choices.
2. Configure Preview-only values; apply the Supabase migration.
3. Run and sign the end-to-end form acceptance test.
4. Review final Vercel preview on mobile and desktop.
5. Open/approve the pull request and promote the reviewed commit during a monitored window.
6. Execute Search Console and production smoke checks.
7. Roll back immediately if conversion, indexing or core routes fail.

## Approval

No merge or production promotion is authorized by this document. Explicit owner approval of the final preview and this report is required.

# Spanish locale test report

Test date: 3 August 2026

The previous shared root layout could expose both English and Spanish navigation/footer shells in crawler-visible output. English and Spanish now use separate root layouts.

Verified results:

- `/es` and every Spanish detail route emit `<html lang="es">` server-side.
- Raw HTML contains exactly one header and one footer, with only the Spanish shell.
- English routes emit `<html lang="en">`.
- Every public page has a self-canonical, reciprocal English/Spanish alternate and `x-default`.
- The language switch resolves the equivalent page, not the language homepage; for example the Spanish Sprint links back to `/services/ai-opportunity-sprint`.
- Sitemap entries carry reciprocal language alternates.
- Spanish demo, contact, legal, industry, service and insight templates pass desktop/mobile rendering and accessibility tests.

Evidence: 66/66 Playwright tests passed locally and in GitHub Actions. The deployed Spanish Sprint preview was also checked directly: one header, one footer, `lang=es`, Spanish title and the exact English-equivalent switch URL.

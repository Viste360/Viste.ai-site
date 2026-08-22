# Search Console deployment checklist

Do not execute production steps until the migration report is approved.

## Before approval

- [ ] Export 16 months of Search Console pages, queries, links, indexing and sitemap history.
- [ ] Export historical analytics landing pages and reconcile any URL not in the redirect map.
- [ ] Review the preview with `noindex` confirmed and no preview URL submitted to search engines.
- [ ] Approve legal redirects and the preserved archive/tag strategy.
- [ ] Confirm every public EN/ES page is substantive and has unique metadata.
- [ ] Confirm final social images and legal-operator data.

## Promotion window

- [ ] Record current production deployment ID and commit `b72609e`.
- [ ] Promote the approved immutable preview; do not rebuild from an unreviewed commit.
- [ ] Verify `/`, `/es`, `/contact`, one service, one insight, all three named legacy legal URLs, sitemap, robots and security headers.
- [ ] Confirm production robots allows public crawling and preview noindex headers are absent only on production.
- [ ] Confirm contact health is `ok`, then reconcile one test lead end-to-end.
- [x] Verify the `sc-domain:viste.ai` property by DNS (completed 2026-08-13).
- [x] Submit `https://viste.ai/sitemap.xml` in the domain property (submitted and read successfully 2026-08-13; 86 pages discovered).
- [ ] Request indexing for the two homepages and highest-value service/industry pages.

## Monitoring

- [ ] At 1 hour and 24 hours, crawl every redirect and canonical route.
- [ ] At 7 and 30 days, review Pages, sitemaps, crawl statistics, 404s, soft 404s, duplicate canonicals and hreflang issues.
- [ ] Compare impressions/clicks for hospitality URLs and new destination pages.
- [ ] Add any newly discovered legacy URL to the typed registry and tests; avoid homepage catch-all redirects.

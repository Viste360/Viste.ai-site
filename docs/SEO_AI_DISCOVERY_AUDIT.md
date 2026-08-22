# SEO and AI-discovery technical audit

Last audited: 2026-08-13

## Current release

- The canonical production domain is `https://viste.ai` and is publicly accessible without Vercel authentication. Vercel Preview deployments remain `noindex` and are not submitted to search engines.
- Public English and Spanish pages are server-rendered and expose unique titles, descriptions, canonicals, reciprocal language alternates, social metadata and one visible `h1`.
- The production sitemap contains only approved indexable routes and their English/Spanish alternates. Draft, thin and rights-pending content stays out of the sitemap or carries `noindex` where applicable.
- Production `robots.txt` allows public crawling while blocking administration and API paths. Preview builds block all crawling.
- Homepage structured data contains `Organization`, crawlable `ImageObject`, `WebSite` and locale-specific `WebPage` entities. Standard commercial pages contain `WebPage` and `BreadcrumbList`; service detail pages also contain `Service`.
- `LocalBusiness` is intentionally withheld until an owner-approved public service area, business phone and consultation hours are documented. No public office or customer-visit location is implied.
- `sameAs` is intentionally withheld until official profiles are owner-approved. The application never converts third-party mentions into claimed official profiles.
- Visible commercial questions remain written for people. `FAQPage` and `QAPage` are intentionally withheld because Google no longer shows FAQ rich results and the markup would not create additional eligibility.
- `/llms.txt` provides a concise bilingual entity and source summary. `/llms-full.txt` exposes the approved public English/Spanish source map. These optional files do not override canonical HTML, the sitemap, robots rules or indexing directives.

## Google Search Console evidence

- The `sc-domain:viste.ai` Domain property was created and ownership was verified on 2026-08-13 using the exact Google TXT proof in Cloudflare DNS.
- `https://viste.ai/sitemap.xml` was submitted to the verified property on 2026-08-13.
- The live sitemap independently returns HTTP `200` with `Content-Type: application/xml` from Vercel. Search Console completed its first read on 2026-08-13 with status `Success` and 86 discovered pages.
- Search Console performance, indexing and Core Web Vitals reports currently state that data is processing and should be checked again after at least one day.
- The verification TXT record must remain in DNS. A second verification method can be added later from Search Console settings for resilience.

## AI/GEO position

Google's current guidance is explicit: foundational SEO, useful original content, crawlability and Search Console monitoring are the relevant controls for AI Overviews and AI Mode. Google does not use `llms.txt` for ranking or AI-search eligibility. The file is maintained only for other systems that voluntarily read it.

This release therefore treats “GEO” as factual clarity and retrieval readiness, not as a separate ranking trick:

- clear entity and service relationships;
- bilingual canonical source pages;
- visible, answer-led decision content;
- approved primary citations on reviewed insights;
- no invented authority, clients, results, registrations or partnerships;
- crawlable logo and social images;
- explicit human-review and implementation boundaries;
- stable sitemap, redirects and internal links.

## Verified Preview evidence

- Deployment: `dpl_DpX2Fz45hm9TMrF6HSBLcCHABY1f`
- Protected Preview: `https://viste-ai-site-z9jc58ef7-vistes-projects-c629d2e5.vercel.app`
- Preview protection remains enabled and every Preview response carries `X-Robots-Tag: noindex, nofollow`.
- `npm run check`: passed, including lint, TypeScript, 97 unit tests, internal-link audit and the production-compatible Next.js build.
- `npm run test:e2e`: 106 tests passed across desktop and mobile.
- Authenticated Preview verification confirmed English and Spanish document languages, canonical URLs, Preview `noindex`, the homepage `Organization`/`ImageObject`/`WebSite`/`WebPage` graph, service `BreadcrumbList`/`WebPage`/`Service` data, and both text discovery endpoints.
- No production deployment, canonical-domain reassignment or website-routing DNS change was made for this audit. The only DNS change was the exact Google ownership-verification TXT record.

## Remaining launch and growth work

- Verify Bing Webmaster Tools and publish its supplied token through `NEXT_PUBLIC_BING_SITE_VERIFICATION` only if Bing requests a meta-tag verification method.
- Request indexing for the two homepages and the highest-value approved service pages after the updated release is public.
- Monitor Pages, sitemaps, crawl statistics, canonical selection and Core Web Vitals at 1 day, 7 days and 30 days.
- Publish additional Michael-led or practitioner-led insight only when the original observation, primary sources, review date and editorial approval are recorded.
- Add `LocalBusiness` and official `sameAs` only after owner approval of the exact facts.

No implementation can guarantee ranking, recommendation or citation. This work improves technical eligibility, factual clarity and retrieval readiness without manufacturing authority.

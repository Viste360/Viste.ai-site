# Viste.ai SEO and Redirect Map

Status: Phase 0 draft; implementation and production activation are not authorized.

Baseline: `bdfb68b`

Canonical production origin: `https://viste.ai`

## Migration principles

1. Inventory and preserve every known legacy URL before replacement.
2. Use a one-to-one permanent redirect only where user intent and topic match.
3. Do not redirect every old page to the homepage.
4. Preserve hospitality relevance through a substantive new hospitality page.
5. Preserve historical legal records when they may govern prior users; do not silently rewrite old terms in place.
6. Keep preview deployments `noindex` and canonicalize only to approved production URLs.
7. Preserve query strings, including UTMs, unless a security review identifies a reason not to.
8. Avoid redirect chains: every legacy URL must resolve directly to its final destination.

## Evidence limits

The repository and live-site crawl provide the known URL set below. Public search spot checks returned the homepage but are not an exhaustive index inventory. Before final approval, export from Google Search Console:

- indexed/not-indexed pages;
- pages receiving impressions or clicks;
- top linked pages;
- crawl errors and soft 404s;
- sitemap history;
- at least the last 16 months of query/page data where available.

Also review GA4 landing pages if a historical property exists, Cloudflare analytics, Vercel traffic, and externally linked URLs. Add any discovered URL to this map before launch.

## Proposed redirect map

| Legacy URL | Current state | Proposed final URL | Status | Rationale/condition |
|---|---:|---|---:|---|
| `/` | 200 | `/` | 200 replacement | Same canonical homepage URL; no redirect |
| `/index.html` | 200 duplicate | `/` | 301 | Consolidate duplicate home URL |
| `/index-es.html` | 200 | `/es` | 301 | Move Spanish to stable language prefix |
| `/privacy-policy.html` | 200 | `/privacy` | 301 | New English website/lead privacy policy |
| `/privacy-policy-es.html` | 200 | `/es/privacidad` | 301 | New reviewed Spanish privacy policy |
| `/privacy-policy/` | 404 but internally linked | `/privacy` | 301 | Repair legacy internal/backlink target |
| `/term-and-condition.html` | 200 | `/terms` | 301 | Website-use terms; only after historical service terms are preserved if required |
| `/term-and-condition-es.html` | 200 | `/es/terminos` | 301 | Spanish website-use terms; same condition |
| `/cookie-policy/en/` | 200 | `/cookies` | 301 | Match new cookie and consent implementation |
| `/cookie-policy/es/` | 200 | `/es/cookies` | 301 | Match Spanish cookie implementation |
| `/guestterms/en/` | 200 | `/legal/archive/guest-terms-2025/en` | 301 or retained 200 | **Blocking legal decision:** preserve historical Freshlanding guest terms and effective dates |
| `/guestterms/es/` | 200 | `/legal/archive/guest-terms-2025/es` | 301 or retained 200 | Same decision; keep language pair |
| `/sitemap.xml` | 200 malformed | `/sitemap.xml` | 200 replacement | Generate valid sitemap from approved route registry |
| `/robots.txt` | 404 | `/robots.txt` | 200 new | Explicit production crawl rules and sitemap reference |

### Hash navigation

Fragments are not sent to the server, so server redirects cannot individually map `/#features`, `/#pricing`, or `/#cta`. Update all owned links. Optional client-side compatibility may map:

- `#features` to the new homepage capabilities section;
- `#pricing` to the engagement section or `/services/ai-opportunity-sprint`;
- `#cta` to the homepage final CTA or `/contact`.

Do not add fragment-handling JavaScript unless Search Console/backlink evidence shows meaningful demand.

### Domain typo

The legacy sitemap and cookie Open Graph metadata use `https://vist.ai` for some URLs. Ownership and control of `vist.ai` are unknown. A redirect cannot be planned from that domain unless ownership, DNS, and legal authority are confirmed. Correct all new references to `https://viste.ai`; do not change `vist.ai` DNS as part of this project.

## New canonical and hreflang matrix

Every indexable page must output:

- a self-referencing canonical URL;
- English and Spanish alternates;
- `x-default` pointing to the English/root equivalent;
- consistent Open Graph URL;
- inclusion in the correct sitemap only when approved and indexable.

The route pairs are defined in `CONTENT_INVENTORY.md`. Article pairs must be linked by a stable translation key, not by guessing equivalent slugs.

## New route indexation policy

| Surface | Production | Vercel preview | Notes |
|---|---|---|---|
| Marketing pages | `index,follow` | `noindex,nofollow` | Preview should also receive `X-Robots-Tag: noindex` |
| Reviewed insights | `index,follow` | `noindex,nofollow` | Drafts excluded from sitemap |
| Legal pages | `index,follow` unless counsel says otherwise | `noindex,nofollow` | Version/date visible |
| Historical legal archive | Usually `noindex,follow` | `noindex,nofollow` | Must remain directly accessible if required |
| `/admin/**` | `noindex,nofollow` plus authentication | Same | Never rely on robots for access control |
| API routes | No HTML indexation | Same | Return appropriate content types/statuses |
| Opportunity Mapper | Decide at implementation | `noindex` preview | Feature disabled at launch by default |

Vercel-generated preview URLs currently receive a `noindex` header by default. The application will also implement environment-aware robots metadata as defense in depth. If a custom preview domain is later attached, verify the header explicitly because custom non-production domains may behave differently.

## Metadata requirements

- Unique title and description for every page.
- One descriptive `h1` per page.
- `Organization` and `WebSite` JSON-LD on appropriate root pages.
- `Service` on substantive service pages.
- `BreadcrumbList` on deep pages.
- `Article` only for published insights.
- `FAQPage` only when matching visible FAQ content exists.
- No review, rating, award, office/location, or partnership schema without verified evidence.
- Page-specific Open Graph assets generated from approved content; never use fictional clients or results.

## Redirect implementation design

Maintain redirects as typed data in `src/lib/seo/redirects.ts` and expose them through `next.config.ts`. Keep tests adjacent to the map.

Illustrative shape only:

```ts
export const permanentRedirects = [
  { source: "/index.html", destination: "/", permanent: true },
  { source: "/index-es.html", destination: "/es", permanent: true },
] as const;
```

Do not encode the unresolved guest-terms redirect until the legal-history decision is approved.

## Redirect acceptance tests

For every row marked 301:

- response is exactly 301/308 as chosen and consistent;
- `Location` is the intended absolute or root-relative final URL;
- query string is preserved;
- destination returns 200;
- destination canonical equals itself;
- no redirect chain or loop exists;
- language intent is preserved;
- content is topically relevant;
- mobile and desktop behavior match.

Add automated tests for all known legacy paths plus a generated link crawl. Before launch, crawl both the legacy URL list and the preview. After launch, repeat at 1 hour, 24 hours, 7 days, and 30 days and review Search Console/404 data.

## Sitemap design

- Generate `sitemap.xml` from the same typed route/content registry used to render pages.
- Include only canonical, approved, indexable production URLs.
- Keep English and Spanish parity and alternates.
- Use reliable `lastModified` values from content metadata; do not set every page to “today” on every build.
- Exclude preview, admin, APIs, drafts, feature-flagged pages, and historical pages marked `noindex`.
- Add an insights RSS feed after the first reviewed articles exist; it is not a launch blocker.

## Pre-launch SEO gate

- [ ] Search Console and any historical analytics exports reviewed.
- [ ] Final URL inventory reconciled against repository, sitemap, crawl, and external links.
- [ ] Guest-terms archive decision approved in writing.
- [ ] Redirect map implemented and test suite passing.
- [ ] Every EN/ES pair has canonical/hreflang/`x-default` tests.
- [ ] Preview headers verified `noindex`.
- [ ] Production robots and sitemap reviewed without deploying them.
- [ ] Hospitality page has substantive, non-duplicated content.
- [ ] No thin placeholder page is indexable.
- [ ] Rollback retains the redirect map and legacy ref.

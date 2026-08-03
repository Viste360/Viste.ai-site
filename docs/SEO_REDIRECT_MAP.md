# SEO redirect map

Canonical origin: `https://viste.ai`

Implementation: `src/config/redirects.ts` through `next.config.ts`
Contract: every listed legacy request returns one direct HTTP 301 to the final route; query strings are preserved by Next.js.

| Legacy URL | Final canonical URL | Result |
|---|---|---:|
| `/index.html` | `/` | 301 |
| `/index-es.html` | `/es` | 301 |
| `/privacy-policy.html` | `/privacy` | 301 |
| `/privacy-policy-es.html` | `/es/privacidad` | 301 |
| `/privacy-policy` | `/privacy` | 301 |
| `/privacy-policy/` | `/privacy` | 301 |
| `/privacy-policy-es` | `/es/privacidad` | 301 |
| `/privacy-policy-es/` | `/es/privacidad` | 301 |
| `/term-and-condition.html` | `/terms` | 301 |
| `/term-and-condition-es.html` | `/es/terminos` | 301 |
| `/term-and-condition` | `/terms` | 301 |
| `/term-and-condition/` | `/terms` | 301 |
| `/term-and-condition-es` | `/es/terminos` | 301 |
| `/term-and-condition-es/` | `/es/terminos` | 301 |
| `/cookie-policy/en` and `/cookie-policy/en/` | `/cookies` | 301 |
| `/cookie-policy/es` and `/cookie-policy/es/` | `/es/cookies` | 301 |
| `/guestterms/en` and `/guestterms/en/` | `/terms` | 301 |
| `/guestterms/es` and `/guestterms/es/` | `/es/terminos` | 301 |
| `/guestterms/terms-en.html` | `/terms` | 301 |
| `/guestterms/terms-es.html` | `/es/terminos` | 301 |
| `/guestterms/privacy-en.html` | `/privacy` | 301 |
| `/guestterms/privacy-es.html` | `/es/privacidad` | 301 |
| `/guestterms/cookie-en.html` | `/cookies` | 301 |
| `/guestterms/cookie-es.html` | `/es/cookies` | 301 |
| `/industries/retail-multi-location` | `/industries/multi-location-businesses` | 301 |
| `/es/sectores/retail-multilocal` | `/es/sectores/empresas-multilocal` | 301 |

The exact historical hospitality source is preserved by tag `pre-viste-global-rebuild-2026-08-02` and branch `archive/legacy-hospitality-site`. The current legal pages do not claim to replace signed historical client agreements.

Fragments never reach the server. The replacement homepage therefore preserves meaningful targets for `#body`, `#features`, `#pricing`, `#cta`, `#how-it-works`, `#key-benefits`, `#demo-video`, `#faq` and `#testimonials`. Owned links should still be updated to clean canonical routes.

Acceptance evidence: the generated registry is exercised in both desktop and mobile Playwright projects; every entry returned a direct 301 and all destination pages returned their expected canonical metadata.

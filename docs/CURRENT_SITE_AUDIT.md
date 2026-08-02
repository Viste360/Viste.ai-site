# Viste.ai Current Site Audit

Audit date: 2026-08-02

Repository: `Viste360/Viste.ai-site`

Audited baseline: `bdfb68b445c30cdec151d6dbbdd98ea48292593a` (`origin/main`)

Scope: Phase 0 only; no production, DNS, or Vercel settings changed.

## Executive summary

The current site is a small, static bilingual hospitality marketing site. It is not a Next.js application and has no server-side lead capture, database, admin area, test suite, CI workflow, or repository-level Vercel configuration. The live site is served by Vercel behind Cloudflare, but the repository does not record the Vercel project ID, production-branch setting, environment variables, redirects, headers, or build settings.

The site renders locally, but the audit found a broken shared cookie script, missing legal-page assets and scripts, an invalid sitemap, inconsistent language handling, no working contact form, no analytics implementation despite legal copy claiming Google Analytics use, and conflicting hospitality-specific legal statements. The current content also contains quantitative claims and testimonial-style proof that must not be carried into the replacement without verification.

The safest migration is a separate, static-first Next.js rebuild on `rebuild/viste-ai-global`, with the legacy commit preserved independently and every old URL explicitly mapped before launch.

## Safety state

| Ref | Commit | Purpose | Phase 0 state |
|---|---|---|---|
| `main` / `origin/main` | `bdfb68b` | Current production source | Inspected only; unchanged |
| `pre-viste-global-rebuild-2026-08-02` | `bdfb68b` | Immutable pre-rebuild marker | Created locally and published to `origin` |
| `archive/legacy-hospitality-site` | `bdfb68b` | Browseable legacy branch | Created locally and published to `origin` |
| `rebuild/viste-ai-global` | `bdfb68b` + Phase 0 docs | Isolated working branch | Active |

The safety tag and archive branch are now durable on GitHub. GitHub deployment history shows Vercel labeled the latest `main` commit `bdfb68b` as Production, and GitHub's default branch is `main`. The Vercel dashboard setting should still be confirmed before any future merge or manual promotion. Publishing a non-production working branch may create a Preview, but it must not change the production domain.

## Repository profile

- 51 commits, from 2025-03-05 through 2025-05-05.
- Root-level static HTML, CSS, JavaScript, images, and XML.
- No `README.md`, `AGENTS.md`, `.gitignore`, `.env*`, `vercel.json`, `.vercelignore`, `.vercel/project.json`, `robots.txt`, GitHub Actions, or test configuration.
- `node_modules` is committed: 1,131 tracked files. This inflates the repository and makes dependency state harder to review.
- The checked-out working tree is approximately 15 MB; Git's packed history is approximately 4.6 MB.
- No environment-variable references were found in application source.

## Current technical architecture

```text
Browser
  -> Cloudflare DNS/proxy
  -> Vercel static deployment
  -> root HTML files
     -> Tailwind 2.2 CSS from jsDelivr/unpkg or Tailwind CDN runtime
     -> Font Awesome 5.15.4 from cdnjs
     -> local styles.css and three small scripts
     -> YouTube iframe, WhatsApp links, Google Calendar link
```

There is no backend. Calls to action leave the site for WhatsApp or a public Google Calendar URL, or open an email client.

Live response headers on 2026-08-02 showed Cloudflare as the edge server plus `x-vercel-cache` and `x-vercel-id`, confirming Vercel behind Cloudflare. Both apex and `www` resolved to Cloudflare IPs. No DNS values or settings were changed.

## Local run result

The existing site was served unchanged with:

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

All ten repository-backed HTML routes returned HTTP 200. `/robots.txt`, `/404`, and `/privacy-policy/` returned 404. The homepage rendered at 1280×720 and its referenced homepage images loaded.

Observed runtime issues:

- `scripts/cookie.js` begins with a shell command and contains literal `<script>` markup. Every page that loads it reports `SyntaxError: Unexpected token '<'`.
- The Spanish homepage redirected to English when an English language preference already existed in `localStorage`; the URL/content pair is therefore not deterministic.
- Legacy legal pages request a missing logo and a missing `scripts/language-detect.js` file.
- Tailwind's browser CDN warns that it is not intended for production.
- The privacy page rendered without an `h1`; its title is an `h2`.
- Several pages load the broken cookie script more than once.

## Public route inventory

| Current route | Source | Language/title | Local status | Main issue | Proposed disposition |
|---|---|---|---:|---|---|
| `/` | `index.html` | EN, “Viste AI – Automate Your Short-Term Rentals” | 200 | Narrow legacy positioning; two `h1`s; unsupported claims | Replace in place |
| `/index.html` | `index.html` | EN duplicate | 200 | Duplicate homepage URL | 301 to `/` |
| `/index-es.html` | `index-es.html` | ES | 200 | Legacy filename; preference redirect can show English | 301 to `/es` |
| `/privacy-policy.html` | `privacy-policy.html` | EN | 200 | Hospitality-only and internally inconsistent | 301 to `/privacy` |
| `/privacy-policy-es.html` | `privacy-policy-es.html` | `lang="en"`, English title | 200 | Incorrect language metadata and stale copy | 301 to `/es/privacidad` |
| `/term-and-condition.html` | `term-and-condition.html` | EN | 200 | Service terms presented as website terms | 301 to `/terms` after legal review |
| `/term-and-condition-es.html` | `term-and-condition-es.html` | `lang="en"`, English title | 200 | Incorrect metadata and stale copy | 301 to `/es/terminos` after legal review |
| `/cookie-policy/en/` | nested `index.html` | EN | 200 | Claims GA exists when code does not | 301 to `/cookies` |
| `/cookie-policy/es/` | nested `index.html` | ES | 200 | `og:url` uses `vist.ai` typo | 301 to `/es/cookies` |
| `/guestterms/en/` | nested `index.html` | EN | 200 | Freshlanding/Málaga/check-in contract content | Preserve as reviewed historical legal record or map to a dedicated legacy page |
| `/guestterms/es/` | nested `index.html` | ES | 200 | Same as above | Preserve as reviewed historical legal record or map to a dedicated legacy page |
| `/sitemap.xml` | `sitemap.xml` | XML | 200 | Malformed: guest URLs appear after `</urlset>` and use `vist.ai` | Replace |

The exact redirect proposal and unresolved legal-route decision are in `SEO_REDIRECT_MAP.md`.

Search-engine spot checks found the homepage in public search results. Other routes were not returned by the limited checks. This is not an index census; Google Search Console page-indexing and links exports are required before redirect approval.

## Navigation and content

The homepages are single long-form pages with anchors for home, features, pricing, contact, demo video, benefits, process, testimonials, FAQ, and team. English and Spanish markup are mostly duplicated manually. Content is hospitality-only and promotes free check-in automation, guest messaging, upsells, and WhatsApp.

The current site has no separate service, solution, industry, about, insight, contact, security, or partner routes.

## Forms and conversion paths

- HTML forms found: **0**.
- No API endpoints, form provider, CRM integration, webhook, or database calls were found.
- Primary CTAs link to a fixed WhatsApp `wa.me` destination.
- “Schedule a Demo” links to a Google Calendar account URL rather than a configured booking service URL.
- Footer social links point to generic service homepages (`linkedin.com`, `wa.me`) rather than verified profiles.
- Contact is also offered through `mailto:support@viste.ai`.
- No UTM capture, referrer capture, consent record, lead notification, confirmation email, or failure handling exists.

## Analytics and consent

- No GA4, Google Tag Manager, PostHog, Meta Pixel, Hotjar, Clarity, or other analytics implementation was found.
- Cookie-policy copy says Google Analytics and third-party scripts are used, which does not match the code audited.
- The banner provides only **Accept**; there is no Reject or Manage choice.
- Consent is a single `localStorage.cookiesAccepted=true` value with no version, timestamp, categories, withdrawal control, or analytics gating.
- Because the shared script is syntactically invalid, the banner behavior depends on duplicated inline page code and is inconsistent.
- Language choice is stored in `localStorage.preferredLanguage` and can unexpectedly redirect explicit URLs.

## Legal-page audit

The repository contains three distinct legal families:

1. Generic hospitality privacy pages dated January 2025/2024.
2. Host/service terms dated January 2025.
3. Freshlanding guest terms and cookie policies dated May 2025.

Material risks:

- Privacy copy says IDs/passports are not collected, while guest terms say ID/passport scans and e-signatures are collected.
- Retention claims conflict: six months, 90 days, and 24 hours appear in different documents.
- Company addresses differ between terms sets.
- Contact addresses alternate between `viste.ai` and `viste.is` domains and inconsistent casing.
- Data-controller roles, OpenAI model usage, processor list, encryption, international-transfer, and “no PII” statements are unverified technical/legal claims.
- Cookie copy claims GA is active when the repository has no GA code.
- Terms mix website use, SaaS service terms, guest check-in terms, privacy notices, and liability clauses.
- Spanish pages contain English metadata and untranslated fragments.
- Current public legal entity details must be treated as unverified historical content, not reused automatically.

Required action: draft new website privacy, cookie, website-use terms, security/responsible-AI, and form notices around configurable verified facts. Preserve historical guest terms separately if contracts or active stays require them. Owner and qualified legal review are mandatory before publication.

## Asset inventory

Current repository assets:

| Asset group | Files | Finding |
|---|---:|---|
| Favicons | 3 PNGs | 16/32/48 only; usable as legacy reference |
| Logos | `logo.png`, `viste-logo.png` | Large raster files; one unused; no SVG source |
| Homepage illustrations | `travel.png`, `traveler.png` | Both exceed 500 KB; hospitality-specific |
| Team portraits | 4 | Referenced; identities/roles/bios require verification before reuse |
| Other photography | 3 | Unused |
| Flag | 1 SVG | Unused |

Referenced legal logo `/images/messaging-business-ai-assistant-3-.png` does not exist.

The supplied external branding package contains 28 image assets plus a README, including full logo/icon/favicon/social sets and four brand boards. It is not yet copied into the repository. Strengths are the mark, restrained dark palette, aqua/blue accent, and typography direction. Risks are documented in `DESIGN_SYSTEM.md`: the boards disagree on exact color tokens, only raster logo files are supplied, and the hero mockup contains fictional client names and performance numbers that must never be published.

## Dependency and build audit

Declared packages:

| Package | Declared/installed | Purpose/status |
|---|---|---|
| `tailwindcss` | `^4.1.5` / 4.1.5 | Build script expects a CLI binary that this package does not provide |
| `postcss` | `^8.5.3` / 8.5.3 | Declared but no working build pipeline verified |
| `autoprefixer` | `^10.4.21` / 10.4.21 | Declared |
| `browserslist` | `^4.24.5` / 4.24.5 | Direct dependency though normally transitive/tooling |
| `caniuse-lite` | `^1.0.30001716` / matching | Direct dependency though normally transitive/tooling |
| `@tailwindcss/typography` | missing | Required by `tailwind.config.js`, so config resolution can fail |

`npm run build:css` invokes `npx tailwindcss`, writes to an untracked `public/` path, and does not match the deployed root-file layout. No start, lint, typecheck, test, or general build script exists. Runtime pages instead rely mainly on Tailwind 2.2 CDNs, creating version drift from the declared Tailwind 4 dependency.

## SEO audit

Positive baseline:

- Homepages have titles, descriptions, language attributes, and EN/ES alternate links.
- Guest terms include EN/ES alternate links.
- Most images have useful alt text.

Critical gaps:

- No canonical links anywhere.
- No `x-default` hreflang.
- No `robots.txt`, structured data, Open Graph on core pages, Twitter metadata, breadcrumbs, RSS, custom 404, or error page.
- Sitemap is invalid and contains a domain typo.
- Legal pages generally lack descriptions, canonical/hreflang, and valid heading hierarchy.
- Duplicate home URLs exist.
- The English homepage has two `h1` elements.
- Spanish legal pages declare English language/title metadata.
- Multiple internal links target non-existent `/privacy-policy/`.
- Existing hospitality authority must be retained through a substantive hospitality industry page, not erased or redirected wholesale to home.

## Accessibility, performance, and security observations

This was a Phase 0 inspection, not a formal WCAG, penetration, or Lighthouse audit.

- Large, unoptimized raster images and multiple CDN stylesheets increase transfer and render risk.
- No Content Security Policy, `X-Content-Type-Options`, explicit frame protection, referrer policy, or permissions policy is represented in the repository.
- HSTS is present on the live response.
- External links opened in new tabs need consistent `rel="noopener noreferrer"` review.
- Cookie and FAQ controls are not consistently modeled as accessible interactive controls.
- Missing `h1`s and duplicate `h1`s harm document structure.
- No automated accessibility, link, metadata, or security-header tests exist.
- The client has no secret-bearing code today; no secret values were found or printed.

## Highest migration risks

| Risk | Severity | Control |
|---|---|---|
| Loss of indexed URLs/authority | High | Search Console export, exact 301 map, hospitality destination, pre/post-launch crawl |
| Loss of historical legal record | High | Preserve Git tag/branch; decide legacy guest-term archive with legal counsel |
| Production branch accidentally deployed | High | Verify Vercel production branch is `main`; branch protection; preview-only PR workflow |
| Unverified claims copied into premium site | High | Claims register and owner evidence gate |
| Legal details copied as fact | High | Configurable drafts; no publication until owner/legal approval |
| Lead endpoint exposes data or keys | High | Server-only validation, Supabase RLS, secret key server-only, rate limiting, audit tests |
| Spanish pages become thin/mechanical translations | Medium | Native-quality editorial review and route parity tests |
| Brand mockup implies fake clients/results | High | Reuse only approved identity assets; create factual operational visual |
| Third-party scripts bypass consent | High | Consent mode and script gating before GA4 loads |
| Owner burden grows with tool count | Medium | Repository content; no CMS; optional services off by default |

## Unknowns requiring owner/account verification

- Vercel project owner/team, project name, production branch, Root Directory, build/output settings, preview protection, and environment scopes.
- GitHub branch protection and Vercel integration permissions.
- Cloudflare account ownership and whether proxying should remain unchanged at launch.
- Google Search Console ownership and exports of indexed pages, top queries, backlinks, and 404s.
- GA4 property/stream status and whether any analytics is injected outside this repository.
- Verified legal entity name, jurisdiction, registration/tax details, address, and privacy contact.
- Whether legacy guest/Freshlanding terms still govern active or historical users.
- Verified team members, biographies, testimonials, clients, results, certifications, partnerships, and logo permissions.
- Confirmed public inboxes and booking URL.
- Supabase region, data-retention policy, admin users, and data-processing requirements.

## Phase 0 conclusion

The legacy site is straightforward to replace technically but carries meaningful SEO, legal, content-integrity, and deployment risks. Phase 1 must not begin until the architecture, redirect decisions, legal-history treatment, and verified-fact gates are approved. Production remains untouched until a reviewed Vercel preview passes the launch checklist and receives explicit approval.

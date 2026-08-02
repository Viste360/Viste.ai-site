# Viste.ai Launch Checklist

Status: Phase 0 control document; production launch is not authorized.

Complete against a reviewed, commit-specific Vercel preview. Record evidence links, owners, dates, and approvals in the final launch PR.

## Stop conditions

Do not launch if any of the following is true:

- Vercel production branch or target deployment is uncertain.
- The reviewed preview commit differs from the proposed merge without re-running relevant checks.
- Legal drafts contain placeholders or lack owner/legal approval.
- Contact form writes to an unapproved database or sends real email unexpectedly.
- Required CI, build, redirect, bilingual, form, access-control, or security checks fail.
- Preview is indexable.
- Rollback source/deployment is unavailable.
- Explicit owner approval has not been recorded.

## Phase 0 safety and scope

- [x] Production source commit recorded as `bdfb68b`.
- [x] Safety tag created and published: `pre-viste-global-rebuild-2026-08-02`.
- [x] Archive branch created and published: `archive/legacy-hospitality-site`.
- [x] Working branch isolated: `rebuild/viste-ai-global`.
- [x] Existing site run locally and audited.
- [x] Known repository routes recorded.
- [x] No production files, deployment, domain, or DNS changed in Phase 0.
- [ ] Confirm Vercel production branch is `main` before remote branch publication.
- [x] Safety tag/archive branch published to GitHub under the user's Phase 0 instruction.
- [ ] Confirm GitHub branch protection and required reviews/checks for `main`.

## Accounts and ownership

- [ ] GitHub organization/repository administrators identified.
- [ ] Vercel team/project owner, project name, production branch, Root Directory, and build settings verified.
- [ ] Preview protection and environment-variable scopes verified.
- [ ] Cloudflare/DNS owner and emergency access identified; no change planned.
- [ ] Supabase project owner, region, billing/limits, and recovery options approved.
- [ ] Google Search Console owner verified.
- [ ] GA4 property/stream owner verified if analytics will launch.
- [ ] Transactional email provider and sending-domain owner verified.
- [ ] Public privacy/security/contact inbox owners and response process verified.

## Content and proof

- [ ] Positioning and tagline approved.
- [ ] Services, Solution Blueprints, industries, partners, process, and CTAs approved.
- [ ] English copy editorially reviewed.
- [ ] Spanish copy reviewed for natural language, terminology, and parity.
- [ ] Public pricing posture approved.
- [ ] Every client, testimonial, metric, biography, affiliation, certification, integration, partnership, and logo has evidence/permission or is removed.
- [ ] Solution examples are labeled Blueprints/Example Systems, not case studies.
- [ ] WhatsApp monitoring limitation is visible.
- [ ] No invented offices, locations, guarantees, ROI, security, or autonomy claims.
- [ ] Hospitality remains a substantive vertical page.
- [ ] Contact inboxes, booking URL, social profiles, and team details are verified.
- [ ] No draft, placeholder, lorem ipsum, fake logo, fake KPI, or mockup data is public.

## Legal and privacy

- [ ] Verified legal entity/controller details supplied by owner.
- [ ] Privacy policy reviewed and approved.
- [ ] Cookie policy matches actual cookies/scripts and is approved.
- [ ] Website-use terms reviewed and approved.
- [ ] Security/responsible-AI statement reviewed for factual accuracy.
- [ ] Contact-form privacy notice reviewed.
- [ ] Historical guest/Freshlanding terms preservation decision approved.
- [ ] Effective dates, versions, contacts, processors, regions/transfers, retention, rights, and lawful bases are accurate.
- [ ] Client-project data is clearly distinguished from website lead data.
- [ ] No legal placeholder can render in production.
- [ ] Cookie banner offers Accept, Reject, and Manage without dark patterns.
- [ ] Consent withdrawal/preferences are accessible.

## Repository and build

- [ ] Stable dependencies pinned with lockfile; no prereleases.
- [ ] `node_modules`, build output, `.env*`, and local tool state ignored/untracked.
- [ ] `README.md`, `AGENTS.md`, `.env.example`, owner/setup/security/rollback docs complete.
- [ ] `npm ci` succeeds in a clean environment.
- [ ] `lint` passes.
- [ ] `typecheck` passes.
- [ ] Unit tests pass.
- [ ] `test:e2e` passes.
- [ ] `build` passes.
- [ ] `check:links` passes.
- [ ] Required GitHub Actions checks protect `main`.
- [ ] Dependency/security review has no unresolved launch-blocking issue.
- [ ] License/asset-rights review complete.

## Preview deployment

- [ ] Deployment is explicitly labeled Preview and maps to the reviewed branch/commit.
- [ ] Production domain still serves the legacy approved version.
- [ ] Preview uses Preview-scoped variables only.
- [ ] Preview cannot write production lead data unless explicitly approved for final test.
- [ ] Preview email is non-delivering/sandboxed or restricted to approved recipients.
- [ ] Preview protection is enabled if required.
- [ ] `X-Robots-Tag: noindex` and robots metadata verified.
- [ ] Preview canonical/hreflang still reference intended production URLs without making preview indexable.
- [ ] No secret values appear in HTML, source maps, logs, screenshots, test fixtures, or client bundles.

## Routes and bilingual behavior

- [ ] Every route in `CONTENT_INVENTORY.md` returns intended 200/redirect status.
- [ ] Every English page has the approved Spanish equivalent or documented exception.
- [ ] Locale switcher lands on the paired page, not just a locale homepage.
- [ ] Explicit `/es` routes never redirect to English based on browser/local preference.
- [ ] Correct `lang` attributes and localized metadata.
- [ ] Navigation/footer/breadcrumbs work in both languages.
- [ ] Long Spanish labels do not clip or overflow at 320 px.
- [ ] Custom 404 and error behavior tested in both languages.

## SEO and redirects

- [ ] Search Console and historical landing-page exports reconciled.
- [ ] Final legacy URL list is complete.
- [ ] Every approved redirect is single-hop and preserves query strings.
- [ ] Guest-terms routes follow the approved legal-history plan.
- [ ] Unique title/description and one `h1` per indexable page.
- [ ] Self-canonical, EN/ES hreflang, and `x-default` correct.
- [ ] Sitemap is valid and contains only canonical approved pages.
- [ ] Robots references sitemap and has correct production rules.
- [ ] Organization/WebSite/Service/Breadcrumb/Article schema validates where used.
- [ ] No fabricated review/rating/location/award schema.
- [ ] Open Graph/social previews render approved page-specific assets.
- [ ] All internal/external links, anchors, and mail/booking links verified.
- [ ] 404 and redirect crawl reports reviewed and attached.

## Contact form and email

- [ ] Required/optional fields and budget bands match approved specification.
- [ ] Accessible labels, help, validation, error summary, and consent.
- [ ] Server-side schema, body-size, method/content-type, and origin checks pass.
- [ ] Honeypot/timing and rate-limit behavior tested.
- [ ] No direct anonymous database read/write path.
- [ ] Supabase insert succeeds and records source URL/referrer/allowed UTMs/consent time.
- [ ] Duplicate/replay behavior approved.
- [ ] Success response reveals no internal data and shows configured booking CTA.
- [ ] Database failure, rate limit, validation failure, and email failure produce safe behavior.
- [ ] Notification and visitor confirmation emails render in both languages.
- [ ] Sender domain authentication and deliverability checks complete.
- [ ] Form bodies and personal data are not written to application logs/analytics.

## Supabase and admin

- [ ] Reviewed migrations applied to correct environment.
- [ ] RLS enabled on every relevant table.
- [ ] Anonymous read and direct lead insertion denied.
- [ ] Secret key server-only; publishable key has least privilege.
- [ ] Public sign-up disabled.
- [ ] Admin allowlist/role and session protection tested.
- [ ] Lead list/detail/status/notes/export work only for authorized admins.
- [ ] Admin changes create audit events.
- [ ] `/admin` is noindex and never protected only by robots.
- [ ] CSV export formula-injection and access risks handled.
- [ ] Retention, deletion, backup, restore, and key rotation documented.
- [ ] Restore/export procedure rehearsed with non-production data.

## Analytics and consent

- [ ] Analytics need and legal basis approved.
- [ ] GA4/other optional scripts do not load before the correct consent state.
- [ ] Reject is as easy as Accept.
- [ ] Manage/withdraw updates consent and script behavior.
- [ ] No unnecessary personal data or form values enter analytics.
- [ ] Approved events fire once with correct parameters: primary CTA, solution view, partner view, form start/submit, booking, language switch, article 75%, optional mapper.
- [ ] UTM attribution reaches the lead record independently of analytics consent where legally approved.
- [ ] Internal/team traffic handling documented.
- [ ] Search Console verified and sitemap submission plan ready.

## Security

- [ ] CSP works without unexpected violations.
- [ ] HSTS, `X-Content-Type-Options`, frame protection, referrer policy, and permissions policy verified.
- [ ] Server/client module boundaries and environment validation tested.
- [ ] Rate limiting and spam controls cannot be trivially bypassed.
- [ ] Error responses and 404s disclose no stack, query, key, or provider detail.
- [ ] Authentication, authorization, session expiry, and logout tested.
- [ ] Dependency and secret scanning complete.
- [ ] Logs avoid personal data and have retention/access controls.
- [ ] `security.txt` contains only verified contact/details.
- [ ] Incident contact and launch-day escalation owner identified.
- [ ] Optional Opportunity Mapper remains disabled unless separately approved/tested.

## Accessibility and responsive QA

- [ ] Keyboard-only navigation through header, menus, locale switcher, forms, consent, and footer.
- [ ] Visible focus and logical focus order.
- [ ] Skip link and semantic landmarks.
- [ ] Heading hierarchy and one `h1`.
- [ ] Form errors announced and associated with inputs.
- [ ] Images have correct informative/decorative alt treatment.
- [ ] Contrast passes for text, controls, focus, and states.
- [ ] Reduced-motion preference respected.
- [ ] 200% zoom and text spacing do not lose content/function.
- [ ] 320, 375, 768, 1024, 1440 px layouts reviewed.
- [ ] Current Safari, Chrome, Firefox, and Edge smoke checks.
- [ ] Automated accessibility checks pass on home, contact, representative detail, article, legal, 404, and admin sign-in.

## Performance

- [ ] Critical text available without client JavaScript.
- [ ] Marketing pages are static where planned.
- [ ] Images have dimensions, responsive sizes, and optimized formats.
- [ ] Fonts are self-hosted/subset with minimal weights.
- [ ] No unnecessary third-party scripts or heavy animation libraries.
- [ ] No material layout shift from media/fonts/banners.
- [ ] Lighthouse targets under controlled conditions: Performance 90+, Accessibility 95+, Best Practices 95+, SEO 95+.
- [ ] Core Web Vitals reviewed on representative mobile/desktop profiles.
- [ ] Contact/API latency and timeout behavior acceptable.

## Final approval and launch

- [ ] All stop conditions cleared.
- [ ] Launch PR identifies exact commit and commit-specific preview URL.
- [ ] Product/content approval recorded.
- [ ] Spanish approval recorded.
- [ ] Legal/privacy approval recorded.
- [ ] Technical/security/SEO approval recorded.
- [ ] Owner gives explicit approval to merge/deploy production.
- [ ] Launch window, responsible people, monitoring channel, and rollback threshold agreed.
- [ ] Prior Vercel deployment and Git safety refs confirmed available.
- [ ] Database backup/export complete if Phase 3 is live.

## Production smoke test (after authorized launch only)

- [ ] Vercel production deployment succeeded from approved commit.
- [ ] `https://viste.ai` and `www` canonical behavior correct.
- [ ] Home, representative EN/ES pages, legal pages, 404, sitemap, and robots return expected statuses.
- [ ] Full legacy redirect sample plus high-value URLs pass.
- [ ] Contact submission stores one approved test lead and sends correct emails.
- [ ] Admin access and audit event verified.
- [ ] Consent and GA4 behavior verified in fresh browser states.
- [ ] Security headers and preview/production robots differences verified.
- [ ] Search Console sitemap submitted and URL inspection sample requested.
- [ ] No spike in 404s, server errors, or failed form/email events.

## Monitoring cadence

- First hour: deployment/errors, core routes, forms, redirects, consent.
- 24 hours: 404s, Search Console crawl, leads/email, analytics sanity, performance.
- 7 days: indexing/coverage, top legacy URLs, Core Web Vitals, conversions, support issues.
- 30 days: redirect/index consolidation, content/search performance, lead quality, dependency/security review.

## Rollback

Trigger rollback for: widespread 5xx/blank pages, broken primary routes/redirects, unsafe lead loss/exposure, authentication bypass, secret exposure, incorrect legal publication, or unresolvable critical accessibility/consent failure.

- [ ] Pause further production changes.
- [ ] Preserve logs and submitted leads without copying sensitive values into tickets/chat.
- [ ] Roll back to the previous known-good Vercel production deployment or revert the launch merge.
- [ ] Do not roll back/mutate production database destructively with the website.
- [ ] Verify apex/www, legacy routes, contact behavior, and security headers after rollback.
- [ ] Record incident, cause, affected period/data, and approval before reattempt.
- [ ] Use `pre-viste-global-rebuild-2026-08-02` / `archive/legacy-hospitality-site` only when a full legacy-code restoration is required.

Production remains untouched until this checklist is completed against a reviewed Vercel preview and explicit approval is given.

# Viste.ai Implementation Plan

Status: Phase 0 plan; stop before Phase 1 until explicit approval.

Production rule: no merge to `main`, production promotion, DNS change, or production-domain change without explicit approval after preview QA.

## Current checkpoint

- Legacy commit audited: `bdfb68b`.
- Safety tag created and published: `pre-viste-global-rebuild-2026-08-02`.
- Archive branch created and published: `archive/legacy-hospitality-site`.
- Working branch active: `rebuild/viste-ai-global`.
- Existing site run locally and route/runtime results recorded.
- Phase 0 planning documents created.
- Phase 1 code has not started.

## Required approval package

Approve or amend:

1. `CURRENT_SITE_AUDIT.md`
2. `CONTENT_INVENTORY.md`
3. `SEO_REDIRECT_MAP.md`
4. `ARCHITECTURE.md`
5. `DESIGN_SYSTEM.md`
6. This implementation sequence
7. `LAUNCH_CHECKLIST.md`

Also answer the blocking decisions listed at the end of this document.

## Implementation sequence

### Phase 0 — Audit and safety (current phase)

Deliverables:

- Repository/live/local audit and exact URL inventory.
- Safety refs at the current production commit.
- Content, SEO/redirect, architecture, design, implementation, and launch plans.
- Accounts, environment names, risks, unknowns, and production guardrails.

Exit criteria:

- Documents reviewed by owner.
- Archive/working-ref publication approach approved.
- Vercel production branch verified before any push.
- Architecture and high-impact content/legal decisions approved.

**Hard stop:** do not start Phase 1 without explicit approval.

### Phase 1 — Foundation, brand system, and core content

Order:

1. Add `.gitignore`, repository guidance, setup README, placeholder-only `.env.example`, and stable pinned toolchain.
2. Create Next.js App Router/strict TypeScript skeleton without removing the legacy baseline from its archive refs.
3. Add design tokens, fonts, layout primitives, accessibility foundation, headers/security config, and reusable UI.
4. Optimize approved logo/favicon/social foundations; create factual operational hero visual.
5. Implement typed route/content/translation manifests.
6. Build global navigation/footer and EN/ES locale pairing.
7. Build core pages: home, service/solution/industry overviews, partners, process, about, contact shell, legal templates.
8. Add unit tests, route parity tests, initial Playwright smoke tests, and PR CI.
9. Produce desktop/mobile screenshots and review copy/design before continuing.

No live lead submission, GA4, OpenAI, or admin dashboard in this phase.

### Phase 2 — Detail pages, migration, and SEO foundation

1. Implement service, Solution Blueprint, and industry details from approved content.
2. Add insight architecture and keep articles draft-only.
3. Implement metadata, canonical/hreflang/`x-default`, JSON-LD, sitemap, robots, breadcrumbs, OG generation, 404/error pages.
4. Implement approved redirects except unresolved historical legal mappings.
5. Add metadata, structured-data, sitemap, redirect, link, and accessibility tests.
6. Preserve substantive hospitality content without unsupported proof.
7. Complete reviewed legal drafts behind publication gates; do not expose placeholders.

### Phase 3 — Lead system and protected admin

1. Create Supabase project/environment plan and reviewed SQL migrations.
2. Implement tables, indexes, RLS, admin allowlist/profile, and audit events.
3. Implement server-only contact endpoint, validation, size/origin limits, spam controls, rate limiting, UTM/referrer capture, and generic error handling.
4. Select/configure transactional email and test non-production delivery isolation.
5. Implement protected `/admin` lead list/detail/status/notes/export.
6. Add form success/failure/replay/rate-limit tests and admin auth/RLS tests.
7. Document backup, restore, retention, export, key rotation, and incident process.

### Phase 4 — Insights and optional Opportunity Mapper

1. Editorially review and publish only approved insights; create natural Spanish versions.
2. Add RSS when enough approved articles exist.
3. Consider Opportunity Mapper only after separate privacy, abuse, cost, and product approval.
4. If approved, implement server-only behind `NEXT_PUBLIC_ENABLE_OPPORTUNITY_MAPPER=false`, with no storage without consent.

The mapper is never a launch blocker.

### Phase 5 — QA and launch preparation

1. Push/open PR only after Vercel production-branch and environment scoping are verified.
2. Review protected Vercel preview on desktop and mobile.
3. Test all routes, redirects, forms, email isolation, admin protection, consent/analytics, metadata, bilingual parity, accessibility, performance, and security headers.
4. Run Search Console/export reconciliation and final pre-launch crawl.
5. Freeze approved legal/content/redirect versions.
6. Run rollback rehearsal using the safety tag/archive commit.
7. Complete `LAUNCH_CHECKLIST.md` with evidence links and named approvers.

**Hard stop:** explicit production approval is required.

### Phase 6 — Production launch (future, not authorized)

1. Merge the reviewed PR to the confirmed production branch.
2. Watch the Vercel production build and retain the prior deployment.
3. Verify live routes, headers, forms, consent, language paths, sitemap, robots, and redirects.
4. Submit/validate sitemap in Search Console.
5. Monitor 404s, lead delivery, Core Web Vitals, consent/analytics, and security logs.
6. Roll back immediately if a launch stop condition occurs.

## Change-set strategy

Keep commits reviewable and reversible. Suggested sequence:

1. `docs: add phase 0 audit and rebuild plan`
2. `chore: establish nextjs typescript foundation`
3. `feat: add brand tokens and site shell`
4. `feat: add bilingual core content`
5. `feat: add detail routes and seo foundation`
6. `feat: add secure lead capture`
7. `feat: add protected lead administration`
8. `content: add reviewed insights and legal copy`
9. `test: complete preview launch checks`

Do not combine database migrations, major content changes, dependency upgrades, and redirect changes in one opaque commit.

## Proposed implementation tree

The authoritative detailed tree is in `ARCHITECTURE.md`. Build order by directory:

```text
docs/ and repository controls
  -> src/styles + src/components/ui
  -> src/content + route manifest
  -> src/app public routes
  -> src/lib/seo + metadata/redirects
  -> tests + CI
  -> supabase/migrations
  -> src/lib/forms + src/app/api/contact
  -> src/app/admin
  -> optional src/app/api/opportunity-map
```

## Verification by phase

| Phase | Required verification |
|---|---|
| 1 | Lint, typecheck, unit, build, EN/ES smoke, keyboard/contrast check, desktop/mobile screenshots |
| 2 | Route manifest, canonical/hreflang, JSON-LD, sitemap/robots, 301 map, broken links, 404/error, accessibility |
| 3 | Validation, abuse/rate tests, RLS/auth, secret/client boundary, email failure, UTM, audit events, export |
| 4 | Editorial/legal review state, article metadata, translation quality, optional AI safety/cost tests |
| 5 | Full CI/e2e, Lighthouse targets, mobile devices, consent/GA4, headers/CSP, dependency audit, rollback rehearsal |
| 6 | Live smoke, redirects, Search Console, leads/email, monitoring and rollback readiness |

## Vercel preview sequence

1. Confirm project and production branch in Vercel; expected production branch is `main`, but do not assume.
2. Configure Preview-scoped variables with non-production Supabase/email behavior.
3. Enable preview protection if real lead/admin data could be exposed.
4. Push the working branch and open a PR only after authorization.
5. Confirm Vercel labels deployment as **Preview**, not Production.
6. Verify `X-Robots-Tag: noindex` and application robots metadata.
7. Execute `LAUNCH_CHECKLIST.md` against the branch/commit preview URL.
8. Record approval against a commit-specific preview.
9. Merge only that reviewed commit range after explicit approval.

## Rollback strategy

- Code rollback source: `pre-viste-global-rebuild-2026-08-02` and `archive/legacy-hospitality-site` at `bdfb68b`.
- Deployment rollback: use Vercel's prior known-good production deployment or revert the launch merge and deploy.
- DNS is not part of normal launch and should not be needed for rollback.
- Database migrations must be backward-compatible through the launch window. Destructive schema changes require a separate approved plan and backup.
- Preserve submitted leads before any database rollback; never reset production data to roll back the website.
- Keep redirect behavior in the rollback decision: reverting the UI must not accidentally break migrated URLs.

## Owner-operable update model

After implementation, routine requests should map to narrow repository areas:

- Change page copy: edit one locale content module and its reviewed counterpart.
- Add an insight: add MDX/frontmatter, review, then publish flag.
- Add a verified case study: add evidence register entry plus case-study content/template.
- Add a service: add route-manifest/content records and parity/SEO tests.
- Change contact details: update verified configuration/content and legal references together.
- Review leads: use protected `/admin`, not Supabase table editor for routine work.
- Deploy preview: branch/PR workflow.
- Roll back: documented Vercel deployment/revert workflow.

The detailed owner guide is a later required deliverable, not part of Phase 0 implementation.

## Blocking decisions

### Needed before Phase 1

- Approve architecture and design-token reconciliation.
- Confirm the canonical Spanish route vocabulary.
- Confirm pricing language: recommended public posture is paid discovery plus “meaningful pilots typically require a low-five-figure budget,” not the full internal ranges.
- Provide verified logo/vector status, team/about facts, public contact inboxes, booking URL, and any permitted proof.
- Confirm legal drafter/reviewer and historical guest-terms treatment.

### Needed before first remote branch push

- Confirm Vercel production branch is `main` and branch pushes are Preview only.
- Approve publication of the safety tag/archive branch and working branch to GitHub.
- Decide preview access protection.

### Needed before Phase 3

- Supabase project/region/owner, retention, backups, and admin users.
- Transactional email provider and verified sending domain.
- Rate-limit/spam approach based on Vercel plan and acceptable extra services.

### Needed before launch

- Search Console exports and redirect approval.
- Legal approval and verified processor/contact facts.
- Final content/proof approval.
- Successful preview evidence and explicit production approval.

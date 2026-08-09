# Demand engine v1 release report

Status: publication approved; final production deployment and verification in progress.
Date: 2026-08-09

Preview: https://viste-ai-site-b5molv9xb-vistes-projects-c629d2e5.vercel.app
Booking page: https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ3ycX4aDZ5mGc3cgsdAHyoSgwDcDZ0wN0zsbRJZG2rZF-SmAodwG5cZrwTgANET6svtEZ7dsLQ8

## Public preview assets

- `/ai-for-my-business` ↔ `/es/ia-para-mi-negocio`
- `/tools/ai-automation-roi-calculator` ↔ `/es/herramientas/calculadora-roi-automatizacion-ia`
- `/questions` ↔ `/es/preguntas`
- Homepage diagnostic entry in both locales
- Earlier appointment-calendar path on contact and decision pages

All six new routes received human publication approval on 2026-08-09. `publishApproved` is true for both languages, so production builds expose indexable metadata and include every route pair in the sitemap. Non-production Vercel previews remain `noindex` by design.

## Implementation notes

- The diagnostic uses seven closed-choice steps and a deterministic scoring function. It shows the rule-based recommendation, assumptions, dependencies, first baseline metric and related Viste.ai service before any contact action.
- The ROI calculator uses only visitor-provided operating values plus three editable efficiency assumptions. It persists nothing and exposes the formula.
- The questions hub groups five substantial decision areas rather than generating thin Q&A pages. No FAQ/Q&A schema was added.
- Calendar links use the existing sanitised `NEXT_PUBLIC_BOOKING_URL`. When no approved URL exists, the interface falls back to the qualified contact form instead of showing a broken calendar.
- Analytics events pass through a consent-aware allowlist that drops personal and free-text properties.
- The Google Appointment Schedule is owned by `yon.wallace@viste.ai`: 30 minutes, Google Meet, weekdays 10:00–17:00 Europe/Madrid, 24-hour minimum notice, 15-minute buffers, four-booking daily maximum, email verification and a one-day reminder. Its public form asks only for identity, email and two concise bilingual discovery prompts.
- `NEXT_PUBLIC_BOOKING_URL` was updated for the Vercel Preview target. The live English and Spanish contact pages were verified to link to the public schedule.
- The same verified booking URL is configured for the Vercel Production target for the approved release.

## Validation completed

- `npm run check`: passed, including lint, TypeScript, 28 unit/API tests, internal-link validation and a production build of 95 static pages.
- `npm run test:e2e`: 92/92 passed across desktop Chromium and the mobile project.
- Accessibility: no serious or critical axe violations on the tested homepage, contact, demo, diagnostic and ROI templates.
- Metadata: unique titles/descriptions, canonical and reciprocal hreflang checks passed for both locales.
- Index control: all six growth routes return `noindex,nofollow` and remain outside the sitemap while `publishApproved` is false.
- Visual review: Spanish diagnostic and calculator inspected at 1440 × 1000, 834 × 1112 and 390 × 844; no browser warnings or errors were recorded.
- Screenshots: `/tmp/viste-growth-diagnostic-desktop.png`, `/tmp/viste-growth-diagnostic-step-desktop.png`, `/tmp/viste-growth-diagnostic-mobile.png`, `/tmp/viste-growth-diagnostic-controls-mobile.png`, `/tmp/viste-growth-diagnostic-tablet.png`, `/tmp/viste-growth-roi-form-desktop.png` and `/tmp/viste-growth-roi-results-desktop.png`.
- Vercel Preview build: passed and generated 95 pages. No production deployment, domain assignment or DNS change was made.
- Lighthouse homepage: performance 91, accessibility 100, best practices 100; FCP 1.6 s, LCP 2.7 s, TBT 30 ms and CLS 0.
- Lighthouse contact page: performance 96, accessibility 100, best practices 100; FCP 1.6 s, LCP 1.8 s, TBT 30 ms and CLS 0.033.
- Lighthouse SEO is 66 on both audited Preview URLs because the private Preview is intentionally blocked from indexing. The principal performance opportunity is initial document latency at roughly 0.8 seconds; this is not a release blocker.
- `chrome-devtools-mcp` is configured on the Codex host. Codex loads newly added MCP servers after restart, so the same Preview was audited immediately with the official Lighthouse CLI during this task.
- End-to-end booking test: `hello@viste.ai` received the Google verification code; the appointment was confirmed; the calendar invitation and Google Meet details arrived by email; the temporary appointment was cancelled; and Google confirmed that the cancellation email was sent to all guests.

## Manual decisions before production publication

1. Confirm the desired cancellation/rescheduling policy in Google Calendar; the current schedule uses Google's standard booking controls and no custom cancellation policy.
2. Re-run the full quality gate and inspect the production deployment after publication.

## Rollback

The changes are additive and remain on a non-production branch. Revert the release commit or promote the prior Vercel deployment. Do not remove the safety tag `pre-viste-global-rebuild-2026-08-02` or the branch `archive/legacy-hospitality-site`.

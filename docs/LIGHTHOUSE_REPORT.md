# Lighthouse report

Tool: Lighthouse 13.4.1

Before: current production at `https://viste.ai` (`b72609e`)

After: Vercel review preview for `codex/production-readiness`

Run date: 3 August 2026

Scores are Performance / Accessibility / Best Practices / SEO. SEO on the preview is intentionally 66 because previews are blocked from indexing by `X-Robots-Tag` and `robots.txt`; production metadata is covered separately by automated tests.

| Template | Device | Before | After preview | Before → after LCP | After CLS / TBT |
|---|---|---|---|---|---|
| Home | Mobile | 86 / 95 / 92 / 100 | 99 / 100 / 100 / 66 | 3.6s → 1.6s | 0 / 0ms |
| Home | Desktop | 100 / 95 / 92 / 100 | 100 / 100 / 100 / 66 | 0.4s → 0.4s | 0 / 0ms |
| Contact | Mobile | 97 / 100 / 92 / 100 | 100 / 100 / 100 / 66 | 2.5s → 1.1s | 0 / 0ms |
| Contact | Desktop | 100 / 100 / 92 / 100 | 100 / 100 / 100 / 66 | 0.5s → 0.4s | 0 / 0ms |
| Sprint service | Mobile | 91 / 100 / 92 / 100 | 94 / 100 / 100 / 66 | 2.6s → 2.8s | 0 / 0ms |
| Sprint service | Desktop | 100 / 100 / 92 / 100 | 100 / 100 / 100 / 66 | 0.5s → 0.3s | 0 / 0ms |
| Insight | Mobile | 85 / 100 / 92 / 100 | 100 / 100 / 100 / 66 | 3.8s → 1.2s | 0 / 0ms |
| Insight | Desktop | 100 / 100 / 92 / 100 | 100 / 100 / 100 / 66 | 0.5s → 0.3s | 0 / 0ms |

Home accessibility improved from 95 to 100 after correcting contrast. All tested templates have zero cumulative layout shift. The contact template intentionally carries more interactive form markup than the placeholder baseline while remaining above the 90 performance threshold.

The preview-only Vercel feedback UI initially caused CSP console findings. The preview CSP now permits only `https://vercel.live` in `script-src`, `connect-src` and `frame-src`; production does not receive that exception. A final desktop audit confirmed a 100 best-practices score with no console or inspector findings. The identical site-wide header correction applies to every audited template.

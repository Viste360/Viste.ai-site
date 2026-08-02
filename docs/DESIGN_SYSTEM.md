# Viste.ai Design System Direction

Status: Phase 0 proposal; no production assets or components implemented.

Goal: stylish, calm, premium, technically precise, and credible to established businesses.

## Brand-package assessment

The supplied package provides a strong new identity direction: a geometric “V”/person mark, `Viste.ai` wordmark, dark navy foundation, aqua/blue signal colors, Space Grotesk/Inter typography, and a system/connection visual language.

Use with constraints:

- The package contains raster PNGs but no original vector logo. Request the source SVG/AI/EPS before final logo implementation if available.
- Two brand boards disagree on exact neutral/aqua values and on pure versus warm white. The canonical set below reconciles them for web use and must be approved.
- `logo_transparent.png` includes glow and excess canvas; it is unsuitable as the default navigation logo without cleanup/optimization.
- The supplied hero mockup includes fictional business names, trust logos, workflow counts, percentages, connected-tool logos, and a “Sign In” affordance. It is inspiration only and must not be published.
- Brand-board contact names, locations, phone numbers, social profiles, client names, metrics, and partner/tool logos are not verified content.
- Social banners should be regenerated from approved copy after final positioning and handle/profile verification.

## Design principles

1. **Calm confidence** — dark ink, precise type, controlled color, no visual shouting.
2. **Business before technology** — outcomes and workflows before model names.
3. **Structure communicates trust** — strong grid, generous space, clear hierarchy, consistent alignment.
4. **Systems, not spectacle** — visuals show controlled flows between people, data, tools, and outcomes.
5. **Evidence over decoration** — no fake dashboards, logos, metrics, reviews, or client counters.
6. **Motion with purpose** — subtle flow/reveal cues that never delay content and respect reduced motion.
7. **Bilingual by design** — components tolerate longer Spanish labels and copy without shrinking text.

## Canonical color tokens

Provisional selection follows the supplied identity-system board and the blueprint's warm off-white direction.

```css
:root {
  --color-ink-950: #0b0f14;       /* Obsidian */
  --color-ink-900: #1b212a;       /* Graphite */
  --color-slate-600: #4b5563;     /* Slate */
  --color-aqua-400: #00e6d4;      /* Electric Aqua */
  --color-blue-600: #2563eb;      /* Signal Blue */
  --color-warm-50: #f6f7f9;       /* Warm White */
  --color-white: #ffffff;
  --color-success: #16805f;
  --color-warning: #a15c00;
  --color-danger: #b42318;
  --color-border-dark: rgb(255 255 255 / 12%);
  --color-border-light: rgb(11 15 20 / 12%);
}
```

The alternate board lists `#0B0F16`, `#171E29`, `#3A4353`, `#00E0D4`, and pure white. Do not mix these ad hoc. Approval of the canonical tokens resolves the inconsistency.

Usage rules:

- Ink is the primary background and text color, not a generic black.
- Warm white is the principal light surface; pure white is reserved for cards/contrast.
- Aqua is an accent and interaction signal, not body text on light backgrounds.
- Blue is the primary action/link color with verified accessible foreground pairings.
- Aqua-to-blue gradients may be used on the brand mark, one hero accent, and key action highlights—not on every card.
- Status colors communicate meaning with icons/text, never color alone.

All token combinations must meet WCAG AA contrast; normal text targets 4.5:1 and large text 3:1 at minimum.

## Typography

Proposed controlled two-font system from the supplied boards:

- Display/headings: **Space Grotesk**, weights 500 and 600.
- Body/UI: **Inter**, weights 400, 500, and 600.
- Load with `next/font` so assets are self-hosted at build time and do not require runtime Google requests.
- Do not load italic or unused weights at launch.

Fluid type proposal:

| Token | Desktop intent | Mobile floor | Use |
|---|---:|---:|---|
| `display-xl` | 64/68, 600 | 44/48 | Homepage hero only |
| `display-lg` | 52/58, 600 | 38/44 | Major landing headings |
| `heading-1` | 44/52, 600 | 34/40 | Page `h1` |
| `heading-2` | 34/42, 600 | 28/36 | Section `h2` |
| `heading-3` | 24/32, 500 | 22/30 | Cards/detail sections |
| `body-lg` | 19/30, 400 | 18/28 | Hero/lead copy |
| `body` | 16/26, 400 | 16/26 | Standard copy |
| `small` | 14/20, 400 | 14/20 | Metadata/help |

Line length should generally stay between 55 and 75 characters. Do not reduce core copy below 16 px.

## Layout and spacing

- 12-column desktop grid, 8-column tablet, 4-column mobile.
- Content max width: 1200–1280 px; reading width: 720–760 px.
- Page gutter: 20 px at 320 px viewport, 24 px tablet, 32–48 px desktop.
- Base spacing unit: 4 px; common steps: 8, 12, 16, 24, 32, 48, 64, 96, 128.
- Section rhythm: 72–96 px mobile, 112–160 px desktop where content warrants it.
- Borders: 1 px low-contrast; radius family 8, 12, 16, 24 px.
- Shadows are rare and soft. Dark surfaces use borders/light gradients for separation.

Responsive support begins at 320 px. Breakpoints follow content needs, not device brands.

## Core visual language

Create a lightweight operational system map as SVG/CSS, connecting:

```text
Conversations  Documents  Operations  Data  People
                         ↓
             Governed AI workflows
                         ↓
     Answers  Actions  Visibility  Measured outcomes
```

The illustration should show permission/oversight checkpoints and one or two subtle animated flow paths. It must contain no fabricated KPI values, client data, product UI, or third-party logos. Provide a static reduced-motion state and meaningful accessible description or mark it decorative when the adjacent copy conveys the same information.

Photography is optional. If used, prefer authentic operational environments and commissioned/rights-cleared imagery; avoid robots, glowing brains, humanoids, generic code walls, and staged “AI people.”

## Component inventory

### Foundation

- Skip link, page container, section wrapper, stack/cluster/grid primitives.
- Header, desktop nav, mobile disclosure nav, locale switcher, footer.
- Text link, primary/secondary/quiet buttons, icon button.
- Eyebrow, heading group, prose, divider, badge.

### Content

- Service card, Blueprint card, industry card, process step.
- Outcome/constraint pair, responsible-implementation list, metric definition (not metric claim).
- Workflow diagram, system integration list, risk/limitation callout.
- Breadcrumbs, article card, article prose, table of contents.
- CTA band, contact expectation panel.

### Forms and consent

- Label/help/error pattern, text input, textarea, select, checkbox.
- Form summary error and success state.
- Cookie banner with Accept, Reject, and Manage of equal visual honesty.
- Consent preferences dialog with keyboard/focus management.

### Trust and system

- Security principle card, human-oversight callout, source/citation example.
- 404, error, loading only where needed.
- Admin components are Phase 3 and visually subordinate to the public system.

Every component must document responsive behavior, focus state, disabled/loading state, accessible name/semantics, and reduced-motion behavior.

## Navigation direction

- Persistent but restrained header; no oversized logo or excessive blur/glass effect.
- Primary navigation: Services, Solutions, Industries, Partners, Process, Insights, About, Contact.
- One dominant CTA: “Discuss your use case.”
- Locale switcher uses explicit `EN` / `ES`, includes current-language state, and links to the paired route.
- Mobile navigation is a true button/disclosure with focus trapping only if implemented as a dialog.
- Deep pages include breadcrumbs; mobile does not hide essential context.

## Homepage composition

1. Dark hero with positioning, two CTAs, trust line, and operational system map.
2. Warm-white “start with the bottleneck” editorial section.
3. Six outcome-first capability entries with restrained dividers rather than a crowded card wall.
4. Featured WhatsApp Blueprint with the corporate-platform monitoring limitation visible.
5. Industry/audience section.
6. Five-stage process with measured progression.
7. Partner programme split section.
8. Responsible implementation principles.
9. Final CTA and qualified contact expectation.

Alternate dark/light sections should create rhythm without making every section a floating panel.

## Motion

- CSS transitions and Intersection Observer only where justified; no animation library at launch.
- Typical duration 160–320 ms; hero flow may run slowly and unobtrusively.
- Use opacity/transform sparingly; never animate layout-critical dimensions.
- Pause or remove non-essential motion under `prefers-reduced-motion: reduce`.
- No entrance animation may hide content from assistive technology or delay interaction.
- No autoplay video with sound, cursor-following effects, or perpetual card motion.

## Image and icon rules

- Optimize raster images with `next/image`, explicit dimensions, appropriate formats, and responsive sizes.
- Use approved SVG icons with consistent 1.5–2 px strokes and rounded geometry.
- Decorative images use empty alt; informative images use concise outcome-focused alt.
- Logos are never used to imply customer, partner, or certification status without written evidence.
- Social/OG images use a single approved template per language with page-specific title and no fake dashboards.

## Accessibility acceptance criteria

- Keyboard access to every function and visible focus on every interactive element.
- Correct landmark and heading structure with one `h1` per page.
- Touch targets approximately 44×44 px where practical.
- Controls have persistent labels; placeholder text is never the only label.
- Errors are associated with fields and summarized.
- Navigation and dialogs manage focus predictably.
- Content and controls work at 200% zoom and 320 px without horizontal page scrolling.
- Contrast, reduced motion, forced-colors/high-contrast behavior, and screen-reader names are tested.
- English and Spanish language attributes are correct at page and inline phrase level.

## Design review deliverables for Phase 1

- Approved token sheet and responsive typography specimen.
- Logo/navigation variants on dark and light surfaces.
- Desktop and mobile homepage previews.
- Mobile navigation and contact form states.
- Operational system-map static and motion states.
- Button, card, form, cookie-consent, breadcrumb, and CTA component set.
- English and Spanish stress test using real-length copy.
- Accessibility contrast and keyboard review.

## Decisions needed

1. Approve the canonical identity-system palette versus the alternate style-guide values.
2. Provide/confirm a vector logo source or approve careful optimization of the raster assets.
3. Confirm whether Space Grotesk + Inter is the desired two-font system.
4. Confirm which team portraits/bios may appear and provide rights/evidence.
5. Confirm that fictional dashboard/client material in the supplied mockup is inspiration only.

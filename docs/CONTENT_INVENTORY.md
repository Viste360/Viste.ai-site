# Viste.ai Content Inventory

Status: Phase 0 planning draft

Baseline: `bdfb68b`

Rule: inventory and plan only; no new public copy is approved for production.

## Current content model

The current site is a manually duplicated English/Spanish hospitality landing page plus legal pages. It has no reusable content model, CMS, article system, or content validation.

### Current homepage sections

| Section | EN/ES | Disposition | Reason |
|---|---|---|---|
| Header and language picker | Both | Replace | New information architecture and `/es` routing |
| Hospitality hero | Both | Replace | Conflicts with global AI implementation positioning |
| Demo video | Both | Verify or remove | Hospitality-specific; reuse only with rights and continued relevance |
| Host pain points | Both | Reframe | Convert to business bottlenecks and operational outcomes |
| Three-step process | Both | Replace | Blueprint requires Discover, Design, Pilot, Integrate, Measure & Scale |
| Benefits | Both | Reframe | Outcome-first, controlled claims only |
| Pricing/free offer | Both | Remove | Conflicts with paid discovery and premium engagement model |
| Five-step guest journey | Both | Preserve as source only | May inform the hospitality Solution Blueprint, not the company-wide process |
| Testimonials | Both | Remove pending evidence | Names/results are not accompanied by verification |
| FAQ | Both | Rewrite | Current questions are rental-specific |
| Team | Both | Verify and rewrite | Names, roles, biographies, affiliations, and image permissions require approval |
| Footer/contact | Both | Replace | Generic links and fixed contact/booking details |

### Current legal content

| Content | Current routes | Disposition |
|---|---|---|
| Website/service privacy | `/privacy-policy.html`, `/privacy-policy-es.html` | Replace with website/lead privacy drafts after fact and legal review |
| Host service terms | `/term-and-condition.html`, `/term-and-condition-es.html` | Replace with website-use terms; preserve service terms as records if required |
| Cookie policy | `/cookie-policy/en/`, `/cookie-policy/es/` | Replace to match actual consent and analytics behavior |
| Freshlanding guest terms | `/guestterms/en/`, `/guestterms/es/` | Do not silently overwrite; preserve or archive based on legal decision |

## Current proof and claims register

The following may not be reused unless evidence and permission are recorded:

- 100% automated guest messaging.
- 80% reduction/resolution/time-saving claims.
- 15% revenue increase.
- “Happy clients” and four testimonial identities/roles.
- Team roles, career affiliations, education, certifications, board positions, and business-scale figures.
- Icnea, Freshlanding, Twilio, Meta/WhatsApp, OpenAI, or other names presented in a way that may imply a partnership.
- Encryption, GDPR compliance, retention, international-transfer, and “no PII sent” statements.
- “Free,” “always,” “24/7,” and absolute service-performance language.

Create a future `content/proof-register` entry for every approved client logo, testimonial, metric, certification, award, or partnership. Minimum evidence: owner, source document/link, permission scope, approval date, expiry/review date, and approved wording.

## Supplied branding package

Inventory supplied outside the repository:

- Logo on light/dark, transparent lockup, transparent symbol.
- App icons, profile assets, and favicon sizes from 16 to 1024.
- LinkedIn, Facebook, X, and Open Graph images.
- Identity, style, logo, application, dark-system, and digital-asset boards.
- Website hero mockup.

Planned use:

- Retain the geometric mark, wordmark, core dark/aqua/blue direction, and selected favicon/social foundations.
- Optimize and copy only approved launch assets into `public/brand` during Phase 1.
- Do not publish the supplied hero mockup or any asset containing fictional logos, metrics, contacts, offices, or unverified proof.
- Request an original vector logo (`.svg`/`.ai`/`.eps`) if available. The supplied production logo files are raster PNGs.

## New English content inventory

### Core pages

| Route | Primary purpose | Core modules | Primary CTA |
|---|---|---|---|
| `/` | Establish positioning in five seconds | Hero, business-first method, six capability cards, featured WhatsApp blueprint, industries, process, partners, responsible implementation | Discuss your use case |
| `/services` | Explain commercial service architecture | Opportunity Sprint plus six implementation capabilities | Start with a sprint |
| `/solutions` | Explain example systems without claiming delivery | Six Solution Blueprint cards and qualification | Explore a blueprint |
| `/industries` | Show audience relevance without overclaiming expertise | Five priority audience/industry entries | Discuss your workflow |
| `/partners` | Sell white-label/co-delivery proposition | Partner fit, model, protections, process, qualification | Discuss partnership |
| `/process` | Reduce buying risk | Discover, Design, Pilot, Integrate, Measure & Scale | Scope a discovery |
| `/about` | Explain approach and verified people | Principles, senior-led delivery, verified team only | Meet Viste.ai |
| `/insights` | Build authority with reviewed editorial content | Article index, topics, newsletter only if operational | Read insights |
| `/contact` | Capture qualified leads | Expectations, qualification form, privacy notice, booking after success | Start the conversation |
| `/security` | Explain responsible implementation | Data boundaries, permissions, oversight, auditability, incident contact | Discuss requirements |
| `/privacy` | Website/lead privacy draft | Verified controller/processors/rights/retention | Privacy contact |
| `/terms` | Website-use terms draft | Scope, acceptable use, IP, disclaimers, law | Contact |
| `/cookies` | Actual cookie/consent policy | Categories, choices, current vendors | Manage preferences |

### Service detail pages

- `/services/ai-opportunity-sprint`
- `/services/customer-service-whatsapp`
- `/services/knowledge-assistants`
- `/services/workflow-automation`
- `/services/sales-crm-automation`
- `/services/data-intelligence`
- `/services/custom-ai-development`

Each service page needs: business problem, outcomes, fit/non-fit, capabilities, discovery inputs, human oversight, delivery stages, dependencies/limitations, related blueprints, and CTA. Public pricing remains a decision; approved default is to describe paid discovery and meaningful low-five-figure pilots without publishing the full internal range.

### Solution Blueprint pages

- `/solutions/whatsapp-sales-service-control`
- `/solutions/ai-support-desk`
- `/solutions/company-knowledge-assistant`
- `/solutions/document-operations`
- `/solutions/hospitality-operations-assistant`
- `/solutions/operations-intelligence`

Every page must be labeled **Solution Blueprint** or **Example System**, never “case study,” unless a verified implementation later replaces it. Required modules: problem, users, current-state example, proposed workflow, systems, oversight, reporting, stages, data/access, success metrics, risks/limits, CTA.

### Industry pages

- `/industries/it-providers-resellers`
- `/industries/hospitality-property`
- `/industries/professional-services`
- `/industries/manufacturing-distribution`
- `/industries/retail-multi-location`

Use audience pains and example workflows, not claims of offices, sector dominance, or completed work. Hospitality is the substantive migration destination for relevant legacy authority.

### Initial insights

Draft but do not publish until fact/editorial review:

1. How to choose the first AI use case in an established business.
2. What a shared WhatsApp inbox can and cannot monitor.
3. How an internal knowledge assistant should handle permissions and sources.
4. Why AI pilots fail between prototype and production.
5. White-label AI delivery for IT providers and resellers.
6. AI automation in hospitality and property operations.
7. A practical framework for measuring AI implementation value.
8. Human oversight in customer-service automation.

## Spanish route and content parity

Spanish must be naturally written and editorially reviewed, not generated as a literal mirror.

| English | Spanish |
|---|---|
| `/` | `/es` |
| `/services` | `/es/servicios` |
| `/services/ai-opportunity-sprint` | `/es/servicios/sprint-oportunidades-ia` |
| `/services/customer-service-whatsapp` | `/es/servicios/atencion-cliente-whatsapp` |
| `/services/knowledge-assistants` | `/es/servicios/asistentes-conocimiento` |
| `/services/workflow-automation` | `/es/servicios/automatizacion-flujos` |
| `/services/sales-crm-automation` | `/es/servicios/automatizacion-ventas-crm` |
| `/services/data-intelligence` | `/es/servicios/inteligencia-datos` |
| `/services/custom-ai-development` | `/es/servicios/desarrollo-ia-medida` |
| `/solutions` | `/es/soluciones` |
| `/solutions/whatsapp-sales-service-control` | `/es/soluciones/control-ventas-servicio-whatsapp` |
| `/solutions/ai-support-desk` | `/es/soluciones/soporte-tecnico-ia` |
| `/solutions/company-knowledge-assistant` | `/es/soluciones/asistente-conocimiento-empresa` |
| `/solutions/document-operations` | `/es/soluciones/operaciones-documentales` |
| `/solutions/hospitality-operations-assistant` | `/es/soluciones/asistente-operaciones-hospitalidad` |
| `/solutions/operations-intelligence` | `/es/soluciones/inteligencia-operaciones` |
| `/industries` | `/es/sectores` |
| `/industries/it-providers-resellers` | `/es/sectores/proveedores-ti-distribuidores` |
| `/industries/hospitality-property` | `/es/sectores/hospitalidad-propiedades` |
| `/industries/professional-services` | `/es/sectores/servicios-profesionales` |
| `/industries/manufacturing-distribution` | `/es/sectores/fabricacion-distribucion` |
| `/industries/retail-multi-location` | `/es/sectores/retail-multilocal` |
| `/partners` | `/es/socios` |
| `/process` | `/es/proceso` |
| `/about` | `/es/nosotros` |
| `/insights` | `/es/recursos` |
| `/insights/[slug]` | `/es/recursos/[slug]` |
| `/contact` | `/es/contacto` |
| `/privacy` | `/es/privacidad` |
| `/terms` | `/es/terminos` |
| `/cookies` | `/es/cookies` |
| `/security` | `/es/seguridad` |

This mapping is the canonical Phase 0 proposal. Changing Spanish slugs later requires updating route manifests, hreflang, sitemap, internal links, and redirect tests together.

## Contact content and qualification

Required fields: name, work email, company, country, website, company size, business challenge, current systems, desired timeline, budget band, preferred language, and explicit privacy consent. UTM values, source URL, and referrer are captured automatically, not requested from the visitor.

The page must state:

- The form starts a commercial conversation, not a free consulting engagement.
- Visitors should not submit confidential, special-category, or unnecessary personal data.
- A successful submission shows a booking CTA only after storage succeeds.
- Published inboxes and booking links must come from confirmed configuration.

## Legal and trust draft inputs

Do not draft publishable legal text until these facts are confirmed:

- Legal entity/controller name and registered details.
- Jurisdiction and governing-law decision.
- Privacy/security contact and public business inboxes.
- Hosting, database, email, analytics, spam-protection, and AI processors actually enabled.
- Data categories, purposes, lawful bases, recipients, regions/transfers, retention periods, and deletion process.
- Cookie inventory and consent implementation.
- Client-project data posture versus website lead data.
- Historical guest-service obligations and archive requirements.

Drafts must carry a visible internal status such as `legalReviewRequired: true` and must not render in production while required facts remain missing.

## Editorial rules

- Lead with the operational outcome, then explain technology.
- Use `Viste.ai` consistently.
- Prefer “AI implementation,” “automation,” “controlled pilot,” and “human oversight” over hype.
- Qualify integrations by API access, licensing, discovery, and security review.
- Qualify WhatsApp monitoring as applying only to the connected corporate platform/shared inbox, never private employee accounts.
- Never invent offices, customers, metrics, testimonials, awards, certifications, integrations, partnerships, or guarantees.
- Avoid “enterprise-grade,” “fully autonomous,” “perfect,” “secure by default,” or guaranteed ROI claims.
- Make limitations and non-fit cases visible, especially on Solution Blueprint pages.
- Preserve hospitality as one credible vertical, not the whole company.

## Approval gates before Phase 1 copy

1. Approve positioning, audience priorities, service names, and public pricing posture.
2. Confirm Spanish route vocabulary (`socios`, `recursos`, and industry terms).
3. Provide verified company/team/legal/contact facts.
4. Decide whether any current testimonial, biography, video, or integration name has evidence and permission.
5. Decide the historical guest-terms treatment.
6. Approve the brand-token reconciliation in `DESIGN_SYSTEM.md`.

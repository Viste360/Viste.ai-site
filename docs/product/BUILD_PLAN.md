# Viste Studio build plan

Status: Phase 1 and the first campaign/voice/calendar slice are implemented in the existing Viste.ai repository.

## Product boundary

Viste Studio is a distinct product surface powered by the Viste Content Engine. The existing bilingual Viste.ai corporate site remains unchanged. During preview, Studio is available at `/studio` and `/app`; the intended production host is `studio.viste.ai` after an explicit deployment and domain decision.

This avoids a premature monorepo rewrite while keeping the application boundary clear enough to extract into `viste-studio` later.

## Assumptions

- Existing `tenants`, `memberships`, Supabase Auth, audit logs and server-only service credentials remain the organisation boundary.
- English and Spanish stay functionally and editorially equivalent.
- All uploaded content is private and organisation-scoped.
- No content is published without explicit approval and an authorised platform account.
- Demo campaign entries are explicitly labelled illustrative and contain no performance claims.
- The render engine is not part of the web runtime.

## Phase 1 — premium shell and asset vertical slice

Delivered:

- Bilingual Studio landing pages.
- Bilingual application shell and dashboard.
- Brand-readiness view that shows concrete gaps rather than a gamified score.
- Private asset library with magic-link sign-in.
- Direct-to-storage signed uploads for images, video, audio and documents.
- Source, licence, permitted-use and AI-generated metadata captured before upload.
- Organisation and optional brand ownership checks on the server.
- Private Supabase Storage bucket, RLS-backed metadata and audit event.
- Loading, empty, unavailable, success and failure states.

Acceptance for this phase:

1. An authorised member can sign in through Supabase Auth.
2. The member can upload a supported file of up to 500 MB without routing the file through a Vercel Function.
3. Another organisation cannot prepare or list that upload.
4. The file remains private and carries rights metadata.
5. English and Spanish routes provide the same workflow.

## Phase 2 — brand intelligence and campaign composer

Delivered in the first Phase 2 slice:

- Bilingual `/app/create` and `/app/calendar` workflows.
- Structured OpenAI generation of three materially different script concepts.
- Timed 0–3, 3–7 and 7–12 second opening beats, full scripts, CTAs and delivery direction.
- Source-review markers for unsupported claims and an explicit no-virality-guarantee boundary.
- Rights-gated ElevenLabs voice previews using server-only credentials.
- Campaign, script, brand voice, platform account, publication and approval records.
- Scheduling restricted to owner, admin or reviewer roles with an approved channel account.
- A protected due-publication dispatcher that fails closed until a reviewed platform adapter is registered.

Still to deliver:

- Organisation onboarding and brand creation.
- Brand voice, approved/restricted claims, CTAs and disclaimers.
- Website and document ingestion with source versioning.
- Retrieval and claim/source linking.
- Locked script lines that survive regeneration.
- Full campaign transition enforcement and audit presentation in the UI.

## Phase 3 — isolated rendering vertical slice

- FastAPI adapter contract and authenticated render request.
- Cloud Run worker/job, queue and private Google Cloud Storage.
- MoneyPrinterTurbo adapter pinned independently of the product app.
- FFmpeg-safe argument construction and worker isolation.
- 1080 × 1920 render, narration, captions, music and status recovery.
- Review, approval invalidation and protected download.

## Phase 4 — campaign expansion

- Storyboard scene editor and asset replacement.
- Campaign packs for 9:16, 1:1, 4:5 and 16:9.
- English/Spanish variants.
- Comments, expanded approval policies, export metadata and authorised publishing adapters.

## Publishing activation decision

The calendar is a product content calendar, not a Google Calendar mirror. A due-item endpoint exists at `/api/studio/publishing/dispatch`, protected by `CRON_SECRET`. No production cron schedule or social adapter is enabled yet: the deployment plan and first business-owned social platform must be selected before activation. This prevents a calendar entry from being mistaken for a successfully published post.

## Phase 5 — analytics and commercialisation

- Tracked links, manual platform metric import and evidence-based recommendations.
- Campaign/hook/language/platform comparisons without causal overclaiming.
- External customer workspaces, usage controls and billing only after the internal workflow is stable.

## External resources needed later

- Business-owned Supabase Preview and Production projects.
- Google Cloud project with Cloud Run, Tasks or Pub/Sub, and private Storage.
- Official OpenAI and ElevenLabs accounts; stock-provider keys only if approved.
- Beyer Licensing catalogue access and rights metadata.
- Social platform credentials only when explicit publishing is commissioned.

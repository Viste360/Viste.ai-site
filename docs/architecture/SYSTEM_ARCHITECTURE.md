# Viste Studio system architecture

## Current vertical slice

```text
Browser
  ├─ Viste Studio UI (Next.js App Router)
  ├─ Supabase Auth session
  └─ Signed file upload ───────────────┐
                                      ▼
Next.js server routes             Private Supabase Storage
  ├─ verify access token              └─ studio-assets/{tenant}/{asset}/{file}
  ├─ verify tenant membership
  ├─ verify brand ownership       Supabase Postgres
  ├─ prepare signed upload            ├─ tenants / memberships (existing)
  ├─ confirm upload                   ├─ brands
  ├─ record audit event               ├─ assets / asset_licences / asset_usage
  ├─ generate structured scripts      ├─ campaigns / scripts / brand_voices
  ├─ create approved voice preview    ├─ platform_accounts / publications
  └─ approve + schedule publishing    └─ approvals / audit_logs
```

The browser never receives the Supabase secret key. Large file bytes travel directly to private object storage through a short-lived signed upload, so Vercel Functions do not buffer video payloads.

OpenAI and ElevenLabs credentials also remain server-only. The script route requires an authenticated tenant member and validates both its input and Structured Output before persistence. The voice route selects only an approved tenant voice, checks licence or consent evidence and confirms language approval before calling ElevenLabs.

```text
Approved member
  └─ campaign brief
       └─ OpenAI Responses API (strict JSON schema)
            └─ 3 concepts + timed 12-second beats + source review
                 ├─ approved ElevenLabs voice preview
                 └─ human approval + authorised platform account
                      └─ publication calendar
                           └─ protected dispatcher → reviewed adapter only
```

The dispatcher currently has no registered social adapter and therefore fails closed. It does not mark an item as published merely because its scheduled time has arrived.

## Target production boundary

```text
studio.viste.ai
  └─ Next.js web application
       ├─ Supabase Auth + PostgreSQL + RLS
       ├─ Brand and campaign engine
       ├─ Provider adapters (server only)
       └─ Render orchestration
              │ authenticated job + signed media references
              ▼
       Google Cloud queue
              ▼
       Isolated Cloud Run worker
         ├─ Viste render adapter
         ├─ MoneyPrinterTurbo foundation
         ├─ FFmpeg
         └─ private Google Cloud Storage outputs
```

## Security decisions

- Organisation ownership is enforced using the existing tenant membership model.
- Metadata tables use RLS; mutation runs through authorised server routes.
- The Storage bucket is private, has an explicit MIME allow-list and a 500 MB initial limit.
- Uploaded content records rights metadata before the upload URL is issued.
- Malware scanning and SHA-256 hashing are explicit pending integration points. Assets should move to `quarantined` when scanning fails.
- Render requests will contain typed parameters and signed asset references; they will never accept arbitrary shell or FFmpeg arguments.
- Publishing remains a separate, explicit, approval-gated operation.
- Cloned and professional voices require a consent reference; premade and generated voices require a licence reference before approval.
- Scheduling requires a role of owner, admin or reviewer and an authorised account for the campaign's brand.
- Service-role credentials remain server-only Vercel environment variables.

## Rendering foundation decision

The upstream MoneyPrinterTurbo release identified during Phase 0 is `v1.3.3` at commit `b4218dd`. It is MIT licensed. Integration must pin that release or an audited immutable digest, retain its copyright and permission notice, and remain behind a Viste-owned adapter. Its Streamlit UI will not be exposed to customers and its provider choices will not be inherited automatically.

The web application does not include or execute MoneyPrinterTurbo in this phase.

## Data evolution

The Studio migrations introduce `brands`, `assets`, `asset_licences`, `asset_usage`, `brand_voices`, `campaigns`, `scripts`, `platform_accounts` and `publications`, plus campaign/publication references on the existing approval ledger. The existing `tenants` and `memberships` represent blueprint organisations and organisation members. Later migrations should add knowledge, claims, storyboard, render, review and analytics aggregates in independently reviewable groups with typed workflow enums.

## Deployment

- Work on a non-production branch.
- Apply migrations to Supabase Preview first.
- Configure Preview-only environment variables.
- Run the repository check and end-to-end suites.
- Review on a Vercel Preview URL.
- Do not change DNS or production data for an ordinary preview release.
